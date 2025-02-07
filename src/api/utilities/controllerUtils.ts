import { Response } from "express";
import { ZodError } from "zod";
import { ServerError } from "../types/errorTypes";
import { errorServices } from "../services/errorServices";

export function handleControllerError(error: Error | ZodError | unknown, res: Response): void {
  // Handle Zod validation errors
  // Maps validation errors to a format that includes the field path and error message
  if (error instanceof ZodError) {
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
  if (error instanceof ServerError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      data: error.data
    });
    return;
  }

  // Handle unknown errors by converting them to ServerError format
  // Ensures consistent error response structure even for unexpected errors
  const serverError = errorServices.handleServerError(error as Error);
  res.status(serverError.status).json({
    success: false,
    message: serverError.message,
    data: serverError.data
  });
} 