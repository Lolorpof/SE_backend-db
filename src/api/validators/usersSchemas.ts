import { z } from "zod";

// Zod Form
export const singleUserRegisterSchema = z.object({
  name: z
    .string()
    .refine((val) => [...val].filter((c) => c === " ").length === 1, {
      message: "Space must appear between First Name and Last Name Once",
    }), // space appear only once
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
});

export const companyRegisterSchema = z.object({
  officialName: z.string(),
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
});

// Infer Type
export type singleUserRegisterType = z.infer<typeof singleUserRegisterSchema>;

export type companyRegisterType = z.infer<typeof companyRegisterSchema>;
