// صفحة طلبات الإجازات - مع أزرار تفاعلية

'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'

interface Employee {
    firstName: string
    lastName: string
    employeeNumber: string
    department: string
}

interface Leave {
    id: string
    type: string
    startDate: string
    endDate: string
    days: number
    reason: string | null
    status: string
    employee: Employee
}

export default function LeaveRequestsPage() {
    const [leaves, setLeaves] = useState<Leave[]>([])
    const [loading, setLoading] = useState(true)

    // جلب البيانات
    useEffect(() => {
        fetchLeaves()
    }, [])

    const fetchLeaves = async () => {
        try {
            const response = await fetch('/api/leaves')
            const data = await response.json()
            if (data.success) {
                setLeaves(data.data)
            }
        } catch (error) {
            console.error('خطأ في جلب الإجازات:', error)
        } finally {
            setLoading(false)
        }
    }

    // دالة الاعتماد
    const handleApprove = async (leaveId: string) => {
        if (!confirm('هل تريد اعتماد هذا الطلب؟')) return

        try {
            const response = await fetch(`/api/leaves/${leaveId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' })
            })

            const result = await response.json()
            if (result.success) {
                alert('✅ تم اعتماد الطلب بنجاح')
                fetchLeaves() // إعادة تحميل البيانات
            } else {
                alert('❌ ' + result.error)
            }
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ حدث خطأ')
        }
    }

    // دالة الرفض
    const handleReject = async (leaveId: string) => {
        const reason = prompt('سبب الرفض (اختياري):')
        if (reason === null) return // ألغى المستخدم

        try {
            const response = await fetch(`/api/leaves/${leaveId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', rejectionReason: reason })
            })

            const result = await response.json()
            if (result.success) {
                alert('✅ تم رفض الطلب')
                fetchLeaves()
            } else {
                alert('❌ ' + result.error)
            }
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ حدث خطأ')
        }
    }

    if (loading) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-600">⏳ جاري التحميل...</p>
            </div>
        )
    }

    const pendingLeaves = leaves.filter(l => l.status === 'PENDING')
    const approvedLeaves = leaves.filter(l => l.status === 'APPROVED')
    const rejectedLeaves = leaves.filter(l => l.status === 'REJECTED')

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">طلبات الإجازات</h1>
                <p className="text-gray-600 mt-1">إدارة ومراجعة طلبات الإجازات</p>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">إجمالي الطلبات</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{leaves.length}</p>
                        </div>
                        <div className="text-4xl">📋</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">قيد المراجعة</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{pendingLeaves.length}</p>
                        </div>
                        <div className="text-4xl">⏳</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">المعتمدة</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{approvedLeaves.length}</p>
                        </div>
                        <div className="text-4xl">✅</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">المرفوضة</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{rejectedLeaves.length}</p>
                        </div>
                        <div className="text-4xl">❌</div>
                    </div>
                </Card>
            </div>

            {/* جدول الطلبات */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموظف</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القسم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع الإجازة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">من - إلى</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأيام</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السبب</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد طلبات إجازات
                                    </td>
                                </tr>
                            ) : (
                                leaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {leave.employee.firstName} {leave.employee.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {leave.employee.employeeNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {leave.employee.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.type === 'ANNUAL'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : leave.type === 'SICK'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {leave.type === 'ANNUAL' ? 'سنوية' : leave.type === 'SICK' ? 'مرضية' : 'طارئة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{new Date(leave.startDate).toLocaleDateString('ar-SA')}</div>
                                            <div className="text-gray-500">{new Date(leave.endDate).toLocaleDateString('ar-SA')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {leave.days} يوم
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {leave.reason || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.status === 'PENDING'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : leave.status === 'APPROVED'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {leave.status === 'PENDING' ? 'معلقة' : leave.status === 'APPROVED' ? 'معتمدة' : 'مرفوضة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {leave.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(leave.id)}
                                                        className="text-green-600 hover:text-green-900 font-medium"
                                                    >
                                                        ✅ اعتماد
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(leave.id)}
                                                        className="text-red-600 hover:text-red-900 font-medium"
                                                    >
                                                        ❌ رفض
                                                    </button>
                                                </div>
                                            )}
                                            {leave.status !== 'PENDING' && (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {pendingLeaves.length > 0 && (
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                        ⚠️ <strong>تنبيه:</strong> لديك {pendingLeaves.length} طلب إجازة قيد المراجعة يحتاج إلى اعتماد أو رفض.
                    </p>
                </div>
            )}
        </div>
    )
}
