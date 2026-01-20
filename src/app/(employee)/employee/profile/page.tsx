'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

// 📋 نوع البيانات المتوقعة من API
interface EmployeeProfile {
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string | null;
    gender: string | null;
    department: string;
    position: string;
    hireDate: string;
    role: string;
    status: string;
    leaveBalance: {
        annualTotal: number;
        annualUsed: number;
        annualRemaining: number;
        sickTotal: number;
        sickUsed: number;
        sickRemaining: number;
    } | null;
}

export default function EmployeeProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    // 📡 جلب بيانات الموظف من API الحقيقي
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/employees/me');
            const json = await res.json();

            if (json.success) {
                setProfile(json.data);
            } else {
                setError(json.error || 'فشل تحميل البيانات');
            }
        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    // 💾 حفظ التعديلات في قاعدة البيانات
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        setError('');

        try {
            const res = await fetch('/api/employees/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: profile.phone,
                    birthDate: profile.birthDate,
                    gender: profile.gender
                })
            });

            const json = await res.json();

            if (json.success) {
                alert('✅ تم تحديث البيانات بنجاح');
                setProfile(json.data);
                setIsEditing(false);
            } else {
                setError(json.error || 'فشل تحديث البيانات');
            }
        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء حفظ البيانات');
        } finally {
            setSaving(false);
        }
    };

    // 🔄 إلغاء التعديل والرجوع للبيانات الأصلية
    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        fetchProfile(); // إعادة تحميل البيانات الأصلية
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Spinner />
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    ❌ {error}
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">📋 الملف الشخصي</h1>
                <div className="text-sm text-gray-500">
                    رقم الموظف: <span className="font-medium text-gray-900">{profile.employeeNumber}</span>
                </div>
            </div>

            {/* بطاقة المعلومات الشخصية */}
            <Card title="المعلومات الشخصية">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* الصورة الشخصية */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-lg">
                            {profile.firstName?.[0]}{profile.lastName?.[0]}
                        </div>
                    </div>

                    {/* الحقول */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* الاسم الأول - للقراءة فقط */}
                        <Input
                            label="الاسم الأول"
                            value={profile.firstName}
                            disabled
                            className="bg-gray-50"
                        />

                        {/* اسم العائلة - للقراءة فقط */}
                        <Input
                            label="اسم العائلة"
                            value={profile.lastName}
                            disabled
                            className="bg-gray-50"
                        />

                        {/* البريد الإلكتروني - للقراءة فقط */}
                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            value={profile.email}
                            disabled
                            className="bg-gray-50"
                        />

                        {/* رقم الهاتف - قابل للتعديل */}
                        <Input
                            label="رقم الهاتف"
                            type="tel"
                            value={profile.phone || ''}
                            disabled={!isEditing}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="05xxxxxxxx"
                        />

                        {/* تاريخ الميلاد - قابل للتعديل */}
                        <Input
                            label="تاريخ الميلاد"
                            type="date"
                            value={profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : ''}
                            disabled={!isEditing}
                            onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                        />

                        {/* الجنس - قابل للتعديل */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                الجنس
                            </label>
                            <select
                                value={profile.gender || ''}
                                disabled={!isEditing}
                                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">اختر...</option>
                                <option value="MALE">ذكر</option>
                                <option value="FEMALE">أنثى</option>
                            </select>
                        </div>

                        {/* القسم - للقراءة فقط */}
                        <Input
                            label="القسم"
                            value={profile.department}
                            disabled
                            className="bg-gray-50"
                        />

                        {/* المنصب - للقراءة فقط */}
                        <Input
                            label="المنصب"
                            value={profile.position}
                            disabled
                            className="bg-gray-50"
                        />

                        {/* تاريخ التعيين - للقراءة فقط */}
                        <Input
                            label="تاريخ التعيين"
                            type="date"
                            value={profile.hireDate ? new Date(profile.hireDate).toISOString().split('T')[0] : ''}
                            disabled
                            className="bg-gray-50"
                        />

                        {/* الدور - للقراءة فقط */}
                        <Input
                            label="نوع الحساب"
                            value={profile.role === 'ADMIN' ? 'مدير' : profile.role === 'HR' ? 'موارد بشرية' : 'موظف'}
                            disabled
                            className="bg-gray-50"
                        />
                    </div>

                    {/* رسالة خطأ */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                            ❌ {error}
                        </div>
                    )}

                    {/* أزرار الإجراءات */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        {isEditing ? (
                            <>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    إلغاء
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
                                </Button>
                            </>
                        ) : (
                            <Button type="button" onClick={() => setIsEditing(true)}>
                                ✏️ تعديل البيانات
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            {/* بطاقة رصيد الإجازات */}
            {profile.leaveBalance && (
                <Card title="📊 رصيد الإجازات">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* الإجازة السنوية */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-900">🏖️ إجازة سنوية</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-blue-600">
                                    {profile.leaveBalance.annualRemaining}
                                </span>
                                <span className="text-sm text-blue-600 mb-1">
                                    متبقي من {profile.leaveBalance.annualTotal}
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-blue-700">
                                المستخدم: {profile.leaveBalance.annualUsed} يوم
                            </div>
                        </div>

                        {/* الإجازة المرضية */}
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-purple-900">🏥 إجازة مرضية</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-purple-600">
                                    {profile.leaveBalance.sickRemaining}
                                </span>
                                <span className="text-sm text-purple-600 mb-1">
                                    متبقي من {profile.leaveBalance.sickTotal}
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-purple-700">
                                المستخدم: {profile.leaveBalance.sickUsed} يوم
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* ملاحظة */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>ℹ️ ملاحظة:</strong> يمكنك تعديل رقم الهاتف، تاريخ الميلاد، والجنس فقط.
                الحقول الأخرى (الاسم، القسم، المنصب) يتم تحديثها من قبل الإدارة.
            </div>
        </div>
    );
}
