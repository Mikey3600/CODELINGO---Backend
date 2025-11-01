

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
};


const logger = {
    
    
    log: (level, msg, data = null) => {
        const timestamp = new Date().toISOString();
        const formattedData = data ? formatData(data) : '';
        
      
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
           
                console.log(logMessage);
                break;
        }
    },
    
    
    
    info: (msg, data) => logger.log('info', msg, data),

    warn: (msg, data) => logger.log('warn', msg, data),
   
    error: (msg, data) => logger.log('error', msg, data),
};


export default logger;
