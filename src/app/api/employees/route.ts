// API للموظفين - GET (قراءة جميع الموظفين) و POST (إنشاء موظف)

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
// 🔐 استيراد دوال إدارة كلمات المرور الاحترافية
import { generateTemporaryPassword, hashPassword } from '@/lib/password'

// ============================================
// GET /api/employees - جلب موظفي الشركة الحالية فقط 🔒
// ============================================
export async function GET(request: NextRequest) {
    try {
        // 🔐 التحقق من المصادقة والحصول على tenantId
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        // 🔍 قراءة معاملات البحث والتصفية من URL
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const department = searchParams.get('department') || '';
        const status = searchParams.get('status') || '';

        // 🏗️ بناء شروط البحث ديناميكياً
        const whereConditions: any = {
            tenantId: sessionUser.tenantId  // 🔒 عزل البيانات
        };

        // البحث في: الاسم الأول، الاسم الأخير، البريد، رقم الموظف
        if (search) {
            whereConditions.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { employeeNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        // تصفية بالقسم
        if (department) {
            whereConditions.department = department;
        }

        // تصفية بالحالة
        if (status) {
            whereConditions.status = status;
        }

        // 📊 جلب الموظفين مع الشروط (فقط من نفس الشركة)
        const employees = await prisma.employee.findMany({
            where: whereConditions,
            include: {
                leaveBalance: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({
            success: true,
            data: employees,
            count: employees.length,
            filters: { search, department, status }
        })
    } catch (error) {
        console.error('خطأ في جلب الموظفين:', error)
        return NextResponse.json(
            { success: false, error: 'فشل جلب البيانات' },
            { status: 500 }
        )
    }
}

// ============================================
// POST /api/employees - إنشاء موظف جديد 🔒
// ============================================
export async function POST(request: NextRequest) {
    try {
        // 🔐 التحقق من المصادقة والحصول على tenantId
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json(
                { success: false, error: 'يجب تسجيل الدخول' },
                { status: 401 }
            );
        }

        const body = await request.json()

        // التحقق من البيانات الأساسية
        if (!body.firstName || !body.email) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'الاسم والبريد مطلوبان'
                },
                { status: 400 }
            )
        }

        // 🔒 استخدام tenantId من JWT (لا نثق بالـ client)
        const tenantId = sessionUser.tenantId;

        let employeeNumber = body.employeeNumber;

        // Auto-generate employee number if not provided
        if (!employeeNumber) {
            const lastEmployee = await prisma.employee.findFirst({
                where: { tenantId: tenantId },  // 🔒 فقط موظفي نفس الشركة
                orderBy: { createdAt: 'desc' }
            });

            if (lastEmployee && lastEmployee.employeeNumber.startsWith('E')) {
                const lastNum = parseInt(lastEmployee.employeeNumber.replace('E', ''));
                if (!isNaN(lastNum)) {
                    employeeNumber = `E${lastNum + 1}`;
                } else {
                    employeeNumber = `E${Math.floor(1000 + Math.random() * 9000)}`;
                }
            } else {
                employeeNumber = 'E1001';
            }
        }

        // Check for duplicates (just in case generated one exists or manual input provided)
        // Check for duplicates
        if (body.employeeNumber) {
            // If manual input, fail if duplicate
            const existing = await prisma.employee.findFirst({
                where: { tenantId: tenantId, employeeNumber: body.employeeNumber }
            });
            if (existing) {
                return NextResponse.json(
                    { success: false, error: 'رقم الموظف مستخدم بالفعل' },
                    { status: 409 }
                );
            }
        } else {
            // If auto-generated, ensure uniqueness (simple retry logic)
            let isUnique = false;
            let retries = 0;
            while (!isUnique && retries < 3) {
                const existing = await prisma.employee.findFirst({
                    where: { tenantId: tenantId, employeeNumber: employeeNumber }
                });
                if (!existing) {
                    isUnique = true;
                } else {
                    // Collision on auto-gen, try random backup
                    employeeNumber = `E${Math.floor(10000 + Math.random() * 90000)}`;
                    retries++;
                }
            }
            if (!isUnique) throw new Error('Failed to generate unique employee number');
        }

        // ════════════════════════════════════════
        // 🔐 توليد كلمة مرور مؤقتة عشوائية
        // ════════════════════════════════════════
        // ✅ بدلاً من كلمة مرور ثابتة (غير آمن)
        // ❌ const password = 'Employee@123'
        // ✅ نولّد كلمة مرور عشوائية قوية أو نستخدم المدخلة
        const temporaryPassword = body.password || generateTemporaryPassword(12);

        // 🔒 تشفير كلمة المرور باستخدام bcrypt
        const hashedPassword = await hashPassword(temporaryPassword);

        // استخدام transaction لضمان إنشاء الاثنين معاً
        const result = await prisma.$transaction(async (tx) => {
            // 1. إنشاء المستخدم
            const user = await tx.user.create({
                data: {
                    tenantId: tenantId,
                    email: body.email,
                    password: hashedPassword,
                    role: 'EMPLOYEE',
                    status: 'ACTIVE',
                    emailVerified: true,
                    // ℹ️ كلمة المرور مؤقتة ويجب تغييرها
                    mustChangePassword: true
                }
            });

            // 2. إنشاء الموظف وربطه بالمستخدم
            const employee = await tx.employee.create({
                data: {
                    tenantId: tenantId,
                    userId: user.id, // ربط الموظف بالمستخدم
                    employeeNumber: employeeNumber,
                    firstName: body.firstName,
                    lastName: body.lastName || '',
                    email: body.email,
                    phone: body.phone || '',
                    department: body.department || 'عام',
                    position: body.position || 'موظف',
                    hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
                    salary: body.salary ? parseFloat(body.salary) : null,
                    gender: body.gender || null,
                    birthDate: body.birthDate ? new Date(body.birthDate) : null,
                    status: 'ACTIVE'
                }
            });

            return { user, employee };
        });

        const employee = result.employee;

        // إنشاء رصيد إجازات للموظف
        await prisma.leaveBalance.create({
            data: {
                tenantId: tenantId,
                employeeId: employee.id,
                year: new Date().getFullYear(),
                annualTotal: 21,
                annualUsed: 0,
                annualRemaining: 21,
                sickTotal: 10,
                sickUsed: 0,
                sickRemaining: 10,
            }
        })

        return NextResponse.json(
            {
                success: true,
                // ⚠️ إرجاع كلمة المرور المؤقتة مرة واحدة فقط
                // المدير يجب أن ينسخها ويعطيها للموظف
                // لن تظهر مرة أخرى في أي API!
                data: { ...employee, tempPassword: temporaryPassword },
                message: 'تم إنشاء الموظف بنجاح'
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('خطأ في إنشاء الموظف:', error)
        return NextResponse.json(
            { success: false, error: 'فشل إنشاء الموظف' },
            { status: 500 }
        )
    }
}
