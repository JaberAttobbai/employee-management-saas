'use client';

import { useState, useEffect } from 'react';
import { LeaveRequestForm } from '@/components/leaves/LeaveRequestForm';
import { LeaveBalanceCard } from '@/components/leaves/LeaveBalanceCard';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

export default function EmployeeLeavesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);

    const fetchLeaves = async () => {
        if (!user?.employeeId) return;
        try {
            const res = await fetch(`/api/leaves?employeeId=${user.employeeId}`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch leaves', error);
        }
    };

    useEffect(() => {
        if (user?.employeeId) {
            fetchLeaves();
            // Mock balance for now as we focus on leaves list visibility
            // or fetch it if possible. Leaving mock balance to ensure no regression on specific user complaint about "leaves not appearing".
            setBalance({
                annualUsed: 0,
                annualTotal: 21,
                sickUsed: 0,
                sickTotal: 10
            });
            setLoading(false);
        }
    }, [user?.employeeId]);

    const handleSubmitRequest = async (data: any) => {
        setLoading(true);
        try {
            // Check if we have employeeId from user
            if (!user?.employeeId) {
                alert('عذراً، لم يتم العثور على معلومات الموظف الخاصة بك.');
                setLoading(false);
                return;
            }

            const payload = {
                ...data, // type, startDate, endDate, reason
                employeeId: user.employeeId
            };

            const response = await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ تم تقديم طلب الإجازة بنجاح');
                // Refresh list
                await fetchLeaves();
            } else {
                alert('❌ ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('❌ حدث خطأ أثناء تقديم الطلب');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge variant="success">مقبول</Badge>;
            case 'REJECTED': return <Badge variant="destructive">مرفوض</Badge>;
            default: return <Badge variant="secondary">قيد المراجعة</Badge>;
        }
    };

    const getLeaveTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'ANNUAL': 'سنوية',
            'SICK': 'مرضية',
            'EMERGENCY': 'طارئة',
            'UNPAID': 'بدون راتب'
        };
        return types[type] || type;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">إدارة الإجازات</h1>

            {balance && (
                <LeaveBalanceCard
                    annualUsed={balance.annualUsed}
                    annualTotal={balance.annualTotal}
                    sickUsed={balance.sickUsed}
                    sickTotal={balance.sickTotal}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <Card>
                    <h3 className="text-lg font-bold mb-4">طلب إجازة جديد</h3>
                    <LeaveRequestForm onSubmit={handleSubmitRequest} isLoading={loading} />
                </Card>

                {/* History Section */}
                <Card>
                    <h3 className="text-lg font-bold mb-4">طلباتي السابقة</h3>
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">لا توجد طلبات سابقة</p>
                        ) : (
                            requests.map((req) => (
                                <div key={req.id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {getLeaveTypeLabel(req.type)} ({req.days} أيام)
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {new Date(req.startDate).toLocaleDateString('en-GB')} - {new Date(req.endDate).toLocaleDateString('en-GB')}
                                        </div>
                                    </div>
                                    <div>
                                        {getStatusBadge(req.status)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
