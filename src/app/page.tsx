// الصفحة الرئيسية - Landing Page

import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          أدِر موظفيك بكل سهولة
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          نظام سحابي متكامل لإدارة الموظفين، الحضور، والإجازات.
          وفّر الوقت والمال مع حل SaaS احترافي.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/register-tenant">
            <Button variant="primary" className="px-8 py-3 text-lg">
              ابدأ تجربة مجانية
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-8 py-3 text-lg">
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          لماذا نظامنا؟
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <Card title="📊 إدارة متكاملة">
            <p className="text-gray-600">
              أضف وعدّل واحذف بيانات الموظفين بكل سهولة.
              كل شيء في مكان واحد.
            </p>
          </Card>

          <Card title="⏰ تتبع الحضور">
            <p className="text-gray-600">
              سجّل الحضور والانصراف تلقائيًا.
              تقارير دقيقة لساعات العمل.
            </p>
          </Card>

          <Card title="📅 إدارة الإجازات">
            <p className="text-gray-600">
              طلبات إلكترونية، اعتماد سريع،
              متابعة الرصيد بكل شفافية.
            </p>
          </Card>

          <Card title="🔒 أمان عالي">
            <p className="text-gray-600">
              بياناتك محمية بأحدث معايير الأمان.
              نسخ احتياطي تلقائي يوميًا.
            </p>
          </Card>

          <Card title="☁️ سحابي 100%">
            <p className="text-gray-600">
              الوصول من أي مكان وأي جهاز.
              لا حاجة للتثبيت أو الصيانة.
            </p>
          </Card>

          <Card title="📈 تقارير فورية">
            <p className="text-gray-600">
              اتخذ قرارات مبنية على بيانات دقيقة.
              رسوم بيانية وإحصائيات واضحة.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            جرّب النظام اليوم مجانًا
          </h2>
          <p className="text-xl mb-8">
            14 يوم تجربة مجانية - بدون بطاقة ائتمان
          </p>
          <Link href="/register-tenant">
            <Button variant="secondary" className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100">
              ابدأ الآن
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
