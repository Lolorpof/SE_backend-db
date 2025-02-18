import { Profile as GoogleProfile } from "passport-google-oauth20";
import "../types/usersTypes";
import { TApprovedRequest } from "../validators/usersValidator";
import {
  TEditEmailResponse,
  TEditFullNameResponse,
  TEditOfficialNameResponse,
  TEditPasswordResponse,
  TEditUsernameResponse,
} from "../types/editUserProfile";

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

  uploadRegistrationImage(
    approvalId: string,
    imageUrl: string
  ): Promise<TRegisterImage>;

  editEmail(
    email: string,
    user: TGenericUserSession
  ): Promise<TEditEmailResponse | null>;

  editPassword(
    password: string,
    oldPassword: string,
    user: TGenericUserSession
  ): Promise<TEditPasswordResponse>;

  uploadProfilePicture(
    image: Express.Multer.File,
    userId: string,
    provider?: string
  ): Promise<TProfileImage>;
}

export interface singleUserModelInterfaces extends userModelInterfaces {
  editUsername(
    username: string,
    password: string,
    user: TGenericUserSession
  ): Promise<TEditUsernameResponse | null>;

  editFullName(
    firstName: string,
    lastName: string,
    user: TGenericUserSession
  ): Promise<TEditFullNameResponse>;
}

export interface userOauthModelInterfaces extends singleUserModelInterfaces {
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

export interface jobSeekerModelInterfaces extends userOauthModelInterfaces {
  uploadResume(
    image: Express.Multer.File,
    user: TGenericUserSession
  ): Promise<TResumeImage>;
}

export interface employerModelInterfaces extends userOauthModelInterfaces {}

export interface companyModelInterfaces extends userModelInterfaces {
  editOfficialName(
    officialName: string,
    user: TGenericUserSession
  ): Promise<TEditOfficialNameResponse>;
}
