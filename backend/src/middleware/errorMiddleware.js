const { errorResponse } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  errorResponse(res, `Route Not Found - ${req.originalUrl}`, null, 404);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`❌ [Error Handler] ${req.method} ${req.originalUrl}:`, err);
  
  errorResponse(
    res,
    err.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? err.stack : null,
    statusCode
  );
};

module.exports = {
  notFound,
  errorHandler
};
