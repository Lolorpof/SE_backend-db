import { Request, Response } from "express";

export interface baseUserControllerInterfaces {
  login(req: Request, res: Response): Promise<void>;

  logout(req: Request, res: Response): Promise<void>;

  getCurrent(req: Request, res: Response): Promise<void>;
}

export interface adminControllerInterfaces
  extends baseUserControllerInterfaces {
  approvingUser(req: Request, res: Response): Promise<void>;

  getAllApproveRequest(req: Request, res: Response): Promise<void>;
}

export interface userControllerInterfaces extends baseUserControllerInterfaces {
  register(req: Request, res: Response): Promise<void>;

  uploadRegistrationImage(req: Request, res: Response): Promise<void>;

  editPassword(req: Request, res: Response): Promise<void>;

  editEmail(req: Request, res: Response): Promise<void>;

  editAbout(req: Request, res: Response): Promise<void>;

  editContact(req: Request, res: Response): Promise<void>;

  editAddress(req: Request, res: Response): Promise<void>;

  uploadProfilePicture(req: Request, res: Response): Promise<void>;
}

export interface singleUserControllerInterfaces
  extends userControllerInterfaces {
  editUsername(req: Request, res: Response): Promise<void>;

  editFullName(req: Request, res: Response): Promise<void>;
}

export interface userOauthControllerInterfaces
  extends singleUserControllerInterfaces {
  googleLogin(req: Request, res: Response): Promise<void>;
}

export interface jobSeekerControllerInterfaces
  extends userOauthControllerInterfaces {
  uploadResume(req: Request, res: Response): Promise<void>;

  editSkill(req: Request, res: Response): Promise<void>;

  editVulnerability(req: Request, res: Response): Promise<void>;
}

export interface employerControllerInterfaces
  extends userOauthControllerInterfaces {}

export interface companyControllerInterfaces extends userControllerInterfaces {
  editOfficialName(req: Request, res: Response): Promise<void>;
}
