
function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500;

  console.error('VetCare API Error');
  console.error('Method:', req.method);
  console.error('Endpoint:', req.originalUrl);
  console.error('Status:', statusCode);
  console.error('Message:', error.message);
  console.error('SQL Code:', error.code || 'N/A');
  console.error('SQL Message:', error.sqlMessage || 'N/A');
  console.error('Stack:', error.stack);

  const message = statusCode === 500
    ? 'Internal server error'
    : error.message;

  return res.status(statusCode).json({
    error: {
      status: statusCode,
      message
    }
  });
}

module.exports = errorHandler;
