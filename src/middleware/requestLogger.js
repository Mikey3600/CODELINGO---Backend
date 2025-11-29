const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || "unknown";

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;

    console.log(`📝 ${method} ${path} - Status: ${status} - ${duration}ms - IP: ${ip}`);

    
    if (path.includes("/auth") && req.method !== "GET") {
      const body = { ...req.body };
      if (body.password) body.password = "***";
      if (body.passwordHash) body.passwordHash = "***";
      console.log(`   Request: ${JSON.stringify(body)}`);
    }
  });

  next();
};

export default requestLogger;

