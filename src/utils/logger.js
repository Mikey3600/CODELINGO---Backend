/**
 * Simple Logger Module
 * Provides basic logging with robust formatting for errors and objects.
 * This acts as a wrapper around console methods for better control and clarity.
 */

const formatData = (data) => {
    // If the data is an Error object, format its message and stack trace
    if (data instanceof Error) {
        // Use a clearer, multi-line format for errors
        return `\n\tMessage: ${data.message}\n\tStack: ${data.stack}`;
    }
    // If the data is a non-null object, serialize it
    if (typeof data === 'object' && data !== null) {
        try {
            // Pretty-print the JSON object with 2-space indentation
            return `\n\tData: ${JSON.stringify(data, null, 2)}`;
        } catch (e) {
            return `\n\tData: [Error serializing object]`;
        }
    }
    return ''; // Return empty string for primitives or null
};

// Define the logger object first
const logger = {
    
    /**
     * Internal function to handle the core logging logic.
     * @param {'info' | 'warn' | 'error'} level - The log level.
     * @param {string} msg - The primary log message.
     * @param {any} [data=null] - Optional data (Error, object, etc.) to include.
     */
    log: (level, msg, data = null) => {
        const timestamp = new Date().toISOString();
        const formattedData = data ? formatData(data) : '';
        
        // Construct the main log message string
        const logMessage = `[${level.toUpperCase()}] ${timestamp} - ${msg}${formattedData}`;

        switch (level) {
            case 'info':
                console.log(logMessage);
                break;
            case 'warn':
                console.warn(logMessage);
                break;
            case 'error':
                console.error(logMessage);
                break;
            default:
                // Fallback for unexpected levels
                console.log(logMessage);
                break;
        }
    },
    
    // Public methods calling the internal log function
    /** @param {string} msg */
    info: (msg, data) => logger.log('info', msg, data),
    /** @param {string} msg */
    warn: (msg, data) => logger.log('warn', msg, data),
    /** @param {string} msg */
    error: (msg, data) => logger.log('error', msg, data),
};

// Export the logger object as the default export
export default logger;
