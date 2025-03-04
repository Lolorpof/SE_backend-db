import { eq, and, or, sql } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import {
  jobHiringPostMatchedTable,
  jobHiringPostMatchedSeekersTable,
  jobFindingPostMatchedTable,
  jobHiringPostTable,
  jobFindingPostTable,
  jobSeekerTypeEnum,
  jobHirerTypeEnum,
  jobMatchedStatusEnum
} from "../../db/schema";
import { Services } from "./services";
import { ServicesResponse } from "../types/responseTypes";
import { errorServices } from "./errorServices";
import { matchingServiceInterfaces } from "../interfaces/matchingServiceInterfaces";
import { NotificationPatterns } from "../utilities/notificationPatterns";
import {
  THiringMatchSeeker,
  TFindingMatchHirer,
  TMatchStatus,
} from "../types/matchingTypes";
import {
  validateHiringMatchSeeker,
  validateFindingMatchHirer,
} from "../schemas/requestBodySchema";
import { TJobSeekerSession, TGenericUserSession, TJobSeeker, TEmployer, TCompany } from "../types/usersTypes";
import { internalUserServices } from "./internalUserServices";

// Define a type for objects that can have user data
type WithUserData<T, U = TJobSeeker | TEmployer | TCompany> = T & {
  userData?: U | null;
};

// Add interfaces for return types
interface BaseMatchedSeeker {
  jobSeekerType: "NORMAL" | "OAUTH";
  jobSeekerId: string | null;
  oauthJobSeekerId: string | null;
  status: TMatchStatus;
  jobHiringPostMatchedId: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  userData?: TJobSeeker;
}

interface BaseMatchedHirer {
  jobHirerType: "EMPLOYER" | "OAUTHEMPLOYER" | "COMPANY";
  employerId: string | null;
  oauthEmployerId: string | null;
  companyId: string | null;
  status: TMatchStatus;
  jobFindingPostId: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  userData?: TEmployer | TCompany;
}

