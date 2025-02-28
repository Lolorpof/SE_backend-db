import { normalUserTypeEnum } from "../../db/schema";

export type TUserType = typeof normalUserTypeEnum.enumValues[number];

export type TUserSession = {
  id: string;
  type: TUserType;
}; 