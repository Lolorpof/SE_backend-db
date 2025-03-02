import { Request, Response } from "express";

export interface matchingControllerInterfaces {
  // Hiring Post Matching
  matchWithHiringPost(req: Request, res: Response): Promise<void>;
  getHiringPostMatches(req: Request, res: Response): Promise<void>;
  updateHiringMatchStatus(req: Request, res: Response): Promise<void>;
  getHiringMatchSeekers(req: Request, res: Response): Promise<void>;
  deleteHiringMatch(req: Request, res: Response): Promise<void>;

  // Finding Post Matching
  matchWithFindingPost(req: Request, res: Response): Promise<void>;
  updateFindingMatchStatus(req: Request, res: Response): Promise<void>;
  getFindingPostMatch(req: Request, res: Response): Promise<void>;
  deleteFindingMatch(req: Request, res: Response): Promise<void>;

  // Tracking Methods
  getUserMatchingStatus(req: Request, res: Response): Promise<void>;
  getAllMatchingStatus(req: Request, res: Response): Promise<void>;
} 