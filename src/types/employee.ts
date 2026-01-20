import { User } from './user';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Employee {
    id: string;
    tenantId: string;
    userId?: string | null;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate?: Date | null;
    gender?: string | null; // Changed to string to match Prisma output sometimes being loose, but ideally Gender
    department: string;
    position: string;
    hireDate: Date;
    salary?: number | null;
    avatar?: string | null;
    status: string; // Prisma uses String by default for Enums in SQLite usually
    createdAt: Date;
    updatedAt: Date;
    user?: User | null;
}
