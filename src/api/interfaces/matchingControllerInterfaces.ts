import { Request, Response } from "express";

export interface matchingControllerInterfaces {
  // Hiring Post Matching
  matchWithHiringPost(req: Request, res: Response): Promise<void>;
  getHiringPostMatches(req: Request, res: Response): Promise<void>;
  updateHiringMatchStatus(req: Request, res: Response): Promise<void>;

  // Finding Post Matching
  createFindingMatch(req: Request, res: Response): Promise<void>;
  updateFindingMatchStatus(req: Request, res: Response): Promise<void>;
  getFindingPostMatch(req: Request, res: Response): Promise<void>;

  // Tracking Methods
  getUserMatchingStatus(req: Request, res: Response): Promise<void>;
  getAllMatchingStatus(req: Request, res: Response): Promise<void>;
} 