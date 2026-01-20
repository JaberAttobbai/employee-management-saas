// API لتسجيل الدخول

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // التحقق من البيانات
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
                { status: 400 }
            )
        }

        // البحث عن المستخدم
        const user = await prisma.user.findFirst({
            where: { email },
            include: {
                tenant: true,
                employee: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
                { status: 401 }
            )
        }

        // التحقق من كلمة المرور
        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return NextResponse.json(
                { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
                { status: 401 }
            )
        }

        // التحقق من حالة المستخدم
        if (user.status !== 'ACTIVE') {
            return NextResponse.json(
                { success: false, error: 'الحساب معطل. تواصل مع الإدارة' },
                { status: 403 }
            )
        }

        // إنشاء JWT Token
        const token = jwt.sign(
            {
                userId: user.id,
                tenantId: user.tenantId,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET || 'default-secret-key',
            { expiresIn: '7d' }
        )

        // تحديث آخر تسجيل دخول
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        })

        // إنشاء response مع cookie
        const response = NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId,
                    tenantName: user.tenant.name,
                    mustChangePassword: user.mustChangePassword
                }
            },
            message: 'تم تسجيل الدخول بنجاح'
        })

        // حفظ الـ token في cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 أيام
        })

        return response
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
