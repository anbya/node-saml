const httpStatus = require("http-status");

const apiLogger = require('./logger');

class ApiError extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (err, res) => {
  const { statusCode, message } = err;
  res.status(statusCode).json({ success: false, status: "error", statusCode, message });
};

const convertToApiError = (err, req, res, next) => {
  let error = err;
  
  apiLogger('error', `${error.stack}`);

  let errorCodes = {
    "08003": "connection_does_not_exist",
    "08006": "connection_failure",
    "2F002": "modifying_sql_data_not_permitted",
    "57P03": "cannot_connect_now",
    "42601": "syntax_error",
    "42501": "insufficient_privilege",
    "42602": "invalid_name",
    "42622": "name_too_long",
    "42939": "reserved_name",
    "42703": "undefined_column",
    "42000": "syntax_error_or_access_rule_violation",
    "42P01": "undefined_table",
    "42P02": "undefined_parameter",
  };
  
  if (error instanceof ApiError) {
    const statusCode = error.statusCode
      ? httpStatus.BAD_REQUEST
      : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message);
  }

  if (error.code !== undefined) {
    if (errorCodes[err.code] !== undefined) {
      const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      const message = `code (${err.code}): ${errorCodes[err.code]}`;
      error = new ApiError(statusCode, message);
    } else {
      const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      const message = "Database unidentified error";
      error = new ApiError(statusCode, message);
    }
  }
 
  apiLogger('error', `${error.message}`);

  next(error);
};

module.exports = {
  ApiError,
  handleError,
  convertToApiError,
};
