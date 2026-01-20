import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-SA');
}

export function formatTime(date: string | Date | undefined) {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(amount: number | undefined) {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
}
