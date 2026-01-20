// مكون زر قابل لإعادة الاستخدام مع أنواع مختلفة

interface ButtonProps {
  children: React.ReactNode  // النص داخل الزر
  onClick?: () => void       // دالة عند النقر (اختيارية)
  variant?: 'primary' | 'secondary' | 'danger'  // نوع الزر
  type?: 'button' | 'submit' | 'reset'  // نوع HTML
  disabled?: boolean  // هل الزر معطل؟
  className?: string  // أنماط إضافية
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = ''
}: ButtonProps) {
  // تحديد الألوان حسب نوع الزر
  const colors = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }
  
  // نمط الزر المعطل
  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        ${colors[variant]}
        ${disabledStyle}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
