// مكون بطاقة لعرض المحتوى بشكل منظم

interface CardProps {
    title?: string            // العنوان
    description?: string      // الوصف
    children?: React.ReactNode  // المحتوى الداخلي
    className?: string        // أنماط إضافية
    onClick?: () => void      // إذا كانت البطاقة قابلة للنقر
}

export default function Card({
    title,
    description,
    children,
    className = '',
    onClick
}: CardProps) {
    // إذا كانت قابلة للنقر، نضيف أنماط hover
    const clickableStyles = onClick
        ? 'cursor-pointer hover:shadow-lg transition-shadow'
        : ''

    return (
        <div
            onClick={onClick}
            className={`
        bg-white rounded-lg shadow-md p-6
        ${clickableStyles}
        ${className}
      `}
        >
            {/* العنوان */}
            {title && (
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {title}
                </h2>
            )}

            {/* الوصف */}
            {description && (
                <p className="text-gray-600 mb-4">
                    {description}
                </p>
            )}

            {/* المحتوى */}
            {children}
        </div>
    )
}
