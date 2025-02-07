import { SQL, and, desc, eq, ilike, sql } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import { TBasePost, TPostResponse, TPostsResponse } from "../types/postTypes";
import { errorServices } from "./errorServices";
import { 
  jobCategoryTable, 
  skillTable,
  jobHiringPostTable,
  jobFindingPostTable,
  jobHiringPostSkillTable,
  jobFindingPostSkillTable,
  jobHireCategoryTable,
  jobFindCategoryTable
} from "../../db/schema";

// Type aliases for better readability and type safety
type SkillsTable = typeof jobHiringPostSkillTable | typeof jobFindingPostSkillTable;
type CategoriesTable = typeof jobHireCategoryTable | typeof jobFindCategoryTable;
type PostTable = typeof jobHiringPostTable | typeof jobFindingPostTable;
type PostIdField = "job_hiring_post_id" | "job_finding_post_id";

/**
 * Abstract base class for job post services.
 * Provides common functionality for both job hiring and job finding posts.
 * Uses generic type T that extends TBasePost to ensure type safety across implementations.
 */
export abstract class BasePostService<T extends TBasePost> {
  // Abstract properties that must be implemented by child classes
  protected abstract table: PostTable;                  // The main post table (hiring or finding)
  protected abstract skillsTable: SkillsTable;         // The skills junction table
  protected abstract categoriesTable: CategoriesTable; // The categories junction table
  protected abstract postIdFieldName: PostIdField;     // The foreign key field name in junction tables

  // Abstract methods that must be implemented by child classes
  /**
   * Validates if the given user owns the post
   * @param postId - The ID of the post to validate
   * @param user - The user attempting to access the post
   */
  protected abstract validateOwnership(postId: string, user: any): Promise<boolean>;

  /**
   * Gets additional fields specific to the post type
   * @param postId - The ID of the post
   */
  protected abstract getAdditionalFields(postId: string): Promise<Partial<T>>;

  /**
   * Builds the base SQL query for retrieving posts
   */
  protected abstract buildBaseQuery(): SQL;

  /**
   * Builds the SQL query for counting posts
   */
  protected abstract buildCountQuery(): SQL;

  /**
   * Retrieves the skills associated with a post
   * @param postId - The ID of the post
   */
  protected async getSkills(postId: string): Promise<T['skills']> {
    const skillsTable = this.skillsTable;
    const skillIdField = skillsTable === jobHiringPostSkillTable ? jobHiringPostSkillTable.skillId : jobFindingPostSkillTable.skillId;
    const postIdField = skillsTable === jobHiringPostSkillTable ? jobHiringPostSkillTable.jobHiringPostId : jobFindingPostSkillTable.jobFindingPostId;

    return await drizzlePool
      .select({
        id: skillTable.id,
        name: skillTable.name,
        description: skillTable.description,
      })
      .from(skillsTable)
      .innerJoin(skillTable, eq(skillIdField, skillTable.id))
      .where(eq(postIdField, postId));
  }

  /**
   * Retrieves the categories associated with a post
   * @param postId - The ID of the post
   */
  protected async getCategories(postId: string): Promise<T['jobCategories']> {
    const categoriesTable = this.categoriesTable;
    const categoryIdField = categoriesTable === jobHireCategoryTable ? jobHireCategoryTable.jobCategoryId : jobFindCategoryTable.jobCategoryId;
    const postIdField = categoriesTable === jobHireCategoryTable ? jobHireCategoryTable.jobHiringPostId : jobFindCategoryTable.jobFindingPostId;

    return await drizzlePool
      .select({
        id: jobCategoryTable.id,
        name: jobCategoryTable.name,
        description: jobCategoryTable.description,
      })
      .from(categoriesTable)
      .innerJoin(jobCategoryTable, eq(categoryIdField, jobCategoryTable.id))
      .where(eq(postIdField, postId));
  }

  /**
   * Builds a complete post object with its relations (skills and categories)
   * @param post - The base post object
   */
  protected async buildPostWithRelations(post: T): Promise<T> {
    const [skills, categories, additionalFields] = await Promise.all([
      this.getSkills(post.id),
      this.getCategories(post.id),
      this.getAdditionalFields(post.id)
    ]);

    return {
      ...post,
      ...additionalFields,
      skills,
      jobCategories: categories,
    } as T;
  }

  /**
   * Builds SQL conditions for filtering posts based on query parameters
   * @param queryParams - The filter parameters
   */
  protected buildFilterConditions(queryParams: {
    title?: string;
    provinces?: string | string[];
    salaryRange?: string;
  }): SQL[] {
    const conditions: SQL[] = [];
    const { title, provinces, salaryRange } = queryParams;

    // Add title search condition
    if (title) {
      conditions.push(
        sql`LOWER(${this.table}.title) ILIKE LOWER(${'%' + title + '%'})`
      );
    }

    // Add location filter condition
    if (provinces) {
      const provinceList = Array.isArray(provinces)
        ? provinces.map((p) => p.toString())
        : [provinces.toString()];
      conditions.push(
        sql`${this.table}.job_location = ANY(${provinceList})`
      );
    }

    // Add salary range condition
    if (salaryRange) {
      const salary = Number(salaryRange);
      if (!isNaN(salary)) {
        conditions.push(sql`${this.table}.salary <= ${salary}`);
      }
    }

    return conditions;
  }

