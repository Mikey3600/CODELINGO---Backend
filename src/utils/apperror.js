class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Mark as errors we expect/handle (vs programming errors)

        // Capture stack trace to easily debug where the error originated
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;