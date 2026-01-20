/**
 * 🕒 API نظام تسجيل الحضور (Attendance System)
 * ═══════════════════════════════════════════════════════════
 * 
 * المنطق الأساسي:
 * 1. كل موظف له سجل واحد فقط لكل يوم (UNIQUE: employeeId + date)
 * 2. تسجيل الدخول: إنشاء سجل جديد مع checkIn فقط
 * 3. تسجيل الخروج: تحديث نفس السجل بإضافة checkOut وحساب الساعات
 * 4. الحماية: منع التسجيل المكرر في نفس اليوم
 * 5. التلقائية: حساب إجمالي الساعات وتحديد حالة الحضور
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ════════════════════════════════════════════════════════
// GET /api/attendance/me - جلب سجل حضور الموظف الحالي
// ════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
    try {
        // 🔍 التحقق من تسجيل الدخول
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول أولاً' },
                { status: 401 }
            );
        }

        // 🔎 البحث عن بيانات الموظف
        const employee = await prisma.employee.findUnique({
            where: { userId: sessionUser.userId }
        });

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'لم يتم العثور على بيانات الموظف' },
                { status: 404 }
            );
        }

        // 📅 جلب سجل الحضور (آخر 30 يوم)
        const history = await prisma.attendance.findMany({
            where: { employeeId: employee.id },
            orderBy: { date: 'desc' },
            take: 30
        });

        // 📍 فحص حالة اليوم الحالي
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayRecord = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                history: history,
                todayRecord: todayRecord,
                canCheckIn: !todayRecord, // يمكن الدخول فقط إذا لم يسجل اليوم
                canCheckOut: todayRecord && !todayRecord.checkOut // يمكن الخروج إذا سجل دخول ولم يخرج
            }
        });

    } catch (error) {
        console.error('❌ خطأ في جلب سجل الحضور:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
            { status: 500 }
        );
    }
}

// ════════════════════════════════════════════════════════
// POST /api/attendance/me - تسجيل دخول أو خروج
// ════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
    try {
        // 🔍 التحقق من تسجيل الدخول
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول أولاً' },
                { status: 401 }
            );
        }

        // 🔎 البحث عن بيانات الموظف
        const employee = await prisma.employee.findUnique({
            where: { userId: sessionUser.userId }
        });

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'لم يتم العثور على بيانات الموظف' },
                { status: 404 }
            );
        }

        // 📥 قراءة نوع العملية (دخول أو خروج)
        const body = await request.json();
        const { type } = body; // 'check-in' أو 'check-out'

        if (!type || !['check-in', 'check-out'].includes(type)) {
            return NextResponse.json(
                { success: false, error: 'نوع العملية غير صحيح' },
                { status: 400 }
            );
        }

        // 📅 تحديد بداية اليوم (00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 🔎 البحث عن سجل اليوم
        const existingRecord = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        // ═══════════════════════════════════════════════════
        // ✅ تسجيل الدخول (Check-In)
        // ═══════════════════════════════════════════════════
        if (type === 'check-in') {
            // 🚫 منع التسجيل المكرر
            if (existingRecord) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'لقد سجلت حضورك اليوم بالفعل!',
                        details: {
                            checkIn: existingRecord.checkIn,
                            alreadyCheckedOut: !!existingRecord.checkOut
                        }
                    },
                    { status: 409 } // Conflict
                );
            }

            const now = new Date();

            // 📊 تحديد حالة الحضور (في الوقت / متأخر)
            const workStartTime = new Date();
            workStartTime.setHours(8, 0, 0, 0); // افتراضياً 8:00 صباحاً

            const isLate = now > workStartTime;
            const status = isLate ? 'LATE' : 'PRESENT';

            // 💾 إنشاء سجل جديد
            const newRecord = await prisma.attendance.create({
                data: {
                    tenantId: employee.tenantId,
                    employeeId: employee.id,
                    date: today,
                    checkIn: now,
                    checkOut: null,
                    totalHours: null,
                    status: status,
                    notes: isLate ? 'متأخر عن موعد العمل' : null
                }
            });

            return NextResponse.json({
                success: true,
                message: '✅ تم تسجيل الدخول بنجاح',
                data: {
                    record: newRecord,
                    isLate: isLate,
                    checkInTime: now.toLocaleTimeString('ar-SA')
                }
            });
        }

        // ═══════════════════════════════════════════════════
        // 🚪 تسجيل الخروج (Check-Out)
        // ═══════════════════════════════════════════════════
        if (type === 'check-out') {
            // 🚫 لا يوجد تسجيل دخول اليوم
            if (!existingRecord) {
                return NextResponse.json(
                    { success: false, error: 'يجب تسجيل الدخول أولاً!' },
                    { status: 400 }
                );
            }

            // 🚫 تم تسجيل الخروج مسبقاً
            if (existingRecord.checkOut) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'لقد سجلت الخروج بالفعل!',
                        details: {
                            checkOut: existingRecord.checkOut
                        }
                    },
                    { status: 409 } // Conflict
                );
            }

            const now = new Date();

            // 🧮 حساب إجمالي الساعات
            const checkInTime = new Date(existingRecord.checkIn);
            const diffMs = now.getTime() - checkInTime.getTime();
            const totalHours = diffMs / (1000 * 60 * 60); // تحويل من ملي ثانية إلى ساعات

            // 💾 تحديث السجل بوقت الخروج وإجمالي الساعات
            const updatedRecord = await prisma.attendance.update({
                where: { id: existingRecord.id },
                data: {
                    checkOut: now,
                    totalHours: parseFloat(totalHours.toFixed(2)), // تقريب لرقمين عشريين
                    updatedAt: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                message: '✅ تم تسجيل الخروج بنجاح',
                data: {
                    record: updatedRecord,
                    totalHours: totalHours.toFixed(2),
                    checkOutTime: now.toLocaleTimeString('ar-SA')
                }
            });
        }

    } catch (error) {
        console.error('❌ خطأ في تسجيل الحضور:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء تسجيل الحضور' },
            { status: 500 }
        );
    }
}
