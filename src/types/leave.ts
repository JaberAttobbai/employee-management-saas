import { Employee } from './employee';
import { User } from './user';

export type LeaveType = 'ANNUAL' | 'SICK' | 'EMERGENCY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Leave {
    id: string;
    tenantId: string;
    employeeId: string;
    type: string;
    startDate: Date;
    endDate: Date;
    days: number;
    reason?: string | null;
    status: string;
    reviewedBy?: string | null;
    reviewedAt?: Date | null;
    rejectionReason?: string | null;
    createdAt: Date;
    updatedAt: Date;
    employee?: Employee;
    reviewer?: User | null;
}

export interface LeaveBalance {
    id: string;
    tenantId: string;
    employeeId: string;
    year: number;
    annualTotal: number;
    annualUsed: number;
    annualRemaining: number;
    sickTotal: number;
    sickUsed: number;
    sickRemaining: number;
    employee?: Employee;
}
