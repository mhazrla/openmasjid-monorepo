import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> 
{
    isLoading?: boolean;
    icon?: ReactNode;
    variant?: ButtonVariant;
    children?: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = 
{
    primary: "text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm",
    secondary: "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:ring-slate-200",
    outline: "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 focus:ring-emerald-500",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

const BASE_STYLES = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";

export const ActionButton = ({
    isLoading = false,
    icon,
    variant = 'primary',
    children,
    className,
    disabled,
    ...props
}: ActionButtonProps) => 
{
    return (
        <button
            disabled={isLoading || disabled}
            className={cn(BASE_STYLES, VARIANT_STYLES[variant], className)}
            {...props}
        >
            {/* Wrapper Icon: Pastikan flex dan centered juga */}
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : icon ? (
                <span className="flex items-center justify-center shrink-0 w-4 h-4">
                    {icon}
                </span>
            ) : null}
            
            {/* Text Label */}
            {children && <span>{children}</span>}
        </button>
    );
};