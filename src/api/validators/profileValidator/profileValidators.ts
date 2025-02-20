import { z } from "zod";

// Zod Schema
export const specificUserSchema = z.object({
  userId: z.string(),
  provider: z.string().nullable(),
});

export const editUsernameSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const editFullNameSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
}); // job-seeker & employer

export const editOfficialNameSchema = z.object({ offcialName: z.string() }); // company only

export const editEmailSchema = z.object({ email: z.string().email() });

export const editPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "New password length must have atleast 6 characters"),
  oldPassword: z.string(),
});

export const editAboutSchema = z.object({ about: z.string() });

export const editContactSchema = z.object({ contact: z.string() });

export const editAddressSchema = z.object({
  address: z.string(),
  provinceAddress: z.string(),
});

export const editJobSeekerSkillSchema = z.object({
  skillsId: z.array(z.string().uuid("Field isn't of type uuid")),
});

export const editJobSeekerVulnerabilitySchema = z.object({
  vulnerabilitiesId: z.array(z.string().uuid("Field isn't of type uuid")),
});

// Infer Type

export type TSpecificUserSchema = z.infer<typeof specificUserSchema>;

export type TEditUsernameSchema = z.infer<typeof editUsernameSchema>;

export type TEditOfficialNameSchema = z.infer<typeof editOfficialNameSchema>;

export type TEditFullNameSchema = z.infer<typeof editFullNameSchema>;

export type TEditEmailSchema = z.infer<typeof editEmailSchema>;

export type TEditPasswordSchema = z.infer<typeof editPasswordSchema>;

export type TEditAboutSchema = z.infer<typeof editAboutSchema>;

export type TEditContactSchema = z.infer<typeof editContactSchema>;

export type TEditAddressSchema = z.infer<typeof editAddressSchema>;

export type TEditJobSeekerSkillSchema = z.infer<
  typeof editJobSeekerSkillSchema
>;

export type TEditJobSeekerVulnerabilitySchema = z.infer<
  typeof editJobSeekerVulnerabilitySchema
>;
