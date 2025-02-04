import { drizzlePool } from "../../db/conn";
import { and, eq, lte, gte, ilike, SQL, inArray, sql, desc } from "drizzle-orm";
import {
  jobHiringPostTable,
  jobHiringPostSkillTable,
  jobHireCategoryTable,
  companyTable,
  jobFindingPostTable,
  jobHirerTypeEnum,
  postStatusEnum,
  skillTable,
  jobCategoryTable,
} from "../../db/schema";
import { jobPostType, validUidType } from "../schemas/api-schema";
import { TPost, TPostResponse, TPostsResponse } from "../types/postTypes";

export class postServices {
  // singleton design
  private static postService: postServices | undefined;
  static instance() {
    if (!this.postService) {
      this.postService = new postServices();
    }
    return this.postService;
  }

  async getAllJobPosts(queryParams: {
    title?: string;
    provinces?: string | string[];
    jobCategories?: string | string[];
    salaryRange?: string;
    sortBy?: string;
    salarySort?: string;
    page?: number;
  }): Promise<TPostsResponse> {
    try {
      const {
        title,
        provinces,
        jobCategories,
        salaryRange,
        sortBy = "desc",
        salarySort,
        page = 1,
      } = queryParams;

      const ITEMS_PER_PAGE = 10;
      const offset = (Number(page) - 1) * ITEMS_PER_PAGE;

      // Check if any filters are applied
      const hasFilters = !!(title || provinces || jobCategories || salaryRange);

      if (!hasFilters) {
        // Use simple Drizzle query for no filters case
        const [posts, countResult] = await Promise.all([
          drizzlePool
            .select({
              id: jobHiringPostTable.id,
              title: jobHiringPostTable.title,
              description: jobHiringPostTable.description,
              jobLocation: jobHiringPostTable.jobLocation,
              salary: jobHiringPostTable.salary,
              workDates: jobHiringPostTable.workDates,
              workHoursRange: jobHiringPostTable.workHoursRange,
              hiredAmount: jobHiringPostTable.hiredAmount,
              status: jobHiringPostTable.status,
              jobHirerType: jobHiringPostTable.jobHirerType,
              companyId: jobHiringPostTable.companyId,
              employerId: jobHiringPostTable.employerId,
              oauthEmployerId: jobHiringPostTable.oauthEmployerId,
              createdAt: jobHiringPostTable.createdAt,
              updatedAt: jobHiringPostTable.updatedAt,
            })
            .from(jobHiringPostTable)
            .orderBy(
              salarySort === "high-low"
                ? desc(jobHiringPostTable.salary)
                : salarySort === "low-high"
                ? jobHiringPostTable.salary
                : sortBy === "desc"
                ? desc(jobHiringPostTable.createdAt)
                : jobHiringPostTable.createdAt
            )
            .limit(ITEMS_PER_PAGE)
            .offset(offset),
          drizzlePool
            .select({ count: sql<number>`count(*)` })
            .from(jobHiringPostTable),
        ]);

        const jobPosts = posts as unknown as TPost[];
        const count = countResult[0].count;

        // After fetching the posts, get company names, skills and categories for each post
        const postsWithRelations = await Promise.all(
          jobPosts.map(async (post) => {
            // Get company name if companyId exists
            let companyName: string | null = null;
            if (post.companyId) {
              const company = await drizzlePool
                .select({ officialName: companyTable.officialName })
                .from(companyTable)
                .where(eq(companyTable.id, post.companyId));
              
              if (company && company.length > 0) {
                companyName = company[0].officialName;
              }
            }

            const [skills, categories] = await Promise.all([
              this.getJobPostSkills(post.id),
              this.getJobPostCategories(post.id),
            ]);

            return {
              ...post,
              companyName,
              skills,
              jobCategories: categories,
            };
          })
        );

        return {
          success: true,
          status: 200,
          msg: "Successfully retrieved job posts",
          data: {
            jobPosts: postsWithRelations,
            pagination: {
              currentPage: Number(page),
              totalPages: Math.ceil(count / ITEMS_PER_PAGE),
              totalItems: count,
              itemsPerPage: ITEMS_PER_PAGE,
            },
          },
        };
      }

      // Build the WHERE clause conditions for filtered case
      const conditions: SQL[] = [];

      // Title filter
      if (title) {
        conditions.push(
          sql`${jobHiringPostTable.title} ILIKE ${`%${title as string}%`}`
        );
      }

      // Provinces filter (multiple provinces support)
      if (provinces) {
        const provinceList = Array.isArray(provinces)
          ? provinces.map((p) => p.toString())
          : [provinces.toString()];
        conditions.push(
          sql`${jobHiringPostTable.jobLocation} = ANY(${provinceList})`
        );
      }

      // Salary range filter
      if (salaryRange) {
        const salary = Number(salaryRange);
        if (!isNaN(salary)) {
          conditions.push(sql`${jobHiringPostTable.salary} <= ${salary}`);
        }
      }

      // Build the base query
      const baseQuery = sql`
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
          jp.company_id as "companyId",
          jp.employer_id as "employerId",
          jp.oauth_employer_id as "oauthEmployerId",
          jp.created_at as "createdAt",
          jp.updated_at as "updatedAt"
        FROM job_hiring_post jp
        ${
          jobCategories
            ? sql`
          LEFT JOIN job_hire_category jhc ON jp.id = jhc.job_hiring_post_id
          WHERE jhc.job_category_id = ANY(${
            Array.isArray(jobCategories)
              ? jobCategories.map((id) => id.toString())
              : [jobCategories.toString()]
          })
          ${conditions.length ? sql`AND ${and(...conditions)}` : sql``}
        `
            : conditions.length
            ? sql`WHERE ${and(...conditions)}`
            : sql``
        }
        ${
          salarySort === "high-low"
            ? sql`ORDER BY jp.salary DESC`
            : salarySort === "low-high"
            ? sql`ORDER BY jp.salary ASC`
            : sortBy === "desc"
            ? sql`ORDER BY jp.created_at DESC`
            : sql`ORDER BY jp.created_at ASC`
        }
        LIMIT ${ITEMS_PER_PAGE}
        OFFSET ${offset}
      `;

      // Get total count
      const countQuery = sql`
        SELECT COUNT(*) as count
        FROM job_hiring_post jp
        ${
          jobCategories
            ? sql`
          LEFT JOIN job_hire_category jhc ON jp.id = jhc.job_hiring_post_id
          WHERE jhc.job_category_id = ANY(${
            Array.isArray(jobCategories)
              ? jobCategories.map((id) => id.toString())
              : [jobCategories.toString()]
          })
          ${conditions.length ? sql`AND ${and(...conditions)}` : sql``}
        `
            : conditions.length
            ? sql`WHERE ${and(...conditions)}`
            : sql``
        }
      `;

      // Execute both queries concurrently
      const [jobPostsResult, countResult] = await Promise.all([
        drizzlePool.execute(baseQuery),
        drizzlePool.execute(countQuery),
      ]);

      // Type cast with intermediate unknown type
      const jobPosts = jobPostsResult as unknown as TPost[];
      const count = (countResult as unknown as [{ count: number }])[0].count;

      // After fetching the posts, get company names, skills and categories for each post
      const postsWithRelations = await Promise.all(
        jobPosts.map(async (post) => {
          // Get company name if companyId exists
          let companyName: string | null = null;
          if (post.companyId) {
            const company = await drizzlePool
              .select({ officialName: companyTable.officialName })
              .from(companyTable)
              .where(eq(companyTable.id, post.companyId));
            
            if (company && company.length > 0) {
              companyName = company[0].officialName;
            }
          }

          const [skills, categories] = await Promise.all([
            this.getJobPostSkills(post.id),
            this.getJobPostCategories(post.id),
          ]);

          return {
            ...post,
            companyName,
            skills,
            jobCategories: categories,
          };
        })
      );

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved job posts",
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
      console.error("Error fetching job posts:", error);
      return {
        success: false,
        status: 500,
        msg: "Failed to fetch job posts",
        data: {
          jobPosts: [],
          pagination: {
            currentPage: 0,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 0,
          },
        },
      };
    }
  }

