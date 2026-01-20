// صفحة طلب إجازة جديدة

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Employee {
    id: string
    firstName: string
    lastName: string
}

export default function NewLeavePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [employees, setEmployees] = useState<Employee[]>([])

    const [formData, setFormData] = useState({
        employeeId: '',
        type: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: ''
    })

    useEffect(() => {
        // جلب الموظفين لملء القائمة
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => {
                if (data.success) setEmployees(data.data)
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/leaves', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (result.success) {
                alert('✅ تم تقديم طلب الإجازة بنجاح!')
                router.push('/leaves/requests')
            } else {
                alert('❌ ' + result.error)
            }
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ حدث خطأ أثناء تقديم الطلب')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">طلب إجازة جديدة</h1>
                <p className="text-gray-600 mt-1">قم بتعبئة النموذج لتقديم طلب إجازة</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* اختيار الموظف */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الموظف (مقدم الطلب)
                        </label>
                        <select
                            value={formData.employeeId}
                            onChange={(e) => handleChange('employeeId', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">اختر الموظف</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            نوع الإجازة
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ANNUAL">إجازة سنوية</option>
                            <option value="SICK">إجازة مرضية</option>
                            <option value="EMERGENCY">إجازة طارئة</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="من تاريخ"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            required
                        />

                        <Input
                            label="إلى تاريخ"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            السبب (اختياري)
                        </label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => handleChange('reason', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="اكتب سبب الإجازة هنا..."
                        />
                    </div>

                    <div className="flex gap-4 justify-end pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push('/leaves/requests')}
                            className="w-full md:w-auto"
                        >
                            إلغاء
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="w-full md:w-auto"
                        >
                            {loading ? '⏳ جاري التقديم...' : '✅ تقديم الطلب'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
