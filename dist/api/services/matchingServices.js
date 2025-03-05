"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchingServices = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const conn_1 = require("../../db/conn");
const schema_1 = require("../../db/schema");
const services_1 = require("./services");
const errorServices_1 = require("./errorServices");
const notificationPatterns_1 = require("../utilities/notificationPatterns");
const requestBodySchema_1 = require("../schemas/requestBodySchema");
const internalUserServices_1 = require("./internalUserServices");
class matchingServices extends services_1.Services {
    constructor() {
        super(schema_1.jobHiringPostMatchedTable);
    }
    static instance() {
        return services_1.Services.getInstance.call(matchingServices);
    }
    // Job seeker matches with a hiring post
    async matchWithHiringPost(hiringPostId, user) {
        try {
            if (!user) {
                throw errorServices_1.errorServices.handleAuthError();
            }
            // Get user data using internal service
            const userData = await internalUserServices_1.internalUserServices.instance().getUserData(user.id, user.isOauth);
            if (!userData.success || !userData.data) {
                return { success: false, msg: "User not found", status: 404 };
            }
            // Check if hiring post exists
            const post = await conn_1.drizzlePool.query.jobHiringPostTable.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.id, hiringPostId),
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
            const existingMatch = await conn_1.drizzlePool.query.jobHiringPostMatchedSeekersTable.findFirst({
                where: (0, drizzle_orm_1.and)(user.isOauth
                    ? (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.oauthJobSeekerId, user.id)
                    : (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobSeekerId, user.id), (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, post.id)),
            });
            if (existingMatch) {
                return {
                    success: false,
                    msg: "You have already matched with this post",
                    status: 400,
                };
            }
            // Create match record if it doesn't exist
            let match = await conn_1.drizzlePool.query.jobHiringPostMatchedTable.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedTable.jobHiringPostId, hiringPostId),
            });
            if (!match) {
                const [newMatch] = await conn_1.drizzlePool
                    .insert(schema_1.jobHiringPostMatchedTable)
                    .values({
                    jobHiringPostId: hiringPostId,
                })
                    .returning();
                match = newMatch;
            }
            // Add seeker to match
            const result = await conn_1.drizzlePool.execute((0, drizzle_orm_1.sql) `
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
            await notificationPatterns_1.NotificationPatterns.createHiringMatchNotification(user.id, post.employerId, post.oauthEmployerId, post.companyId, post.title, post.postByCompany?.officialName ||
                post.postByEmployer?.firstName + " " + post.postByEmployer?.lastName ||
                post.postByOauthEmployer?.firstName + " " + post.postByOauthEmployer?.lastName, user.isOauth);
            return {
                success: true,
                msg: "Successfully matched with hiring post",
                data: seekerMatch,
                status: 201,
            };
        }
        catch (error) {
            console.error("Error in matchWithHiringPost:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    // Get all matches for a hiring post
    async getHiringPostMatches(hiringPostId) {
        try {
            const matches = await conn_1.drizzlePool.query.jobHiringPostMatchedTable.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedTable.jobHiringPostId, hiringPostId),
                with: {
                    toMatchSeekers: true,
                },
            });
            // Fetch user data for each seeker
            const matchesWithUserData = await Promise.all(matches.map(async (match) => {
                const seekersWithData = await Promise.all(match.toMatchSeekers.map(async (seeker) => {
                    const userId = seeker.jobSeekerId || seeker.oauthJobSeekerId;
                    const isOauth = seeker.jobSeekerType === "OAUTH";
                    if (!userId)
                        return seeker;
                    const userData = await internalUserServices_1.internalUserServices.instance().queryUserById(userId, isOauth);
                    return {
                        ...seeker,
                        userData
                    };
                }));
                return {
                    ...match,
                    toMatchSeekers: seekersWithData
                };
            }));
            return {
                success: true,
                msg: "Matches retrieved successfully",
                data: matchesWithUserData,
                status: 200,
            };
        }
        catch (error) {
            console.error(error);
            return { success: false, msg: "Failed to get matches", status: 500 };
        }
    }
    // Update match status (by employer)
    async updateHiringMatchStatus(matchId, seekerId, status) {
        try {
            const match = await conn_1.drizzlePool.query.jobHiringPostMatchedSeekersTable.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, matchId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobSeekerId, seekerId), (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.oauthJobSeekerId, seekerId))),
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
            const result = await conn_1.drizzlePool.execute((0, drizzle_orm_1.sql) `
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
            await notificationPatterns_1.NotificationPatterns.createMatchStatusUpdateNotification(seekerId, match.jobSeekerType === "NORMAL" ? "JOBSEEKER" : "OAUTHJOBSEEKER", post.title, status.toLowerCase(), companyName);
            return {
                success: true,
                msg: "Match status updated successfully",
                data: updated[0],
                status: 200,
            };
        }
        catch (error) {
            console.error(error);
            return { success: false, msg: "Failed to update match status", status: 500 };
        }
    }
    async addSeekerToHiringPost(matchId, seekerData) {
        try {
            if (!(0, requestBodySchema_1.validateHiringMatchSeeker)(seekerData)) {
                return {
                    success: false,
                    msg: "Must provide either jobSeekerId or oauthJobSeekerId",
                    status: 400,
                };
            }
            // Check if match exists
            const match = await conn_1.drizzlePool.query.jobHiringPostMatchedTable.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedTable.id, matchId),
            });
            if (!match) {
                return { success: false, msg: "Match not found", status: 404 };
            }
            // Create seeker match record
            const result = await conn_1.drizzlePool.execute((0, drizzle_orm_1.sql) `
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
        }
        catch (error) {
            console.error(error);
            return {
                success: false,
                msg: "Failed to add seeker to hiring post match",
                status: 500,
            };
        }
    }
    async updateSeekerMatchStatus(matchId, seekerId, status) {
        try {
            const result = await conn_1.drizzlePool.execute((0, drizzle_orm_1.sql) `
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
        }
        catch (error) {
            console.error(error);
            return {
                success: false,
                msg: "Failed to update match status",
                status: 500,
            };
        }
    }
    async getHiringMatchSeekers(matchId) {
        try {
            const seekers = await conn_1.drizzlePool.query.jobHiringPostMatchedSeekersTable.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, matchId),
            });
            // Fetch user data for each seeker
            const seekersWithData = await Promise.all(seekers.map(async (seeker) => {
                const userId = seeker.jobSeekerId || seeker.oauthJobSeekerId;
                const isOauth = seeker.jobSeekerType === "OAUTH";
                if (!userId)
                    return seeker;
                const userData = await internalUserServices_1.internalUserServices.instance().queryUserById(userId, isOauth);
                return {
                    ...seeker,
                    userData
                };
            }));
            return {
                success: true,
                msg: "Match seekers retrieved successfully",
                data: seekersWithData,
                status: 200,
            };
        }
        catch (error) {
            console.error(error);
            return {
                success: false,
                msg: "Failed to get match seekers",
                status: 500,
            };
        }
    }
    // Finding Post Matching Methods
    async matchWithFindingPost(findingPostId, user) {
        try {
            // Check if finding post exists
            const post = await conn_1.drizzlePool.query.jobFindingPostTable.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.id, findingPostId),
                with: {
                    postByNormal: true,
                    postByOauth: true,
                }
            });
            if (!post) {
                return { success: false, msg: "Finding post not found", status: 404 };
            }
            // Check if user has already matched with this post
            const existingMatch = await conn_1.drizzlePool.query.jobFindingPostMatchedTable.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.jobFindingPostId, findingPostId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.employerId, user.id), (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.oauthEmployerId, user.id), (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.companyId, user.id))),
            });
            if (existingMatch) {
                return {
                    success: false,
                    msg: "You have already matched with this post",
                    status: 400,
                };
            }
            // Create match record
            const result = await conn_1.drizzlePool.execute((0, drizzle_orm_1.sql) `
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
            await notificationPatterns_1.NotificationPatterns.createFindingMatchNotification(post.jobSeekerId, post.oauthJobSeekerId, user.id, post.title, user.type === "OAUTHEMPLOYER");
            return {
                success: true,
                msg: "Successfully matched with finding post",
                data: match,
                status: 201,
            };
        }
        catch (error) {
            console.error(error);
            return {
                success: false,
                msg: "Failed to match with finding post",
                status: 500,
            };
        }
    }
    async updateFindingMatchStatus(matchId, status) {
        try {
            const match = await conn_1.drizzlePool.query.jobFindingPostMatchedTable.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.id, matchId),
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
            const result = await conn_1.drizzlePool.execute((0, drizzle_orm_1.sql) `
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
                await notificationPatterns_1.NotificationPatterns.createMatchStatusUpdateNotification(post.jobSeekerId || post.oauthJobSeekerId, post.jobSeekerType === "NORMAL" ? "JOBSEEKER" : "OAUTHJOBSEEKER", post.title, status.toLowerCase());
            }
            // Notify employer/company
            if (match.employerId || match.oauthEmployerId || match.companyId) {
                await notificationPatterns_1.NotificationPatterns.createMatchStatusUpdateNotification(match.employerId || match.oauthEmployerId || match.companyId, match.jobHirerType, post.title, status.toLowerCase());
            }
            return {
                success: true,
                msg: "Match status updated successfully",
                data: updated[0],
                status: 200,
            };
        }
        catch (error) {
            console.error(error);
            return { success: false, msg: "Failed to update match status", status: 500 };
        }
    }
    async getFindingPostMatch(findingPostId) {
        try {
            const match = await conn_1.drizzlePool.query.jobFindingPostMatchedTable.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.jobFindingPostId, findingPostId),
            });
            if (!match) {
                return { success: false, msg: "Match not found", status: 404 };
            }
            // Fetch user data for the employer/company
            const userId = match.employerId || match.oauthEmployerId || match.companyId;
            const isOauth = match.jobHirerType === "OAUTHEMPLOYER";
            if (userId) {
                const userData = await internalUserServices_1.internalUserServices.instance().queryUserById(userId, isOauth);
                match.userData = userData;
            }
            return {
                success: true,
                msg: "Match retrieved successfully",
                data: match,
                status: 200,
            };
        }
        catch (error) {
            console.error(error);
            return { success: false, msg: "Failed to get match", status: 500 };
        }
    }
    async getUserMatchingStatus(userId, userType) {
        try {
            // Get user data using internal service
            const userData = await internalUserServices_1.internalUserServices.instance().queryUserById(userId, userType.includes("OAUTH"));
            if (!userData) {
                return { success: false, msg: "User not found", status: 404 };
            }
            // Get user session to determine exact type
            const userSession = await internalUserServices_1.internalUserServices.instance().getUserSession(userId);
            if (!userSession.success || !userSession.data) {
                return { success: false, msg: "User session not found", status: 404 };
            }
            let matches;
            // If user is a job seeker
            if (userSession.data.type === "JOBSEEKER" || userSession.data.type === "OAUTH_JOBSEEKER") {
                // Get hiring post matches where user is a seeker
                console.log("Jobseeker trying to get all matched");
                console.log("userSession.data.type", userSession.data.type);
                const hiringMatches = await conn_1.drizzlePool.query.jobHiringPostMatchedSeekersTable.findMany({
                    where: userSession.data.type === "OAUTH_JOBSEEKER"
                        ? (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.oauthJobSeekerId, userId)
                        : (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobSeekerId, userId),
                    with: {
                        toPostMatched: {
                            with: {
                                toPost: true,
                            },
                        },
                    },
                });
                // Get finding posts where user is the creator
                const findingMatches = await conn_1.drizzlePool.query.jobFindingPostTable.findMany({
                    where: userSession.data.type === "OAUTH_JOBSEEKER"
                        ? (0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.oauthJobSeekerId, userId)
                        : (0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.jobSeekerId, userId),
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
                const findingMatchesWithData = await Promise.all(findingMatches.map(async (match) => {
                    if (match.postMatched) {
                        await Promise.all(match.postMatched.map(async (matched) => {
                            const hirerId = matched.employerId || matched.oauthEmployerId || matched.companyId;
                            const isOauth = matched.jobHirerType === "OAUTHEMPLOYER";
                            if (hirerId) {
                                const hirerData = await internalUserServices_1.internalUserServices.instance().queryUserById(hirerId, isOauth);
                                if (hirerData) {
                                    matched.userData = hirerData;
                                }
                            }
                        }));
                    }
                    return match;
                }));
                matches = {
                    hiringMatches,
                    findingMatches: findingMatchesWithData,
                };
            }
            // If user is an employer/company
            else {
                // Get hiring posts created by the user
                console.log("Employer trying to get all matched");
                const hiringMatches = await conn_1.drizzlePool.query.jobHiringPostTable.findMany({
                    where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.employerId, userId), (0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.oauthEmployerId, userId), (0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.companyId, userId)),
                    with: {
                        postMatched: {
                            with: {
                                toMatchSeekers: true,
                            },
                        },
                    },
                });
                // Add user data to hiring matches
                const hiringMatchesWithData = await Promise.all(hiringMatches.map(async (match) => {
                    if (match.postMatched) {
                        await Promise.all(match.postMatched.map(async (matched) => {
                            if (matched.toMatchSeekers) {
                                await Promise.all(matched.toMatchSeekers.map(async (seeker) => {
                                    const seekerId = seeker.jobSeekerId || seeker.oauthJobSeekerId;
                                    const isOauth = seeker.jobSeekerType === "OAUTH";
                                    if (seekerId) {
                                        const seekerData = await internalUserServices_1.internalUserServices.instance().queryUserById(seekerId, isOauth);
                                        if (seekerData) {
                                            seeker.userData = seekerData;
                                        }
                                    }
                                }));
                            }
                        }));
                    }
                    return match;
                }));
                // Get finding post matches where user is the hirer
                const findingMatches = await conn_1.drizzlePool.query.jobFindingPostMatchedTable.findMany({
                    where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.employerId, userId), (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.oauthEmployerId, userId), (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.companyId, userId)),
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
                const findingMatchesWithData = await Promise.all(findingMatches.map(async (match) => {
                    if (match.toPost) {
                        const seekerId = match.toPost.jobSeekerId || match.toPost.oauthJobSeekerId;
                        const isOauth = match.toPost.jobSeekerType === "OAUTH";
                        if (seekerId) {
                            const seekerData = await internalUserServices_1.internalUserServices.instance().queryUserById(seekerId, isOauth);
                            if (seekerData) {
                                match.toPost.userData = seekerData;
                            }
                        }
                    }
                    return match;
                }));
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
        }
        catch (error) {
            console.error(error);
            return {
                success: false,
                msg: "Failed to get user matching status",
                status: 500,
            };
        }
    }
    async getAllMatchingStatus() {
        try {
            // Get all hiring post matches with related data
            const hiringMatches = await conn_1.drizzlePool.query.jobHiringPostMatchedTable.findMany({
                with: {
                    toPost: true,
                    toMatchSeekers: true,
                },
            });
            // Get all finding post matches with related data
            const findingMatches = await conn_1.drizzlePool.query.jobFindingPostMatchedTable.findMany({
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
        }
        catch (error) {
            console.error(error);
            return {
                success: false,
                msg: "Failed to get all matching status",
                status: 500,
            };
        }
    }
    // Delete hiring match
    async deleteHiringMatch(matchId, userId, userType) {
        try {
            // First, verify that the user owns the match
            const match = await conn_1.drizzlePool.query.jobHiringPostMatchedSeekersTable.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, matchId), userType === "JOBSEEKER"
                    ? (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobSeekerId, userId)
                    : (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.oauthJobSeekerId, userId)),
            });
            if (!match) {
                return {
                    success: false,
                    msg: "Match not found or you don't have permission to delete it",
                    status: 404
                };
            }
            // Delete the match
            const deleted = await conn_1.drizzlePool
                .delete(schema_1.jobHiringPostMatchedSeekersTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId, matchId), userType === "JOBSEEKER"
                ? (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.jobSeekerId, userId)
                : (0, drizzle_orm_1.eq)(schema_1.jobHiringPostMatchedSeekersTable.oauthJobSeekerId, userId)))
                .returning();
            return {
                success: true,
                msg: "Match deleted successfully",
                data: deleted[0],
                status: 200,
            };
        }
        catch (error) {
            console.error(error);
            return { success: false, msg: "Failed to delete match", status: 500 };
        }
    }
    // Delete finding match
    async deleteFindingMatch(matchId, userId, userType) {
        try {
            // First, verify that the user owns the match
            const match = await conn_1.drizzlePool.query.jobFindingPostMatchedTable.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.id, matchId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.employerId, userId), (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.oauthEmployerId, userId), (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.companyId, userId))),
            });
            if (!match) {
                return {
                    success: false,
                    msg: "Match not found or you don't have permission to delete it",
                    status: 404
                };
            }
            // Delete the match
            const deleted = await conn_1.drizzlePool
                .delete(schema_1.jobFindingPostMatchedTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.id, matchId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.employerId, userId), (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.oauthEmployerId, userId), (0, drizzle_orm_1.eq)(schema_1.jobFindingPostMatchedTable.companyId, userId))))
                .returning();
            return {
                success: true,
                msg: "Match deleted successfully",
                data: deleted[0],
                status: 200,
            };
        }
        catch (error) {
            console.error(error);
            return { success: false, msg: "Failed to delete match", status: 500 };
        }
    }
}
exports.matchingServices = matchingServices;
