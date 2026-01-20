import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const sessionUser = await getCurrentUser();

        if (!sessionUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch full user details if needed, e.g. names if not in session
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.userId },
            select: {
                id: true,
                email: true,
                role: true,
                tenantId: true,
                // If User table has names, select them. 
                // But names are in Employee table usually?
                // Depending on schema. Let's check schema/types.
                // Assuming User matches types/user.ts which currently doesn't have names.
            }
        });

        // If role is EMPLOYEE, try to fetch employee details to get Name
        let employeeDetails = null;
        if (sessionUser.role === 'EMPLOYEE') {
            employeeDetails = await prisma.employee.findFirst({
                where: { userId: sessionUser.userId }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...user,
                employeeId: employeeDetails?.id,
                firstName: employeeDetails?.firstName || 'User', // Fallback or from Employee
                lastName: employeeDetails?.lastName || '',
            }
        });

    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
