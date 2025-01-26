import { Profile as GoogleProfile } from "passport-google-oauth20";
import "../types/usersTypes";

export interface userModelInterfaces {
  register(
    user: formattedSingleUserRegisterType | formattedCompanyRegisterType
  ): Promise<registerUserType>;

  duplicateNameEmail(
    email: string,
    firstName?: string,
    lastName?: string,
    officialName?: string
  ): Promise<duplicateNameEmailType1 | duplicateNameEmailType2 | undefined>;

  matchNameEmail(nameEmail: string): Promise<matchNameEmailType[]>;

  getById(
    id: string
  ): Promise<jobSeekerType | employerType | companyType | undefined>;
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
