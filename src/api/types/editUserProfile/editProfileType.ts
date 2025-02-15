import {
  TEditFullNameSchema,
  TEditPasswordSchema,
  TEditOfficialNameSchema,
  TEditUsernameSchema,
  TEditEmailSchema,
  TEditAboutSchema,
  TEditContactSchema,
  TEditAddressSchema,
} from "../../validators/profileValidator";

type userId = { userId: string };

export type TEditUsernameResponse = TEditUsernameSchema & userId;

export type TEditPasswordResponse = TEditPasswordSchema & userId;

export type TEditOfficialNameResponse = TEditOfficialNameSchema & userId;

export type TEditFullNameResponse = TEditFullNameSchema & userId;

export type TEditEmailResponse = TEditEmailSchema & userId;

export type TEditAboutResponse = TEditAboutSchema & userId;

export type TEditContactResponse = TEditContactSchema & userId;

export type TEditAddressResponse = TEditAddressSchema & userId;
