import { eq, and, or } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import {
  jobHiringPostMatchedTable,
  jobHiringPostMatchedSeekersTable,
  jobFindingPostMatchedTable,
  jobHiringPostTable,
  jobFindingPostTable,
} from "../../db/schema";
import { Services } from "./services";
import { ServicesResponse } from "../types/responseTypes";
import { errorServices } from "./errorServices";
import { matchingServiceInterfaces } from "../interfaces/matchingServiceInterfaces";
import {
  THiringMatchSeeker,
  TFindingMatchHirer,
  TMatchStatus,
} from "../types/matchingTypes";
import {
  validateHiringMatchSeeker,
  validateFindingMatchHirer,
} from "../schemas/requestBodySchema";
import { TJobSeekerSession } from "../types/usersTypes";

export class matchingServices
  extends Services<any, any>
  implements matchingServiceInterfaces
{
  private constructor() {
    super(jobHiringPostMatchedTable);
  }

  static instance(): matchingServices {
    return Services.getInstance.call(matchingServices);
  }

  // Job seeker matches with a hiring post
  async matchWithHiringPost(
    hiringPostId: string,
    user: TJobSeekerSession
  ): Promise<ServicesResponse<any>> {
    try {
      if (!user) {
        throw errorServices.handleAuthError();
      }

      // Check if hiring post exists
      const post = await drizzlePool.query.jobHiringPostTable.findFirst({
        where: eq(jobHiringPostTable.id, hiringPostId),
      });

      if (!post) {
        return { success: false, msg: "Hiring post not found", status: 404 };
      }

      // Determine if user is OAuth or normal job seeker
      const isOauth = user.isOauth;

      // Check if user has already matched with this post
      const existingMatch =
        await drizzlePool.query.jobHiringPostMatchedSeekersTable.findFirst({
          where: and(
            isOauth
              ? eq(jobHiringPostMatchedSeekersTable.oauthJobSeekerId, user.id)
              : eq(jobHiringPostMatchedSeekersTable.jobSeekerId, user.id),
            eq(jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, post.id)
          ),
        });

      if (existingMatch) {
        return {
          success: false,
          msg: "You have already matched with this post",
          status: 400,
        };
      }

      // Create match record if it doesn't exist
      let match = await drizzlePool.query.jobHiringPostMatchedTable.findFirst({
        where: eq(jobHiringPostMatchedTable.jobHiringPostId, hiringPostId),
      });

      if (!match) {
        const [newMatch] = await drizzlePool
          .insert(jobHiringPostMatchedTable)
          .values({
            jobHiringPostId: hiringPostId,
          })
          .returning();
        match = newMatch;
      }

      // Add seeker to match
      const [seekerMatch] = await drizzlePool
        .insert(jobHiringPostMatchedSeekersTable)
        .values({
          jobHiringPostMatchedId: match.id,
          jobSeekerType: isOauth ? "OAUTH" : "NORMAL",
          jobSeekerId: isOauth ? null : user.id,
          oauthJobSeekerId: isOauth ? user.id : null,
          status: "INPROGRESS",
        })
        .returning();

      return {
        success: true,
        msg: "Successfully matched with hiring post",
        data: seekerMatch,
        status: 201,
      };
    } catch (error) {
      console.error("Error in matchWithHiringPost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  // Get all matches for a hiring post
  async getHiringPostMatches(
    hiringPostId: string
  ): Promise<ServicesResponse<any>> {
    try {
      const matches =
        await drizzlePool.query.jobHiringPostMatchedTable.findMany({
          where: eq(jobHiringPostMatchedTable.jobHiringPostId, hiringPostId),
          with: {
            toMatchSeekers: true,
          },
        });

      return {
        success: true,
        msg: "Matches retrieved successfully",
        data: matches,
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return { success: false, msg: "Failed to get matches", status: 500 };
    }
  }

  // Update match status (by employer)
  async updateHiringMatchStatus(
    matchId: string,
    status: TMatchStatus
  ): Promise<ServicesResponse<any>> {
    try {
      const updated = await drizzlePool
        .update(jobHiringPostMatchedSeekersTable)
        .set({
          status,
          approvedAt: status === "ACCEPTED" ? new Date() : undefined,
        })
        .where(
          eq(jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, matchId)
        )
        .returning();

      if (!updated.length) {
        return { success: false, msg: "Match not found", status: 404 };
      }

      return {
        success: true,
        msg: "Match status updated successfully",
        data: updated[0],
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to update match status",
        status: 500,
      };
    }
  }

  // Hiring Post Matching Methods
  async createHiringPostMatch(
    hiringPostId: string
  ): Promise<ServicesResponse<any>> {
    try {
      // Check if hiring post exists
      const post = await drizzlePool.query.jobHiringPostTable.findFirst({
        where: eq(jobHiringPostTable.id, hiringPostId),
      });

      if (!post) {
        return { success: false, msg: "Hiring post not found", status: 404 };
      }

      // Create match record
      const match = await drizzlePool
        .insert(jobHiringPostMatchedTable)
        .values({
          jobHiringPostId: hiringPostId,
        })
        .returning();

      return {
        success: true,
        msg: "Hiring post match created successfully",
        data: match[0],
        status: 201,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to create hiring post match",
        status: 500,
      };
    }
  }

  async addSeekerToHiringPost(
    matchId: string,
    seekerData: THiringMatchSeeker
  ): Promise<ServicesResponse<any>> {
    try {
      if (!validateHiringMatchSeeker(seekerData)) {
        return {
          success: false,
          msg: "Must provide either jobSeekerId or oauthJobSeekerId",
          status: 400,
        };
      }
      // Check if match exists
      const match = await drizzlePool.query.jobHiringPostMatchedTable.findFirst(
        {
          where: eq(jobHiringPostMatchedTable.id, matchId),
        }
      );

      if (!match) {
        return { success: false, msg: "Match not found", status: 404 };
      }

      // Create seeker match record
      const seekerMatch = await drizzlePool
        .insert(jobHiringPostMatchedSeekersTable)
        .values({
          jobHiringPostMatchedId: matchId,
          jobSeekerType: seekerData.jobSeekerType,
          jobSeekerId: seekerData.jobSeekerId,
          oauthJobSeekerId: seekerData.oauthJobSeekerId,
          status: "INPROGRESS",
        })
        .returning();

      return {
        success: true,
        msg: "Seeker added to hiring post match successfully",
        data: seekerMatch[0],
        status: 201,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to add seeker to hiring post match",
        status: 500,
      };
    }
  }

  async updateSeekerMatchStatus(
    matchId: string,
    seekerId: string,
    status: TMatchStatus
  ): Promise<ServicesResponse<any>> {
    try {
      const updated = await drizzlePool
        .update(jobHiringPostMatchedSeekersTable)
        .set({
          status,
          approvedAt: status === "ACCEPTED" ? new Date() : undefined,
        })
        .where(
          and(
            eq(
              jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId,
              matchId
            ),
            eq(jobHiringPostMatchedSeekersTable.jobSeekerId, seekerId)
          )
        )
        .returning();

      if (!updated.length) {
        return { success: false, msg: "Match not found", status: 404 };
      }

      return {
        success: true,
        msg: "Match status updated successfully",
        data: updated[0],
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to update match status",
        status: 500,
      };
    }
  }

  async getHiringMatchSeekers(matchId: string): Promise<ServicesResponse<any>> {
    try {
      const seekers =
        await drizzlePool.query.jobHiringPostMatchedSeekersTable.findMany({
          where: eq(
            jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId,
            matchId
          ),
        });

      return {
        success: true,
        msg: "Match seekers retrieved successfully",
        data: seekers,
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to get match seekers",
        status: 500,
      };
    }
  }

  // Finding Post Matching Methods
  async createFindingPostMatch(
    findingPostId: string,
    hirerData: TFindingMatchHirer
  ): Promise<ServicesResponse<any>> {
    try {
      if (!validateFindingMatchHirer(hirerData)) {
        return {
          success: false,
          msg: "Must provide exactly one hirer ID matching the hirer type",
          status: 400,
        };
      }
      // Check if finding post exists
      const post = await drizzlePool.query.jobFindingPostTable.findFirst({
        where: eq(jobFindingPostTable.id, findingPostId),
      });

      if (!post) {
        return { success: false, msg: "Finding post not found", status: 404 };
      }

      // Create match record
      const match = await drizzlePool
        .insert(jobFindingPostMatchedTable)
        .values({
          jobFindingPostId: findingPostId,
          jobHirerType: hirerData.jobHirerType,
          employerId: hirerData.employerId,
          oauthEmployerId: hirerData.oauthEmployerId,
          companyId: hirerData.companyId,
          status: "INPROGRESS",
        })
        .returning();

      return {
        success: true,
        msg: "Finding post match created successfully",
        data: match[0],
        status: 201,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to create finding post match",
        status: 500,
      };
    }
  }

  async updateFindingPostMatchStatus(
    matchId: string,
    status: TMatchStatus
  ): Promise<ServicesResponse<any>> {
    try {
      const updated = await drizzlePool
        .update(jobFindingPostMatchedTable)
        .set({
          status,
          approvedAt: status === "ACCEPTED" ? new Date() : undefined,
        })
        .where(eq(jobFindingPostMatchedTable.id, matchId))
        .returning();

      if (!updated.length) {
        return { success: false, msg: "Match not found", status: 404 };
      }

      return {
        success: true,
        msg: "Match status updated successfully",
        data: updated[0],
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to update match status",
        status: 500,
      };
    }
  }

  async getFindingPostMatch(
    findingPostId: string
  ): Promise<ServicesResponse<any>> {
    try {
      const match =
        await drizzlePool.query.jobFindingPostMatchedTable.findFirst({
          where: eq(jobFindingPostMatchedTable.jobFindingPostId, findingPostId),
        });

      if (!match) {
        return { success: false, msg: "Match not found", status: 404 };
      }

      return {
        success: true,
        msg: "Match retrieved successfully",
        data: match,
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return { success: false, msg: "Failed to get match", status: 500 };
    }
  }

  async getUserMatchingStatus(
    userId: string,
    userType: string
  ): Promise<ServicesResponse<any>> {
    try {
      let matches: { hiringMatches: any[]; findingMatches: any[] };

      // If user is a job seeker
      if (userType === "JOBSEEKER") {
        // Get hiring post matches where user is a seeker
        const hiringMatches =
          await drizzlePool.query.jobHiringPostMatchedSeekersTable.findMany({
            where: eq(jobHiringPostMatchedSeekersTable.jobSeekerId, userId),
            with: {
              toPostMatched: {
                with: {
                  toPost: true,
                },
              },
            },
          });

        // Get finding posts where user is the creator
        const findingMatches =
          await drizzlePool.query.jobFindingPostTable.findMany({
            where: eq(jobFindingPostTable.jobSeekerId, userId),
            with: {
              postMatched: true,
            },
          });

        matches = {
          hiringMatches,
          findingMatches,
        };
      }
      // If user is an employer/company
      else {
        // Get hiring posts created by the user
        const hiringMatches =
          await drizzlePool.query.jobHiringPostTable.findMany({
            where: or(
              eq(jobHiringPostTable.employerId, userId),
              eq(jobHiringPostTable.oauthEmployerId, userId),
              eq(jobHiringPostTable.companyId, userId)
            ),
            with: {
              postMatched: {
                with: {
                  toMatchSeekers: true,
                },
              },
            },
          });

        // Get finding post matches where user is the hirer
        const findingMatches =
          await drizzlePool.query.jobFindingPostMatchedTable.findMany({
            where: or(
              eq(jobFindingPostMatchedTable.employerId, userId),
              eq(jobFindingPostMatchedTable.oauthEmployerId, userId),
              eq(jobFindingPostMatchedTable.companyId, userId)
            ),
            with: {
              toPost: true,
            },
          });

        matches = {
          hiringMatches,
          findingMatches,
        };
      }

      return {
        success: true,
        msg: "User matching status retrieved successfully",
        data: matches,
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to get user matching status",
        status: 500,
      };
    }
  }

  async getAllMatchingStatus(): Promise<ServicesResponse<any>> {
    try {
      // Get all hiring post matches with related data
      const hiringMatches =
        await drizzlePool.query.jobHiringPostMatchedTable.findMany({
          with: {
            toPost: true,
            toMatchSeekers: true,
          },
        });

      // Get all finding post matches with related data
      const findingMatches =
        await drizzlePool.query.jobFindingPostMatchedTable.findMany({
          with: {
            toPost: true,
          },
        });

      return {
        success: true,
        msg: "All matching status retrieved successfully",
        data: {
          hiringMatches,
          findingMatches,
        },
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to get all matching status",
        status: 500,
      };
    }
  }
}
