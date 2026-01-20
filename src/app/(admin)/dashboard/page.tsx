// Dashboard الرئيسي مع إحصائيات فعلية

import Link from 'next/link'
import Card from '@/components/ui/Card'
import prisma from '@/lib/prisma'

export default async function DashboardPage() {
    // جلب الإحصائيات من قاعدة البيانات
    const [
        totalEmployees,
        totalLeaves,
        pendingLeaves,
        todayAttendance
    ] = await Promise.all([
        prisma.employee.count({ where: { status: 'ACTIVE' } }),
        prisma.leave.count(),
        prisma.leave.count({ where: { status: 'PENDING' } }),
        prisma.attendance.count({
            where: {
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        })
    ])

    // جلب آخر الموظفين المضافين
    const recentEmployees = await prisma.employee.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
            createdAt: true
        }
    })

    // جلب طلبات الإجازات المعلقة
    const pendingLeaveRequests = await prisma.leave.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true,
                    department: true
                }
            }
        }
    })

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-gray-600 mt-1">مرحبًا بك في نظام إدارة الموظفين</p>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">إجمالي الموظفين</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {totalEmployees}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">نشط</p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">الحاضرون اليوم</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">
                                {todayAttendance}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                من {totalEmployees}
                            </p>
                        </div>
                        <div className="text-4xl">✅</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">طلبات الإجازات المعلقة</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">
                                {pendingLeaves}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                من {totalLeaves} إجمالي
                            </p>
                        </div>
                        <div className="text-4xl">📅</div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">إجمالي الإجازات</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">
                                {totalLeaves}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">جميع الأنواع</p>
                        </div>
                        <div className="text-4xl">🏖️</div>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* آخر الموظفين المضافين */}
                <Card title="آخر الموظفين المضافين">
                    {recentEmployees.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            لا يوجد موظفون بعد
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {recentEmployees.map((emp) => (
                                <div
                                    key={emp.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 font-medium">
                                                {emp.firstName.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {emp.firstName} {emp.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {emp.position} - {emp.department}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/employees/${emp.id}`}
                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        عرض
                                    </Link>
                                </div>
                            ))}

                            <Link
                                href="/employees"
                                className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4"
                            >
                                عرض جميع الموظفين ←
                            </Link>
                        </div>
                    )}
                </Card>

                {/* طلبات الإجازات المعلقة */}
                <Card title="طلبات الإجازات المعلقة">
                    {pendingLeaveRequests.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            لا توجد طلبات معلقة
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {pendingLeaveRequests.map((leave) => (
                                <div
                                    key={leave.id}
                                    className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {leave.employee.firstName} {leave.employee.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {leave.employee.department}
                                            </p>
                                        </div>
                                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                            {leave.type === 'ANNUAL' ? 'سنوية' : leave.type === 'SICK' ? 'مرضية' : 'طارئة'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        📅 {new Date(leave.startDate).toLocaleDateString('ar-SA')} - {new Date(leave.endDate).toLocaleDateString('ar-SA')}
                                        <span className="mr-2">({leave.days} أيام)</span>
                                    </div>
                                </div>
                            ))}

                            <Link
                                href="/leaves/requests"
                                className="block text-center text-orange-600 hover:text-orange-700 text-sm font-medium mt-4"
                            >
                                عرض جميع الطلبات ←
                            </Link>
                        </div>
                    )}
                </Card>
            </div>

            {/* روابط سريعة */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">روابط سريعة</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/employees/new">
                        <Card className="hover:shadow-lg transition cursor-pointer text-center">
                            <div className="text-4xl mb-2">➕</div>
                            <p className="font-medium text-gray-900">إضافة موظف</p>
                        </Card>
                    </Link>

                    <Link href="/employees">
                        <Card className="hover:shadow-lg transition cursor-pointer text-center">
                            <div className="text-4xl mb-2">👥</div>
                            <p className="font-medium text-gray-900">الموظفون</p>
                        </Card>
                    </Link>

                    <Link href="/attendance">
                        <Card className="hover:shadow-lg transition cursor-pointer text-center">
                            <div className="text-4xl mb-2">⏰</div>
                            <p className="font-medium text-gray-900">الحضور</p>
                        </Card>
                    </Link>

                    <Link href="/leaves/requests">
                        <Card className="hover:shadow-lg transition cursor-pointer text-center">
                            <div className="text-4xl mb-2">📅</div>
                            <p className="font-medium text-gray-900">الإجازات</p>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    )
}
