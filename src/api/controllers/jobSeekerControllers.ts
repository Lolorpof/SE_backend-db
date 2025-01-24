import { jobSeekerServices } from "../services/jobSeekerServices";
import { Request, Response } from "express";
import passport from "../middlewares/passport";

export class jobSeekerControllers {
  // singleton design
  private static userController: jobSeekerControllers | undefined;
  static instance() {
    if (!this.userController) {
      this.userController = new jobSeekerControllers();
    }
    return this.userController;
  }

  // register
  async register(req: Request, res: Response) {
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

  // login
  async login(req: Request, res: Response) {
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
            return res.status(403).json({ success: false, msg: info.message });
          }

          return res
            .status(200)
            .json({ success: true, msg: "Successfully logged in", data: user });
        });
      }
    )(req, res);
  }

  // get all
  async getAll(req: Request, res: Response) {
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

  // get
  async getCurrent(req: Request, res: Response) {
    const responseUser = await jobSeekerServices
      .instance()
      .getCurrent(req.user);

    if (!responseUser.success || !responseUser.data) {
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
