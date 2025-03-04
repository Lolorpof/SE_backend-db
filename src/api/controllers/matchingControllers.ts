import { Request, Response } from "express";
import { matchingServices } from "../services/matchingServices";
import { matchingControllerInterfaces } from "../interfaces/matchingControllerInterfaces";
import { handleControllerError } from "../utilities/controllerUtils";
import { TGenericUserSession, TJobSeekerSession } from "../types/usersTypes";
import { THiringMatchSeeker } from "../types/matchingTypes";

export class matchingControllers implements matchingControllerInterfaces {
  private static matchingController: matchingControllers | undefined;

  static instance() {
    if (!this.matchingController) {
      this.matchingController = new matchingControllers();
    }
    return this.matchingController;
  }

  // Job seeker matches with a hiring post
  async matchWithHiringPost(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TGenericUserSession;

      // Check if user is a job seeker
      if (!user || user.type !== "JOBSEEKER") {
        res.status(403).json({
          success: false,
          msg: "Only job seekers can match with hiring posts",
        });
        return;
      }

      const jobSeeker = user as TJobSeekerSession;
      const result = await matchingServices
        .instance()
        .matchWithHiringPost(req.params.postId, jobSeeker);

      if (!result.success) {
        res
          .status(result.status)
          .json({ success: result.success, msg: result.msg });
        return;
      }

      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  // Get all matches for a hiring post
  async getHiringPostMatches(req: Request, res: Response): Promise<void> {
    try {
      const result = await matchingServices
        .instance()
        .getHiringPostMatches(req.params.postId);

      if (!result.success) {
        res
          .status(result.status)
          .json({ success: result.success, msg: result.msg });
        return;
      }

      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  // Update match status (by employer)
  async updateHiringMatchStatus(req: Request, res: Response): Promise<void> {
    try {
      const { matchId } = req.params;
      const { seekerId } = req.body;
      const { status } = req.body;

      const result = await matchingServices
        .instance()
        .updateHiringMatchStatus(matchId, seekerId, status);

      res.status(result.status).json(result);
    } catch (error) {
      console.error("Error in updateHiringMatchStatus:", error);
      res.status(500).json({
        success: false,
        msg: "Internal server error",
        status: 500,
      });
    }
  }

  async getHiringMatchSeekers(req: Request, res: Response): Promise<void> {
    try {
      const result = await matchingServices
        .instance()
        .getHiringMatchSeekers(req.params.matchId);

      if (!result.success) {
        res
          .status(result.status)
          .json({ success: result.success, msg: result.msg });
        return;
      }

      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  // Finding Post Matching
  async matchWithFindingPost(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TGenericUserSession;

      // Check if user is an employer/company
      if (!user || !["EMPLOYER", "OAUTHEMPLOYER", "COMPANY"].includes(user.type)) {
        res.status(403).json({
          success: false,
          msg: "Only employers and companies can match with finding posts",
        });
        return;
      }

      const result = await matchingServices
        .instance()
        .matchWithFindingPost(req.params.postId, user);

      if (!result.success) {
        res
          .status(result.status)
          .json({ success: result.success, msg: result.msg });
        return;
      }

      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  async updateFindingMatchStatus(req: Request, res: Response): Promise<void> {
    try {
      const result = await matchingServices
        .instance()
        .updateFindingMatchStatus(req.params.matchId, req.body.status);

      if (!result.success) {
        res
          .status(result.status)
          .json({ success: result.success, msg: result.msg });
        return;
      }

      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  async getFindingPostMatch(req: Request, res: Response): Promise<void> {
    try {
      const result = await matchingServices
        .instance()
        .getFindingPostMatch(req.params.postId);

      if (!result.success) {
        res
          .status(result.status)
          .json({ success: result.success, msg: result.msg });
        return;
      }

      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  /**
   * Get all matching/tracking status for the authenticated user
   * Includes both hiring and finding post matches
   */
  async getUserMatchingStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TGenericUserSession;
      const result = await matchingServices
        .instance()
        .getUserMatchingStatus(user.id, user.type);

      if (!result.success) {
        res.status(result.status).json({ message: result.msg });
        return;
      }

      res.status(200).json({
        message: "User matching status retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  /**
   * Get all matching/tracking status in the system (admin only)
   * Includes all hiring and finding post matches
   */
  async getAllMatchingStatus(req: Request, res: Response): Promise<void> {
    try {
      const result = await matchingServices.instance().getAllMatchingStatus();

      if (!result.success) {
        res.status(result.status).json({ message: result.msg });
        return;
      }

      res.status(200).json({
        message: "All matching status retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  // Delete hiring match
  async deleteHiringMatch(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TGenericUserSession;
      const result = await matchingServices
        .instance()
        .deleteHiringMatch(req.params.matchId, user.id, user.type);

      if (!result.success) {
        res.status(result.status).json({ success: result.success, msg: result.msg });
        return;
      }

      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  // Delete finding match
  async deleteFindingMatch(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TGenericUserSession;
      const result = await matchingServices
        .instance()
        .deleteFindingMatch(req.params.matchId, user.id, user.type);

      if (!result.success) {
        res.status(result.status).json({ success: result.success, msg: result.msg });
        return;
      }

      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
