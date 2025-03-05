"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.DatabaseErrorCode = void 0;
var DatabaseErrorCode;
(function (DatabaseErrorCode) {
    // Integrity Constraint Violations
    DatabaseErrorCode["UNIQUE_VIOLATION"] = "23505";
    DatabaseErrorCode["FOREIGN_KEY_VIOLATION"] = "23503";
    DatabaseErrorCode["NOT_NULL_VIOLATION"] = "23502";
    DatabaseErrorCode["CHECK_VIOLATION"] = "23514";
    DatabaseErrorCode["EXCLUSION_VIOLATION"] = "23P01";
    // Data Exceptions
    DatabaseErrorCode["NUMERIC_VALUE_OUT_OF_RANGE"] = "22003";
    DatabaseErrorCode["DIVISION_BY_ZERO"] = "22012";
    DatabaseErrorCode["STRING_DATA_RIGHT_TRUNCATION"] = "22001";
    DatabaseErrorCode["DATETIME_FIELD_OVERFLOW"] = "22008";
    DatabaseErrorCode["INVALID_TEXT_REPRESENTATION"] = "22P02";
    DatabaseErrorCode["INVALID_DATETIME_FORMAT"] = "22007";
    // Syntax Errors and Access Rule Violations
    DatabaseErrorCode["SYNTAX_ERROR"] = "42601";
    DatabaseErrorCode["INSUFFICIENT_PRIVILEGE"] = "42501";
    // Connection Exceptions
    DatabaseErrorCode["CONNECTION_EXCEPTION"] = "08000";
    DatabaseErrorCode["CONNECTION_DOES_NOT_EXIST"] = "08003";
    DatabaseErrorCode["CONNECTION_FAILURE"] = "08006";
    // Transaction Rollback
    DatabaseErrorCode["DEADLOCK_DETECTED"] = "40P01";
    DatabaseErrorCode["SERIALIZATION_FAILURE"] = "40001";
})(DatabaseErrorCode || (exports.DatabaseErrorCode = DatabaseErrorCode = {}));
// Custom error class for handling server-side errors with additional context
// Used to standardize error responses across the application
class ServerError extends Error {
    status;
    message;
    code;
    data;
    constructor(status, // HTTP status code
    message, // Error message
    code, // Optional error code for more specific error handling
    data // Optional additional error data/context
    ) {
        super(message);
        this.status = status;
        this.message = message;
        this.code = code;
        this.data = data;
        this.name = "ServerError";
    }
}
exports.ServerError = ServerError;
