const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Prisma Unique Constraint Violation (e.g. unique email)
  if (err.code === 'P2002') {
    statusCode = 400;
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target || 'field';
    message = `Duplicate value entered for ${target}. Please use another value.`;
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = err.meta?.cause || 'Record not found.';
  }

  // Prisma Foreign Key Constraint Failure
  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid reference: Related record does not exist.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