  /**
   * Retrieves all posts with optional filtering and pagination
   * @param queryParams - The query parameters for filtering and pagination
   */
  public async getAllPosts(queryParams: {
    title?: string;
    provinces?: string | string[];
    jobCategories?: string | string[];
    salaryRange?: string;
    sortBy?: string;
    salarySort?: string;
    page?: number;
  }): Promise<TPostsResponse<T>> {
    try {
      const {
        jobCategories,
        sortBy = "desc",
        page = 1,
      } = queryParams;

      const ITEMS_PER_PAGE = 10;
      const offset = (Number(page) - 1) * ITEMS_PER_PAGE;

      const hasFilters = !!(queryParams.title || queryParams.provinces || jobCategories || queryParams.salaryRange);

      // Handle non-filtered case
      if (!hasFilters) {
        const baseQuery = this.buildBaseQuery();
        const countQuery = this.buildCountQuery();

        const [posts, countResult] = await Promise.all([
          drizzlePool.execute(baseQuery),
          drizzlePool.execute(countQuery),
        ]);

        const jobPosts = posts as unknown as T[];
        const count = (countResult as unknown as [{ count: number }])[0].count;

        const postsWithRelations = await Promise.all(
          jobPosts.map((post) => this.buildPostWithRelations(post))
        );

        return {
          success: true,
          status: 200,
          msg: "Successfully retrieved posts",
          data: {
            jobPosts: postsWithRelations,
            pagination: {
              currentPage: Number(page),
              totalPages: Math.ceil(Number(count) / ITEMS_PER_PAGE),
              totalItems: Number(count),
              itemsPerPage: ITEMS_PER_PAGE,
            },
          },
        };
      }

      // Handle filtered case
      const conditions = this.buildFilterConditions(queryParams);
      const filteredBaseQuery = this.buildBaseQuery();
      const filteredCountQuery = this.buildCountQuery();

      // Add category filter if present
      if (jobCategories) {
        const categoryIds = Array.isArray(jobCategories)
          ? jobCategories.map((id) => id.toString())
          : [jobCategories.toString()];
        const categoryIdField = this.categoriesTable === jobHireCategoryTable ? jobHireCategoryTable.jobCategoryId : jobFindCategoryTable.jobCategoryId;
        conditions.push(sql`${categoryIdField} = ANY(${categoryIds})`);
      }

      const [jobPostsResult, countResult] = await Promise.all([
        drizzlePool.execute(filteredBaseQuery),
        drizzlePool.execute(filteredCountQuery),
      ]);

      const jobPosts = jobPostsResult as unknown as T[];
      const count = (countResult as unknown as [{ count: number }])[0].count;

      const postsWithRelations = await Promise.all(
        jobPosts.map((post) => this.buildPostWithRelations(post))
      );

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved posts",
        data: {
          jobPosts: postsWithRelations,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(Number(count) / ITEMS_PER_PAGE),
            totalItems: Number(count),
            itemsPerPage: ITEMS_PER_PAGE,
          },
        },
      };
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      throw errorServices.handleServerError(error);
    }
  }

  /**
   * Retrieves a single post by ID with its relations
   * @param postId - The ID of the post to retrieve
   */
  public async getPost(postId: string): Promise<TPostResponse<T>> {
    try {
      const post = await drizzlePool
        .select()
        .from(this.table)
        .where(eq(this.table.id, postId))
        .limit(1);

      if (!post || post.length === 0) {
        throw errorServices.handleNotFoundError('Post');
      }

      const postWithRelations = await this.buildPostWithRelations(post[0] as unknown as T);

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved post",
        data: postWithRelations,
      };
    } catch (error) {
      console.error("Error in getPost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  /**
   * Deletes a post after validating ownership
   * @param postId - The ID of the post to delete
   * @param user - The user attempting to delete the post
   */
  protected async deletePost(postId: string, user: any): Promise<TPostResponse<T>> {
    try {
      const isOwner = await this.validateOwnership(postId, user);
      if (!isOwner) {
        throw errorServices.handleForbiddenError('You are not authorized to delete this post');
      }

      const [deletedPost] = await drizzlePool
        .delete(this.table)
        .where(eq(this.table.id, postId))
        .returning();

      if (!deletedPost) {
        throw errorServices.handleNotFoundError('Post');
      }

      const post = deletedPost as unknown as T;

      return {
        success: true,
        status: 200,
        msg: "Successfully deleted post",
        data: post,
      };
    } catch (error) {
      console.error("Error in deletePost:", error);
      throw errorServices.handleServerError(error);
    }
  }
} 