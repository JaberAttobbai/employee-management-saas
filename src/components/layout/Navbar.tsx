'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

export function Navbar() {
    const { user, logout } = useAuth();
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center">
                            <span className="text-2xl font-bold text-blue-600">
                                نظام إدارة الموظفين
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-700">
                            👤 {user?.email || 'مدير النظام'}
                        </div>

                        <button
                            onClick={() => setPasswordModalOpen(true)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition"
                        >
                            🔐 تغيير كلمة المرور
                        </button>

                        <button
                            onClick={logout}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            تسجيل خروج
                        </button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
            />
        </nav>
    );
}
