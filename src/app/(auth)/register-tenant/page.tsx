'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// حالات النموذج
type FormState = 'idle' | 'typing' | 'submitting' | 'success' | 'error';

// أنواع الأخطاء للحقول
interface FieldErrors {
    companyName?: string;
    adminName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export default function RegisterTenantPage() {
    const router = useRouter();

    // بيانات النموذج
    const [formData, setFormData] = useState({
        companyName: '',
        adminName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    // حالة النموذج
    const [formState, setFormState] = useState<FormState>('idle');

    // أخطاء الحقول
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    // رسالة الخطأ العامة
    const [errorMessage, setErrorMessage] = useState('');

    // التحقق من صحة الحقول في الوقت الفعلي
    useEffect(() => {
        // إذا كانت الحالة idle، لا نتحقق
        if (formState === 'idle') return;

        const errors: FieldErrors = {};

        // التحقق من اسم الشركة
        if (formData.companyName.trim() === '') {
            errors.companyName = 'اسم الشركة مطلوب';
        } else if (formData.companyName.trim().length < 2) {
            errors.companyName = 'اسم الشركة يجب أن يكون حرفين على الأقل';
        }

        // التحقق من اسم المسؤول
        if (formData.adminName.trim() === '') {
            errors.adminName = 'اسم المسؤول مطلوب';
        } else if (formData.adminName.trim().length < 2) {
            errors.adminName = 'اسم المسؤول يجب أن يكون حرفين على الأقل';
        }

        // التحقق من البريد الإلكتروني
        if (formData.email.trim() === '') {
            errors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'البريد الإلكتروني غير صحيح';
        }

        // التحقق من كلمة المرور
        if (formData.password === '') {
            errors.password = 'كلمة المرور مطلوبة';
        } else if (formData.password.length < 8) {
            errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        }

        // التحقق من تأكيد كلمة المرور
        if (formData.confirmPassword === '') {
            errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'كلمة المرور غير متطابقة';
        }

        setFieldErrors(errors);
    }, [formData, formState]);

    // معالج تغيير الحقول
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // تحديث البيانات
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // تغيير الحالة إلى typing إذا كانت idle
        if (formState === 'idle' || formState === 'error') {
            setFormState('typing');
        }
    };

    // معالج إرسال النموذج
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // تغيير الحالة إلى typing إذا كانت idle
        if (formState === 'idle') {
            setFormState('typing');
            return;
        }

        // التحقق من عدم وجود أخطاء
        if (Object.keys(fieldErrors).length > 0) {
            return;
        }

        // تغيير الحالة إلى submitting
        setFormState('submitting');
        setErrorMessage('');

        try {
            // إرسال البيانات إلى API
            const response = await fetch('/api/auth/register-tenant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyName: formData.companyName.trim(),
                    adminName: formData.adminName.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // حالة الفشل
                setFormState('error');
                setErrorMessage(data.message || 'حدث خطأ أثناء التسجيل');
                return;
            }

            // حالة النجاح
            setFormState('success');

            // التوجيه إلى لوحة التحكم بعد ثانيتين
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (error) {
            // حالة الخطأ
            setFormState('error');
            setErrorMessage('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4" dir="rtl">
            <div className="w-full max-w-md">
                {/* بطاقة النموذج */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    {/* العنوان */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            تسجيل شركة جديدة
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            أنشئ حساب شركتك وابدأ إدارة موظفيك
                        </p>
                    </div>

                    {/* رسالة النجاح */}
                    {formState === 'success' && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-green-800 dark:text-green-300 font-medium">
                                    تم التسجيل بنجاح! جاري التوجيه...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* رسالة الخطأ العامة */}
                    {formState === 'error' && errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-800 dark:text-red-300 font-medium">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* النموذج */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* حقل اسم الشركة */}
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                اسم الشركة
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                disabled={formState === 'submitting' || formState === 'success'}
                                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.companyName
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder="أدخل اسم شركتك"
                            />
                            {fieldErrors.companyName && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {fieldErrors.companyName}
                                </p>
                            )}
                        </div>

                        {/* حقل اسم المسؤول */}
                        <div>
                            <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                اسم المسؤول
                            </label>
                            <input
                                type="text"
                                id="adminName"
                                name="adminName"
                                value={formData.adminName}
                                onChange={handleChange}
                                disabled={formState === 'submitting' || formState === 'success'}
                                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.adminName
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder="أدخل اسمك الكامل"
                            />
                            {fieldErrors.adminName && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {fieldErrors.adminName}
                                </p>
                            )}
                        </div>

                        {/* حقل البريد الإلكتروني */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={formState === 'submitting' || formState === 'success'}
                                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.email
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder="admin@company.com"
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        {/* حقل كلمة المرور */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                كلمة المرور
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={formState === 'submitting' || formState === 'success'}
                                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.password
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder="••••••••"
                            />
                            {fieldErrors.password && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        {/* حقل تأكيد كلمة المرور */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                تأكيد كلمة المرور
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={formState === 'submitting' || formState === 'success'}
                                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.confirmPassword
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder="••••••••"
                            />
                            {fieldErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {fieldErrors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* زر الإرسال */}
                        <button
                            type="submit"
                            disabled={
                                formState === 'submitting' ||
                                formState === 'success' ||
                                (formState !== 'idle' && Object.keys(fieldErrors).length > 0)
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:cursor-not-allowed"
                        >
                            {formState === 'submitting' ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    جاري التسجيل...
                                </>
                            ) : formState === 'success' ? (
                                <>
                                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    تم التسجيل بنجاح
                                </>
                            ) : (
                                'تسجيل الشركة'
                            )}
                        </button>
                    </form>

                    {/* رابط تسجيل الدخول */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            لديك حساب بالفعل؟{' '}
                            <a
                                href="/login"
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                            >
                                تسجيل الدخول
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
