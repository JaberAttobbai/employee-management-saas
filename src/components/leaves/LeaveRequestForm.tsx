'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface LeaveRequestFormProps {
    onSubmit: (data: any) => Promise<void>;
    isLoading?: boolean;
}

export function LeaveRequestForm({ onSubmit, isLoading }: LeaveRequestFormProps) {
    const [formData, setFormData] = useState({
        type: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="نوع الإجازة"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    options={[
                        { value: 'ANNUAL', label: 'سنوية' },
                        { value: 'SICK', label: 'مرضية' },
                        { value: 'EMERGENCY', label: 'طارئة' },
                        { value: 'UNPAID', label: 'بدون راتب' },
                    ]}
                />
                <Input
                    label="تاريخ البداية"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    required
                />
                <Input
                    label="تاريخ النهاية"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السبب</label>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                />
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'جاري الإرسال...' : 'تقديم الطلب'}
                </Button>
            </div>
        </form>
    );
}
