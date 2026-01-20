/**
 * 📋 API لبيانات الموظف الحالي (Current Employee Profile)
 * ═══════════════════════════════════════════════════════════
 * 
 * هذا الـ endpoint يُستخدم لجلب بيانات الموظف الحالي
 * بناءً على الـ session/JWT الخاص بالمستخدم المسجل دخوله
 * 
 * الاستخدام:
 * - صفحة الملف الشخصي للموظف
 * - داشبورد الموظف
 * - أي مكان يحتاج معلومات الموظف الحالي
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

// ════════════════════════════════════════════════════════
// GET /api/employees/me - جلب بيانات الموظف الحالي
// ════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
    try {
        // 🔍 الحصول على بيانات المستخدم من Session
        const sessionUser = await getCurrentUser();

        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول أولاً' },
                { status: 401 }
            );
        }

        // 🔎 جلب بيانات الموظف المرتبط بهذا المستخدم
        // نستخدم userId من الـ session للبحث عن الموظف
        const employee = await prisma.employee.findUnique({
            where: {
                userId: sessionUser.userId
            },
            include: {
                leaveBalance: true, // رصيد الإجازات
                user: {
                    select: {
                        email: true,
                        role: true,
                        status: true,
                        mustChangePassword: true
                    }
                }
            }
        });

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'لم يتم العثور على بيانات الموظف' },
                { status: 404 }
            );
        }

        // ✅ إرجاع البيانات
        return NextResponse.json({
            success: true,
            data: {
                // بيانات الموظف الأساسية
                id: employee.id,
                employeeNumber: employee.employeeNumber,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phone: employee.phone,
                birthDate: employee.birthDate,
                gender: employee.gender,
                department: employee.department,
                position: employee.position,
                hireDate: employee.hireDate,
                salary: employee.salary,
                avatar: employee.avatar,
                status: employee.status,

                // بيانات المستخدم
                role: employee.user?.role,
                userStatus: employee.user?.status,
                mustChangePassword: employee.user?.mustChangePassword,

                // رصيد الإجازات
                leaveBalance: employee.leaveBalance ? {
                    annualTotal: employee.leaveBalance.annualTotal,
                    annualUsed: employee.leaveBalance.annualUsed,
                    annualRemaining: employee.leaveBalance.annualRemaining,
                    sickTotal: employee.leaveBalance.sickTotal,
                    sickUsed: employee.leaveBalance.sickUsed,
                    sickRemaining: employee.leaveBalance.sickRemaining,
                } : null
            }
        });

    } catch (error) {
        console.error('❌ خطأ في جلب بيانات الموظف:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
            { status: 500 }
        );
    }
}

// ════════════════════════════════════════════════════════
// PUT /api/employees/me - تحديث بيانات الموظف الحالي
// ════════════════════════════════════════════════════════
export async function PUT(request: NextRequest) {
    try {
        // 🔍 الحصول على بيانات المستخدم من Session
        const sessionUser = await getCurrentUser();

        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول أولاً' },
                { status: 401 }
            );
        }

        // 📥 قراءة البيانات المُرسلة
        const body = await request.json();
        const { phone, birthDate, gender } = body;

        // 🔎 جلب بيانات الموظف الحالي
        const employee = await prisma.employee.findUnique({
            where: { userId: sessionUser.userId }
        });

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'لم يتم العثور على بيانات الموظف' },
                { status: 404 }
            );
        }

        // 💾 تحديث البيانات المسموح بها فقط
        // ملاحظة: الموظف يمكنه تحديث بياناته الشخصية فقط
        // لا يمكنه تحديث القسم، الراتب، أو المنصب (هذه للمدير فقط)
        const updatedEmployee = await prisma.employee.update({
            where: { id: employee.id },
            data: {
                // البيانات الشخصية التي يمكن تعديلها
                phone: phone || employee.phone,
                birthDate: birthDate ? new Date(birthDate) : employee.birthDate,
                gender: gender || employee.gender,
                updatedAt: new Date()
            },
            include: {
                leaveBalance: true,
                user: {
                    select: {
                        email: true,
                        role: true,
                        status: true
                    }
                }
            }
        });

        // ✅ إرجاع البيانات المحدثة
        return NextResponse.json({
            success: true,
            message: 'تم تحديث البيانات بنجاح',
            data: {
                id: updatedEmployee.id,
                employeeNumber: updatedEmployee.employeeNumber,
                firstName: updatedEmployee.firstName,
                lastName: updatedEmployee.lastName,
                email: updatedEmployee.email,
                phone: updatedEmployee.phone,
                birthDate: updatedEmployee.birthDate,
                gender: updatedEmployee.gender,
                department: updatedEmployee.department,
                position: updatedEmployee.position,
                hireDate: updatedEmployee.hireDate,
                role: updatedEmployee.user?.role,
                leaveBalance: updatedEmployee.leaveBalance
            }
        });

    } catch (error) {
        console.error('❌ خطأ في تحديث بيانات الموظف:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء تحديث البيانات' },
            { status: 500 }
        );
    }
}
