import { IVerifyOptions } from "passport-local";
import { Profile, VerifyCallback } from "passport-google-oauth20";

import "../types/responseTypes";

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
    type: string
  ): Promise<SerivcesResponse<any>>;

  deserializer(id: string): Promise<SerivcesResponse<any>>;

  getCurrent(user: Express.User | undefined): Promise<SerivcesResponse<any>>;
}

export interface adminServiceInterfaces extends baseUserServiceInterfaces {
  approve(user: any): Promise<SerivcesResponse<any>>;
}

export interface userServiceInterfaces extends baseUserServiceInterfaces {
  register(userForm: any): Promise<SerivcesResponse<any>>;
}

export interface userOauthServiceInterfaces extends baseUserServiceInterfaces {
  // passport strategy
  googleLogin(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<void>;

  checkCurrent(
    user: Express.User,
    type: string,
    isOauth?: boolean
  ): Promise<SerivcesResponse<any>>;

  deserializer(
    id: string,
    provider?: "GOOGLE" | "LINE"
  ): Promise<SerivcesResponse<any>>;
}
