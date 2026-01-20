// مكون حقل إدخال مع تسميات وأخطاء

interface InputProps {
    label?: string  // التسمية فوق الحقل
    type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel'
    placeholder?: string
    value?: string
    name?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string  // رسالة خطأ
    required?: boolean
    disabled?: boolean
    className?: string
}

export default function Input({
    label,
    type = 'text',
    placeholder,
    value,
    name,
    onChange,
    error,
    required = false,
    disabled = false,
    className = ''
}: InputProps) {
    return (
        <div className="w-full">
            {/* التسمية */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 mr-1">*</span>}
                </label>
            )}

            {/* حقل الإدخال */}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
            />

            {/* رسالة الخطأ */}
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}
