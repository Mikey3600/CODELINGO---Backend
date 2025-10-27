

const formatData = (data) => {
    
    if (data instanceof Error) {
        
        return `\n\tMessage: ${data.message}\n\tStack: ${data.stack}`;
    }
    if (typeof data === 'object' && data !== null) {
        try {
            
            return `\n\tData: ${JSON.stringify(data, null, 2)}`;
        } catch (e) {
            return `\n\tData: [Error serializing object]`;
        }
    }
    return ''; 

const logger = {
    
   
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
    
  
};

}
export default logger;

