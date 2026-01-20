import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth'; // Warning: this import might not work in middleware due to Node APIs
// Middleware runs in Edge runtime usually. 
// For now, this is a placeholder for logic extraction.

export async function checkAuth(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return false;
    }

    // In real middleware we verify JWT locally without database
    return true;
}
