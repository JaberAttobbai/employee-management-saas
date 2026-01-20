import Card from '@/components/ui/Card';

interface AttendanceStatsProps {
    present: number;
    late: number;
    absent: number;
    total: number;
}

export function AttendanceStats({ present, late, absent, total }: AttendanceStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-blue-50 border-blue-100">
                <h3 className="text-blue-600 font-medium text-sm">إجمالي الموظفين</h3>
                <p className="text-3xl font-bold text-blue-900 mt-2">{total}</p>
            </Card>
            <Card className="bg-green-50 border-green-100">
                <h3 className="text-green-600 font-medium text-sm">حضور اليوم</h3>
                <p className="text-3xl font-bold text-green-900 mt-2">{present}</p>
            </Card>
            <Card className="bg-orange-50 border-orange-100">
                <h3 className="text-orange-600 font-medium text-sm">تأخر</h3>
                <p className="text-3xl font-bold text-orange-900 mt-2">{late}</p>
            </Card>
            <Card className="bg-red-50 border-red-100">
                <h3 className="text-red-600 font-medium text-sm">غياب</h3>
                <p className="text-3xl font-bold text-red-900 mt-2">{absent}</p>
            </Card>
        </div>
    );
}