interface BasePost {
  userData?: TJobSeeker | TEmployer | TCompany;
  [key: string]: any;
}


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

      // Get user data using internal service
      const userData = await internalUserServices.instance().getUserData(user.id, user.isOauth);
      if (!userData.success || !userData.data) {
        return { success: false, msg: "User not found", status: 404 };
      }

      // Check if hiring post exists
      const post = await drizzlePool.query.jobHiringPostTable.findFirst({
        where: eq(jobHiringPostTable.id, hiringPostId),
        with: {
          postByEmployer: true,
          postByOauthEmployer: true,
          postByCompany: true,
        },
      });

      if (!post) {
        return { success: false, msg: "Hiring post not found", status: 404 };
      }

      // Check if user has already matched with this post
      const existingMatch =
        await drizzlePool.query.jobHiringPostMatchedSeekersTable.findFirst({
          where: and(
            user.isOauth
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
      const result = await drizzlePool.execute(sql`
        INSERT INTO job_hiring_post_matched_seekers (
          job_hiring_post_matched_id,
          job_seeker_type,
          job_seeker_id,
          oauth_job_seeker_id,
          status
        )
        VALUES (
          ${match.id},
          ${user.isOauth ? "OAUTH" : "NORMAL"},
          ${user.isOauth ? null : user.id},
          ${user.isOauth ? user.id : null},
          'INPROGRESS'
        )
        RETURNING *
      `);
      const seekerMatch = result.rows[0];

      // Send notifications
      await NotificationPatterns.createHiringMatchNotification(
        user.id,
        post.employerId,
        post.oauthEmployerId,
        post.companyId,
        post.title,
        post.postByCompany?.officialName || 
        post.postByEmployer?.firstName + " " + post.postByEmployer?.lastName ||
        post.postByOauthEmployer?.firstName + " " + post.postByOauthEmployer?.lastName,
        user.isOauth
      );

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

      // Fetch user data for each seeker
      const matchesWithUserData = await Promise.all(
        matches.map(async (match) => {
          const seekersWithData = await Promise.all(
            match.toMatchSeekers.map(async (seeker) => {
              const userId = seeker.jobSeekerId || seeker.oauthJobSeekerId;
              const isOauth = seeker.jobSeekerType === "OAUTH";
              if (!userId) return seeker;

              const userData = await internalUserServices.instance().queryUserById(userId, isOauth);
              return {
                ...seeker,
                userData
              };
            })
          );

          return {
            ...match,
            toMatchSeekers: seekersWithData
          };
        })
      );

      return {
        success: true,
        msg: "Matches retrieved successfully",
        data: matchesWithUserData,
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
    seekerId: string,
    status: TMatchStatus
  ): Promise<ServicesResponse<any>> {
    try {
      const match = await drizzlePool.query.jobHiringPostMatchedSeekersTable.findFirst({
        where: and(
          eq(jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, matchId),
          or(
            eq(jobHiringPostMatchedSeekersTable.jobSeekerId, seekerId),
            eq(jobHiringPostMatchedSeekersTable.oauthJobSeekerId, seekerId)
          )
        ),
        with: {
          toPostMatched: {
            with: {
              toPost: {
                with: {
                  postByCompany: true,
                  postByEmployer: true,
                  postByOauthEmployer: true,
                }
              }
            }
          },
          toJobSeeker: true,
          toOauthJobSeeker: true,
        }
      });

      if (!match) {
        return { success: false, msg: "Match not found", status: 404 };
      }

      const result = await drizzlePool.execute(sql`
        UPDATE job_hiring_post_matched_seekers
        SET 
          status = ${status},
          approved_at = ${status === "ACCEPTED" ? new Date() : null}
        WHERE 
          job_hiring_post_matched_id = ${matchId}
          AND (job_seeker_id = ${seekerId} OR oauth_job_seeker_id = ${seekerId})
        RETURNING *
      `);
      const updated = result.rows;

      // Send notification to job seeker
      const post = match.toPostMatched.toPost;
      const companyName = post.postByCompany?.officialName || 
                         post.postByEmployer?.firstName + " " + post.postByEmployer?.lastName ||
                         post.postByOauthEmployer?.firstName + " " + post.postByOauthEmployer?.lastName;

      await NotificationPatterns.createMatchStatusUpdateNotification(
        seekerId,
        match.jobSeekerType === "NORMAL" ? "JOBSEEKER" : "OAUTHJOBSEEKER",
        post.title,
        status.toLowerCase(),
        companyName
      );

      return {
        success: true,
        msg: "Match status updated successfully",
        data: updated[0],
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return { success: false, msg: "Failed to update match status", status: 500 };
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
      const result = await drizzlePool.execute(sql`
        INSERT INTO job_hiring_post_matched_seekers (
          job_hiring_post_matched_id,
          job_seeker_type,
          job_seeker_id,
          oauth_job_seeker_id,
          status
        )
        VALUES (
          ${matchId},
          ${seekerData.jobSeekerType},
          ${seekerData.jobSeekerId},
          ${seekerData.oauthJobSeekerId},
          'INPROGRESS'
        )
        RETURNING *
      `);
      const seekerMatch = result.rows[0];

      return {
        success: true,
        msg: "Seeker added to hiring post match successfully",
        data: seekerMatch,
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
      const result = await drizzlePool.execute(sql`
        UPDATE job_hiring_post_matched_seekers
        SET 
          status = ${status},
          approved_at = ${status === "ACCEPTED" ? new Date() : null}
        WHERE 
          job_hiring_post_matched_id = ${matchId}
          AND job_seeker_id = ${seekerId}
        RETURNING *
      `);
      const updated = result.rows;

      if (updated.length === 0) {
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

      // Fetch user data for each seeker
      const seekersWithData = await Promise.all(
        seekers.map(async (seeker) => {
          const userId = seeker.jobSeekerId || seeker.oauthJobSeekerId;
          const isOauth = seeker.jobSeekerType === "OAUTH";
          if (!userId) return seeker;

          const userData = await internalUserServices.instance().queryUserById(userId, isOauth);
          return {
            ...seeker,
            userData
          };
        })
      );

      return {
        success: true,
        msg: "Match seekers retrieved successfully",
        data: seekersWithData,
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
  async matchWithFindingPost(
    findingPostId: string,
    user: TGenericUserSession
  ): Promise<ServicesResponse<any>> {
    try {
      // Check if finding post exists
      const post = await drizzlePool.query.jobFindingPostTable.findFirst({
        where: eq(jobFindingPostTable.id, findingPostId),
        with: {
          postByNormal: true,
          postByOauth: true,
        }
      });

      if (!post) {
        return { success: false, msg: "Finding post not found", status: 404 };
      }

      // Check if user has already matched with this post
      const existingMatch = await drizzlePool.query.jobFindingPostMatchedTable.findFirst({
        where: and(
          eq(jobFindingPostMatchedTable.jobFindingPostId, findingPostId),
          or(
            eq(jobFindingPostMatchedTable.employerId, user.id),
            eq(jobFindingPostMatchedTable.oauthEmployerId, user.id),
            eq(jobFindingPostMatchedTable.companyId, user.id)
          )
        ),
      });

      if (existingMatch) {
        return {
          success: false,
          msg: "You have already matched with this post",
          status: 400,
        };
      }

      // Create match record
      const result = await drizzlePool.execute(sql`
        INSERT INTO job_finding_post_matched (
          job_finding_post_id,
          job_hirer_type,
          employer_id,
          oauth_employer_id,
          company_id,
          status
        )
        VALUES (
          ${findingPostId},
          ${user.type === "EMPLOYER" ? "EMPLOYER" : 
            user.type === "OAUTHEMPLOYER" ? "OAUTHEMPLOYER" : "COMPANY"},
          ${user.type === "EMPLOYER" ? user.id : null},
          ${user.type === "OAUTHEMPLOYER" ? user.id : null},
          ${user.type === "COMPANY" ? user.id : null},
          'INPROGRESS'
        )
        RETURNING *
      `);
      const match = result.rows[0];

      // Send notifications
      await NotificationPatterns.createFindingMatchNotification(
        post.jobSeekerId,
        post.oauthJobSeekerId,
        user.id,
        post.title,
        user.type === "OAUTHEMPLOYER"
      );

      return {
        success: true,
        msg: "Successfully matched with finding post",
        data: match,
        status: 201,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        msg: "Failed to match with finding post",
        status: 500,
      };
    }
  }

  async updateFindingMatchStatus(
    matchId: string,
    status: TMatchStatus
  ): Promise<ServicesResponse<any>> {
    try {
      const match = await drizzlePool.query.jobFindingPostMatchedTable.findFirst({
        where: eq(jobFindingPostMatchedTable.id, matchId),
        with: {
          toPost: {
            with: {
              postByNormal: true,
              postByOauth: true,
            }
          },
          toEmployer: true,
          toOauthEmployer: true,
          toCompany: true,
        }
      });

      if (!match) {
        return { success: false, msg: "Match not found", status: 404 };
      }

      const result = await drizzlePool.execute(sql`
        UPDATE job_finding_post_matched
        SET 
          status = ${status},
          approved_at = ${status === "ACCEPTED" ? new Date() : null}
        WHERE id = ${matchId}
        RETURNING *
      `);
      const updated = result.rows;

      // Send notifications to both parties
      const post = match.toPost;
      
      // Notify job seeker
      if (post.postByNormal || post.postByOauth) {
        await NotificationPatterns.createMatchStatusUpdateNotification(
          post.jobSeekerId || post.oauthJobSeekerId!,
          post.jobSeekerType === "NORMAL" ? "JOBSEEKER" : "OAUTHJOBSEEKER",
          post.title,
          status.toLowerCase()
        );
      }

      // Notify employer/company
      if (match.employerId || match.oauthEmployerId || match.companyId) {
        await NotificationPatterns.createMatchStatusUpdateNotification(
          match.employerId || match.oauthEmployerId || match.companyId!,
          match.jobHirerType,
          post.title,
          status.toLowerCase()
        );
      }

      return {
        success: true,
        msg: "Match status updated successfully",
        data: updated[0],
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return { success: false, msg: "Failed to update match status", status: 500 };
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

      // Fetch user data for the employer/company
      const userId = match.employerId || match.oauthEmployerId || match.companyId;
      const isOauth = match.jobHirerType === "OAUTHEMPLOYER";
      if (userId) {
        const userData = await internalUserServices.instance().queryUserById(userId, isOauth);
        (match as WithUserData<typeof match>).userData = userData;
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
      // Get user data using internal service
      const userData = await internalUserServices.instance().queryUserById(userId, userType.includes("OAUTH"));
      if (!userData) {
        return { success: false, msg: "User not found", status: 404 };
      }

      // Get user session to determine exact type
      const userSession = await internalUserServices.instance().getUserSession(userId);
      if (!userSession.success || !userSession.data) {
        return { success: false, msg: "User session not found", status: 404 };
      }

      let matches: { hiringMatches: any[]; findingMatches: any[] };

      // If user is a job seeker
      if (userSession.data.type === "JOBSEEKER" || userSession.data.type === "OAUTH_JOBSEEKER") {
        // Get hiring post matches where user is a seeker
        console.log("Jobseeker trying to get all matched");
        console.log("userSession.data.type", userSession.data.type);
        const hiringMatches =
          await drizzlePool.query.jobHiringPostMatchedSeekersTable.findMany({
            where: userSession.data.type === "OAUTH_JOBSEEKER"
              ? eq(jobHiringPostMatchedSeekersTable.oauthJobSeekerId, userId)
              : eq(jobHiringPostMatchedSeekersTable.jobSeekerId, userId),
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
            where: userSession.data.type === "OAUTH_JOBSEEKER"
              ? eq(jobFindingPostTable.oauthJobSeekerId, userId)
              : eq(jobFindingPostTable.jobSeekerId, userId),
            with: {
              postMatched: {
                with: {
                  toEmployer: true,
                  toOauthEmployer: true,
                  toCompany: true,
                },
              },
            },
          });

        // Add user data to finding matches
        const findingMatchesWithData = await Promise.all(
          findingMatches.map(async (match) => {
            if (match.postMatched) {
              await Promise.all(match.postMatched.map(async (matched) => {
                const hirerId = matched.employerId || matched.oauthEmployerId || matched.companyId;
                const isOauth = matched.jobHirerType === "OAUTHEMPLOYER";
                if (hirerId) {
                  const hirerData = await internalUserServices.instance().queryUserById(hirerId, isOauth);
                  if (hirerData) {
                    (matched as WithUserData<typeof matched>).userData = hirerData;
                  }
                }
              }));
            }
            return match;
          })
        );

        matches = {
          hiringMatches,
          findingMatches: findingMatchesWithData,
        };
      }
      // If user is an employer/company
      else {
        // Get hiring posts created by the user
        console.log("Employer trying to get all matched");
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

        // Add user data to hiring matches
        const hiringMatchesWithData = await Promise.all(
          hiringMatches.map(async (match) => {
            if (match.postMatched) {
              await Promise.all(match.postMatched.map(async (matched) => {
                if (matched.toMatchSeekers) {
                  await Promise.all(matched.toMatchSeekers.map(async (seeker) => {
                    const seekerId = seeker.jobSeekerId || seeker.oauthJobSeekerId;
                    const isOauth = seeker.jobSeekerType === "OAUTH";
                    if (seekerId) {
                      const seekerData = await internalUserServices.instance().queryUserById(seekerId, isOauth);
                      if (seekerData) {
                        (seeker as BaseMatchedSeeker).userData = seekerData as TJobSeeker;
                      }
                    }
                  }));
                }
              }));
            }
            return match;
          })
        );

        // Get finding post matches where user is the hirer
        const findingMatches =
          await drizzlePool.query.jobFindingPostMatchedTable.findMany({
            where: or(
              eq(jobFindingPostMatchedTable.employerId, userId),
              eq(jobFindingPostMatchedTable.oauthEmployerId, userId),
              eq(jobFindingPostMatchedTable.companyId, userId)
            ),
            with: {
              toPost: {
                with: {
                  postByNormal: true,
                  postByOauth: true,
                },
              },
            },
          });

        // Add user data to finding matches
        const findingMatchesWithData = await Promise.all(
          findingMatches.map(async (match) => {
            if (match.toPost) {
              const seekerId = match.toPost.jobSeekerId || match.toPost.oauthJobSeekerId;
              const isOauth = match.toPost.jobSeekerType === "OAUTH";
              if (seekerId) {
                const seekerData = await internalUserServices.instance().queryUserById(seekerId, isOauth);
                if (seekerData) {
                  (match.toPost as BasePost).userData = seekerData;
                }
              }
            }
            return match;
          })
        );

        matches = {
          hiringMatches: hiringMatchesWithData,
          findingMatches: findingMatchesWithData,
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

  // Delete hiring match
  async deleteHiringMatch(
    matchId: string,
    userId: string,
    userType: string
  ): Promise<ServicesResponse<any>> {
    try {
      // First, verify that the user owns the match
      const match = await drizzlePool.query.jobHiringPostMatchedSeekersTable.findFirst({
        where: and(
          eq(jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, matchId),
          userType === "JOBSEEKER" 
            ? eq(jobHiringPostMatchedSeekersTable.jobSeekerId, userId)
            : eq(jobHiringPostMatchedSeekersTable.oauthJobSeekerId, userId)
        ),
      });

      if (!match) {
        return { 
          success: false, 
          msg: "Match not found or you don't have permission to delete it", 
          status: 404 
        };
      }

      // Delete the match
      const deleted = await drizzlePool
        .delete(jobHiringPostMatchedSeekersTable)
        .where(
          and(
            eq(jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, matchId),
            userType === "JOBSEEKER"
              ? eq(jobHiringPostMatchedSeekersTable.jobSeekerId, userId)
              : eq(jobHiringPostMatchedSeekersTable.oauthJobSeekerId, userId)
          )
        )
        .returning();

      return {
        success: true,
        msg: "Match deleted successfully",
        data: deleted[0],
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return { success: false, msg: "Failed to delete match", status: 500 };
    }
  }

  // Delete finding match
  async deleteFindingMatch(
    matchId: string,
    userId: string,
    userType: string
  ): Promise<ServicesResponse<any>> {
    try {
      // First, verify that the user owns the match
      const match = await drizzlePool.query.jobFindingPostMatchedTable.findFirst({
        where: and(
          eq(jobFindingPostMatchedTable.id, matchId),
          or(
            eq(jobFindingPostMatchedTable.employerId, userId),
            eq(jobFindingPostMatchedTable.oauthEmployerId, userId),
            eq(jobFindingPostMatchedTable.companyId, userId)
          )
        ),
      });

      if (!match) {
        return { 
          success: false, 
          msg: "Match not found or you don't have permission to delete it", 
          status: 404 
        };
      }

      // Delete the match
      const deleted = await drizzlePool
        .delete(jobFindingPostMatchedTable)
        .where(
          and(
            eq(jobFindingPostMatchedTable.id, matchId),
            or(
              eq(jobFindingPostMatchedTable.employerId, userId),
              eq(jobFindingPostMatchedTable.oauthEmployerId, userId),
              eq(jobFindingPostMatchedTable.companyId, userId)
            )
          )
        )
        .returning();

      return {
        success: true,
        msg: "Match deleted successfully",
        data: deleted[0],
        status: 200,
      };
    } catch (error) {
      console.error(error);
      return { success: false, msg: "Failed to delete match", status: 500 };
    }
  }
}
