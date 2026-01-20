// Layout رئيسي لجميع الصفحات

import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

// تحميل خط Cairo للعربية
const cairo = Cairo({
  subsets: ["arabic"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "نظام إدارة الموظفين",
  description: "نظام SaaS متكامل لإدارة الموظفين، الحضور، والإجازات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
