// API لإدارة الإجازات - اعتماد/رفض

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// ============================================
// PATCH /api/leaves/[id] - تحديث حالة الإجازة
// ============================================
export async function PATCH(
    request: NextRequest,
    context: RouteParams
) {
    const { params } = context;
    const { id } = await params;
    try {
        const body = await request.json()
        const { action, rejectionReason } = body

        // التحقق من وجود الطلب
        const leave = await prisma.leave.findUnique({
            where: { id: id }
        })

        if (!leave) {
            return NextResponse.json(
                { success: false, error: 'طلب الإجازة غير موجود' },
                { status: 404 }
            )
        }

        // التحقق من أن الطلب معلق
        if (leave.status !== 'PENDING') {
            return NextResponse.json(
                { success: false, error: 'لا يمكن تعديل طلب تمت مراجعته بالفعل' },
                { status: 400 }
            )
        }

        // تحديث حالة الطلب
        const updatedLeave = await prisma.leave.update({
            where: { id: id },
            data: {
                status: action === 'approve' ? 'APPROVED' : 'REJECTED',
                reviewedAt: new Date(),
                rejectionReason: action === 'reject' ? rejectionReason : null,
                // في المستقبل: سنضيف reviewedBy من session
            }
        })

        // إذا تم الاعتماد، نخصم من الرصيد
        if (action === 'approve') {
            const balance = await prisma.leaveBalance.findFirst({
                where: { employeeId: leave.employeeId }
            })

            if (balance) {
                if (leave.type === 'ANNUAL') {
                    await prisma.leaveBalance.update({
                        where: { id: balance.id },
                        data: {
                            annualUsed: balance.annualUsed + leave.days,
                            annualRemaining: balance.annualRemaining - leave.days
                        }
                    })
                } else if (leave.type === 'SICK') {
                    await prisma.leaveBalance.update({
                        where: { id: balance.id },
                        data: {
                            sickUsed: balance.sickUsed + leave.days,
                            sickRemaining: balance.sickRemaining - leave.days
                        }
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: updatedLeave,
            message: action === 'approve' ? 'تم اعتماد الطلب بنجاح' : 'تم رفض الطلب'
        })
    } catch (error) {
        console.error('خطأ في تحديث الإجازة:', error)
        return NextResponse.json(
            { success: false, error: 'فشل تحديث الطلب' },
            { status: 500 }
        )
    }
}
