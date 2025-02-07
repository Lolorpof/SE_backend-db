import { DatabaseError, DatabaseErrorCode, ServerError } from '../types/errorTypes';
import { ZodError } from 'zod';

/**
 * Error handling service for managing application errors
 */
class ErrorServices {
  /**
   * Handle database errors and convert them to appropriate ServerError instances
   */
  handleDatabaseError(error: DatabaseError): ServerError {
    switch (error.code) {
      case DatabaseErrorCode.UNIQUE_VIOLATION:
        return new ServerError(409, 'Resource already exists', error.code, {
          detail: error.detail,
          table: error.table,
          constraint: error.constraint
        });

      case DatabaseErrorCode.FOREIGN_KEY_VIOLATION:
        return new ServerError(400, 'Invalid reference to related resource', error.code, {
          detail: error.detail,
          table: error.table,
          constraint: error.constraint
        });

      case DatabaseErrorCode.NOT_NULL_VIOLATION:
        return new ServerError(400, 'Required field is missing', error.code, {
          detail: error.detail,
          table: error.table,
          constraint: error.constraint
        });

      case DatabaseErrorCode.CHECK_VIOLATION:
        return new ServerError(400, 'Data validation failed', error.code, {
          detail: error.detail,
          table: error.table,
          constraint: error.constraint
        });

      case DatabaseErrorCode.NUMERIC_VALUE_OUT_OF_RANGE:
      case DatabaseErrorCode.STRING_DATA_RIGHT_TRUNCATION:
      case DatabaseErrorCode.DATETIME_FIELD_OVERFLOW:
        return new ServerError(400, 'Invalid data format or value', error.code, {
          detail: error.detail,
          table: error.table,
          constraint: error.constraint
        });

      case DatabaseErrorCode.INSUFFICIENT_PRIVILEGE:
        return new ServerError(403, 'Insufficient permissions', error.code, {
          detail: error.detail,
          table: error.table,
          constraint: error.constraint
        });

      case DatabaseErrorCode.CONNECTION_EXCEPTION:
      case DatabaseErrorCode.CONNECTION_FAILURE:
      case DatabaseErrorCode.CONNECTION_DOES_NOT_EXIST:
        return new ServerError(503, 'Database connection error', error.code, {
          detail: error.detail,
          table: error.table,
          constraint: error.constraint
        });

      case DatabaseErrorCode.DEADLOCK_DETECTED:
      case DatabaseErrorCode.SERIALIZATION_FAILURE:
        return new ServerError(409, 'Transaction conflict', error.code, {
          detail: error.detail,
          table: error.table,
          constraint: error.constraint
        });

      default:
        return new ServerError(500, 'Internal database error', error.code, {
          detail: error.detail,
          table: error.table,
          constraint: error.constraint
        });
    }
  }

  /**
   * Handle validation errors
   */
  handleValidationError(message: string, details?: any): ServerError {
    return new ServerError(400, message, 'VALIDATION_ERROR', details);
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(message: string = 'Authentication failed'): ServerError {
    return new ServerError(401, message, 'AUTH_ERROR');
  }

  /**
   * Handle authorization errors
   */
  handleForbiddenError(message: string = 'Access forbidden'): ServerError {
    return new ServerError(403, message, 'FORBIDDEN_ERROR');
  }

  /**
   * Handle not found errors
   */
  handleNotFoundError(resource: string): ServerError {
    return new ServerError(404, `${resource} not found`, 'NOT_FOUND_ERROR');
  }

  /**
   * Handle Zod validation errors
   */
  handleZodError(error: ZodError): ServerError {
    return new ServerError(400, 'Validation failed', 'VALIDATION_ERROR', {
      errors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    });
  }

  /**
   * Handle general server errors
   */
  handleServerError(error: Error): ServerError {
    if (error instanceof ServerError) {
      return error;
    }
    
    if (error instanceof ZodError) {
      return this.handleZodError(error);
    }
    
    if ((error as any).code && (error as any).detail) {
      return this.handleDatabaseError(error as DatabaseError);
    }

    return new ServerError(500, 'Internal server error', 'INTERNAL_SERVER_ERROR', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export const errorServices = new ErrorServices(); 