import { Request, Response } from "express";
import { userServices } from "../services/userServices";
import { unifiedUserControllerInterface } from "../interfaces/userControllerInterfaces";

export class userControllers implements unifiedUserControllerInterface {
  private static userController: userControllers | undefined;

  static instance() {
    if (!this.userController) {
      this.userController = new userControllers();
    }
    return this.userController;
  }

  /**
   * Get current authenticated user information
   * @param req Express Request object
   * @param res Express Response object
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await userServices.instance().getCurrentUser(req.user);
      res.status(result.status).json(result);
    } catch (error) {
      console.error("Error in getCurrentUser controller:", error);
      res.status(500).json({
        success: false,
        status: 500,
        msg: "Internal server error",
      });
    }
  }
} 