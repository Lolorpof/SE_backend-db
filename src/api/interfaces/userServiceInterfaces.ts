import { IVerifyOptions } from "passport-local";
import { Profile, VerifyCallback } from "passport-google-oauth20";

import "../types/responseTypes";
import { ServicesResponse } from "../types/responseTypes";
import {
  TEditAboutResponse,
  TEditAddressResponse,
  TEditContactResponse,
  TEditEmailResponse,
  TEditFullNameResponse,
  TEditJobSeekerSkillResponse,
  TEditJobSeekerVulnerabilityResponse,
  TEditOfficialNameResponse,
  TEditPasswordResponse,
  TEditUsernameResponse,
} from "../types/editUserProfile";

export interface baseUserServiceInterfaces {
  // passport strategy, so response is not <ServiceResponse>
  login(
    username: string,
    password: string,
    done: (
      error: any,
      user?: Express.User | false,
      options?: IVerifyOptions
    ) => void
  ): Promise<void>;

  checkCurrent(
    user: Express.User,
    type: string,
    isOauth?: boolean
  ): Promise<ServicesResponse<any>>;

  deserializer(id: string): Promise<ServicesResponse<any>>;

  getCurrent(user: Express.User | undefined): Promise<ServicesResponse<any>>;
}

export interface adminServiceInterfaces extends baseUserServiceInterfaces {
  approvingUser(user: any, adminId: string): Promise<ServicesResponse<any>>;

  getAllApproveRequest(): Promise<ServicesResponse<any>>;
}

export interface userServiceInterfaces extends baseUserServiceInterfaces {
  register(userForm: any): Promise<ServicesResponse<TRegisterUser>>;

  uploadRegistrationImage(
    approvalId: string,
    image: Express.Multer.File
  ): Promise<ServicesResponse<TRegisterImage>>;

  editPassword(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditPasswordResponse>>;

  editEmail(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditEmailResponse>>;

  editAbout(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditAboutResponse>>;

  editContact(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditContactResponse>>;

  editAddress(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditAddressResponse>>;

  uploadProfilePicture(
    image: Express.Multer.File,
    user: Express.User
  ): Promise<ServicesResponse<TProfileImage>>;
}

export interface singleUserServiceInterfaces extends userServiceInterfaces {
  editUsername(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditUsernameResponse>>;

  editFullName(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditFullNameResponse>>;
}

export interface userOauthServiceInterfaces
  extends singleUserServiceInterfaces {
  // passport strategy
  googleLogin(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<void>; // redirect

  deserializer(
    id: string,
    provider?: "GOOGLE" | "LINE"
  ): Promise<ServicesResponse<any>>;
}

export interface jobSeekerServiceInterfaces extends userOauthServiceInterfaces {
  uploadResume(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TResumeImage>>;

  editSkill(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditJobSeekerSkillResponse>>;

  editVulnerability(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditJobSeekerVulnerabilityResponse>>;
}

export interface employerServiceInterfaces extends userOauthServiceInterfaces {}

export interface companyServiceInterfaces extends userServiceInterfaces {
  editOfficialName(
    req: Request,
    res: Response
  ): Promise<ServicesResponse<TEditOfficialNameResponse>>;
}
