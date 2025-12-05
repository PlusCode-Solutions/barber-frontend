import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`
            bg-white rounded-xl shadow-lg border border-gray-100 
            transition-shadow hover:shadow-xl duration-300
            ${className}
        `}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: CardProps) {
    return (
        <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }: CardProps) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}
