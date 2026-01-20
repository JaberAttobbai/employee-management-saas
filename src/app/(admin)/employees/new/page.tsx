// صفحة إضافة موظف جديد - Form كامل مع Client Component

'use client'

import { useRouter } from 'next/navigation';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { useState } from 'react';

export default function NewEmployeePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: any, onSuccess?: (result: any) => void) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                if (onSuccess) {
                    onSuccess(result.data);
                } else {
                    // Fallback if no callback provided (though Form handles it)
                    alert('✅ تم إضافة الموظف بنجاح!');
                    router.push('/employees');
                }
            } else {
                alert('❌ ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('❌ حدث خطأ أثناء الإضافة');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">إضافة موظف جديد</h1>
                <p className="text-gray-600 mt-1">املأ جميع الحقول المطلوبة</p>
            </div>

            <EmployeeForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}
