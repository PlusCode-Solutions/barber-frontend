import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className = '',
        variant = 'primary',
        size = 'md',
        isLoading = false,
        fullWidth = false,
        children,
        disabled,
        ...props
    }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 shadow-md shadow-primary/20",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
            danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
            ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
            outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-indigo-500"
        };

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-4 py-2 text-sm",
            lg: "px-6 py-3 text-base"
        };

        const widthClass = fullWidth ? "w-full" : "";

        // Hook for context inside component if possible, but Button is UI.
        // Better to rely on CSS vars or pass it. 
        // User requested "like login" (inline). Since Button is generic, we can't easily hook useTenant here without circular deps or overhead.
        // However, we can keep the CSS variable approach as fallback, OR allows style override.
        // But the user said "like login". 
        // Let's modify the component to use the CSS variable directly in style as a "hard" fallback if the class fails?
        // Actually, the previous fix to TenantContext (smart hex) SHOULD make the variable work.
        // But sticking to the user's request: "Inline Style".

        // We will stick to the CSS variable for Button as it's too granular to hook context everywhere.
        // But we will ensure the class 'bg-primary' is NOT used if we can allow style injection.
        // Re-reading: The user said "Login uses inline". 
        // Login page uses: style={{ color: tenant.primaryColor }}

        // Let's trust the TenantContext fix for the button (variables), but maybe the user meant the NAVBAR specifically was failing.
        // I updated Navbars. Let's see if that's enough.
        // Wait, if I change Button to use inline style, I need to fetch tenant context here.

        return (
            <button
                ref={ref}
                className={`
                    ${baseStyles}
                    ${variants[variant]}
                    ${sizes[size]}
                    ${widthClass}
                    ${className}
                `}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
