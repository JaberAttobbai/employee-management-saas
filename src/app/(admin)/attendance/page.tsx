// صفحة الحضور - Attendance

import Link from 'next/link'
import Card from '@/components/ui/Card'
import prisma from '@/lib/prisma'

export default async function AttendancePage() {
    // جلب سجلات الحضور لليوم
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAttendance = await prisma.attendance.findMany({
        where: {
            date: {
                gte: today
            }
        },
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true,
                    employeeNumber: true,
                    department: true
                }
            }
        },
        orderBy: {
            checkIn: 'asc'
        }
    })

    // إحصائيات
    const totalEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } })
    const presentToday = todayAttendance.filter(a => a.status !== 'ABSENT').length
    const lateToday = todayAttendance.filter(a => a.status === 'LATE').length

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">الحضور والانصراف</h1>
                <p className="text-gray-600 mt-1">
                    تاريخ اليوم: {today.toLocaleDateString('ar-SA')}
                </p>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">الموظفون الحاضرون</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">
                                {presentToday}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                من {totalEmployees} موظف
                            </p>
                        </div>
                        <div className="text-4xl">✅</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">المتأخرون</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">
                                {lateToday}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">موظف</p>
                        </div>
                        <div className="text-4xl">⏰</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">الغائبون</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">
                                {totalEmployees - presentToday}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">موظف</p>
                        </div>
                        <div className="text-4xl">❌</div>
                    </div>
                </Card>
            </div>

            {/* جدول الحضور */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    رقم الموظف
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    الاسم
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    القسم
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    وقت الدخول
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    وقت الخروج
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    ساعات العمل
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    الحالة
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {todayAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد سجلات حضور لليوم
                                    </td>
                                </tr>
                            ) : (
                                todayAttendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {record.employee.employeeNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.employee.firstName} {record.employee.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {record.employee.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(record.checkIn).toLocaleTimeString('ar-SA', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.checkOut
                                                ? new Date(record.checkOut).toLocaleTimeString('ar-SA', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '-'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.totalHours ? `${record.totalHours} ساعة` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'PRESENT'
                                                    ? 'bg-green-100 text-green-800'
                                                    : record.status === 'LATE'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {record.status === 'PRESENT' ? 'حاضر' : record.status === 'LATE' ? 'متأخر' : 'غائب'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ملاحظة */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                    💡 <strong>ملاحظة:</strong> هذه البيانات تجريبية. في النسخة النهائية سيتمكن الموظفون من تسجيل الحضور والانصراف عبر التطبيق.
                </p>
            </div>
        </div>
    )
}
