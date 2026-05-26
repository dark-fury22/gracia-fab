// This function catches ALL errors in the app
// Think of it as the "emergency cleanup crew"

const errorHandler = (err, req, res, next) => {
  // Log the full error for YOU (developer) to see
  console.error(`❌ ${req.method} ${req.path} — ${err.message}`);

  // But send a clean response to the USER
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong on our end",
    // Only show detailed errors in development, not in production
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      path: req.path,
    }),
  });
};

// This catches requests to routes that don't exist
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export { errorHandler, notFound };
