'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ChangePasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        currentPassword: '', // المستخدم سيدخل كلمة المرور المؤقتة هنا
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword  // إضافة تأكيد كلمة المرور
                })
            });
            console.log('Sending payload:', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'فشل تغيير كلمة المرور');
            }

            // نجاح! توجيه للوحة التحكم
            router.push('/dashboard');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        تغيير كلمة المرور مطلوب
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        لأمان حسابك، يجب عليك تغيير كلمة المرور المؤقتة قبل المتابعة.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <Input
                                label="كلمة المرور الحالية (المؤقتة)"
                                name="currentPassword"
                                type="password"
                                required
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="أدخل كلمة المرور التي استلمتها"
                            />
                        </div>
                        <div className="mb-4">
                            <Input
                                label="كلمة المرور الجديدة"
                                name="newPassword"
                                type="password"
                                required
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="كلمة مرور قوية جديدة"
                            />
                        </div>
                        <div className="mb-4">
                            <Input
                                label="تأكيد كلمة المرور الجديدة"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="أعد كتابة كلمة المرور الجديدة"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isLoading ? 'جاري التحديث...' : 'تغيير كلمة المرور والدخول'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
