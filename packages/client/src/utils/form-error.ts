import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { toast } from 'sonner';

interface ValidationError {
    code: string;
    message: string;
    path: string[];
}

interface ApiErrorResponse {
    message?: string;
    errors?: ValidationError[];
}

export const handleFormError = <T extends FieldValues>(
    error: any,
    setError: UseFormSetError<T>
) => {
    const responseData = error?.response?.data as ApiErrorResponse;

    if (responseData?.errors && Array.isArray(responseData.errors)) {
        responseData.errors.forEach((err) => {
            // Join path array to dot notation (e.g. ['contact', 'email'] -> 'contact.email')
            const fieldName = err.path.join('.') as Path<T>;
            
            setError(fieldName, {
                type: 'server',
                message: err.message,
            });
        });

        toast.error('Validation failed. Please check the form.');
    } else {
        // Fallback for generic errors or network issues
        const errorMessage = responseData?.message || error.message || 'An unexpected error occurred.';
        toast.error(errorMessage);
    }
};
