import { z } from "zod";
import { provinces } from "../utilities/province";
import { jobPostTypeEnum, jobSeekerTypeEnum } from "../../db/schema";

// Empty schemas for job posts
export const dummySchema = z.object({});

export const jobPostSchema = z.object({
  title: z
    .string()
    .max(255, "Title must be less than 255 characters")
    .min(1, "Title is required"),
  description: z
    .string()
    .max(540, "Description must be less than 540 characters")
    .optional(),
  jobLocation: z
    .string()
    .max(255, "Job location must be less than 255 characters")
    .min(1, "Job location is required"),
  salary: z
    .number()
    .int("Salary must be an integer")
    .positive("Salary must be a positive number")
    .min(1, "Salary is required"),
  workDates: z
    .string()
    .max(1024, "Work dates must be less than 1024 characters")
    .min(1, "Work dates are required"),
  workHoursRange: z
    .string()
    .max(255, "Work hours range must be less than 255 characters")
    .min(1, "Work hours range is required"),  
  hiredAmount: z
    .number()
    .int("Hired amount must be an integer")
    .positive("Hired amount must be a positive number")
    .min(1, "Must hire at least 1 person")
    .default(1),
  jobPostType: z.enum(jobPostTypeEnum.enumValues, {
    required_error: "Job post type is required",
    invalid_type_error: "Invalid job post type",
  }),
  skills: z.array(z.string().uuid("Invalid skill ID")).optional(),
  jobCategories: z.array(z.string().uuid("Invalid category ID")).optional(),
});
export type jobPostType = z.infer<typeof jobPostSchema>;

export const getJobSeekerSchema = z.object({
  officialName: z.string().optional(),
  jobCategories: z.array(z.string().uuid("Invalid category ID")).optional(),
  skills: z.array(z.string().uuid("Invalid skill ID")).optional(),
  province: z.enum(provinces).optional(),
  jobLocation: z
    .string()
    .max(255, "Job location must be less than 255 characters")
    .optional(),
  salaryRange: z
    .object({
      min: z.number().int().positive().optional(),
      max: z.number().int().positive().optional(),
    })
    .optional(),
  workHoursRange: z
    .string()
    .max(255, "Work hours range must be less than 255 characters")
    .optional(),
});

export const getAllJobPostsSchema = z.object({
  title: z.string().optional(),
  provinces: z.array(z.enum(provinces)).optional(),
  jobCategories: z.array(z.string().uuid("Invalid category ID")).optional(),
  salaryRange: z.number().int().positive().optional(),
  sortBy: z.enum(['asc', 'desc']).optional(),
  salarySort: z.enum(['high-low', 'low-high']).optional(),
  page: z.number().int().positive().default(1)
})
export type getAllJobPostsType = z.infer<typeof getAllJobPostsSchema>;

export const validUidSchema = z.object({
  id: z.string().uuid("Invalid ID")
})
export type validUidType = z.infer<typeof validUidSchema>;

// Schema for job finding posts
export const jobFindingPostSchema = z.object({
  title: z
    .string()
    .max(255, "Title must be less than 255 characters")
    .min(1, "Title is required"),
  description: z
    .string()
    .max(540, "Description must be less than 540 characters")
    .optional(),
  jobLocation: z
    .string()
    .max(255, "Job location must be less than 255 characters")
    .min(1, "Job location is required"),
  expectedSalary: z
    .number()
    .int("Expected salary must be an integer")
    .positive("Expected salary must be a positive number")
    .min(1, "Expected salary is required"),
  workDates: z
    .string()
    .max(1024, "Work dates must be less than 1024 characters")
    .min(1, "Work dates are required"),
  workHoursRange: z
    .string()
    .max(255, "Work hours range must be less than 255 characters")
    .min(1, "Work hours range is required"),
  jobPostType: z.enum(jobPostTypeEnum.enumValues, {
    required_error: "Job post type is required",
    invalid_type_error: "Invalid job post type",
  }),
  jobSeekerType: z.enum(jobSeekerTypeEnum.enumValues, {
    required_error: "Job seeker type is required",
    invalid_type_error: "Invalid job seeker type",
  }),
  skills: z.array(z.string().uuid("Invalid skill ID")).optional(),
  jobCategories: z.array(z.string().uuid("Invalid category ID")).optional(),
});
export type jobFindingPostType = z.infer<typeof jobFindingPostSchema>; 

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});
export type skillType = z.infer<typeof skillSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});
export type categoryType = z.infer<typeof categorySchema>;


