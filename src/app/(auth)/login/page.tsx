// صفحة تسجيل الدخول - محدثة مع API

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const validateForm = () => {
        const newErrors = { email: '', password: '' }

        if (!email) {
            newErrors.email = 'البريد الإلكتروني مطلوب'
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'البريد الإلكتروني غير صحيح'
        }

        if (!password) {
            newErrors.password = 'كلمة المرور مطلوبة'
        } else if (password.length < 6) {
            newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        }

        setErrors(newErrors)
        return !newErrors.email && !newErrors.password
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            setLoading(true)

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                })

                const result = await response.json()

                if (result.success) {
                    alert('✅ تم تسجيل الدخول بنجاح!')

                    // 🔀 توجيه حسب الدور
                    // ملاحظة: لا يوجد إجبار على تغيير كلمة المرور
                    // الموظف يمكنه تغييرها من داشبورده إذا أراد
                    if (result.data.user.role === 'ADMIN' || result.data.user.role === 'HR') {
                        window.location.href = '/dashboard'
                    } else {
                        window.location.href = '/employee/dashboard'
                    }
                } else {
                    alert('❌ ' + result.error)
                }
            } catch (error) {
                console.error('خطأ في تسجيل الدخول:', error)
                alert('❌ حدث خطأ. حاول مرة أخرى.')
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        مرحبًا بعودتك
                    </h1>
                    <p className="text-gray-600">
                        سجّل دخولك للوصول إلى لوحة التحكم
                    </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            placeholder="example@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            required
                        />

                        <Input
                            label="كلمة المرور"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            required
                        />

                        <div className="text-left">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                نسيت كلمة المرور؟
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? '⏳ جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            ليس لديك حساب؟{' '}
                            <Link
                                href="/register-tenant"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                شركة جديدة؟ سجّل شركتك الآن
                            </Link>
                        </p>
                    </div>

                    {/* بيانات تجريبية للمساعدة */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
                        <p className="font-bold text-blue-900 mb-2">🔑 بيانات تجريبية:</p>
                        <p className="text-blue-800">Admin: admin@demo.com / admin123</p>
                        <p className="text-blue-800">HR: hr@demo.com / hr123</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
