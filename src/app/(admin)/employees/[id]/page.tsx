// صفحة عرض تفاصيل موظف

import Link from 'next/link'
import { notFound } from 'next/navigation'
import Card from '@/components/ui/Card'
import prisma from '@/lib/prisma'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EmployeeDetailsPage({ params }: PageProps) {
    const { id } = await params;
    // جلب بيانات الموظف
    const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
            leaveBalance: true,
            attendance: {
                take: 5,
                orderBy: { date: 'desc' }
            },
            leaves: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!employee) {
        notFound()
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {employee.firstName} {employee.lastName}
                    </h1>
                    <p className="text-gray-600 mt-1">{employee.employeeNumber}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link href={`/employees/${employee.id}/edit`} className="flex-1 md:flex-initial">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition">
                            ✏️ تعديل
                        </button>
                    </Link>
                    <Link href="/employees" className="flex-1 md:flex-initial">
                        <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition">
                            ← رجوع
                        </button>
                    </Link>
                </div>
            </div>

            {/* المعلومات الأساسية */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">المعلومات الشخصية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                            <p className="text-gray-900">{employee.firstName} {employee.lastName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                            <p className="text-gray-900 break-all">{employee.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                            <p className="text-gray-900">{employee.phone || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                            <p className="text-gray-900">
                                {employee.gender === 'MALE' ? 'ذكر' : employee.gender === 'FEMALE' ? 'أنثى' : 'آخر'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                            <p className="text-gray-900">
                                {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('ar-SA') : '-'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {employee.status === 'ACTIVE' ? 'نشط' : 'معطل'}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الوظيفة</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                            <p className="text-gray-900">{employee.department}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المنصب</label>
                            <p className="text-gray-900">{employee.position}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التعيين</label>
                            <p className="text-gray-900">
                                {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('ar-SA') : '-'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الراتب</label>
                            <p className="text-gray-900">{employee.salary ? `${employee.salary} ريال` : '-'}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* رصيد الإجازات */}
            {employee.leaveBalance && (
                <Card className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">رصيد الإجازات</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">الإجازة السنوية</p>
                            <p className="text-2xl md:text-3xl font-bold text-blue-900 mt-1">
                                {employee.leaveBalance.annualRemaining}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">من {employee.leaveBalance.annualTotal}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-600 font-medium">الإجازة المرضية</p>
                            <p className="text-2xl md:text-3xl font-bold text-purple-900 mt-1">
                                {employee.leaveBalance.sickRemaining}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">من {employee.leaveBalance.sickTotal}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">المُستخدمة (سنوية)</p>
                            <p className="text-2xl md:text-3xl font-bold text-green-900 mt-1">
                                {employee.leaveBalance.annualUsed}
                            </p>
                            <p className="text-xs text-green-600 mt-1">يوم</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <p className="text-sm text-orange-600 font-medium">المُستخدمة (مرضية)</p>
                            <p className="text-2xl md:text-3xl font-bold text-orange-900 mt-1">
                                {employee.leaveBalance.sickUsed}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">يوم</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* آخر سجلات الحضور */}
            <Card className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">آخر سجلات الحضور</h2>
                {employee.attendance.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">لا توجد سجلات حضور</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدخول</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخروج</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الساعات</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {employee.attendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {new Date(record.date).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {new Date(record.checkIn).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {record.totalHours ? `${record.totalHours}سا` : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                                                record.status === 'LATE' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {record.status === 'PRESENT' ? 'حاضر' : record.status === 'LATE' ? 'متأخر' : 'غائب'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* آخر طلبات الإجازات */}
            <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">آخر طلبات الإجازات</h2>
                {employee.leaves.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">لا توجد طلبات إجازات</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">من - إلى</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأيام</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {employee.leaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.type === 'ANNUAL' ? 'bg-blue-100 text-blue-800' :
                                                leave.type === 'SICK' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {leave.type === 'ANNUAL' ? 'سنوية' : leave.type === 'SICK' ? 'مرضية' : 'طارئة'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div>{new Date(leave.startDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</div>
                                            <div className="text-gray-500">{new Date(leave.endDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{leave.days}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                                                leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {leave.status === 'PENDING' ? 'معلقة' : leave.status === 'APPROVED' ? 'معتمدة' : 'مرفوضة'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}
