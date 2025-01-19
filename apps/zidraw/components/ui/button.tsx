import React from 'react';

interface ButtonProps {
    variant: 'primary' | 'outline' | 'secondary',
    size: 'lg' | 'md' | 'sm',
    onClick?: () => void,
    disabled?: boolean,
    name: string,
}

const Button: React.FC<ButtonProps> = ({
    variant,
    name,
    size,
    disabled,
    onClick
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
            className={`border-2 rounded-lg m-4 ${sizeClasses} ${variantClasses}`}
            onClick={onClick}
            disabled={disabled}
        >
            {name}
        </button>
    );
}

export default Button;
