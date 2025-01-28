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

  providerId?: string;
  provider?: string; // oauth exclusive
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

  providerId?: string;
  provider?: string;
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
}

interface adminType {
  id: string;
  username?: string;
  email?: string;
  profilePicture?: string | null;
  password?: string;
  contact?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// middleware types

interface userSessionType {
  id: string;
  type: string;
  provider?: "GOOGLE" | "LINE";
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
  type: string;
}

interface adminSessionType extends adminType {
  type: string;
}

interface registerUserType {
  id: string;
}

type approveReturn = { userId: string; userType: string; isOauth: boolean };

type approveUser = { id: string };

type approvingUser = approveUser & { status: "APPROVED" | "UNAPPROVED" };

type approveResponse = { approvedId: string; adminId: string };

type registrationApprovalType = {
  id: string;
  userId: string;
  userType: string;
  status: string;
  adminId?: string | null;
};

interface checkUserType {
  id: string;
  username?: string;
  officialName?: string;
}

interface matchNameEmailType {
  id: string;
  password: string;
  approvalStatus?: "UNAPPROVED" | "APPROVED";
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
