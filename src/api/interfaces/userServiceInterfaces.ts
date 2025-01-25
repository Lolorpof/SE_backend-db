import { IVerifyOptions } from "passport-local";
import "../types/responseTypes";

export interface userServiceInterfaces {
  register(userForm: any): Promise<SerivcesResponse<any>>;

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
    isOauth: boolean,
    type: string
  ): Promise<SerivcesResponse<any>>;

  //   getById(userForm: any);

  deserializer(id: string, isOauth: boolean): Promise<SerivcesResponse<any>>;

  getCurrent(user: Express.User | undefined): Promise<SerivcesResponse<any>>;
}
