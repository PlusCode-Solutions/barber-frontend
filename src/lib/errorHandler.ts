/**
 * Centralized Error Handling
 * 
 * Provides consistent error handling across the application with:
 * - Custom error classes
 * - User-friendly error messages
 * - Error logging capabilities
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;

    constructor(
        message: string,
        statusCode?: number,
        code?: string,
        details?: any
    ) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

/**
 * Network/Connection Error
 */
export class NetworkError extends ApiError {
    constructor(message = 'Error de conexión. Verifica tu internet.') {
        super(message, 0, 'NETWORK_ERROR');
        this.name = 'NetworkError';
    }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends ApiError {
    constructor(message = 'Sesión expirada. Por favor inicia sesión nuevamente.') {
        super(message, 401, 'AUTH_ERROR');
        this.name = 'AuthenticationError';
    }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends ApiError {
    constructor(message = 'No tienes permisos para realizar esta acción.') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'AuthorizationError';
    }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
    constructor(message = 'Recurso no encontrado.') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

/**
 * Validation Error (400/422)
 */
export class ValidationError extends ApiError {
    validationErrors?: Record<string, string[]>;

    constructor(
        message = 'Datos inválidos.',
        validationErrors?: Record<string, string[]>
    ) {
        super(message, 400, 'VALIDATION_ERROR', validationErrors);
        this.name = 'ValidationError';
        this.validationErrors = validationErrors;
    }
}

/**
 * Server Error (500+)
 */
export class ServerError extends ApiError {
    constructor(message = 'Error del servidor. Intenta nuevamente más tarde.') {
        super(message, 500, 'SERVER_ERROR');
        this.name = 'ServerError';
    }
}

/**
 * Converts axios/fetch errors into typed ApiError instances
 */
export function handleApiError(error: any): ApiError {
    // Network errors (no response)
    if (!error.response) {
        if (error.request) {
            return new NetworkError();
        }
        return new ApiError(error.message || 'Error desconocido');
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || 'Error en la solicitud';

    // Map HTTP status codes to specific error types
    switch (status) {
        case 400:
        case 422:
            return new ValidationError(message, data?.errors);
        case 401:
            return new AuthenticationError(message);
        case 403:
            return new AuthorizationError(message);
        case 404:
            return new NotFoundError(message);
        case 500:
        case 502:
        case 503:
        case 504:
            return new ServerError(message);
        default:
            return new ApiError(message, status, data?.code);
    }
}

/**
 * Logs errors to console in development, can be extended for production logging
 */
export function logError(error: Error | ApiError, context?: string): void {
    if (import.meta.env.DEV) {
        console.group(`🔴 Error${context ? ` in ${context}` : ''}`);
        console.error('Message:', error.message);
        if (error instanceof ApiError) {
            console.error('Status:', error.statusCode);
            console.error('Code:', error.code);
            if (error.details) {
                console.error('Details:', error.details);
            }
        }
        console.error('Stack:', error.stack);
        console.groupEnd();
    }

    // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
    // if (import.meta.env.PROD) {
    //     Sentry.captureException(error, { extra: { context } });
    // }
}

/**
 * Gets a user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }
    
    if (error instanceof Error) {
        return error.message;
    }
    
    if (typeof error === 'string') {
        return error;
    }
    
    return 'Ha ocurrido un error inesperado';
}
