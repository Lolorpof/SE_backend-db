import {
  TEditFullNameSchema,
  TEditPasswordSchema,
  TEditOfficialNameSchema,
  TEditUsernameSchema,
  TEditEmailSchema,
  TEditAboutSchema,
  TEditContactSchema,
  TEditAddressSchema,
  TEditJobSeekerSkillSchema,
  TEditJobSeekerVulnerabilitySchema,
} from "../../validators/profileValidator";

type userId = { userId: string };
type Case = { case?: string };

export type TEditUsernameResponse = Omit<TEditUsernameSchema, "password"> &
  userId &
  Case;

export type TEditPasswordResponse = userId & Case;

export type TEditOfficialNameResponse = TEditOfficialNameSchema & userId;

export type TEditFullNameResponse = TEditFullNameSchema & userId;

export type TEditEmailResponse = TEditEmailSchema & userId;

export type TEditAboutResponse = TEditAboutSchema & userId;

export type TEditContactResponse = TEditContactSchema & userId;

export type TEditAddressResponse = TEditAddressSchema & userId;

export type TEditJobSeekerSkillResponse = TEditJobSeekerSkillSchema &
  userId &
  Case;

export type TEditJobSeekerVulnerabilityResponse =
  TEditJobSeekerVulnerabilitySchema & userId & Case;
