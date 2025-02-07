import { SQL, and, eq, sql } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import { 
  jobHiringPostTable, 
  jobHiringPostSkillTable, 
  jobHireCategoryTable,
  companyTable,
  postStatusEnum,
  jobPostTypeEnum
} from "../../db/schema";
import { TPost, TPostResponse, TPostsResponse } from "../types/postTypes";
import { jobPostType } from "../schemas/requestBodySchema";
import { errorServices } from "./errorServices";
import { BasePostService } from "./basePostService";

/**
 * Service class for handling job hiring posts.
 * Extends BasePostService with TPost type to handle employer's and company's posts.
 * Implements singleton pattern for service instance management.
 */
export class JobHiringPostService extends BasePostService<TPost> {
  private static instance: JobHiringPostService;

  // Required table and field implementations from base class
  protected table = jobHiringPostTable;
  protected skillsTable = jobHiringPostSkillTable;
  protected categoriesTable = jobHireCategoryTable;
  protected postIdFieldName = "job_hiring_post_id" as const;

  private constructor() {
    super();
  }

  /**
   * Gets the singleton instance of JobHiringPostService
   */
  public static getInstance(): JobHiringPostService {
    if (!JobHiringPostService.instance) {
      JobHiringPostService.instance = new JobHiringPostService();
    }
    return JobHiringPostService.instance;
  }

  /**
   * Validates if the given user owns the post
   * Checks against employer, OAuth employer, and company IDs
   */
  protected async validateOwnership(postId: string, user: any): Promise<boolean> {
    const [post] = await drizzlePool
      .select()
      .from(jobHiringPostTable)
      .where(eq(jobHiringPostTable.id, postId));

    if (!post) return false;

    if ("isOauth" in user) {
      // TEmployerSession
      return user.isOauth
        ? post.oauthEmployerId === user.id
        : post.employerId === user.id;
    } else {
      // TCompanySession
      return post.companyId === user.id;
    }
  }

  /**
   * Gets additional fields specific to hiring posts
   * Currently retrieves company name for company posts
   */
  protected async getAdditionalFields(postId: string): Promise<Partial<TPost>> {
    const [post] = await drizzlePool
      .select()
      .from(jobHiringPostTable)
      .where(eq(jobHiringPostTable.id, postId));

    if (!post || !post.companyId) return {};

    const [company] = await drizzlePool
      .select({ officialName: companyTable.officialName })
      .from(companyTable)
      .where(eq(companyTable.id, post.companyId));

    return {
      companyName: company?.officialName || null
    };
  }

  /**
   * Builds the base SQL query for retrieving job hiring posts
   * Maps database column names to camelCase property names
   */
  protected buildBaseQuery(): SQL {
    return sql`
      SELECT 
        jp.id,
        jp.title,
        jp.description,
        jp.job_location as "jobLocation",
        jp.salary,
        jp.work_dates as "workDates",
        jp.work_hours_range as "workHoursRange",
        jp.hired_amount as "hiredAmount",
        jp.status,
        jp.job_hirer_type as "jobHirerType",
        jp.job_post_type as "jobPostType",
        jp.company_id as "companyId",
        jp.employer_id as "employerId",
        jp.oauth_employer_id as "oauthEmployerId",
        jp.created_at as "createdAt",
        jp.updated_at as "updatedAt"
      FROM job_hiring_post jp
    `;
  }

  /**
   * Builds the SQL query for counting job hiring posts
   */
  protected buildCountQuery(): SQL {
    return sql`SELECT COUNT(*) as count FROM job_hiring_post`;
  }

