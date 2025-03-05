"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvedRequestSchema = exports.companyRegisterSchema = exports.singleUserRegisterSchema = void 0;
exports.schemaValidation = schemaValidation;
const zod_1 = require("zod");
const zod_validation_error_1 = require("zod-validation-error");
// Generics
function schemaValidation(schema, data) {
    try {
        schema.parse(data);
        return true;
    }
    catch (error) {
        const result = (0, zod_validation_error_1.fromError)(error);
        console.log(result.toString());
        return false;
    }
}
// Zod Form
exports.singleUserRegisterSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .refine((val) => [...val].filter((c) => c === " ").length === 1, {
        message: "Space must appear between First Name and Last Name Once",
    }), // space appear only once
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "Password length must have atleast 6 characters"),
    confirmPassword: zod_1.z
        .string()
        .min(6, "Confirm password length must have atleast 6 characters"),
});
exports.companyRegisterSchema = zod_1.z.object({
    officialName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "Password length must have atleast 6 characters"),
    confirmPassword: zod_1.z
        .string()
        .min(6, "Confirm password length must have atleast 6 characters"),
});
exports.approvedRequestSchema = zod_1.z.object({
    id: zod_1.z.string(),
    status: zod_1.z
        .string()
        .refine((val) => val === "APPROVED" || val === "UNAPPROVED", {
        message: "Status must be either 'APPROVED' or 'UNAPPROVED'",
    }),
});
