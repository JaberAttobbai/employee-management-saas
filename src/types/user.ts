export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
    id: string;
    tenantId: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    lastLoginAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    // Frontend extensions
    employeeId?: string;
    firstName?: string;
    lastName?: string;
}

// Session User interface used in Auth
export interface SessionUser {
    userId: string
    tenantId: string
    role: string
    email: string
}
