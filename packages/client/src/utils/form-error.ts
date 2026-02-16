import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { toast } from 'sonner';

interface ValidationError 
{
    code: string;
    message: string;
    path: string[];
}

interface ZodFormattedError 
{
    _errors: string[];
}

interface ApiErrorResponse 
{
    message?: string;
    errors?: ValidationError[] | Record<string, ZodFormattedError>;
}

export const handleFormError = <T extends FieldValues>(
    error: any,
    setError: UseFormSetError<T>
) => 
{
    const responseData = error?.response?.data as ApiErrorResponse;
    const backendErrors = responseData?.errors;

    if (backendErrors) 
    {
        if (Array.isArray(backendErrors)) 
        {
            backendErrors.forEach((err) => 
            {
                const fieldName = err.path.join('.') as Path<T>;
                setError(fieldName, 
                {
                    type: 'server',
                    message: err.message,
                });
            });
        } 
        
        else if (typeof backendErrors === 'object') 
        {
            let hasMappedError = false;

            Object.entries(backendErrors).forEach(([key, value]) => 
            {
                const errorItem = value as ZodFormattedError;
                
                if (errorItem && Array.isArray(errorItem._errors) && errorItem._errors.length > 0) 
                {
                    setError(key as Path<T>, {
                        type: 'server',
                        message: errorItem._errors[0]
                    });
                    hasMappedError = true;
                }
            });

            if (!hasMappedError) 
            {
                toast.error(responseData?.message || 'Validation error occurred');
            }
        }
    } 
    else 
    {
        const errorMessage = responseData?.message || error.message || 'An unexpected error occurred.';
        toast.error(errorMessage);
    }
};