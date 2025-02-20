import { jobSeekerServices } from "../services/jobSeekerServices";
import { Request, Response } from "express";
import passport from "../middlewares/passport";
import "../interfaces/userControllerInterfaces";
import {
  jobSeekerControllerInterfaces,
  userControllerInterfaces,
  userOauthControllerInterfaces,
} from "../interfaces/userControllerInterfaces";
import { catchError } from "../utilities/utilFunctions";

export class jobSeekerControllers implements jobSeekerControllerInterfaces {
  // singleton design
  private static userController: jobSeekerControllers | undefined;
  static instance() {
    if (!this.userController) {
      this.userController = new jobSeekerControllers();
    }
    return this.userController;
  }

  // register route handler
  async register(req: Request, res: Response): Promise<void> {
    const userForm = req.body; // frontend sent in body user object
    const result = await jobSeekerServices.instance().register(userForm);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg, data: result.data });
  }

  // login route handler
  async login(req: Request, res: Response): Promise<void> {
    passport.authenticate(
      "local-jobSeeker",
      (err: any, user: any, info: any) => {
        if (err) {
          return res.status(403).json({ success: false, msg: info.message });
        }
        if (!user) {
          return res.status(401).json({ success: false, msg: info.message });
        }

        req.logIn(user, (err) => {
          if (err) {
            return res.status(403).json({
              success: false,
              msg: "Something went wrong when logging in",
            });
          }

          return res
            .status(200)
            .json({ success: true, msg: "Successfully logged in", data: user });
        });
      }
    )(req, res);
  }

  // google oauth 2.0 route handler
  async googleLogin(req: Request, res: Response): Promise<void> {
    passport.authenticate(
      "google-jobSeeker",
      (err: any, user: any, info: any) => {
        if (err) {
          console.log(err);
          return res.redirect(
            `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/login?msg=${info.message}`
          );
        }
        if (!user) {
          return res.redirect(
            `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/login?msg=Not+approved+yet&approvalId=${info.approvalId}`
          );
        }

        req.logIn(user, (err) => {
          if (err) {
            console.log(err);
            return res.redirect(
              `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/login?msg=login`
            );
          }

          res.redirect(
            `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}?msg=success`
          );
        });
      }
    )(req, res);
  }

  // logout route handler
  async logout(req: Request, res: Response): Promise<void> {
    // check current user type
    const result = await jobSeekerServices
      .instance()
      .checkCurrent(req.user, "JOBSEEKER", false);
    if (!result.success || !result.data) {
      res.status(result.status).json({
        success: false,
        msg: result.msg,
      });
      return;
    }

    req.logOut((err) => {
      if (err) {
        res.status(403).json({
          success: false,
          msg: "Something went wrong when logging out",
        });
        return;
      }

      // destroy session cookie
      req.session.destroy((err) => {
        if (err) {
          res.status(403).json({
            success: false,
            msg: "Something went wrong when removing session cookie",
          });
          return;
        }

        res.clearCookie("sid");
        res.status(200).json({
          success: true,
          msg: "Successfuly logged out",
          data: result.data,
        });
      });
    });
  }

  // get all route handler
  async getAll(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices.instance().getAll();

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg, data: result.data });
  }

  // get current user route handler
  async getCurrent(req: Request, res: Response): Promise<void> {
    const responseUser = await jobSeekerServices
      .instance()
      .getCurrent(req.user);

    if (!responseUser.success || !responseUser.data) {
      res
        .status(responseUser.status)
        .json({ success: responseUser.success, msg: responseUser.msg });
      return;
    }

    if (responseUser.data.type !== "JOBSEEKER") {
      res
        .status(responseUser.status)
        .json({ success: responseUser.success, msg: responseUser.msg });
      return;
    }

    res.status(responseUser.status).json({
      success: responseUser.success,
      msg: responseUser.msg,
      data: responseUser.data,
    });
  }

  // upload registration image route handler (not done)
  async uploadRegistrationImage(req: Request, res: Response): Promise<void> {
    if (!req.params || !req.params.approvalId) {
      res.status(400).json({ success: false, msg: "Credential is missing" });
      console.error("params missing");
      return;
    }
    const { approvalId } = req.params;
    const [error, result] = await catchError(
      jobSeekerServices
        .instance()
        .uploadRegistrationImage(approvalId, req.file as Express.Multer.File)
    );

    if (error) {
      console.log(error);
      res.status(403).json({ success: false, msg: "Credential is missing" });
      return;
    }

    if (!result.success || !result.data) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg, data: result.data });
  }

  // upload profile picture route handler (not done)
  // async uploadProfilePicture(req: Request, res: Response): Promise<void> {}

  // // upload resume image route handler
  // async uploadResume(req: Request, res: Response): Promise<void> {}

  // edit username route handler
  async editUsername(req: Request, res: Response): Promise<void> {
    // get response
    const result = await jobSeekerServices
      .instance()
      .editUsername(req.body, req.user as Express.User);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    const { case: _, ...formattedResultData } = result.data;

    res.status(result.status).json({
      success: result.success,
      msg: result.msg,
      data: formattedResultData,
    });
  }

  // edit email route handler
  async editEmail(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices
      .instance()
      .editEmail(req.body, req.user as Express.User);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    // const { case: _, ...formattedResultData } = result.data;

    res.status(result.status).json({
      success: result.success,
      msg: result.msg,
      data: result.data,
    });
  }

  // edit full name route handler
  async editFullName(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices
      .instance()
      .editFullName(req.body, req.user as Express.User);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    // const { case: _, ...formattedResultData } = result.data;

    res.status(result.status).json({
      success: result.success,
      msg: result.msg,
      data: result.data,
    });
  }

  // edit about route handler
  async editAbout(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices
      .instance()
      .editAbout(req.body, req.user as Express.User);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    // const { case: _, ...formattedResultData } = result.data;

    res.status(result.status).json({
      success: result.success,
      msg: result.msg,
      data: result.data,
    });
  }

  // edit address route handler
  async editAddress(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices
      .instance()
      .editAddress(req.body, req.user as Express.User);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    // const { case: _, ...formattedResultData } = result.data;

    res.status(result.status).json({
      success: result.success,
      msg: result.msg,
      data: result.data,
    });
  }

  // edit contact route handler
  async editContact(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices
      .instance()
      .editContact(req.body, req.user as Express.User);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    // const { case: _, ...formattedResultData } = result.data;

    res.status(result.status).json({
      success: result.success,
      msg: result.msg,
      data: result.data,
    });
  }

  // edit password route handler
  async editPassword(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices
      .instance()
      .editPassword(req.body, req.user as Express.User);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    const { case: _, ...formattedResultData } = result.data;

    res.status(result.status).json({
      success: result.success,
      msg: result.msg,
      data: formattedResultData,
    });
  }

  // edit job seeker skills route handler
  async editSkill(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices
      .instance()
      .editSkill(req.body, req.user as Express.User);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    // const { case: _, ...formattedResultData } = result.data;

    res.status(result.status).json({
      success: result.success,
      msg: result.msg,
      data: result.data,
    });
  }

  // edit job seeker vulnerabilities route handler
  async editVulnerability(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices
      .instance()
      .editVulnerability(req.body, req.user as Express.User);

    if (!result.success) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    // const { case: _, ...formattedResultData } = result.data;

    res.status(result.status).json({
      success: result.success,
      msg: result.msg,
      data: result.data,
    });
  }
}
