// Prisma Client Singleton
// نستخدم Singleton Pattern لتجنب إنشاء connections كثيرة في Development

import { PrismaClient } from '@prisma/client'

// إنشاء global variable للـ PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// إنشاء أو استخدام instance موجود
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

// حفظ في global في Development (Hot Reload)
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
