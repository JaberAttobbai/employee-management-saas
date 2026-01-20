// صفحة الموظفين - مع زر حذف تفاعلي

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'

interface Employee {
    id: string
    employeeNumber: string
    firstName: string
    lastName: string
    email: string
    department: string
    position: string
    status: string
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)

    // 🔍 states للبحث والتصفية
    const [searchQuery, setSearchQuery] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    // جلب البيانات عند تغيير أي فلتر
    useEffect(() => {
        fetchEmployees()
    }, [searchQuery, departmentFilter, statusFilter])

    const fetchEmployees = async () => {
        try {
            setLoading(true)

            // 🏗️ بناء URL مع query parameters
            const params = new URLSearchParams()
            if (searchQuery) params.append('search', searchQuery)
            if (departmentFilter) params.append('department', departmentFilter)
            if (statusFilter) params.append('status', statusFilter)

            const url = `/api/employees${params.toString() ? `?${params.toString()}` : ''}`
            const response = await fetch(url)
            const data = await response.json()

            if (data.success) {
                setEmployees(data.data)
            }
        } catch (error) {
            console.error('خطأ:', error)
        } finally {
            setLoading(false)
        }
    }

    // إعادة تعيين جميع الفلاتر
    const handleResetFilters = () => {
        setSearchQuery('')
        setDepartmentFilter('')
        setStatusFilter('')
    }

    // دالة الحذف
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`هل تريد حذف الموظف "${name}"؟\n\nتحذير: هذا الإجراء لا يمكن التراجع عنه!`)) {
            return
        }

        try {
            const response = await fetch(`/api/employees/${id}`, {
                method: 'DELETE'
            })

            const result = await response.json()
            if (result.success) {
                alert('✅ تم حذف الموظف بنجاح')
                fetchEmployees() // إعادة تحميل القائمة
            } else {
                alert('❌ ' + result.error)
            }
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ حدث خطأ أثناء الحذف')
        }
    }

    if (loading) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-600">⏳ جاري التحميل...</p>
            </div>
        )
    }

    const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">الموظفون</h1>
                    <p className="text-gray-600 mt-1">إدارة بيانات الموظفين</p>
                </div>
                <Link href="/employees/new">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
                        ➕ إضافة موظف
                    </button>
                </Link>
            </div>

            {/* 🔍 البحث والتصفية */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* حقل البحث */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            🔍 بحث
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="اسم، بريد، أو رقم موظف..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* تصفية بالقسم */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            القسم
                        </label>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">الكل</option>
                            <option value="تقنية المعلومات">تقنية المعلومات</option>
                            <option value="الموارد البشرية">الموارد البشرية</option>
                            <option value="المالية">المالية</option>
                            <option value="التسويق">التسويق</option>
                            <option value="المبيعات">المبيعات</option>
                        </select>
                    </div>

                    {/* تصفية بالحالة */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            الحالة
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">الكل</option>
                            <option value="ACTIVE">نشط</option>
                            <option value="INACTIVE">معطل</option>
                        </select>
                    </div>
                </div>

                {/* زر إعادة تعيين الفلاتر */}
                {(searchQuery || departmentFilter || statusFilter) && (
                    <div className="mt-3 text-right">
                        <button
                            onClick={handleResetFilters}
                            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                        >
                            ❌ إعادة تعيين الفلاتر
                        </button>
                    </div>
                )}
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">إجمالي الموظفين</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{employees.length}</p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">الموظفون النشطون</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{activeEmployees}</p>
                        </div>
                        <div className="text-4xl">✅</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">الموظفون المعطلون</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{employees.length - activeEmployees}</p>
                        </div>
                        <div className="text-4xl">❌</div>
                    </div>
                </Card>
            </div>

            {/* جدول الموظفين */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الموظف</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القسم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنصب</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        لا يوجد موظفون. انقر على "إضافة موظف" لإضافة أول موظف.
                                    </td>
                                </tr>
                            ) : (
                                employees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {employee.employeeNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium">
                                                            {employee.firstName.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mr-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {employee.firstName} {employee.lastName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {employee.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {employee.position}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {employee.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {employee.status === 'ACTIVE' ? 'نشط' : 'معطل'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={`/employees/${employee.id}`}
                                                className="text-blue-600 hover:text-blue-900 ml-4"
                                            >
                                                👁️ عرض
                                            </Link>
                                            <Link
                                                href={`/employees/${employee.id}/edit`}
                                                className="text-green-600 hover:text-green-900 ml-4"
                                            >
                                                ✏️ تعديل
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                🗑️ حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
