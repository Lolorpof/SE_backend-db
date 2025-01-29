import { Profile as GoogleProfile } from "passport-google-oauth20";
import "../types/usersTypes";

export interface adminModelInterfaces {
  // login
  matchNameEmail(nameEmail: string): Promise<matchNameEmailType[]>;

  getById(
    id: string
  ): Promise<
    jobSeekerType | employerType | adminType | companyType | undefined
  >;
}

export interface userModelInterfaces extends adminModelInterfaces {
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
