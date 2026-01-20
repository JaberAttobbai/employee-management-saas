'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
// Assuming Select uses specific options format

interface EmployeeFormProps {
    initialData?: any;
    onSubmit: (data: any, onSuccess?: (result: any) => void) => Promise<void>;
    isLoading?: boolean;
}

export function EmployeeForm({ initialData, onSubmit, isLoading }: EmployeeFormProps) {
    const [formData, setFormData] = useState(initialData || {
        firstName: '',
        lastName: '',
        employeeNumber: '', // Auto-generated
        email: '',
        password: '', // for new employees
        phone: '',
        gender: '',
        birthDate: '',
        department: '',
        position: '',
        salary: '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    // ════════════════════════════════════════════════════
    // 🎯 State لإدارة النجاح وكلمة المرور المؤقتة
    // ════════════════════════════════════════════════════
    const [showSuccess, setShowSuccess] = useState(false);
    const [tempPassword, setTempPassword] = useState('');
    const [copied, setCopied] = useState(false);

    // ════════════════════════════════════════════════════
    // 📋 دالة نسخ كلمة المرور للحافظة
    // ════════════════════════════════════════════════════
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(tempPassword);
            setCopied(true);
            // إعادة تعيين بعد 3 ثواني
            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            alert('❌ فشل النسخ. يرجى نسخ كلمة المرور يدوياً.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(formData, (result: any) => {
                if (result?.tempPassword) {
                    setTempPassword(result.tempPassword);
                    setShowSuccess(true);
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    // ════════════════════════════════════════════════════
    // ✅ شاشة النجاح - عرض كلمة المرور المؤقتة
    // ════════════════════════════════════════════════════
    if (showSuccess) {
        return (
            <div className="max-w-2xl mx-auto mt-8">
                {/* البطاقة الرئيسية */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header مع خلفية خضراء */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
                        <div className="text-6xl mb-3">✅</div>
                        <h3 className="text-3xl font-bold">تم إضافة الموظف بنجاح!</h3>
                        <p className="text-green-100 mt-2">تم إنشاء حساب جديد للموظف</p>
                    </div>

                    {/* المحتوى */}
                    <div className="p-8 space-y-6">
                        {/* 🚨 تحذير أمني مهم */}
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <div className="flex items-start">
                                <div className="text-2xl ml-3">⚠️</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-red-800 mb-1">تحذير أمني مهم</h4>
                                    <p className="text-sm text-red-700">
                                        كلمة المرور المؤقتة تظهر <strong>مرة واحدة فقط</strong> ولن يمكن استرجاعها.
                                        يرجى نسخها وحفظها في مكان آمن قبل إغلاق هذه النافذة.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 🔐 صندوق كلمة المرور */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                🔑 كلمة المرور المؤقتة
                            </label>

                            {/* كلمة المرور مع خط منقط */}
                            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-300 mb-4">
                                <p className="text-2xl font-mono font-bold tracking-widest text-center text-blue-600 select-all break-all">
                                    {tempPassword}
                                </p>
                            </div>

                            {/* زر النسخ */}
                            <button
                                onClick={copyToClipboard}
                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {copied ? '✅ تم النسخ بنجاح!' : '📋 نسخ كلمة المرور'}
                            </button>
                        </div>

                        {/* 📝 التعليمات */}
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                            <h4 className="font-bold text-amber-900 mb-2 flex items-center">
                                <span className="text-xl ml-2">📝</span>
                                الخطوات التالية
                            </h4>
                            <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
                                <li>قم بنسخ كلمة المرور أعلاه (اضغط على زر النسخ)</li>
                                <li>سلّم كلمة المرور للموظف شخصياً أو عبر قناة آمنة</li>
                                <li>سيُطلب من الموظف تغيير كلمة المرور عند أول تسجيل دخول</li>
                                <li>لن يتمكن من الوصول للنظام قبل تغيير كلمة المرور</li>
                            </ol>
                        </div>

                        {/* 🔒 ملاحظة أمنية */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 text-center">
                                🔒 <strong>ملاحظة:</strong> كلمة المرور محفوظة بشكل مشفّر في قاعدة البيانات.
                                لا يمكن لأي شخص (حتى المديرين) رؤيتها بعد إغلاق هذه النافذة.
                            </p>
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={() => window.location.href = '/employees'}
                                className="flex-1 bg-gray-600 hover:bg-gray-700"
                            >
                                📊 عرض جميع الموظفين
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                className="flex-1"
                            >
                                ➕ إضافة موظف آخر
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">المعلومات الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* الصف الأول: الاسم الأول + اسم العائلة */}
                    <Input
                        label="الاسم الأول"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        required
                    />
                    <Input
                        label="اسم العائلة"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        required
                    />

                    {/* الصف الثاني: البريد الإلكتروني + كلمة المرور */}
                    <Input
                        label="البريد الإلكتروني"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                    />

                    {!initialData && (
                        <Input
                            label="كلمة المرور المؤقتة"
                            type="text"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="اجعلها فارغة للتوليد التلقائي"
                        />
                    )}

                    {/* الصف الثالث: رقم الموظف + رقم الهاتف */}
                    <Input
                        label="رقم الموظف"
                        value={formData.employeeNumber}
                        onChange={(e) => handleChange('employeeNumber', e.target.value)}
                        required
                        placeholder="يتم التوليد تلقائياً إذا ترك فارغاً"
                    />

                    <Input
                        label="رقم الهاتف"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="05XXXXXXXX"
                    />

                    {/* الصف الرابع: الجنس + تاريخ الميلاد */}
                    <Select
                        label="الجنس"
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        options={[
                            { value: '', label: 'اختر الجنس' },
                            { value: 'MALE', label: 'ذكر' },
                            { value: 'FEMALE', label: 'أنثى' },
                        ]}
                    />

                    <Input
                        label="تاريخ الميلاد"
                        type="date"
                        value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleChange('birthDate', e.target.value)}
                    />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6 border-b pb-2">معلومات الوظيفة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="القسم"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        options={[
                            { value: '', label: 'اختر القسم' },
                            { value: 'IT', label: 'تقنية المعلومات' },
                            { value: 'HR', label: 'الموارد البشرية' },
                            { value: 'Sales', label: 'المبيعات' },
                            { value: 'Management', label: 'الإدارة' },
                        ]}
                    />
                    <Input
                        label="المنصب"
                        value={formData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        placeholder="مثال: مطور برمجيات"
                    />
                    <Input
                        label="الراتب (ريال)"
                        type="number"
                        value={formData.salary}
                        onChange={(e) => handleChange('salary', e.target.value)}
                        placeholder="0.00"
                    />
                    <Input
                        label="تاريخ التعيين"
                        type="date"
                        value={formData.hireDate ? new Date(formData.hireDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleChange('hireDate', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                {/* Provide visual feedback or cancel button if needed */}
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'جاري الحفظ...' : 'حفظ الموظف'}
                </Button>
            </div>
        </form>
    );
}
