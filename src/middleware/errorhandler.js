const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}: ${err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: {
        code: "validation_error",
        message: message,
      },
    });
  }

  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field} already exists`,
      details: { code: "duplicate_field", field },
    });
  }

  
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      details: { code: "invalid_token" },
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      details: { code: "token_expired" },
    });
  }

  
  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : message,
    details: statusCode === 500 ? null : { code: "unknown_error" },
  });
};

export default errorHandler;

