// Prisma Client Singleton
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const connectionString = process.env.DATABASE_URL

// دالة لتهيئة Prisma Client
const prismaClientSingleton = () => {
    // 1. حالة Production مع Turso (libsql://)
    if (connectionString?.startsWith('libsql://')) {
        const libsql = createClient({
            url: connectionString,
            authToken: process.env.DATABASE_AUTH_TOKEN,
        })
        // @ts-ignore
        const adapter = new PrismaLibSql(libsql)

        return new PrismaClient({
            // @ts-ignore
            adapter,
            log: ['error'],
        })
    }

    // 2. حالة Development (local file)
    // أو أي حالة أخرى لا تستخدم libsql
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
}

// Global Types
declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
