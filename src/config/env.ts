/**
 * Environment Configuration
 * 
 * Validates and provides type-safe access to environment variables.
 * Fails fast with clear error messages if required variables are missing.
 */

interface EnvironmentConfig {
    API_URL: string;
    NODE_ENV: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
    const value = import.meta.env[key] || defaultValue;
    
    if (!value) {
        throw new Error(
            `❌ Missing required environment variable: ${key}\n\n` +
            `Please create a .env file in the project root with:\n` +
            `${key}=your_value_here\n\n` +
            `See .env.example for reference.`
        );
    }
    
    return value;
}

/**
 * Validated environment configuration
 * All required environment variables are validated on app startup
 */
export const env: EnvironmentConfig = {
    API_URL: getEnvVar('VITE_API_URL'),
    NODE_ENV: getEnvVar('MODE', 'development'),
} as const;

/**
 * Helper to check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Helper to check if we're in production mode
 */
export const isProduction = env.NODE_ENV === 'production';
