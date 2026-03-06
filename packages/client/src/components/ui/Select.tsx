import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Check, X, Search } from "lucide-react"
import { cn } from "../../lib/utils"

export interface SelectOption 
{
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface SelectProps 
{
    value?: string | number | (string | number)[];
    onChange?: (value: string | number | (string | number)[]) => void;
    options: SelectOption[];
    placeholder?: string;
    label?: React.ReactNode;
    description?: string;
    error?: string;
    className?: string;
    searchable?: boolean;
    multiple?: boolean;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    triggerClassName?: string;
    onBlur?: () => void;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(({ 
    className, 
    triggerClassName,
    label, 
    error, 
    options, 
    placeholder = "Select...", 
    description, 
    value,
    onChange,
    searchable = false,
    multiple = false,
    disabled = false,
    onBlur,
    ...props 
}, ref) => 
{
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
    
    const containerRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const updatePosition = React.useCallback(() => 
    {
        if (containerRef.current) 
        {
            const rect = containerRef.current.getBoundingClientRect();
            const dropdownMaxH = 240; // 15rem
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUp = spaceBelow < dropdownMaxH && rect.top > dropdownMaxH;

            setPosition({
                top: openUp 
                    ? rect.top + window.scrollY - dropdownMaxH - 4 
                    : rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, []);

    React.useLayoutEffect(() => 
    {
        if (!isOpen) return;
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => 
        {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, updatePosition]);

    // Handle click outside
    React.useEffect(() => 
    {
        const handleClickOutside = (event: MouseEvent) => 
        {
            if (
                containerRef.current && 
                !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) 
          {
                setIsOpen(false);
                if (onBlur) onBlur();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onBlur]);

    // Handle search focus
    React.useEffect(() => 
    {
        if (isOpen && searchable && searchInputRef.current) 
        {
            searchInputRef.current.focus();
        }
    }, [isOpen, searchable]);

    // Filter options
    const filteredOptions = React.useMemo(() => 
    {
        if (!searchQuery) return options;
        return options.filter(opt => 
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [options, searchQuery]);

    // Handle selection
    const handleSelect = (optionValue: string | number) => 
    {
        if (multiple) 
        {
            const currentValues = Array.isArray(value) ? value : [];
            const newValue = currentValues.includes(optionValue)
                ? currentValues.filter(v => v !== optionValue)
                : [...currentValues, optionValue];
            onChange?.(newValue);
        } else {
            onChange?.(optionValue);
            setIsOpen(false);
        }
    };

    // Remove item (for multiple)
    const handleRemove = (e: React.MouseEvent, optionValue: string | number) => 
    {
        e.stopPropagation();
        if (multiple && Array.isArray(value)) 
        {
            onChange?.(value.filter(v => v !== optionValue));
        }
    };

    // Display text
    const getDisplayText = () => 
    {
        if (!value || (Array.isArray(value) && value.length === 0)) 
        {
            return <span className="text-slate-500">{placeholder}</span>;
        }

        if (multiple) 
        {
            const selectedOptions = options.filter(opt => (value as (string | number)[]).includes(opt.value));
            return (
                <div className="flex flex-wrap gap-1">
                    {selectedOptions.map(opt => (
                        <span key={opt.value} className="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                            {opt.label}
                            <X 
                                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                                onClick={(e) => handleRemove(e, opt.value)}
                            />
                        </span>
                    ))}
                </div>
            );
        } else {
            const selectedOption = options.find(opt => opt.value === value);
            return selectedOption ? selectedOption.label : placeholder;
        }
    };

    // Forward ref to container
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const dropdownContent = (
        <div 
            ref={dropdownRef}
            className="z-200 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 flex flex-col"
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: '15rem' 
            }}
        >
            {searchable && (
                <div className="flex items-center border-b border-slate-100 px-3 pb-2 pt-1 mb-1 shrink-0">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        ref={searchInputRef}
                        className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        // Prevent closing when clicking search
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
            
            <div className="overflow-y-auto flex-1 p-1">
                {filteredOptions.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">No options found.</p>
                ) : (
                    filteredOptions.map((opt) => 
                    {
                        const isSelected = multiple 
                            ? Array.isArray(value) && value.includes(opt.value)
                            : value === opt.value;

                        return (
                            <div
                                key={opt.value}
                                aria-disabled={opt.disabled}
                                data-disabled={opt.disabled}
                                className={cn(
                                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 data-disabled:pointer-events-none data-disabled:opacity-50",
                                    isSelected && "bg-emerald-50 text-emerald-900 font-medium"
                                )}
                                onClick={(e) => 
                                {
                                    if (opt.disabled) return;
                                    e.stopPropagation();
                                    handleSelect(opt.value);
                                }}
                            >
                                <span className="flex-1 truncate">{opt.label}</span>
                                {isSelected && (
                                    <Check className="ml-auto h-4 w-4 text-emerald-600" />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    return (
        <div className={cn("w-full space-y-2", className)} ref={containerRef} {...props}>
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                    {label} {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                <div
                    className={cn(
                        "flex min-h-[40px] w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none cursor-pointer",
                        disabled && "cursor-not-allowed opacity-50",
                        error && "border-red-500",
                        isOpen && "ring-2 ring-emerald-500 ring-offset-2 border-emerald-500",
                        triggerClassName
                    )}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <div className="flex-1">
                        {getDisplayText()}
                    </div>
                    <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
                </div>

                {isOpen && createPortal(dropdownContent, document.body)}
            </div>

            {description && !error && <p className="text-xs text-slate-500">{description}</p>}
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
});

const MemoizedSelect = React.memo(Select);
MemoizedSelect.displayName = "Select";

export { MemoizedSelect as Select };
