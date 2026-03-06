import * as React from "react"
import { cn } from "../../lib/utils"
import { Label } from "./Label"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> 
{
  label?: React.ReactNode;
  error?: string;
  description?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, description, required, ...props }, ref) => 
{
    return (
      <div className="w-full space-y-2">
        {label && (
          <Label required={required}>
            {label}
          </Label>
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          required={required}
          {...props}
        />
        {description && !error && <p className="text-xs text-slate-500">{description}</p>}
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
