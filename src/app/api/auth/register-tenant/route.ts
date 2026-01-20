/**
 * 🏢 API تسجيل شركة جديدة (Tenant Registration)
 * ═══════════════════════════════════════════════════════════
 * 
 * الوظيفة:
 * - استقبال طلب تسجيل شركة جديدة
 * - التحقق من البيانات (3 مراحل)
 * - إنشاء Tenant + Admin User + Settings في transaction واحدة
 * - إنشاء JWT للتسجيل التلقائي
 * 
 * المدخلات:
 * - companyName: اسم الشركة
 * - subdomain: المعرف الفرعي (فريد)
 * - adminName: اسم المسؤول
 * - adminEmail: البريد الإلكتروني (فريد)
 * - password: كلمة المرور
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { companyName, subdomain, adminName, adminEmail, password } = body

        // ════════════════════════════════════════════════════
        // المرحلة 1: التحقق من وجود البيانات
        // ════════════════════════════════════════════════════
        if (!companyName || !subdomain || !adminName || !adminEmail || !password) {
            return NextResponse.json(
                { success: false, error: 'جميع الحقول مطلوبة' },
                { status: 400 }
            )
        }

        // ════════════════════════════════════════════════════
        // المرحلة 2: التحقق من صحة البيانات
        // ════════════════════════════════════════════════════

        // التحقق من طول كلمة المرور
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
                { status: 400 }
            )
        }

        // التحقق من صيغة البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(adminEmail)) {
            return NextResponse.json(
                { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' },
                { status: 400 }
            )
        }

        // ════════════════════════════════════════════════════
        // المرحلة 3: التحقق من التفرد (Uniqueness)
        // ════════════════════════════════════════════════════

        // تنظيف subdomain
        const cleanSubdomain = subdomain
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')

        // التحقق من عدم وجود tenant بنفس الـ domain
        const existingTenant = await prisma.tenant.findFirst({
            where: { domain: cleanSubdomain }
        })

        if (existingTenant) {
            return NextResponse.json(
                { success: false, error: 'هذا المعرف مستخدم بالفعل' },
                { status: 409 }
            )
        }

        // التحقق من عدم وجود مستخدم بنفس البريد
        const existingUser = await prisma.user.findFirst({
            where: { email: adminEmail }
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'هذا البريد مستخدم بالفعل' },
                { status: 409 }
            )
        }

        // ════════════════════════════════════════════════════
        // معالجة البيانات قبل الحفظ
        // ════════════════════════════════════════════════════

        // تقسيم اسم المسؤول
        const nameParts = adminName.trim().split(/\s+/)
        const firstName = nameParts[0] || adminName
        const lastName = nameParts.slice(1).join(' ') || ''

        // تشفير كلمة المرور
        const hashedPassword = await hashPassword(password)

        // ════════════════════════════════════════════════════
        // Transaction: إنشاء Tenant + Admin User + Settings
        // ════════════════════════════════════════════════════
        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ إنشاء Tenant
            const tenant = await tx.tenant.create({
                data: {
                    name: companyName,
                    domain: cleanSubdomain,
                    status: 'ACTIVE'
                }
            })

            // 2️⃣ إنشاء Admin User
            const user = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    emailVerified: true,
                    mustChangePassword: false
                }
            })

            // 3️⃣ إنشاء Settings الافتراضية
            const settings = await tx.settings.create({
                data: {
                    tenantId: tenant.id,
                    workStartTime: '08:00',
                    workEndTime: '17:00',
                    annualLeaveDays: 21,
                    sickLeaveDays: 10
                }
            })

            return { tenant, user, settings }
        })

        // ════════════════════════════════════════════════════
        // إنشاء JWT للتسجيل التلقائي
        // ════════════════════════════════════════════════════
        const token = jwt.sign(
            {
                userId: result.user.id,
                tenantId: result.tenant.id,
                role: result.user.role,
                email: result.user.email
            },
            process.env.JWT_SECRET || 'default-secret-key',
            { expiresIn: '7d' }
        )

        // ════════════════════════════════════════════════════
        // إنشاء Response مع Cookie
        // ════════════════════════════════════════════════════
        const response = NextResponse.json(
            {
                success: true,
                message: 'تم تسجيل الشركة بنجاح',
                data: {
                    tenant: {
                        id: result.tenant.id,
                        name: result.tenant.name,
                        domain: result.tenant.domain
                    },
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        role: result.user.role
                    }
                }
            },
            { status: 201 }
        )

        // حفظ JWT في Cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 أيام
        })

        return response

    } catch (error) {
        console.error('❌ خطأ في تسجيل الشركة:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء التسجيل' },
            { status: 500 }
        )
    }
}
