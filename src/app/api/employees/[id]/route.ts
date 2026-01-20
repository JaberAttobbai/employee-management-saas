// API لموظف واحد - GET, PUT, DELETE 🔒

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

// ============================================
// GET /api/employees/[id] - جلب موظف واحد 🔒
// ============================================
export async function GET(
    request: NextRequest,
    context: RouteParams
) {
    const { params } = context;
    const { id } = await params;
    try {
        // 🔐 التحقق من المصادقة
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        // 🔒 جلب الموظف فقط إذا كان من نفس الشركة
        const employee = await prisma.employee.findFirst({
            where: {
                id: id,
                tenantId: sessionUser.tenantId  // عزل البيانات
            },
            include: {
                leaveBalance: true,
                attendance: {
                    take: 10,
                    orderBy: { date: 'desc' }
                },
                leaves: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'الموظف غير موجود' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: employee
        })
    } catch (error) {
        console.error('خطأ في جلب الموظف:', error)
        return NextResponse.json(
            { success: false, error: 'فشل جلب البيانات' },
            { status: 500 }
        )
    }
}

// ============================================
// PUT /api/employees/[id] - تحديث موظف 🔒
// ============================================
export async function PUT(
    request: NextRequest,
    context: RouteParams
) {
    const { params } = context;
    const { id } = await params;
    try {
        // 🔐 التحقق من المصادقة
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const body = await request.json()

        // 🔒 التحقق من وجود الموظف في نفس الشركة
        const existingEmployee = await prisma.employee.findFirst({
            where: {
                id: id,
                tenantId: sessionUser.tenantId
            }
        })

        if (!existingEmployee) {
            return NextResponse.json(
                { success: false, error: 'الموظف غير موجود' },
                { status: 404 }
            )
        }

        // تحديث الموظف
        const employee = await prisma.employee.update({
            where: { id: id },
            data: {
                firstName: body.firstName || existingEmployee.firstName,
                lastName: body.lastName || existingEmployee.lastName,
                email: body.email || existingEmployee.email,
                phone: body.phone || existingEmployee.phone,
                department: body.department || existingEmployee.department,
                position: body.position || existingEmployee.position,
                salary: body.salary ? parseFloat(body.salary) : existingEmployee.salary,
                status: body.status || existingEmployee.status,
            }
        })

        return NextResponse.json({
            success: true,
            data: employee,
            message: 'تم تحديث الموظف بنجاح'
        })
    } catch (error) {
        console.error('خطأ في تحديث الموظف:', error)
        return NextResponse.json(
            { success: false, error: 'فشل تحديث الموظف' },
            { status: 500 }
        )
    }
}

// ============================================
// DELETE /api/employees/[id] - حذف موظف 🔒
// ============================================
export async function DELETE(
    request: NextRequest,
    context: RouteParams
) {
    const { params } = context;
    const { id } = await params;
    try {
        // 🔐 التحقق من المصادقة
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        // 🔒 التحقق من وجود الموظف في نفس الشركة
        const employee = await prisma.employee.findFirst({
            where: {
                id: id,
                tenantId: sessionUser.tenantId
            }
        })

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'الموظف غير موجود' },
                { status: 404 }
            )
        }

        // حذف الموظف (سيتم حذف البيانات المرتبطة تلقائياً بسبب onDelete: Cascade)
        await prisma.employee.delete({
            where: { id: id }
        })

        return NextResponse.json({
            success: true,
            message: 'تم حذف الموظف بنجاح'
        })
    } catch (error) {
        console.error('خطأ في حذف الموظف:', error)
        return NextResponse.json(
            { success: false, error: 'فشل حذف الموظف' },
            { status: 500 }
        )
    }
}
