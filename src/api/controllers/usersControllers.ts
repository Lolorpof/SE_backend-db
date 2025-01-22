import { usersServices } from "../services/usersServices";
import { Request, Response } from "express";

export class usersControllers {
  // {Job Seeker}
  // job seeker register
  static async jobSeekerRegister(req: Request, res: Response) {
    const userForm = req.body.user; // frontend sent in body user object
    const result = await usersServices.jobSeekerRegister(userForm);
  }

  // {Employer}

  // {Company}
}
