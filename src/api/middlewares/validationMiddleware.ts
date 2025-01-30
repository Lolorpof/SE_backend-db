import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

export function validateData(schema: z.ZodObject<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        res
          .status(400)
          .json({ error: "Invalid request body", details: errorMessages });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
}
