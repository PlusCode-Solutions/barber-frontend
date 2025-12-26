export const APP_CONSTANTS = {
    // Time & Dates
    DEFAULT_SLOT_INTERVAL: 30, // minutes
    DEFAULT_SERVICE_DURATION: 60, // minutes
    
    // Cache (React Query)
    QUERY: {
        STALE_TIME: 1000 * 60 * 5, // 5 minutes
        GC_TIME: 1000 * 60 * 10,   // 10 minutes
    }
} as const;
