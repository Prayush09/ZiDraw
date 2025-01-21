import React from 'react';

interface ButtonProps {
    variant: 'primary' | 'outline' | 'secondary',
    size: 'lg' | 'md' | 'sm',
    onClick?: () => void,
    disabled?: boolean,
    name?: string, // Make this optional since children can also render content
    className?: string,
    children?: React.ReactNode // Ensure children is optional
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant,
    name,
    size,
    disabled,
    onClick,
    className
}) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'lg':
                return 'p-6 text-lg';
            case 'md':
                return 'p-4 text-md';
            case 'sm':
                return 'p-2 m-2 text-sm';
            default:
                return '';
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'bg-black text-white border-white';
            case 'outline':
                return 'bg-white text-black border-black';
            case 'secondary':
                return 'bg-gray-300 text-black border-gray-500';
            default:
                return 'bg-gray-300 text-black border-gray-500';
        }
    };

    const sizeClasses = getSizeClasses();
    const variantClasses = getVariantClasses();

    return (
        <button
            className={`border-2 rounded-lg m-4 ${sizeClasses} ${variantClasses} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children || name} {/* Render children if provided; fallback to name */}
        </button>
    );
}


