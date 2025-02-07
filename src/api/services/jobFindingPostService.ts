import { SQL, and, eq, sql } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import { 
  jobFindingPostTable, 
  jobFindingPostSkillTable, 
  jobFindCategoryTable,
  postStatusEnum,
  jobPostTypeEnum,
  jobSeekerTypeEnum
} from "../../db/schema";
import { TJobFindingPost, TPostResponse, TPostsResponse } from "../types/postTypes";
import { jobFindingPostType } from "../schemas/requestBodySchema";
import { errorServices } from "./errorServices";
import { BasePostService } from "./basePostService";

/**
 * Service class for handling job finding posts.
 * Extends BasePostService with TJobFindingPost type to handle job seeker's posts.
 * Implements singleton pattern for service instance management.
 */
export class JobFindingPostService extends BasePostService<TJobFindingPost> {
  private static instance: JobFindingPostService;

  // Required table and field implementations from base class
  protected table = jobFindingPostTable;
  protected skillsTable = jobFindingPostSkillTable;
  protected categoriesTable = jobFindCategoryTable;
  protected postIdFieldName = "job_finding_post_id" as const;

  private constructor() {
    super();
  }

  /**
   * Gets the singleton instance of JobFindingPostService
   */
  public static getInstance(): JobFindingPostService {
    if (!JobFindingPostService.instance) {
      JobFindingPostService.instance = new JobFindingPostService();
    }
    return JobFindingPostService.instance;
  }

  /**
   * Validates if the given user owns the post
   * Checks against both normal and OAuth job seeker IDs
   */
  protected async validateOwnership(postId: string, user: any): Promise<boolean> {
    const [post] = await drizzlePool
      .select()
      .from(jobFindingPostTable)
      .where(eq(jobFindingPostTable.id, postId));

    if (!post) return false;

    return user.type === "NORMAL"
      ? post.jobSeekerId === user.id
      : post.oauthJobSeekerId === user.id;
  }

  /**
   * No additional fields needed for job finding posts
   */
  protected async getAdditionalFields(postId: string): Promise<Partial<TJobFindingPost>> {
    return {}; // No additional fields needed for job finding posts
  }

  /**
   * Builds the base SQL query for retrieving job finding posts
   * Maps database column names to camelCase property names
   */
  protected buildBaseQuery(): SQL {
    return sql`
      SELECT 
        jp.id,
        jp.title,
        jp.description,
        jp.job_location as "jobLocation",
        jp.expected_salary as "expectedSalary",
        jp.work_dates as "workDates",
        jp.work_hours_range as "workHoursRange",
        jp.status,
        jp.job_post_type as "jobPostType",
        jp.job_seeker_type as "jobSeekerType",
        jp.job_seeker_id as "jobSeekerId",
        jp.oauth_job_seeker_id as "oauthJobSeekerId",
        jp.created_at as "createdAt",
        jp.updated_at as "updatedAt"
      FROM job_finding_post jp
    `;
  }

  /**
   * Builds the SQL query for counting job finding posts
   */
  protected buildCountQuery(): SQL {
    return sql`SELECT COUNT(*) as count FROM job_finding_post`;
  }