  /**
   * Creates a new job hiring post
   * @param jobPostData - The post data from the request
   * @param user - The user creating the post (employer or company)
   */
  public async createPost(jobPostData: jobPostType, user: any): Promise<TPostResponse<TPost>> {
    try {
      // Insert the main post record
      const [newPost] = await drizzlePool
        .insert(jobHiringPostTable)
        .values({
          title: jobPostData.title,
          description: jobPostData.description ?? null,
          jobLocation: jobPostData.jobLocation,
          salary: jobPostData.salary,
          workDates: jobPostData.workDates,
          workHoursRange: jobPostData.workHoursRange,
          hiredAmount: jobPostData.hiredAmount,
          status: postStatusEnum.enumValues[1], // UNMATCHED
          jobPostType: jobPostData.jobPostType as typeof jobPostTypeEnum.enumValues[number],
          jobHirerType: "isOauth" in user 
            ? (user.isOauth ? "OAUTHEMPLOYER" : "EMPLOYER")
            : "COMPANY",
          employerId: "isOauth" in user ? (user.isOauth ? null : user.id) : null,
          oauthEmployerId: "isOauth" in user ? (user.isOauth ? user.id : null) : null,
          companyId: "isOauth" in user ? null : user.id,
        })
        .returning();

      // Insert related skills if provided
      if (jobPostData.skills) {
        await drizzlePool.insert(jobHiringPostSkillTable).values(
          jobPostData.skills.map((skillId) => ({
            jobHiringPostId: newPost.id,
            skillId,
          }))
        );
      }

      // Insert related categories if provided
      if (jobPostData.jobCategories) {
        await drizzlePool.insert(jobHireCategoryTable).values(
          jobPostData.jobCategories.map((categoryId) => ({
            jobHiringPostId: newPost.id,
            jobCategoryId: categoryId,
          }))
        );
      }

      const postWithRelations = await this.buildPostWithRelations(newPost as TPost);

      return {
        success: true,
        status: 201,
        msg: "Successfully created job post",
        data: postWithRelations,
      };
    } catch (error) {
      console.error("Error in createPost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  /**
   * Updates an existing job hiring post
   * @param postId - The ID of the post to update
   * @param jobPostData - The updated post data
   * @param user - The user updating the post
   */
  public async updatePost(
    postId: string,
    jobPostData: jobPostType,
    user: any
  ): Promise<TPostResponse<TPost>> {
    try {
      // Validate post ownership
      const isOwner = await this.validateOwnership(postId, user);
      if (!isOwner) {
        throw errorServices.handleForbiddenError('You are not authorized to update this post');
      }

      // Update the main post record
      const [updatedPost] = await drizzlePool
        .update(jobHiringPostTable)
        .set({
          title: jobPostData.title,
          description: jobPostData.description ?? null,
          jobLocation: jobPostData.jobLocation,
          salary: jobPostData.salary,
          workDates: jobPostData.workDates,
          workHoursRange: jobPostData.workHoursRange,
          hiredAmount: jobPostData.hiredAmount,
          jobPostType: jobPostData.jobPostType,
          updatedAt: new Date(),
        })
        .where(eq(jobHiringPostTable.id, postId))
        .returning();

      // Update related skills if provided
      if (jobPostData.skills) {
        await drizzlePool
          .delete(jobHiringPostSkillTable)
          .where(eq(jobHiringPostSkillTable.jobHiringPostId, postId));
        await drizzlePool.insert(jobHiringPostSkillTable).values(
          jobPostData.skills.map((skillId) => ({
            jobHiringPostId: postId,
            skillId,
          }))
        );
      }

      // Update related categories if provided
      if (jobPostData.jobCategories) {
        await drizzlePool
          .delete(jobHireCategoryTable)
          .where(eq(jobHireCategoryTable.jobHiringPostId, postId));
        await drizzlePool.insert(jobHireCategoryTable).values(
          jobPostData.jobCategories.map((categoryId) => ({
            jobHiringPostId: postId,
            jobCategoryId: categoryId,
          }))
        );
      }

      const postWithRelations = await this.buildPostWithRelations(updatedPost as TPost);

      return {
        success: true,
        status: 200,
        msg: "Successfully updated job post",
        data: postWithRelations,
      };
    } catch (error) {
      console.error("Error in updatePost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  /**
   * Deletes a job hiring post
   * Uses the base class implementation after type casting
   */
  public async deletePost(postId: string, user: any): Promise<TPostResponse<TPost>> {
    return super.deletePost(postId, user);
  }

  /**
   * Retrieves all job hiring posts for a specific employer
   * @param userId - The ID of the employer
   * @param isOauth - Whether the employer is an OAuth user
   */
  public async getPostsByEmployer(userId: string, isOauth: boolean): Promise<TPostsResponse<TPost>> {
    try {
      const posts = await drizzlePool
        .select()
        .from(jobHiringPostTable)
        .where(
          isOauth 
            ? eq(jobHiringPostTable.oauthEmployerId, userId)
            : eq(jobHiringPostTable.employerId, userId)
        );

      const postsWithRelations = await Promise.all(
        posts.map((post) => this.buildPostWithRelations(post as TPost))
      );

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved employer's job posts",
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
      console.error("Error in getPostsByEmployer:", error);
      throw errorServices.handleServerError(error);
    }
  }

  /**
   * Retrieves all job hiring posts for a specific company
   * @param companyId - The ID of the company
   */
  public async getPostsByCompany(companyId: string): Promise<TPostsResponse<TPost>> {
    try {
      const posts = await drizzlePool
        .select()
        .from(jobHiringPostTable)
        .where(eq(jobHiringPostTable.companyId, companyId));

      const postsWithRelations = await Promise.all(
        posts.map((post) => this.buildPostWithRelations(post as TPost))
      );

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved company's job posts",
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
      console.error("Error in getPostsByCompany:", error);
      throw errorServices.handleServerError(error);
    }
  }
} 