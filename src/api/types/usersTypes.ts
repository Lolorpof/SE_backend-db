// interfaces
interface userObj {
  id: string;
  type: string;
  isOauth: boolean;
}

// model types
type jobSeekerType = {
  id?: string;
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
};

type employerType = {
  id?: string;
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
};

type companyType = {
  id?: string;
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
};

// middleware types

type nameDescType = {
  name: string;
  description: string | null;
};

type formattedSingleUserRegisterType = {
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
};

type formattedCompanyRegisterType = {
  officialName: string;
  email: string;
  hashedPassword: string;
};

type sessionUser = {
  id: string;
  type: string;
  isOauth: boolean;
};
