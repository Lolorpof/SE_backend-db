import { z, ZodType } from "zod";
import { fromError } from "zod-validation-error";

// Generics
export function schemaValidation<T>(schema: ZodType<T>, data: any) {
  try {
    schema.parse(data);
    return true;
  } catch (error) {
    const result = fromError(error);
    console.log(result.toString());
    return false;
  }
}

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

export const approvedRequestSchema = z.object({
  id: z.string(),
  status: z
    .string()
    .refine((val) => val === "APPROVED" || val === "UNAPPROVED", {
      message: "Status must be either 'APPROVED' or 'UNAPPROVED'",
    }),
});

// Infer Type
export type singleUserRegisterType = z.infer<typeof singleUserRegisterSchema>;

export type companyRegisterType = z.infer<typeof companyRegisterSchema>;

export type approvedRequestType = z.infer<typeof approvedRequestSchema>;
