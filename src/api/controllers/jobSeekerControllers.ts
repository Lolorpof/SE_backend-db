import { jobSeekerServices } from "../services/jobSeekerServices";
import { Request, Response } from "express";
import passport from "../middlewares/passport";
import "../interfaces/userControllerInterfaces";
import {
  userControllerInterfaces,
  userOauthControllerInterfaces,
} from "../interfaces/userControllerInterfaces";

export class jobSeekerControllers implements userOauthControllerInterfaces {
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

    if (result.data) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg, data: result.data });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg });
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
            `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/login?msg=${info.message}`
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

  // get all
  async getAll(req: Request, res: Response): Promise<void> {
    const result = await jobSeekerServices.instance().getAll();

    if (result.data) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg, data: result.data });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg });
  }

  // get current user
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
}