  async createJobPostFromEmp(
    jobPostData: jobPostType,
    user: TEmployerSession
  ): Promise<TPostResponse> {
    try {
      if (!user) {
        return {
          success: false,
          status: 401,
          msg: "Unauthorized",
          data: null as unknown as TPost,
        };
      }

      // Create the job hiring post
      const [jobPost] = await drizzlePool
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
          jobHirerType: user.isOauth
            ? jobHirerTypeEnum.enumValues[1]
            : jobHirerTypeEnum.enumValues[0], // OAUTH_EMPLOYER or EMPLOYER
          employerId: user.isOauth ? null : user.id,
          oauthEmployerId: user.isOauth ? user.id : null,
          companyId: null,
        })
        .returning();

      return {
        success: true,
        status: 201,
        msg: "Job hiring post created successfully",
        data: jobPost as TPost,
      };
    } catch (error) {
      console.error("Error creating job hiring post:", error);
      return {
        success: false,
        status: 500,
        msg: "Failed to create job hiring post",
        data: null as unknown as TPost,
      };
    }
  }

  async createJobPostFromCompany(
    jobPostData: jobPostType,
    user: TCompanySession
  ): Promise<TPostResponse> {
    try {
      if (!user) {
        return {
          success: false,
          status: 401,
          msg: "Unauthorized",
          data: null as unknown as TPost,
        };
      }

      // Create the job hiring post
      const [jobPost] = await drizzlePool
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
          jobHirerType: jobHirerTypeEnum.enumValues[2], // COMPANY
          employerId: null,
          oauthEmployerId: null,
          companyId: user.id,
        })
        .returning();

      return {
        success: true,
        status: 201,
        msg: "Job hiring post created successfully",
        data: jobPost as TPost,
      };
    } catch (error) {
      console.error("Error creating job hiring post:", error);
      return {
        success: false,
        status: 500,
        msg: "Failed to create job hiring post",
        data: null as unknown as TPost,
      };
    }
  }

  async updateJobPost(
    id: string,
    jobPostData: jobPostType,
    user: TEmployerSession | TCompanySession
  ): Promise<TPostResponse> {
    try {
      if (!user) {
        return {
          success: false,
          status: 401,
          msg: "Unauthorized",
          data: null as unknown as TPost,
        };
      }

      // Get the job post and check if it exists
      const [jobPost] = await drizzlePool
        .select()
        .from(jobHiringPostTable)
        .where(eq(jobHiringPostTable.id, id));

      if (!jobPost) {
        return {
          success: false,
          status: 404,
          msg: "Job post not found",
          data: null as unknown as TPost,
        };
      }

      // Check if the user is the owner of the post
      let isOwner = false;
      if ("isOauth" in user) {
        // TEmployerSession
        isOwner = user.isOauth
          ? jobPost.oauthEmployerId === user.id
          : jobPost.employerId === user.id;
      } else {
        // TCompanySession
        isOwner = jobPost.companyId === user.id;
      }

      if (!isOwner) {
        return {
          success: false,
          status: 403,
          msg: "You are not authorized to update this job post",
          data: null as unknown as TPost,
        };
      }

      // Update the job post
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
          updatedAt: new Date(),
        })
        .where(eq(jobHiringPostTable.id, id))
        .returning();

      return {
        success: true,
        status: 200,
        msg: "Job post updated successfully",
        data: updatedPost as TPost,
      };
    } catch (error) {
      console.error("Error updating job post:", error);
      return {
        success: false,
        status: 500,
        msg: "Failed to update job post",
        data: null as unknown as TPost,
      };
    }
  }

  async getJobPost(id: string): Promise<TPostResponse> {
    try {
      const jobPost = await drizzlePool
        .select({
          id: jobHiringPostTable.id,
          title: jobHiringPostTable.title,
          description: jobHiringPostTable.description,
          jobLocation: jobHiringPostTable.jobLocation,
          salary: jobHiringPostTable.salary,
          workDates: jobHiringPostTable.workDates,
          workHoursRange: jobHiringPostTable.workHoursRange,
          hiredAmount: jobHiringPostTable.hiredAmount,
          status: jobHiringPostTable.status,
          jobHirerType: jobHiringPostTable.jobHirerType,
          employerId: jobHiringPostTable.employerId,
          oauthEmployerId: jobHiringPostTable.oauthEmployerId,
          companyId: jobHiringPostTable.companyId,
          createdAt: jobHiringPostTable.createdAt,
          updatedAt: jobHiringPostTable.updatedAt,
        })
        .from(jobHiringPostTable)
        .where(eq(jobHiringPostTable.id, id));

      if (!jobPost || jobPost.length === 0) {
        return {
          success: false,
          status: 404,
          msg: "Job post not found",
          data: null as unknown as TPost,
        };
      }

      // Fetch company name if companyId exists
      let companyName: string | null = null;
      if (jobPost[0].companyId) {
        const company = await drizzlePool
          .select({ officialName: companyTable.officialName })
          .from(companyTable)
          .where(eq(companyTable.id, jobPost[0].companyId));
        
        if (company && company.length > 0) {
          companyName = company[0].officialName;
        }
      }

      // Fetch skills and categories
      const [skills, categories] = await Promise.all([
        this.getJobPostSkills(id),
        this.getJobPostCategories(id),
      ]);

      const postWithRelations = {
        ...jobPost[0],
        companyName,
        skills,
        jobCategories: categories,
      };

      return {
        success: true,
        status: 200,
        msg: "Job post fetched successfully",
        data: postWithRelations as TPost,
      };
    } catch (error) {
      console.error("Error fetching job post:", error);
      return {
        success: false,
        status: 500,
        msg: "Failed to fetch job post",
        data: null as unknown as TPost,
      };
    }
  }

  async deleteJobPost(
    id: string,
    user: TEmployerSession | TCompanySession
  ): Promise<TPostResponse> {
    try {
      if (!user) {
        return {
          success: false,
          status: 401,
          msg: "Unauthorized",
          data: null as unknown as TPost,
        };
      }

      // Get the job post and check if it exists
      const [jobPost] = await drizzlePool
        .select()
        .from(jobHiringPostTable)
        .where(eq(jobHiringPostTable.id, id));

      if (!jobPost) {
        return {
          success: false,
          status: 404,
          msg: "Job post not found",
          data: null as unknown as TPost,
        };
      }

      // Check if the user is the owner of the post
      let isOwner = false;
      if ("isOauth" in user) {
        // TEmployerSession
        isOwner = user.isOauth
          ? jobPost.oauthEmployerId === user.id
          : jobPost.employerId === user.id;
      } else {
        // TCompanySession
        isOwner = jobPost.companyId === user.id;
      }

      if (!isOwner) {
        return {
          success: false,
          status: 403,
          msg: "You are not authorized to delete this job post",
          data: null as unknown as TPost,
        };
      }

      // Delete the job post
      const [deletedPost] = await drizzlePool
        .delete(jobHiringPostTable)
        .where(eq(jobHiringPostTable.id, id))
        .returning();

      return {
        success: true,
        status: 200,
        msg: "Job post deleted successfully",
        data: deletedPost as TPost,
      };
    } catch (error) {
      console.error("Error deleting job post:", error);
      return {
        success: false,
        status: 500,
        msg: "Failed to delete job post",
        data: null as unknown as TPost,
      };
    }
  }

  async getJobPostSkills(postId: string): Promise<{
    id: string;
    name: string;
    description: string | null;
  }[]> {
    try {
      const skills = await drizzlePool
        .select({
          id: skillTable.id,
          name: skillTable.name,
          description: skillTable.description,
        })
        .from(jobHiringPostSkillTable)
        .innerJoin(
          skillTable,
          eq(jobHiringPostSkillTable.skillId, skillTable.id)
        )
        .where(eq(jobHiringPostSkillTable.jobHiringPostId, postId));

      return skills;
    } catch (error) {
      console.error("Error fetching job post skills:", error);
      return [];
    }
  }

  async getJobPostCategories(postId: string): Promise<{
    id: string;
    name: string;
    description: string | null;
  }[]> {
    try {
      const categories = await drizzlePool
        .select({
          id: jobCategoryTable.id,
          name: jobCategoryTable.name,
          description: jobCategoryTable.description,
        })
        .from(jobHireCategoryTable)
        .innerJoin(
          jobCategoryTable,
          eq(jobHireCategoryTable.jobCategoryId, jobCategoryTable.id)
        )
        .where(eq(jobHireCategoryTable.jobHiringPostId, postId));

      return categories;
    } catch (error) {
      console.error("Error fetching job post categories:", error);
      return [];
    }
  }
} 