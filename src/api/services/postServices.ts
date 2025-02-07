import { drizzlePool } from "../../db/conn";
import { and, eq, lte, gte, ilike, SQL, inArray, sql, desc } from "drizzle-orm";
import {
  jobHiringPostTable,
  jobHiringPostSkillTable,
  jobHireCategoryTable,
  companyTable,
  jobFindingPostTable,
  jobFindingPostSkillTable,
  jobFindCategoryTable,
  jobHirerTypeEnum,
  postStatusEnum,
  skillTable,
  jobCategoryTable,
  jobPostTypeEnum,
} from "../../db/schema";
import { jobPostType, jobFindingPostType, validUidType } from "../schemas/requestBodySchema";
import { TPost, TPostResponse, TPostsResponse, TJobFindingPost } from "../types/postTypes";
import { SerivcesResponse } from "../types/responseTypes";
import { errorServices } from "./errorServices";
import { JobHiringPostService } from "./jobHiringPostService";
import { JobFindingPostService } from "./jobFindingPostService";

/**
 * Main service class for handling both job hiring and job finding posts.
 * Acts as a facade for JobHiringPostService and JobFindingPostService.
 * Implements singleton pattern for service instance management.
 */
export class postServices {
  private static postService: postServices | undefined;
  private hiringService: JobHiringPostService;
  private findingService: JobFindingPostService;

  private constructor() {
    this.hiringService = JobHiringPostService.getInstance();
    this.findingService = JobFindingPostService.getInstance();
  }

  /**
   * Gets the singleton instance of postServices
   */
  static instance() {
    if (!this.postService) {
      this.postService = new postServices();
    }
    return this.postService;
  }

  // Job Hiring Post Methods

  /**
   * Retrieves all job hiring posts with optional filtering
   * @param queryParams - Parameters for filtering and pagination
   */
  async getAllJobPosts(queryParams: {
    title?: string;
    provinces?: string | string[];
    jobCategories?: string | string[];
    salaryRange?: string;
    sortBy?: string;
    salarySort?: string;
    page?: number;
  }): Promise<TPostsResponse> {
    return this.hiringService.getAllPosts(queryParams);
  }

  /**
   * Creates a new job hiring post from an employer
   * @param jobPostData - The post data
   * @param user - The employer session data
   */
  async createJobPostFromEmp(
    jobPostData: jobPostType,
    user: TEmployerSession
  ): Promise<TPostResponse> {
    return this.hiringService.createPost(jobPostData, user);
  }

  /**
   * Creates a new job hiring post from a company
   * @param jobPostData - The post data
   * @param user - The company session data
   */
  async createJobPostFromCompany(
    jobPostData: jobPostType,
    user: TCompanySession
  ): Promise<TPostResponse> {
    return this.hiringService.createPost(jobPostData, user);
  }

  /**
   * Updates an existing job hiring post
   * @param id - The post ID
   * @param jobPostData - The updated post data
   * @param user - The user session data (employer or company)
   */
  async updateJobPost(
    id: string,
    jobPostData: jobPostType,
    user: TEmployerSession | TCompanySession
  ): Promise<TPostResponse> {
    return this.hiringService.updatePost(id, jobPostData, user);
  }

  /**
   * Retrieves a single job hiring post by ID
   * @param id - The post ID
   */
  async getJobPost(id: string): Promise<TPostResponse> {
    return this.hiringService.getPost(id);
  }

  /**
   * Deletes a job hiring post
   * @param id - The post ID
   * @param user - The user attempting to delete the post
   */
  async deleteJobPost(
    id: string,
    user: TEmployerSession | TCompanySession
  ): Promise<TPostResponse> {
    return this.hiringService.deletePost(id, user);
  }

  /**
   * Retrieves all job hiring posts for a specific employer
   * @param userId - The employer ID
   * @param isOauth - Whether the employer is an OAuth user
   */
  async getJobPostsByEmployer(userId: string, isOauth: boolean): Promise<TPostsResponse> {
    return this.hiringService.getPostsByEmployer(userId, isOauth);
  }

  /**
   * Retrieves all job hiring posts for a specific company
   * @param companyId - The company ID
   */
  async getJobPostsByCompany(companyId: string): Promise<TPostsResponse> {
    return this.hiringService.getPostsByCompany(companyId);
  }

  // Job Finding Post Methods

  /**
   * Retrieves all job finding posts with optional filtering
   * @param queryParams - Parameters for filtering and pagination
   */
  async getAllJobFindingPosts(queryParams: {
    title?: string;
    provinces?: string | string[];
    jobCategories?: string | string[];
    salaryRange?: string;
    sortBy?: string;
    salarySort?: string;
    page?: number;
  }): Promise<TPostsResponse<TJobFindingPost>> {
    return this.findingService.getAllPosts(queryParams);
  }

  /**
   * Creates a new job finding post
   * @param jobPostData - The post data
   * @param user - The job seeker session data
   */
  async createJobFindingPost(
    jobPostData: jobFindingPostType,
    user: TJobSeekerSession
  ): Promise<TPostResponse> {
    return this.findingService.createPost(jobPostData, user);
  }

  /**
   * Updates an existing job finding post
   * @param postId - The post ID
   * @param jobPostData - The updated post data
   * @param user - The job seeker session data
   */
  async updateJobFindingPost(
    postId: string,
    jobPostData: jobFindingPostType,
    user: TJobSeekerSession
  ): Promise<TPostResponse> {
    return this.findingService.updatePost(postId, jobPostData, user);
  }

  /**
   * Retrieves a single job finding post by ID
   * @param postId - The post ID
   */
  async getJobFindingPost(postId: string): Promise<TPostResponse> {
    return this.findingService.getPost(postId);
  }

  /**
   * Deletes a job finding post
   * @param postId - The post ID
   * @param user - The user attempting to delete the post
   */
  async deleteJobFindingPost(
    postId: string,
    user: TJobSeekerSession
  ): Promise<TPostResponse> {
    return this.findingService.deletePost(postId, user);
  }

  /**
   * Retrieves all job finding posts for a specific user
   * @param userId - The job seeker ID
   * @param isOauth - Whether the job seeker is an OAuth user
   */
  async getJobFindingPostsByUser(userId: string, isOauth: boolean): Promise<TPostsResponse<TJobFindingPost>> {
    return this.findingService.getPostsByUser(userId, isOauth);
  }
} 