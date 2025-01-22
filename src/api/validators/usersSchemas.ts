import { z } from "zod";

// Zod Form
export const jobSeekerRegisterSchema = z.object({
  name: z
    .string()
    .refine((val) => [...val].filter((c) => c === " ").length === 1, {
      message: "Space must appear between First Name and Last Name Once",
    }), // space appear only once
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
});

// Infer Type
export type jobSeekerRegisterType = z.infer<typeof jobSeekerRegisterSchema>;
