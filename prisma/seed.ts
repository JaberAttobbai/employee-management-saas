// ملف Seed لإضافة بيانات تجريبية
// يتم تشغيله بالأمر: npx prisma db seed

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 بدأ إضافة البيانات التجريبية...')

    // ================================================================
    // 1. إنشاء شركة تجريبية
    // ================================================================
    const tenant = await prisma.tenant.upsert({
        where: { domain: 'demo-company' },
        update: {},
        create: {
            name: 'شركة التقنية المتقدمة',
            domain: 'demo-company',
            size: 'MEDIUM',
            industry: 'تقنية المعلومات',
            status: 'ACTIVE',
        }
    })
    console.log(`✅ تم إنشاء الشركة: ${tenant.name}`)

    // ================================================================
    // 2. إنشاء مستخدم Admin
    // ================================================================
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const adminUser = await prisma.user.upsert({
        where: { id: 'admin-user-1' },
        update: {},
        create: {
            id: 'admin-user-1',
            tenantId: tenant.id,
            email: 'admin@demo.com',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true,
        }
    })
    console.log(`✅ تم إنشاء المستخدم: ${adminUser.email} (Admin)`)

    // ================================================================
    // 3. إنشاء مستخدم HR
    // ================================================================
    const hrUser = await prisma.user.upsert({
        where: { id: 'hr-user-1' },
        update: {},
        create: {
            id: 'hr-user-1',
            tenantId: tenant.id,
            email: 'hr@demo.com',
            password: await bcrypt.hash('hr123', 10),
            role: 'HR',
            status: 'ACTIVE',
            emailVerified: true,
        }
    })
    console.log(`✅ تم إنشاء المستخدم: ${hrUser.email} (HR)`)

    // ================================================================
    // 4. إنشاء موظفين تجريبيين
    // ================================================================
    const employees = [
        {
            id: 'emp-1',
            employeeNumber: 'E1001',
            firstName: 'أحمد',
            lastName: 'محمد',
            email: 'ahmed@demo.com',
            phone: '0501234567',
            department: 'IT',
            position: 'مطور برمجيات',
            hireDate: new Date('2024-01-01'),
            salary: 8000,
        },
        {
            id: 'emp-2',
            employeeNumber: 'E1002',
            firstName: 'سارة',
            lastName: 'علي',
            email: 'sara@demo.com',
            phone: '0501234568',
            department: 'HR',
            position: 'أخصائي موارد بشرية',
            hireDate: new Date('2024-02-01'),
            salary: 7000,
        },
        {
            id: 'emp-3',
            employeeNumber: 'E1003',
            firstName: 'محمد',
            lastName: 'سعد',
            email: 'mohammed@demo.com',
            phone: '0501234569',
            department: 'Sales',
            position: 'مدير مبيعات',
            hireDate: new Date('2023-06-01'),
            salary: 9000,
        },
    ]

    const defaultPassword = await bcrypt.hash('employee123', 10);

    for (const emp of employees) {
        // 1. Create User for Employee
        const userId = `user-${emp.id}`;
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                tenantId: tenant.id,
                email: emp.email,
                password: defaultPassword,
                role: 'EMPLOYEE',
                status: 'ACTIVE',
                emailVerified: true,
            }
        });

        // 2. Create Employee linked to User
        const created = await prisma.employee.upsert({
            where: { id: emp.id },
            update: { userId: user.id },
            create: {
                ...emp,
                tenantId: tenant.id,
                userId: user.id,
                status: 'ACTIVE',
            }
        })
        console.log(`✅ تم إنشاء الموظف والمستخدم: ${created.firstName} ${created.lastName}`)

        // إنشاء رصيد إجازات للموظف
        await prisma.leaveBalance.upsert({
            where: { employeeId: created.id },
            update: {},
            create: {
                tenantId: tenant.id,
                employeeId: created.id,
                year: 2026,
                annualTotal: 21,
                annualUsed: 0,
                annualRemaining: 21,
                sickTotal: 10,
                sickUsed: 0,
                sickRemaining: 10,
            }
        })
    }

    // ================================================================
    // 5. إنشاء سجلات حضور تجريبية
    // ================================================================
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const emp of employees) {
        const checkIn = new Date(today)
        checkIn.setHours(8, 30, 0)

        const checkOut = new Date(today)
        checkOut.setHours(17, 0, 0)

        // Use upsert to prevent duplicate errors
        const attendanceId = `att-${emp.id}-${today.toISOString().split('T')[0]}`;
        await prisma.attendance.upsert({
            where: {
                tenantId_employeeId_date: {
                    tenantId: tenant.id,
                    employeeId: emp.id,
                    date: today
                }
            },
            update: {},
            create: {
                id: attendanceId,
                tenantId: tenant.id,
                employeeId: emp.id,
                date: today,
                checkIn,
                checkOut,
                totalHours: 8.5,
                status: 'PRESENT',
            }
        })
    }
    console.log('✅ تم إنشاء سجلات الحضور لليوم')

    // ================================================================
    // 6. إنشاء طلبات إجازة تجريبية
    // ================================================================
    await prisma.leave.upsert({
        where: { id: 'leave-demo-1' },
        update: {},
        create: {
            id: 'leave-demo-1',
            tenantId: tenant.id,
            employeeId: 'emp-1',
            type: 'ANNUAL',
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-02-05'),
            days: 5,
            reason: 'إجازة عائلية',
            status: 'PENDING',
        }
    })
    console.log('✅ تم إنشاء طلب إجازة معلق')

    // ================================================================
    // 7. إنشاء إعدادات الشركة
    // ================================================================
    await prisma.settings.upsert({
        where: { tenantId: tenant.id },
        update: {},
        create: {
            tenantId: tenant.id,
            workStartTime: '08:00',
            workEndTime: '17:00',
            lateThresholdMinutes: 15,
            workDays: '["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY"]',
            annualLeaveDays: 21,
            sickLeaveDays: 10,
            holidays: JSON.stringify([
                { date: '2026-09-23', name: 'اليوم الوطني' },
                { date: '2026-01-01', name: 'رأس السنة الميلادية' },
            ]),
            currency: 'SAR',
            timezone: 'Asia/Riyadh',
        }
    })
    console.log('✅ تم إنشاء إعدادات الشركة')

    console.log('\n🎉 تم إضافة جميع البيانات التجريبية بنجاح!')
    console.log('\n📧 بيانات تسجيل الدخول:')
    console.log('   Admin: admin@demo.com / admin123')
    console.log('   HR: hr@demo.com / hr123')
    console.log('   Employee: ahmed@demo.com / employee123')
}

main()
    .catch((e) => {
        console.error('❌ خطأ في إضافة البيانات:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
