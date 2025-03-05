"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorServices = void 0;
const errorTypes_1 = require("../types/errorTypes");
const zod_1 = require("zod");
/**
 * Error handling service for managing application errors
 */
class ErrorServices {
    /**
     * Handle database errors and convert them to appropriate ServerError instances
     */
    handleDatabaseError(error) {
        switch (error.code) {
            case errorTypes_1.DatabaseErrorCode.UNIQUE_VIOLATION:
                return new errorTypes_1.ServerError(409, 'Resource already exists', error.code, {
                    detail: error.detail,
                    table: error.table,
                    constraint: error.constraint
                });
            case errorTypes_1.DatabaseErrorCode.FOREIGN_KEY_VIOLATION:
                return new errorTypes_1.ServerError(400, 'Invalid reference to related resource', error.code, {
                    detail: error.detail,
                    table: error.table,
                    constraint: error.constraint
                });
            case errorTypes_1.DatabaseErrorCode.NOT_NULL_VIOLATION:
                return new errorTypes_1.ServerError(400, 'Required field is missing', error.code, {
                    detail: error.detail,
                    table: error.table,
                    constraint: error.constraint
                });
            case errorTypes_1.DatabaseErrorCode.CHECK_VIOLATION:
                return new errorTypes_1.ServerError(400, 'Data validation failed', error.code, {
                    detail: error.detail,
                    table: error.table,
                    constraint: error.constraint
                });
            case errorTypes_1.DatabaseErrorCode.NUMERIC_VALUE_OUT_OF_RANGE:
            case errorTypes_1.DatabaseErrorCode.STRING_DATA_RIGHT_TRUNCATION:
            case errorTypes_1.DatabaseErrorCode.DATETIME_FIELD_OVERFLOW:
                return new errorTypes_1.ServerError(400, 'Invalid data format or value', error.code, {
                    detail: error.detail,
                    table: error.table,
                    constraint: error.constraint
                });
            case errorTypes_1.DatabaseErrorCode.INSUFFICIENT_PRIVILEGE:
                return new errorTypes_1.ServerError(403, 'Insufficient permissions', error.code, {
                    detail: error.detail,
                    table: error.table,
                    constraint: error.constraint
                });
            case errorTypes_1.DatabaseErrorCode.CONNECTION_EXCEPTION:
            case errorTypes_1.DatabaseErrorCode.CONNECTION_FAILURE:
            case errorTypes_1.DatabaseErrorCode.CONNECTION_DOES_NOT_EXIST:
                return new errorTypes_1.ServerError(503, 'Database connection error', error.code, {
                    detail: error.detail,
                    table: error.table,
                    constraint: error.constraint
                });
            case errorTypes_1.DatabaseErrorCode.DEADLOCK_DETECTED:
            case errorTypes_1.DatabaseErrorCode.SERIALIZATION_FAILURE:
                return new errorTypes_1.ServerError(409, 'Transaction conflict', error.code, {
                    detail: error.detail,
                    table: error.table,
                    constraint: error.constraint
                });
            default:
                return new errorTypes_1.ServerError(500, 'Internal database error', error.code, {
                    detail: error.detail,
                    table: error.table,
                    constraint: error.constraint
                });
        }
    }
    /**
     * Handle validation errors
     */
    handleValidationError(message, details) {
        return new errorTypes_1.ServerError(400, message, 'VALIDATION_ERROR', details);
    }
    /**
     * Handle authentication errors
     */
    handleAuthError(message = 'Authentication failed') {
        return new errorTypes_1.ServerError(401, message, 'AUTH_ERROR');
    }
    /**
     * Handle authorization errors
     */
    handleForbiddenError(message = 'Access forbidden') {
        return new errorTypes_1.ServerError(403, message, 'FORBIDDEN_ERROR');
    }
    /**
     * Handle not found errors
     */
    handleNotFoundError(resource) {
        return new errorTypes_1.ServerError(404, `${resource} not found`, 'NOT_FOUND_ERROR');
    }
    /**
     * Handle Zod validation errors
     */
    handleZodError(error) {
        return new errorTypes_1.ServerError(400, 'Validation failed', 'VALIDATION_ERROR', {
            errors: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        });
    }
    /**
     * Handle general server errors
     */
    handleServerError(error) {
        if (error instanceof errorTypes_1.ServerError) {
            return error;
        }
        if (error instanceof zod_1.ZodError) {
            return this.handleZodError(error);
        }
        if (error.code && error.detail) {
            return this.handleDatabaseError(error);
        }
        return new errorTypes_1.ServerError(500, 'Internal server error', 'INTERNAL_SERVER_ERROR', {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
exports.errorServices = new ErrorServices();
