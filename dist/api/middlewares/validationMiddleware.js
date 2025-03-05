"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateData = validateData;
const zod_1 = require("zod");
function validateData(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                }));
                res
                    .status(400)
                    .json({ error: "Invalid request body", details: errorMessages });
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    };
}
