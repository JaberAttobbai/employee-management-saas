// صفحة تعديل موظف

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function EditEmployeePage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState({
        employeeNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        hireDate: '',
        salary: '',
        gender: '',
        birthDate: '',
        status: 'ACTIVE'
    })

    // جلب بيانات الموظف
    useEffect(() => {
        fetchEmployee()
    }, [])

    const fetchEmployee = async () => {
        try {
            const response = await fetch(`/api/employees/${id}`)
            const result = await response.json()

            if (result.success) {
                const emp = result.data
                setFormData({
                    employeeNumber: emp.employeeNumber || '',
                    firstName: emp.firstName || '',
                    lastName: emp.lastName || '',
                    email: emp.email || '',
                    phone: emp.phone || '',
                    department: emp.department || '',
                    position: emp.position || '',
                    hireDate: emp.hireDate ? emp.hireDate.split('T')[0] : '',
                    salary: emp.salary?.toString() || '',
                    gender: emp.gender || '',
                    birthDate: emp.birthDate ? emp.birthDate.split('T')[0] : '',
                    status: emp.status || 'ACTIVE'
                })
            } else {
                alert('❌ خطأ في جلب البيانات')
                router.push('/employees')
            }
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ حدث خطأ')
        } finally {
            setLoading(false)
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.firstName) {
            newErrors.firstName = 'الاسم الأول مطلوب'
        }

        if (!formData.email) {
            newErrors.email = 'البريد الإلكتروني مطلوب'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'البريد الإلكتروني غير صحيح'
        }

        if (!formData.department) {
            newErrors.department = 'القسم مطلوب'
        }

        if (!formData.position) {
            newErrors.position = 'المنصب مطلوب'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) {
            return
        }

        setSaving(true)

        try {
            const response = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (result.success) {
                alert('✅ تم تحديث البيانات بنجاح!')
                router.push(`/employees/${id}`)
            } else {
                alert('❌ ' + result.error)
            }
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ حدث خطأ أثناء الحفظ')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    if (loading) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-600">⏳ جاري التحميل...</p>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">تعديل بيانات الموظف</h1>
                <p className="text-gray-600 mt-1">قم بتحديث المعلومات المطلوبة</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* معلومات أساسية */}
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">المعلومات الأساسية</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="رقم الموظف"
                                type="text"
                                value={formData.employeeNumber}
                                onChange={(e) => handleChange('employeeNumber', e.target.value)}
                                disabled
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحالة
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ACTIVE">نشط</option>
                                    <option value="INACTIVE">معطل</option>
                                </select>
                            </div>

                            <Input
                                label="الاسم الأول"
                                type="text"
                                placeholder="أحمد"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                error={errors.firstName}
                                required
                            />

                            <Input
                                label="اسم العائلة"
                                type="text"
                                placeholder="محمد"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                            />

                            <Input
                                label="البريد الإلكتروني"
                                type="email"
                                placeholder="employee@company.com"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                error={errors.email}
                                required
                            />

                            <Input
                                label="رقم الهاتف"
                                type="tel"
                                placeholder="05XXXXXXXX"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الجنس</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">اختر</option>
                                    <option value="MALE">ذكر</option>
                                    <option value="FEMALE">أنثى</option>
                                    <option value="OTHER">آخر</option>
                                </select>
                            </div>

                            <Input
                                label="تاريخ الميلاد"
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => handleChange('birthDate', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* معلومات الوظيفة */}
                    <div className="border-t pt-6">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">معلومات الوظيفة</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    القسم <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.department ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    required
                                >
                                    <option value="">اختر القسم</option>
                                    <option value="IT">تقنية المعلومات</option>
                                    <option value="HR">الموارد البشرية</option>
                                    <option value="Sales">المبيعات</option>
                                    <option value="Marketing">التسويق</option>
                                    <option value="Finance">المالية</option>
                                    <option value="Operations">العمليات</option>
                                </select>
                                {errors.department && (
                                    <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                                )}
                            </div>

                            <Input
                                label="المنصب"
                                type="text"
                                placeholder="مطور برمجيات"
                                value={formData.position}
                                onChange={(e) => handleChange('position', e.target.value)}
                                error={errors.position}
                                required
                            />

                            <Input
                                label="تاريخ التعيين"
                                type="date"
                                value={formData.hireDate}
                                onChange={(e) => handleChange('hireDate', e.target.value)}
                            />

                            <Input
                                label="الراتب (ريال)"
                                type="number"
                                placeholder="8000"
                                value={formData.salary}
                                onChange={(e) => handleChange('salary', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-end border-t pt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push(`/employees/${id}`)}
                            disabled={saving}
                            className="w-full md:w-auto"
                        >
                            إلغاء
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={saving}
                            className="w-full md:w-auto"
                        >
                            {saving ? '⏳ جاري الحفظ...' : '✅ حفظ التعديلات'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
