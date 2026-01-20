import { Employee } from './employee';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT';

export interface Attendance {
    id: string;
    tenantId: string;
    employeeId: string;
    date: Date;
    checkIn: Date;
    checkOut?: Date | null;
    totalHours?: number | null;
    status: string;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
    employee?: Employee;
}
