import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps 
{
    value?: string | File | null;
    onChange: (file: File | null) => void;
    label: string;
    className?: string;
}

export const ImageUpload = ({ value, onChange, label, className }: ImageUploadProps) => 
{
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => 
    {
        if (!value) 
        {
            setPreviewUrl('');

            return;
        }

        if (typeof value === 'string') 
        {
            if (value.startsWith('http')) 
            {
                setPreviewUrl(value);

                return;
            }

            const baseUrl = import.meta.env.VITE_BASE_URL || ''; 
            setPreviewUrl(`${baseUrl}${value}`);

            return;
        }

        if (value instanceof File) 
        {
            const objectUrl = URL.createObjectURL(value);
            setPreviewUrl(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [value]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => 
    {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) 
        {
            toast.error('Invalid file type. Please upload an image.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) 
        { 
            toast.error('File too large. Max size is 2MB.');
            return;
        }

        onChange(file);
        
        if (fileInputRef.current) 
        {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = () => 
    {
        onChange(null);
    };

    const triggerUpload = () => 
    {
        fileInputRef.current?.click();
    };

    return (
        <div className={cn("space-y-4", className)}>
            <label className="block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="flex items-start gap-4">
                {/* Preview Area */}
                <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                    {previewUrl ? (
                        <>
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                </div>

                {/* Controls */}
                <div className="flex-1 space-y-2">
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/png, image/jpeg, image/webp" 
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    
                    <button
                        type="button"
                        onClick={triggerUpload}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        <Upload className="w-4 h-4" />
                        {value ? 'Change Image' : 'Select Image'}
                    </button>
                    
                    <p className="text-xs text-slate-500">
                        JPG, PNG, WebP. Max 2MB.
                    </p>
                </div>
            </div>
        </div>
    );
};
