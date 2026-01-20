'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const adminMenu = [
        { name: 'لوحة التحكم', path: '/dashboard', icon: '📊' },
        { name: 'الموظفون', path: '/employees', icon: '👥' },
        { name: 'الحضور', path: '/attendance', icon: '⏰' },
        { name: 'الإجازات', path: '/leaves/requests', icon: '📅' },
        { name: 'الإعدادات', path: '/settings', icon: '⚙️' },
    ];

    const employeeMenu = [
        { name: 'لوحة التحكم', path: '/employee/dashboard', icon: '🏠' },
        { name: 'تسجيل الحضور', path: '/employee/attendance', icon: '⏰' },
        { name: 'طلباتي', path: '/employee/leaves', icon: '📅' },
        { name: 'الملف الشخصي', path: '/employee/profile', icon: '👤' },
    ];

    const menuItems = user?.role === 'EMPLOYEE' ? employeeMenu : adminMenu;

    return (
        <aside className="w-64 bg-white min-h-screen shadow-sm hidden md:block">
            <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium",
                                isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            )}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
