
import AppError from '../utils/apperror.js';
import logger from '../utils/logger.js'; 



const sendErrorDev = (err, res) => {
   
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
        
    
    } else {
      
        logger.error('CRITICAL UNHANDLED ERROR', err); 

       
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong! Please try again later.'
        });
    }
};



export const errorHandler = (err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    
    logger.error(`[API ERROR] Status: ${err.statusCode} | Path: ${req.path}`, {
        error: err,
        method: req.method,
        ip: req.ip
    });

    
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        
        let error = { ...err };
        error.message = err.message;
        
      
        if (err.code && (err.code.startsWith('23') || err.code.startsWith('PGRST'))) {
           
            const message = `Invalid database operation: ${err.message.split('(')[0]}`;
            error = new AppError(message, 400); 
        }

        
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
             error = new AppError('Invalid token or token has expired. Please log in again.', 401);
        }

        sendErrorProd(error, res);
    }
};


