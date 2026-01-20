// API للإجازات - جلب جميع الطلبات وإنشاء طلب جديد

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic';

// ============================================
// GET /api/leaves - جلب طلبات الإجازات للشركة الحالية 🔒
// ============================================
export async function GET(request: NextRequest) {
    try {
        // 🔐 التحقق من المصادقة
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url)
        const employeeId = searchParams.get('employeeId')

        const whereClause: any = {
            tenantId: sessionUser.tenantId  // 🔒 عزل البيانات
        }
        if (employeeId) {
            whereClause.employeeId = employeeId
        }

        const leaves = await prisma.leave.findMany({
            where: whereClause,
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeNumber: true,
                        department: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({
            success: true,
            data: leaves,
            count: leaves.length
        })
    } catch (error) {
        console.error('خطأ في جلب الإجازات:', error)
        return NextResponse.json(
            { success: false, error: 'فشل جلب البيانات' },
            { status: 500 }
        )
    }
}

// ============================================
// POST /api/leaves - إنشاء طلب إجازة جديد
// ============================================
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { employeeId, type, startDate, endDate, reason } = body

        // التحقق من البيانات المطلوبة
        if (!employeeId || !type || !startDate || !endDate) {
            return NextResponse.json(
                { success: false, error: 'جميع الحقول مطلوبة' },
                { status: 400 }
            )
        }

        // حساب عدد الأيام
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

        // التحقق من الرصيد
        const balance = await prisma.leaveBalance.findFirst({
            where: { employeeId }
        })

        if (!balance) {
            return NextResponse.json(
                { success: false, error: 'لم يتم العثور على رصيد إجازات للموظف' },
                { status: 404 }
            )
        }

        if (type === 'ANNUAL' && balance.annualRemaining < days) {
            return NextResponse.json(
                { success: false, error: `الرصيد غير كافي. المتبقي: ${balance.annualRemaining} يوم` },
                { status: 400 }
            )
        }

        // إنشاء الطلب
        const leave = await prisma.leave.create({
            data: {
                employeeId,
                tenantId: balance.tenantId,
                type,
                startDate: start,
                endDate: end,
                days,
                reason,
                status: 'PENDING'
            }
        })

        return NextResponse.json({
            success: true,
            data: leave,
            message: 'تم تقديم طلب الإجازة بنجاح'
        })

    } catch (error) {
        console.error('خطأ في إنشاء طلب الإجازة:', error)
        return NextResponse.json(
            { success: false, error: 'فشل تقديم الطلب' },
            { status: 500 }
        )
    }
}
