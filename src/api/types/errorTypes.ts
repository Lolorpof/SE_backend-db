export enum DatabaseErrorCode {
    // Integrity Constraint Violations
    UNIQUE_VIOLATION = "23505",               // Duplicate key value violates unique constraint.
    FOREIGN_KEY_VIOLATION = "23503",           // Insert or update on a table violates a foreign key constraint.
    NOT_NULL_VIOLATION = "23502",              // A null value in a column that is declared NOT NULL.
    CHECK_VIOLATION = "23514",                 // A check constraint is violated.
    EXCLUSION_VIOLATION = "23P01",             // Exclusion constraint violation.
  
    // Data Exceptions
    NUMERIC_VALUE_OUT_OF_RANGE = "22003",      // Numeric value is out of range.
    DIVISION_BY_ZERO = "22012",                // Division by zero.
    STRING_DATA_RIGHT_TRUNCATION = "22001",    // Data would be truncated for the target column.
    DATETIME_FIELD_OVERFLOW = "22008",         // Date/time field value is out of range.
    INVALID_TEXT_REPRESENTATION = "22P02",     // Invalid text representation (e.g. parsing error).
    INVALID_DATETIME_FORMAT = "22007",         // Invalid datetime format.
  
    // Syntax Errors and Access Rule Violations
    SYNTAX_ERROR = "42601",                    // Syntax error in SQL statement.
    INSUFFICIENT_PRIVILEGE = "42501",          // Insufficient privilege to perform the operation.
  
    // Connection Exceptions
    CONNECTION_EXCEPTION = "08000",            // General connection exception.
    CONNECTION_DOES_NOT_EXIST = "08003",        // Connection does not exist.
    CONNECTION_FAILURE = "08006",               // Connection failure.
  
    // Transaction Rollback
    DEADLOCK_DETECTED = "40P01",               // Deadlock detected.
    SERIALIZATION_FAILURE = "40001",           // Transaction serialization failure.
  }

// Interface representing database-specific errors that extend the base Error type
// Contains additional properties specific to database errors like error code, details, affected table etc
export interface DatabaseError extends Error {
  code: DatabaseErrorCode;      // The specific database error code from DatabaseErrorCode enum
  detail: string;              // Detailed error message from the database
  table: string;               // Name of the table where error occurred
  constraint: string;          // Name of the constraint that was violated
}

// Custom error class for handling server-side errors with additional context
// Used to standardize error responses across the application
export class ServerError extends Error {
  constructor(
    public status: number,     // HTTP status code
    public message: string,    // Error message
    public code?: string,      // Optional error code for more specific error handling
    public data?: any         // Optional additional error data/context
  ) {
    super(message);
    this.name = "ServerError";
  }
}