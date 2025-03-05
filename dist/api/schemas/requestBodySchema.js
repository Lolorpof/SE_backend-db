"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFindingMatchHirer = exports.validateHiringMatchSeeker = exports.findingMatchHirerSchema = exports.hiringMatchSeekerSchema = exports.matchStatusSchema = exports.vulnerabilitySchema = exports.categorySchema = exports.skillSchema = exports.validUidSchema = exports.getAllJobPostsSchema = exports.getJobSeekerSchema = exports.jobFindingPostSchema = exports.jobPostSchema = exports.dummySchema = void 0;
const zod_1 = require("zod");
const province_1 = require("../utilities/province");
const schema_1 = require("../../db/schema");
// Empty schemas for job posts
exports.dummySchema = zod_1.z.object({});
// Base schema for common fields between job posts
const baseJobPostSchema = {
    title: zod_1.z
        .string()
        .max(255, "Title must be less than 255 characters")
        .min(1, "Title is required"),
    description: zod_1.z
        .string()
        .max(540, "Description must be less than 540 characters")
        .optional(),
    jobLocation: zod_1.z
        .string()
        .max(255, "Job location must be less than 255 characters")
        .min(1, "Job location is required"),
    workDates: zod_1.z
        .string()
        .max(1024, "Work dates must be less than 1024 characters")
        .min(1, "Work dates are required"),
    workHoursRange: zod_1.z
        .string()
        .max(255, "Work hours range must be less than 255 characters")
        .min(1, "Work hours range is required"),
    jobPostType: zod_1.z.enum(schema_1.jobPostTypeEnum.enumValues, {
        required_error: "Job post type is required",
        invalid_type_error: "Invalid job post type",
    }),
    skills: zod_1.z.array(zod_1.z.string().uuid("Invalid skill ID")).optional(),
    jobCategories: zod_1.z.array(zod_1.z.string().uuid("Invalid category ID")).optional(),
};
// Schema for job hiring posts
exports.jobPostSchema = zod_1.z.object({
    ...baseJobPostSchema,
    salary: zod_1.z
        .number()
        .int("Salary must be an integer")
        .positive("Salary must be a positive number")
        .min(1, "Salary is required"),
    hiredAmount: zod_1.z
        .number()
        .int("Hired amount must be an integer")
        .positive("Hired amount must be a positive number")
        .min(1, "Must hire at least 1 person")
        .default(1),
});
// Schema for job finding posts
exports.jobFindingPostSchema = zod_1.z.object({
    ...baseJobPostSchema,
    expectedSalary: zod_1.z
        .number()
        .int("Expected salary must be an integer")
        .positive("Expected salary must be a positive number")
        .min(1, "Expected salary is required"),
    jobSeekerType: zod_1.z.enum(schema_1.jobSeekerTypeEnum.enumValues, {
        required_error: "Job seeker type is required",
        invalid_type_error: "Invalid job seeker type",
    }),
});
exports.getJobSeekerSchema = zod_1.z.object({
    officialName: zod_1.z.string().optional(),
    jobCategories: zod_1.z.array(zod_1.z.string().uuid("Invalid category ID")).optional(),
    skills: zod_1.z.array(zod_1.z.string().uuid("Invalid skill ID")).optional(),
    province: zod_1.z.enum(province_1.provinces).optional(),
    jobLocation: zod_1.z
        .string()
        .max(255, "Job location must be less than 255 characters")
        .optional(),
    salaryRange: zod_1.z
        .object({
        min: zod_1.z.number().int().positive().optional(),
        max: zod_1.z.number().int().positive().optional(),
    })
        .optional(),
    workHoursRange: zod_1.z
        .string()
        .max(255, "Work hours range must be less than 255 characters")
        .optional(),
});
exports.getAllJobPostsSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    provinces: zod_1.z.array(zod_1.z.enum(province_1.provinces)).optional(),
    jobCategories: zod_1.z.array(zod_1.z.string().uuid("Invalid category ID")).optional(),
    salaryRange: zod_1.z.number().int().positive().optional(),
    sortBy: zod_1.z.enum(['asc', 'desc']).optional(),
    salarySort: zod_1.z.enum(['high-low', 'low-high']).optional(),
    page: zod_1.z.number().int().positive().default(1)
});
exports.validUidSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid ID")
});
const baseNameDescriptionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().optional(),
});
exports.skillSchema = baseNameDescriptionSchema;
exports.categorySchema = baseNameDescriptionSchema;
exports.vulnerabilitySchema = baseNameDescriptionSchema;
// Matching schemas
exports.matchStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["INPROGRESS", "ACCEPTED", "DENIED"]),
    seekerId: zod_1.z.string().uuid(),
}).strict();
const baseHiringMatchSeekerSchema = zod_1.z.object({
    jobSeekerType: zod_1.z.enum(["NORMAL", "OAUTH"]),
    jobSeekerId: zod_1.z.string().uuid().optional(),
    oauthJobSeekerId: zod_1.z.string().uuid().optional(),
}).strict();
exports.hiringMatchSeekerSchema = baseHiringMatchSeekerSchema;
const baseFindingMatchHirerSchema = zod_1.z.object({
    jobHirerType: zod_1.z.enum(["EMPLOYER", "OAUTHEMPLOYER", "COMPANY"]),
    employerId: zod_1.z.string().uuid().optional(),
    oauthEmployerId: zod_1.z.string().uuid().optional(),
    companyId: zod_1.z.string().uuid().optional(),
}).strict();
exports.findingMatchHirerSchema = baseFindingMatchHirerSchema;
// Validation functions (to be used after schema validation)
const validateHiringMatchSeeker = (data) => {
    return (data.jobSeekerId && !data.oauthJobSeekerId) || (!data.jobSeekerId && data.oauthJobSeekerId);
};
exports.validateHiringMatchSeeker = validateHiringMatchSeeker;
const validateFindingMatchHirer = (data) => {
    const ids = [data.employerId, data.oauthEmployerId, data.companyId].filter(Boolean);
    return ids.length === 1;
};
exports.validateFindingMatchHirer = validateFindingMatchHirer;
