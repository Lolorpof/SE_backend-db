"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerError = handleControllerError;
const zod_1 = require("zod");
const errorTypes_1 = require("../types/errorTypes");
const errorServices_1 = require("../services/errorServices");
function handleControllerError(error, res) {
    // Handle Zod validation errors
    // Maps validation errors to a format that includes the field path and error message
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            data: {
                errors: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            }
        });
        return;
    }
    // Handle known server errors that have already been processed
    // Returns the error with its status code, message and any additional data
    if (error instanceof errorTypes_1.ServerError) {
        res.status(error.status).json({
            success: false,
            message: error.message,
            data: error.data
        });
        return;
    }
    // Handle unknown errors by converting them to ServerError format
    // Ensures consistent error response structure even for unexpected errors
    const serverError = errorServices_1.errorServices.handleServerError(error);
    res.status(serverError.status).json({
        success: false,
        message: serverError.message,
        data: serverError.data
    });
}