  /**
   * Creates a new job finding post
   * @param jobPostData - The post data from the request
   * @param user - The user creating the post (job seeker)
   */
  public async createPost(jobPostData: jobFindingPostType, user: any): Promise<TPostResponse<TJobFindingPost>> {
    try {
      // Insert the main post record
      const [newPost] = await drizzlePool
        .insert(jobFindingPostTable)
        .values({
          title: jobPostData.title,
          description: jobPostData.description ?? null,
          jobLocation: jobPostData.jobLocation,
          expectedSalary: jobPostData.expectedSalary,
          workDates: jobPostData.workDates,
          workHoursRange: jobPostData.workHoursRange,
          status: postStatusEnum.enumValues[1], // UNMATCHED
          jobPostType: jobPostData.jobPostType as typeof jobPostTypeEnum.enumValues[number],
          jobSeekerType: jobPostData.jobSeekerType as typeof jobSeekerTypeEnum.enumValues[number],
          jobSeekerId: user.type === "NORMAL" ? user.id : null,
          oauthJobSeekerId: user.type === "OAUTH" ? user.id : null,
        })
        .returning();

      // Insert related skills if provided
      if (jobPostData.skills) {
        await drizzlePool.insert(jobFindingPostSkillTable).values(
          jobPostData.skills.map((skillId) => ({
            jobFindingPostId: newPost.id,
            skillId,
          }))
        );
      }

      // Insert related categories if provided
      if (jobPostData.jobCategories) {
        await drizzlePool.insert(jobFindCategoryTable).values(
          jobPostData.jobCategories.map((categoryId) => ({
            jobFindingPostId: newPost.id,
            jobCategoryId: categoryId,
          }))
        );
      }

      const postWithRelations = await this.buildPostWithRelations(newPost as TJobFindingPost);

      return {
        success: true,
        status: 201,
        msg: "Successfully created job finding post",
        data: postWithRelations,
      };
    } catch (error) {
      console.error("Error in createPost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  /**
   * Updates an existing job finding post
   * @param postId - The ID of the post to update
   * @param jobPostData - The updated post data
   * @param user - The user updating the post
   */
  public async updatePost(
    postId: string,
    jobPostData: jobFindingPostType,
    user: any
  ): Promise<TPostResponse<TJobFindingPost>> {
    try {
      // Validate post ownership
      const isOwner = await this.validateOwnership(postId, user);
      if (!isOwner) {
        throw errorServices.handleForbiddenError('You are not authorized to update this post');
      }

      // Update the main post record
      const [updatedPost] = await drizzlePool
        .update(jobFindingPostTable)
        .set({
          title: jobPostData.title,
          description: jobPostData.description ?? null,
          jobLocation: jobPostData.jobLocation,
          expectedSalary: jobPostData.expectedSalary,
          workDates: jobPostData.workDates,
          workHoursRange: jobPostData.workHoursRange,
          jobPostType: jobPostData.jobPostType,
          jobSeekerType: jobPostData.jobSeekerType,
          updatedAt: new Date(),
        })
        .where(eq(jobFindingPostTable.id, postId))
        .returning();

      // Update related skills if provided
      if (jobPostData.skills) {
        await drizzlePool
          .delete(jobFindingPostSkillTable)
          .where(eq(jobFindingPostSkillTable.jobFindingPostId, postId));
        await drizzlePool.insert(jobFindingPostSkillTable).values(
          jobPostData.skills.map((skillId) => ({
            jobFindingPostId: postId,
            skillId,
          }))
        );
      }

      // Update related categories if provided
      if (jobPostData.jobCategories) {
        await drizzlePool
          .delete(jobFindCategoryTable)
          .where(eq(jobFindCategoryTable.jobFindingPostId, postId));
        await drizzlePool.insert(jobFindCategoryTable).values(
          jobPostData.jobCategories.map((categoryId) => ({
            jobFindingPostId: postId,
            jobCategoryId: categoryId,
          }))
        );
      }

      const postWithRelations = await this.buildPostWithRelations(updatedPost as TJobFindingPost);

      return {
        success: true,
        status: 200,
        msg: "Successfully updated job finding post",
        data: postWithRelations,
      };
    } catch (error) {
      console.error("Error in updatePost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  /**
   * Deletes a job finding post
   * Uses the base class implementation after type casting
   */
  public async deletePost(postId: string, user: any): Promise<TPostResponse<TJobFindingPost>> {
    return super.deletePost(postId, user);
  }

  /**
   * Retrieves all job finding posts for a specific user
   * @param userId - The ID of the user (job seeker)
   * @param isOauth - Whether the user is an OAuth user
   */
  public async getPostsByUser(userId: string, isOauth: boolean): Promise<TPostsResponse<TJobFindingPost>> {
    try {
      const posts = await drizzlePool
        .select()
        .from(jobFindingPostTable)
        .where(
          isOauth 
            ? eq(jobFindingPostTable.oauthJobSeekerId, userId)
            : eq(jobFindingPostTable.jobSeekerId, userId)
        );

      const postsWithRelations = await Promise.all(
        posts.map((post) => this.buildPostWithRelations(post as TJobFindingPost))
      );

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved user's job finding posts",
        data: {
          jobPosts: postsWithRelations,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: postsWithRelations.length,
            itemsPerPage: postsWithRelations.length,
          },
        },
      };
    } catch (error) {
      console.error("Error in getPostsByUser:", error);
      throw errorServices.handleServerError(error);
    }
  }
} 