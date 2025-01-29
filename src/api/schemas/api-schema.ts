import { z } from "zod";
import { provinces } from "../utils/province";

// Empty schemas for job posts
export const dummySchema = z.object({});

export const getFindEmpSchema = z.object({
  title: z
    .string()
    .max(255, "Title must be less than 255 characters")
    .optional(),
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
});

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
