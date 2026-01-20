import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const employee = await prisma.employee.findFirst({
            where: { userId: sessionUser.userId }
        });

        if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });

        // Get leaves history
        const leaves = await prisma.leave.findMany({
            where: { employeeId: employee.id },
            orderBy: { createdAt: 'desc' }
        });

        // Get Balance
        const balance = await prisma.leaveBalance.findUnique({
            where: { employeeId: employee.id }
        });

        return NextResponse.json({ success: true, data: { leaves, balance } });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const employee = await prisma.employee.findFirst({
            where: { userId: sessionUser.userId }
        });

        if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });

        const body = await request.json();
        const { type, startDate, endDate, reason } = body;

        // Validation logic here (dates, etc)

        // Calculate days logic (simplified for now)
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Check sufficient balance if annual/sick...

        const leave = await prisma.leave.create({
            data: {
                tenantId: sessionUser.tenantId,
                employeeId: employee.id,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                days: diffDays,
                reason,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, data: leave });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
