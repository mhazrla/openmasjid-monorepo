import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

export interface SelectOption 
{
    value: string | number;
    label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> 
  {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ 
  className, 
  label, 
  error, 
  options, 
  placeholder, 
  description, 
  ...props 
}, ref) => 
{
    return (
      <div className="w-full space-y-2">
        {label && (
           <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
            <select
                className={cn(
                    "flex h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8",
                    error && "border-red-500 focus-visible:ring-red-500",
                    className
                )}
                ref={ref}
                {...props}
            >
                {placeholder && <option value="" disabled>{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
        {description && !error && <p className="text-xs text-slate-500">{description}</p>}
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
