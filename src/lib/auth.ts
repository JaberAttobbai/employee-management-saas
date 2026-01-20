// دوال المصادقة والتحقق

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// نوع بيانات المستخدم
export interface SessionUser {
    userId: string
    tenantId: string
    role: string
    email: string
}

// استخراج المستخدم الحالي من Session
export async function getCurrentUser(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return null
        }

        // فك تشفير الـ token
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET || 'default-secret-key'
        ) as SessionUser

        return payload
    } catch (error) {
        console.error('خطأ في استخراج المستخدم:', error)
        return null
    }
}

// التحقق من الدور
export async function requireRole(allowedRoles: string[]): Promise<SessionUser> {
    const user = await getCurrentUser()

    if (!user) {
        throw new Error('يجب تسجيل الدخول')
    }

    if (!allowedRoles.includes(user.role)) {
        throw new Error('غير مصرح لك بالوصول')
    }

    return user
}

// التحقق من Admin
export async function requireAdmin(): Promise<SessionUser> {
    return requireRole(['ADMIN'])
}

// التحقق من Admin أو HR
export async function requireAdminOrHR(): Promise<SessionUser> {
    return requireRole(['ADMIN', 'HR'])
}
