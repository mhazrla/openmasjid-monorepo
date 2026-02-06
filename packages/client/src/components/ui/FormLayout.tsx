import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface FormItemProps 
{
    label?: string;
    error?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    required?: boolean;
}

export const FormItem = ({ 
    label, 
    error, 
    description, 
    children, 
    className, 
    required 
}: FormItemProps) => 
{
    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label} {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            {children}
            {description && !error && <p className="text-[0.8rem] text-slate-500">{description}</p>}
            {error && <p className="text-[0.8rem] font-medium text-red-500 animate-in fade-in-50">{error}</p>}
        </div>
    );
};

export const FormSection = ({ 
    children, 
    className 
}: { children: ReactNode, className?: string }) => 
{
    return (
        <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
            {children}
        </div>
    );
};
