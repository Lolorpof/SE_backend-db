import { z } from "zod";
import { provinces } from "../utils/province";

export const getFindEmpSchema = z.object({
  title: z.string().max(255, "Title must be less than 255 characters"),
  province: z.enum(provinces),
  jobLocation: z
    .string()
    .max(255, "Job location must be less than 255 characters"),
  salary: z.number().int(),
  workHoursRange: z
    .string()
    .max(255, "Work hours range must be less than 255 characters"),
});

export const createJobHiringPostSchema = z.object({
  title: z
    .string()
    .max(255, "Title must be less than 255 characters")
    .min(1, "Title is required"),
  description: z
    .string()
    .max(540, "Description must be less than 540 characters"),
  jobLocation: z
    .string()
    .max(255, "Job location must be less than 255 characters")
    .min(1, "Job location is required"),
  salary: z
    .number()
    .int()
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
    .int()
    .positive("Hired amount must be a positive number")
    .min(1, "Must hire at least 1 person"),
  skills: z
    .array(z.string().uuid("Invalid skill ID"))
    .min(1, "At least one skill is required"),
  jobCategories: z
    .array(z.string().uuid("Invalid category ID"))
    .min(1, "At least one job category is required"),
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
