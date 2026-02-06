import { cn } from "../../../lib/utils";

interface PrayerTimeCardProps 
{
    label: string;
    time: string;
    highlight?: boolean;
}

export const PrayerTimeCard = ({ 
    label, 
    time, 
    highlight = false 
}: PrayerTimeCardProps) =>
{
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-200 group relative overflow-hidden",
            highlight 
                ? "bg-amber-50 border-amber-200 shadow-md transform hover:-translate-y-1" 
                : "bg-white border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md"
        )}>
            {highlight && <div className="absolute top-0 inset-x-0 h-1 bg-amber-400" />}
            <span className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-2",
                highlight ? "text-amber-700" : "text-slate-400 group-hover:text-emerald-600"
            )}>{label}</span>
            <span className={cn(
                "text-2xl font-bold font-mono tracking-tight",
                highlight ? "text-amber-900" : "text-slate-700"
            )}>{time}</span>
        </div>
        );
};
