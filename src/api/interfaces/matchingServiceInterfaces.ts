import { ServicesResponse } from "../types/responseTypes";
import { TFindingMatchHirer, TMatchStatus } from "../types/matchingTypes";
import { TJobSeekerSession } from "../types/usersTypes";

export interface matchingServiceInterfaces {
  // Hiring Post Matching
  matchWithHiringPost(hiringPostId: string, user: TJobSeekerSession): Promise<ServicesResponse<any>>;
  getHiringPostMatches(hiringPostId: string): Promise<ServicesResponse<any>>;
  updateHiringMatchStatus(matchId: string, status: TMatchStatus): Promise<ServicesResponse<any>>;
  deleteHiringMatch(matchId: string, userId: string, userType: string): Promise<ServicesResponse<any>>;

  // Finding Post Matching
  createFindingPostMatch(findingPostId: string, hirerData: TFindingMatchHirer): Promise<ServicesResponse<any>>;
  updateFindingPostMatchStatus(matchId: string, status: TMatchStatus): Promise<ServicesResponse<any>>;
  getFindingPostMatch(findingPostId: string): Promise<ServicesResponse<any>>;
  deleteFindingMatch(matchId: string, userId: string, userType: string): Promise<ServicesResponse<any>>;

  // Tracking Methods
  getUserMatchingStatus(userId: string, userType: string): Promise<ServicesResponse<any>>;
  getAllMatchingStatus(): Promise<ServicesResponse<any>>;
} 