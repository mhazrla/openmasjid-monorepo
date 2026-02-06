import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface DisplayLayoutProps 
{
    children?: ReactNode;
}

export const DisplayLayout = ({ children }: DisplayLayoutProps) => 
{
    return (
        <div className={cn(
            "min-h-screen w-full bg-slate-950 text-white overflow-hidden font-sans selection:bg-emerald-500/30",
            "flex flex-col"
        )}>
           {children}
        </div>
    );
};
