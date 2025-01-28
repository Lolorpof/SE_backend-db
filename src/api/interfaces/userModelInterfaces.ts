import { Profile as GoogleProfile } from "passport-google-oauth20";
import "../types/usersTypes";
import { approvedRequestType } from "../validators/usersValidator";

export interface baseUserModelInterfaces {
  // login
  matchNameEmail(nameEmail: string): Promise<matchNameEmailType[]>;

  getById(
    id: string
  ): Promise<
    jobSeekerType | employerType | adminType | companyType | undefined
  >;
}

export interface adminModelInterfaces extends baseUserModelInterfaces {}

export interface userModelInterfaces extends baseUserModelInterfaces {
  register(
    user: formattedSingleUserRegisterType | formattedCompanyRegisterType
  ): Promise<registerUserType>;

  // for register
  duplicateNameEmail(
    email: string,
    firstName?: string,
    lastName?: string,
    officialName?: string
  ): Promise<duplicateNameEmailType1 | duplicateNameEmailType2 | undefined>;

  approved(user: approvingUser, isOauth?: boolean): Promise<approveUser>;
}

export interface userOauthModelInterfaces extends userModelInterfaces {
  oauthUserInsert(
    profile: GoogleProfile,
    provider: "GOOGLE" | "LINE"
  ): Promise<registerUserType>;

  oauthUserUpdate(
    profile: GoogleProfile,
    currentUser: jobSeekerType,
    provider: "GOOGLE" | "LINE"
  ): Promise<jobSeekerType>;

  getById(
    providerId: string,
    getByProviderId?: boolean,
    provider?: "GOOGLE" | "LINE"
  ): Promise<jobSeekerType | employerType | companyType | undefined>;
}
