// model types
interface jobSeekerType {
  id: string;
  username: string;
  password?: string; // normal exclusive
  firstName?: string;
  lastName?: string;
  email: string;
  profilePicture?: string | null;
  aboutMe?: string | null;
  contact?: string | null;
  resume?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
  approvalStatus?: string;
  toSkill?: nameDescType[];
  toVulnerabilityType?: nameDescType[];

  oauthType?: string; // oauth exclusive
}

interface employerType {
  id: string;
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profilePicture?: string | null;
  aboutMe?: string | null;
  contact?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
  approvalStatus?: string;

  oauthType?: string;
}

interface companyType {
  id: string;
  officialName: string;
  password?: string;
  email: string;
  profilePicture?: string | null;
  aboutMe?: string | null;
  contact?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
  approvalStatus?: string;

  oauthType?: string;
}

// middleware types

interface userSessionType {
  id: string;
  type: string;
  isOauth: boolean;
}

interface jobSeekerSessionType extends jobSeekerType {
  isOauth: boolean;
  type: string;
}

interface employerSessionType extends employerType {
  isOauth: boolean;
  type: string;
}

interface companySessionType extends companyType {
  isOauth: boolean;
  type: string;
}

interface registerUserType {
  id: string;
}

interface checkUserType {
  id: string;
  username?: string;
  officialName?: string;
}

interface matchNameEmailType {
  id: string;
  approvalStatus: "UNAPPROVED" | "APPROVED";
  password: string;
}

interface duplicateNameEmailType1 {
  email: string;
  firstName: string;
  lastName: string;
}
interface duplicateNameEmailType2 {
  email: string;
  officialName: string;
}

interface nameDescType {
  name: string;
  description: string | null;
}

interface formattedSingleUserRegisterType {
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
}

interface formattedCompanyRegisterType {
  officialName: string;
  email: string;
  hashedPassword: string;
}

type sessionUser = {
  id: string;
  type: string;
  isOauth: boolean;
};
