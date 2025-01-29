import { Profile as GoogleProfile } from "passport-google-oauth20";
import "../types/usersTypes";
import { TApprovedRequest } from "../validators/usersValidator";

export interface baseUserModelInterfaces {
  // login
  matchNameEmail(nameEmail: string): Promise<TMatchNameEmail[]>;

  getById(
    id: string
  ): Promise<TJobSeeker | TEmployer | TAdmin | TCompany | undefined>;
}

export interface adminModelInterfaces extends baseUserModelInterfaces {}

export interface userModelInterfaces extends baseUserModelInterfaces {
  register(
    user: TFormattedSingleUserRegister | TFormattedCompanyRegister
  ): Promise<TRegisterUser>;

  // for register
  duplicateNameEmail(
    email: string,
    firstName?: string,
    lastName?: string,
    officialName?: string
  ): Promise<TDuplicateNameEmail1 | TDuplicateNameEmail2 | undefined>;

  approved(user: TApprovingUser, isOauth?: boolean): Promise<TApproveUser>;
}

export interface userOauthModelInterfaces extends userModelInterfaces {
  oauthUserInsert(
    profile: GoogleProfile,
    provider: "GOOGLE" | "LINE"
  ): Promise<TRegisterUser>;

  oauthUserUpdate(
    profile: GoogleProfile,
    currentUser: TJobSeeker,
    provider: "GOOGLE" | "LINE"
  ): Promise<TJobSeeker>;

  getById(
    providerId: string,
    getByProviderId?: boolean,
    provider?: "GOOGLE" | "LINE"
  ): Promise<TJobSeeker | TEmployer | TCompany | undefined>;
}
