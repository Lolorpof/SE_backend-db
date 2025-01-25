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
    id: string,
    isOauth: boolean
  ): Promise<jobSeekerType | employerType | companyType | undefined>;
}
