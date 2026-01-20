import Card from '@/components/ui/Card';

interface LeaveBalanceCardProps {
    annualUsed: number;
    annualTotal: number;
    sickUsed: number;
    sickTotal: number;
}

export function LeaveBalanceCard({ annualUsed, annualTotal, sickUsed, sickTotal }: LeaveBalanceCardProps) {
    return (
        <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">رصيد الإجازات</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">الإجازة السنوية</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-900 mt-1">
                        {annualTotal - annualUsed}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">من {annualTotal}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">الإجازة المرضية</p>
                    <p className="text-2xl md:text-3xl font-bold text-purple-900 mt-1">
                        {sickTotal - sickUsed}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">من {sickTotal}</p>
                </div>
            </div>
        </Card>
    );
}
