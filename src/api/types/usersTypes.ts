// model types
type TJobSeeker = {
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
  toSkill?: TNameDesc[];
  toVulnerabilityType?: TNameDesc[];

  providerId?: string;
  provider?: string; // oauth exclusive
};

type TEmployer = {
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
};

type TCompany = {
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
};

type TAdmin = {
  id: string;
  username?: string;
  email?: string;
  profilePicture?: string | null;
  password?: string;
  contact?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// serializer types
type TUserSession = {
  id: string;
  type: string;
  provider?: "GOOGLE" | "LINE";
};

// deserializer types (req.user)
type TJobSeekerSession = TJobSeeker & {
  isOauth: boolean;
  type: string;
};

type TEmployerSession = TEmployer & {
  isOauth: boolean;
  type: string;
};

type TCompanySession = TCompany & {
  type: string;
};

type TAdminSession = TAdmin & {
  type: string;
};

type TGenericUserSession =
  | TJobSeekerSession
  | TEmployerSession
  | TCompanySession;

// register return
type TRegisterUser = {
  userId: string;
  approvalId: string;
};

// some id
type TGetId = {
  id: string;
};

// registration approval database fetch
type TApproveReturn = { userId: string; userType: string; isOauth: boolean };

// user approved by admin
type TApproveUser = { id: string };

// admin approving user
type TApprovingUser = TApproveUser & { status: "APPROVED" | "UNAPPROVED" };

// response after approving
type TApproveResponse = { approvedId: string; adminId: string };

// registration approval return
type TRegistrationApproval = {
  id: string;
  userId: string;
  userType: string;
  status: string;
  adminId?: string | null;
};

// check current user return
type TCheckUser = {
  id: string;
  username?: string;
  officialName?: string;
};

// name or email matched return
type TMatchNameEmail = {
  id: string;
  password: string;
  approvalStatus?: "UNAPPROVED" | "APPROVED";
};

// duplicate single user
type TDuplicateNameEmail1 = {
  email: string;
  firstName: string;
  lastName: string;
};

// duplicate company
type TDuplicateNameEmail2 = {
  email: string;
  officialName: string;
};

// data with description
type TNameDesc = {
  name: string;
  description: string | null;
};

// single user registration form
type TFormattedSingleUserRegister = {
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
};

// company registration form
type TFormattedCompanyRegister = {
  officialName: string;
  email: string;
  hashedPassword: string;
};

// register approve image upload
type TRegisterImage = {
  approvalId: string;
  url: string;
};

// profile image
type TProfileImage = {
  url: string;
};

// resume image
type TResumeImage = {
  url: string;
};
