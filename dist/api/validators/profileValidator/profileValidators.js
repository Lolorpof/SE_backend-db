"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editJobSeekerVulnerabilitySchema = exports.editJobSeekerSkillSchema = exports.editAddressSchema = exports.editContactSchema = exports.editAboutSchema = exports.editPasswordSchema = exports.editEmailSchema = exports.editOfficialNameSchema = exports.editFullNameSchema = exports.editUsernameSchema = exports.specificUserSchema = void 0;
const zod_1 = require("zod");
// Zod Schema
exports.specificUserSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    provider: zod_1.z.string().nullable(),
});
exports.editUsernameSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.editFullNameSchema = zod_1.z.object({
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
}); // job-seeker & employer
exports.editOfficialNameSchema = zod_1.z.object({
    officialName: zod_1.z.string(),
    password: zod_1.z.string(),
}); // company only
exports.editEmailSchema = zod_1.z.object({ email: zod_1.z.string().email() });
exports.editPasswordSchema = zod_1.z.object({
    password: zod_1.z
        .string()
        .min(6, "New password length must have atleast 6 characters"),
    oldPassword: zod_1.z.string(),
});
exports.editAboutSchema = zod_1.z.object({ about: zod_1.z.string() });
exports.editContactSchema = zod_1.z.object({ contact: zod_1.z.string() });
exports.editAddressSchema = zod_1.z.object({
    address: zod_1.z.string(),
    provinceAddress: zod_1.z.string(),
});
exports.editJobSeekerSkillSchema = zod_1.z.object({
    skillsId: zod_1.z.array(zod_1.z.string().uuid("Field isn't of type uuid")),
});
exports.editJobSeekerVulnerabilitySchema = zod_1.z.object({
    vulnerabilitiesId: zod_1.z.array(zod_1.z.string().uuid("Field isn't of type uuid")),
});
