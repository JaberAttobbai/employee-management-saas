'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

// 📋 أنواع البيانات
interface AttendanceRecord {
    id: string;
    date: Date;
    checkIn: Date;
    checkOut: Date | null;
    totalHours: number | null;
    status: string;
    notes: string | null;
}

interface TodayRecord {
    id: string;
    checkIn: Date;
    checkOut: Date | null;
    totalHours: number | null;
    status: string;
}

export default function EmployeeAttendancePage() {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [todayRecord, setTodayRecord] = useState<TodayRecord | null>(null);
    const [canCheckIn, setCanCheckIn] = useState(false);
    const [canCheckOut, setCanCheckOut] = useState(false);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // 🕐 تحديث الوقت كل ثانية
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 📡 جلب بيانات الحضور من API
    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await fetch('/api/attendance/me');
            const json = await res.json();

            if (json.success) {
                setAttendanceHistory(json.data.history || []);
                setTodayRecord(json.data.todayRecord || null);
                setCanCheckIn(json.data.canCheckIn);
                setCanCheckOut(json.data.canCheckOut);
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

    // ✅ تسجيل الدخول
    const handleCheckIn = async () => {
        if (!confirm('هل تريد تسجيل الدخول الآن؟')) return;

        try {
            setProcessing(true);
            setError('');

            const res = await fetch('/api/attendance/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'check-in' })
            });

            const json = await res.json();

            if (json.success) {
                alert(`✅ ${json.message}\n⏰ الوقت: ${json.data.checkInTime}`);

                // إذا كان متأخراً، أظهر تنبيه
                if (json.data.isLate) {
                    alert('⚠️ ملاحظة: أنت متأخر عن موعد العمل المحدد');
                }

                // إعادة تحميل البيانات
                await fetchAttendance();
            } else {
                alert(`❌ ${json.error}`);
            }
        } catch (e) {
            console.error(e);
            alert('❌ حدث خطأ أثناء تسجيل الدخول');
        } finally {
            setProcessing(false);
        }
    };

    // 🚪 تسجيل الخروج
    const handleCheckOut = async () => {
        if (!confirm('هل تريد تسجيل الخروج الآن؟')) return;

        try {
            setProcessing(true);
            setError('');

            const res = await fetch('/api/attendance/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'check-out' })
            });

            const json = await res.json();

            if (json.success) {
                alert(
                    `✅ ${json.message}\n` +
                    `⏰ الوقت: ${json.data.checkOutTime}\n` +
                    `⏱️ إجمالي الساعات: ${json.data.totalHours} ساعة`
                );

                // إعادة تحميل البيانات
                await fetchAttendance();
            } else {
                alert(`❌ ${json.error}`);
            }
        } catch (e) {
            console.error(e);
            alert('❌ حدث خطأ أثناء تسجيل الخروج');
        } finally {
            setProcessing(false);
        }
    };

    // 🎨 دالة تنسيق الوقت
    const formatTime = (date: Date | string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 🎨 دالة تنسيق التاريخ
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // 🎨 دالة الحصول على اسم الحالة
    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            'PRESENT': 'حاضر',
            'LATE': 'متأخر',
            'HALF_DAY': 'نصف يوم',
            'ABSENT': 'غائب'
        };
        return statusMap[status] || status;
    };

    // 🎨 دالة الحصول على لون الحالة
    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            'PRESENT': 'bg-green-100 text-green-700',
            'LATE': 'bg-orange-100 text-orange-700',
            'HALF_DAY': 'bg-yellow-100 text-yellow-700',
            'ABSENT': 'bg-red-100 text-red-700'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">⏰ سجل الحضور</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    ❌ {error}
                </div>
            )}

            {/* بطاقة تسجيل الحضور */}
            <Card>
                <div className="flex flex-col items-center justify-center p-8 space-y-6">
                    {/* الساعة الحالية */}
                    <div className="text-6xl font-bold text-gray-900 font-mono">
                        {currentTime.toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        })}
                    </div>

                    {/* التاريخ */}
                    <div className="text-lg text-gray-600">
                        {currentTime.toLocaleDateString('ar-SA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>

                    {/* معلومات الحضور اليوم */}
                    {todayRecord && (
                        <div className="w-full max-w-md bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-700 font-medium">وقت الدخول:</span>
                                    <div className="text-blue-900 font-semibold text-lg">
                                        {formatTime(todayRecord.checkIn)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-blue-700 font-medium">وقت الخروج:</span>
                                    <div className="text-blue-900 font-semibold text-lg">
                                        {formatTime(todayRecord.checkOut)}
                                    </div>
                                </div>
                            </div>
                            {todayRecord.totalHours && (
                                <div className="mt-3 pt-3 border-t border-blue-200 text-center">
                                    <span className="text-blue-700 text-sm">إجمالي الساعات: </span>
                                    <span className="text-blue-900 font-bold text-lg">
                                        {todayRecord.totalHours.toFixed(2)} ساعة
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* أزرار التسجيل */}
                    <div className="flex gap-4">
                        {canCheckIn && (
                            <Button
                                onClick={handleCheckIn}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium"
                            >
                                {processing ? '⏳ جاري التسجيل...' : '✅ تسجيل دخول'}
                            </Button>
                        )}

                        {canCheckOut && (
                            <Button
                                onClick={handleCheckOut}
                                disabled={processing}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-medium"
                            >
                                {processing ? '⏳ جاري التسجيل...' : '🚪 تسجيل خروج'}
                            </Button>
                        )}

                        {!canCheckIn && !canCheckOut && todayRecord?.checkOut && (
                            <div className="text-center">
                                <div className="bg-green-100 border border-green-200 rounded-lg px-6 py-3">
                                    <div className="text-green-800 font-medium">
                                        ✅ لقد أكملت يوم عملك اليوم
                                    </div>
                                    <div className="text-green-600 text-sm mt-1">
                                        شكراً لك!
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* بطاقة سجل الأيام السابقة */}
            <Card title="📊 سجل الأيام السابقة">
                {attendanceHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        لا يوجد سجل سابق
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>وقت الدخول</TableHead>
                                    <TableHead>وقت الخروج</TableHead>
                                    <TableHead>إجمالي الساعات</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>ملاحظات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceHistory.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {formatDate(record.date)}
                                        </TableCell>
                                        <TableCell>{formatTime(record.checkIn)}</TableCell>
                                        <TableCell>{formatTime(record.checkOut)}</TableCell>
                                        <TableCell>
                                            {record.totalHours
                                                ? `${record.totalHours.toFixed(2)} ساعة`
                                                : '-'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                                                {getStatusLabel(record.status)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {record.notes || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>

            {/* ملاحظة توضيحية */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>ℹ️ ملاحظة:</strong> يمكنك تسجيل الدخول مرة واحدة فقط يومياً.
                وقت العمل الرسمي: 8:00 صباحاً.
                التسجيل بعد هذا الوقت سيعتبر تأخيراً.
            </div>
        </div>
    );
}
