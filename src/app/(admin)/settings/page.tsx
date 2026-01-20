// صفحة الإعدادات

import Card from '@/components/ui/Card'
import prisma from '@/lib/prisma'

export default async function SettingsPage() {
    // جلب الإعدادات من قاعدة البيانات
    const tenant = await prisma.tenant.findFirst()
    const settings = tenant ? await prisma.settings.findUnique({
        where: { tenantId: tenant.id }
    }) : null

    return (
        <div className="p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
                <p className="text-gray-600 mt-1">إعدادات النظام والشركة</p>
            </div>

            {/* معلومات الشركة */}
            <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    معلومات الشركة
                </h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                اسم الشركة
                            </label>
                            <p className="text-gray-900">{tenant?.name || 'غير محدد'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                الحجم
                            </label>
                            <p className="text-gray-900">
                                {tenant?.size === 'SMALL' ? 'صغيرة' : tenant?.size === 'MEDIUM' ? 'متوسطة' : 'كبيرة'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                المجال
                            </label>
                            <p className="text-gray-900">{tenant?.industry || 'غير محدد'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                الحالة
                            </label>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant?.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                {tenant?.status === 'ACTIVE' ? 'نشط' : tenant?.status === 'TRIAL' ? 'تجريبي' : 'معلق'}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* إعدادات أوقات العمل */}
            <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    أوقات العمل
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            وقت البداية
                        </label>
                        <p className="text-gray-900">{settings?.workStartTime || '08:00'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            وقت النهاية
                        </label>
                        <p className="text-gray-900">{settings?.workEndTime || '17:00'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            التأخير المسموح (دقيقة)
                        </label>
                        <p className="text-gray-900">{settings?.lateThresholdMinutes || 15}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            المنطقة الزمنية
                        </label>
                        <p className="text-gray-900">{settings?.timezone || 'Asia/Riyadh'}</p>
                    </div>
                </div>
            </Card>

            {/* إعدادات الإجازات */}
            <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    إعدادات الإجازات
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            رصيد الإجازة السنوية (يوم)
                        </label>
                        <p className="text-gray-900">{settings?.annualLeaveDays || 21}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            رصيد الإجازة المرضية (يوم)
                        </label>
                        <p className="text-gray-900">{settings?.sickLeaveDays || 10}</p>
                    </div>
                </div>
            </Card>

            {/* معلومات إضافية */}
            <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    معلومات النظام
                </h2>
                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">العملة</span>
                        <span className="font-medium text-gray-900">{settings?.currency || 'SAR'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">نسخة النظام</span>
                        <span className="font-medium text-gray-900">1.0.0 (Beta)</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-600">آخر تحديث</span>
                        <span className="font-medium text-gray-900">
                            {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                        </span>
                    </div>
                </div>
            </Card>

            {/* ملاحظة */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                    💡 <strong>ملاحظة:</strong> هذه صفحة عرض فقط. في النسخة النهائية ستتمكن من تعديل جميع الإعدادات من خلال نماذج تفاعلية.
                </p>
            </div>
        </div>
    )
}
