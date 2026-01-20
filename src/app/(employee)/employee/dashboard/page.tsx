'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

// 📋 أنواع البيانات
interface EmployeeData {
    firstName: string;
    lastName: string;
    leaveBalance: {
        annualRemaining: number;
        sickRemaining: number;
    } | null;
}

interface TodayAttendance {
    checkIn: Date | null;
    checkOut: Date | null;
}

export default function EmployeeDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<EmployeeData | null>(null);
    const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
    const [error, setError] = useState('');

    // 📡 جلب بيانات الموظف الحالي
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // جلب بيانات الموظف ورصيد الإجازات
            const profileRes = await fetch('/api/employees/me');
            const profileData = await profileRes.json();

            if (profileData.success) {
                setEmployee(profileData.data);
            }

            // جلب حالة الحضور اليوم
            const attendanceRes = await fetch('/api/attendance/me');
            const attendanceData = await attendanceRes.json();

            if (attendanceData.success && attendanceData.data.todayRecord) {
                setTodayAttendance({
                    checkIn: attendanceData.data.todayRecord.checkIn,
                    checkOut: attendanceData.data.todayRecord.checkOut
                });
            }

        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    ❌ {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">
                    مرحباً، {employee?.firstName || 'موظف'} 👋
                </h1>
                <p className="text-gray-600">هذه نظرة عامة على نشاطك</p>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/employee/attendance">
                    <Card className="hover:shadow-md transition cursor-pointer border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600 text-xl">⏰</div>
                            <div>
                                <h3 className="font-bold text-gray-900">تسجيل الحضور</h3>
                                <p className="text-sm text-gray-500">سجل دخولك أو خروجك</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href="/employee/leaves">
                    <Card className="hover:shadow-md transition cursor-pointer border-l-4 border-l-purple-500">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-full text-purple-600 text-xl">📅</div>
                            <div>
                                <h3 className="font-bold text-gray-900">طلب إجازة</h3>
                                <p className="text-sm text-gray-500">قدم طلب إجازة جديد</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link href="/employee/profile">
                    <Card className="hover:shadow-md transition cursor-pointer border-l-4 border-l-green-500">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full text-green-600 text-xl">👤</div>
                            <div>
                                <h3 className="font-bold text-gray-900">الملف الشخصي</h3>
                                <p className="text-sm text-gray-500">عرض وتعديل بياناتك</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Real Data Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* حضور اليوم - بيانات حقيقية */}
                <Card>
                    <h2 className="font-bold text-gray-900 mb-4">حضور اليوم</h2>
                    {todayAttendance && todayAttendance.checkIn ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">وقت الدخول:</span>
                                <span className="font-semibold text-green-600">
                                    {new Date(todayAttendance.checkIn).toLocaleTimeString('ar-SA', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">وقت الخروج:</span>
                                <span className="font-semibold text-gray-900">
                                    {todayAttendance.checkOut
                                        ? new Date(todayAttendance.checkOut).toLocaleTimeString('ar-SA', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '-'
                                    }
                                </span>
                            </div>
                            {!todayAttendance.checkOut && (
                                <div className="mt-4">
                                    <Link href="/employee/attendance" className="text-blue-600 hover:underline text-sm">
                                        سجل خروجك الآن ←
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            لم تقم بتسجيل الدخول اليوم
                            <div className="mt-4">
                                <Link href="/employee/attendance" className="text-blue-600 hover:underline">
                                    سجل الآن
                                </Link>
                            </div>
                        </div>
                    )}
                </Card>

                {/* رصيد الإجازات - بيانات حقيقية */}
                <Card>
                    <h2 className="font-bold text-gray-900 mb-4">رصيد الإجازات</h2>
                    {employee?.leaveBalance ? (
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                <span className="block text-2xl font-bold text-blue-600">
                                    {employee.leaveBalance.annualRemaining}
                                </span>
                                <span className="text-xs text-gray-600">سنوية</span>
                            </div>
                            <div className="p-2 bg-purple-50 rounded border border-purple-200">
                                <span className="block text-2xl font-bold text-purple-600">
                                    {employee.leaveBalance.sickRemaining}
                                </span>
                                <span className="text-xs text-gray-600">مرضية</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            لا توجد بيانات رصيد
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
