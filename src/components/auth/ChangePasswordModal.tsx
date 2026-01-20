'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('كلمة المرور الجديدة غير متطابقة');
            return;
        }

        if (newPassword.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword // Adding missing field
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('تم تغيير كلمة المرور بنجاح');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    onClose();
                    setSuccess('');
                }, 1500);
            } else {
                setError(data.error || 'حدث خطأ ما');
            }
        } catch (err) {
            setError('فشل الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="تغيير كلمة المرور"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
                {success && <div className="text-green-500 text-sm font-medium text-center">{success}</div>}

                <Input
                    label="كلمة المرور الحالية"
                    name="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
                <Input
                    label="كلمة المرور الجديدة"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <Input
                    label="تأكيد كلمة المرور الجديدة"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        إلغاء
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
