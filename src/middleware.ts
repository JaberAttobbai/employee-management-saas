import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// المسارات العامة التي لا تحتاج مصادقة
const publicPaths = ['/login', '/register-tenant']

// المسارات المحمية التي تحتاج مصادقة
const protectedPaths = ['/dashboard', '/employees', '/attendance', '/leaves', '/employee']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // الحصول على JWT من الكوكيز
    const token = request.cookies.get('token')?.value

    // التحقق من المسارات العامة
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

    // إذا كان المستخدم مسجل دخول (يوجد token)
    if (token) {
        // إذا حاول الدخول لمسار عام، وجهه للـ dashboard
        if (isPublicPath) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // إذا لم يكن مسجل دخول (لا يوجد token)
    if (!token) {
        // إذا حاول الدخول لمسار محمي، وجهه للـ login
        if (isProtectedPath) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

// تحديد المسارات التي يعمل عليها الـ middleware
export const config = {
    matcher: [
        /*
         * تطبيق على جميع المسارات ما عدا:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
