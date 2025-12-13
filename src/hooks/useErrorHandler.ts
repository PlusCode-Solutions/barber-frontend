import { useCallback } from 'react';
import { handleApiError, logError, getErrorMessage } from '../lib/errorHandler';

interface UseErrorHandlerReturn {
    /**
     * Handles an error and returns a user-friendly message
     */
    handleError: (error: unknown, context?: string) => string;
    
    /**
     * Wraps an async function with error handling
     */
    withErrorHandling: <T>(
        fn: () => Promise<T>,
        context?: string
    ) => Promise<T | null>;
}

/**
 * Hook for consistent error handling across components
 * 
 * @example
 * ```tsx
 * const { handleError, withErrorHandling } = useErrorHandler();
 * 
 * const loadData = async () => {
 *   const data = await withErrorHandling(
 *     () => api.getData(),
 *     'loadData'
 *   );
 *   if (data) {
 *     setData(data);
 *   }
 * };
 * ```
 */
export function useErrorHandler(): UseErrorHandlerReturn {
    const handleError = useCallback((error: unknown, context?: string): string => {
        const apiError = error instanceof Error ? handleApiError(error) : new Error(String(error));
        logError(apiError, context);
        return getErrorMessage(apiError);
    }, []);

    const withErrorHandling = useCallback(
        async <T,>(fn: () => Promise<T>, context?: string): Promise<T | null> => {
            try {
                return await fn();
            } catch (error) {
                handleError(error, context);
                return null;
            }
        },
        [handleError]
    );

    return {
        handleError,
        withErrorHandling,
    };
}
