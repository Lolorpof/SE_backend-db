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
import {
  jobPostType,
  jobFindingPostType,
  validUidType,
} from "../schemas/requestBodySchema";
import {
  TPost,
  TPostResponse,
  TPostsResponse,
  TJobFindingPost,
} from "../types/postTypes";
import { ServicesResponse } from "../types/responseTypes";
import { errorServices } from "./errorServices";

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
              jobPostType: jobHiringPostTable.jobPostType,
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
              this.getJobPostSkills(post.id, "hiring"),
              this.getJobPostCategories(post.id, "hiring"),
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
          jp.job_post_type as "jobPostType",
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
            this.getJobPostSkills(post.id, "hiring"),
            this.getJobPostCategories(post.id, "hiring"),
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
      throw errorServices.handleServerError(error);
    }
  }

  async createJobPostFromEmp(
    jobPostData: jobPostType,
    user: TEmployerSession
  ): Promise<TPostResponse> {
    try {
      if (!user) {
        throw errorServices.handleAuthError();
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
          jobPostType: jobPostData.jobPostType,
          jobHirerType: user.isOauth
            ? jobHirerTypeEnum.enumValues[1]
            : jobHirerTypeEnum.enumValues[0], // OAUTH_EMPLOYER or EMPLOYER
          employerId: user.isOauth ? null : user.id,
          oauthEmployerId: user.isOauth ? user.id : null,
          companyId: null,
        })
        .returning();

      // Insert skills if provided
      if (jobPostData.skills && jobPostData.skills.length > 0) {
        await drizzlePool.insert(jobHiringPostSkillTable).values(
          jobPostData.skills.map((skillId) => ({
            jobHiringPostId: jobPost.id,
            skillId,
          }))
        );
      }

      // Insert categories if provided
      if (jobPostData.jobCategories && jobPostData.jobCategories.length > 0) {
        await drizzlePool.insert(jobHireCategoryTable).values(
          jobPostData.jobCategories.map((categoryId) => ({
            jobHiringPostId: jobPost.id,
            jobCategoryId: categoryId,
          }))
        );
      }

      // Get the skills and categories for the response
      const [skills, categories] = await Promise.all([
        this.getJobPostSkills(jobPost.id, "hiring"),
        this.getJobPostCategories(jobPost.id, "hiring"),
      ]);

      return {
        success: true,
        status: 201,
        msg: "Job hiring post created successfully",
        data: { ...jobPost, skills, jobCategories: categories } as TPost,
      };
    } catch (error) {
      console.error("Error creating job hiring post:", error);
      throw errorServices.handleServerError(error);
    }
  }

  async createJobPostFromCompany(
    jobPostData: jobPostType,
    user: TCompanySession
  ): Promise<TPostResponse> {
    try {
      if (!user) {
        throw errorServices.handleAuthError();
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
          jobPostType: jobPostData.jobPostType,
          jobHirerType: jobHirerTypeEnum.enumValues[2], // COMPANY
          employerId: null,
          oauthEmployerId: null,
          companyId: user.id,
        })
        .returning();

      // Insert skills if provided
      if (jobPostData.skills && jobPostData.skills.length > 0) {
        await drizzlePool.insert(jobHiringPostSkillTable).values(
          jobPostData.skills.map((skillId) => ({
            jobHiringPostId: jobPost.id,
            skillId,
          }))
        );
      }

      // Insert categories if provided
      if (jobPostData.jobCategories && jobPostData.jobCategories.length > 0) {
        await drizzlePool.insert(jobHireCategoryTable).values(
          jobPostData.jobCategories.map((categoryId) => ({
            jobHiringPostId: jobPost.id,
            jobCategoryId: categoryId,
          }))
        );
      }

      // Get the skills and categories for the response
      const [skills, categories] = await Promise.all([
        this.getJobPostSkills(jobPost.id, "hiring"),
        this.getJobPostCategories(jobPost.id, "hiring"),
      ]);

      // Get company name
      const [company] = await drizzlePool
        .select({ officialName: companyTable.officialName })
        .from(companyTable)
        .where(eq(companyTable.id, user.id));

      return {
        success: true,
        status: 201,
        msg: "Job hiring post created successfully",
        data: {
          ...jobPost,
          companyName: company?.officialName || null,
          skills,
          jobCategories: categories,
        } as TPost,
      };
    } catch (error) {
      console.error("Error creating job hiring post:", error);
      throw errorServices.handleServerError(error);
    }
  }

  async updateJobPost(
    id: string,
    jobPostData: jobPostType,
    user: TEmployerSession | TCompanySession
  ): Promise<TPostResponse> {
    try {
      if (!user) {
        throw errorServices.handleAuthError();
      }

      // Get the job post and check if it exists
      const [jobPost] = await drizzlePool
        .select()
        .from(jobHiringPostTable)
        .where(eq(jobHiringPostTable.id, id));

      if (!jobPost) {
        throw errorServices.handleNotFoundError("Job post");
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
        throw errorServices.handleForbiddenError(
          "You are not authorized to update this job post"
        );
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
          jobPostType: jobPostData.jobPostType,
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
      throw errorServices.handleServerError(error);
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
          jobPostType: jobHiringPostTable.jobPostType,
          employerId: jobHiringPostTable.employerId,
          oauthEmployerId: jobHiringPostTable.oauthEmployerId,
          companyId: jobHiringPostTable.companyId,
          createdAt: jobHiringPostTable.createdAt,
          updatedAt: jobHiringPostTable.updatedAt,
        })
        .from(jobHiringPostTable)
        .where(eq(jobHiringPostTable.id, id));

      if (!jobPost || jobPost.length === 0) {
        throw errorServices.handleNotFoundError("Job post");
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
        this.getJobPostSkills(id, "hiring"),
        this.getJobPostCategories(id, "hiring"),
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
      throw errorServices.handleServerError(error);
    }
  }

  async deleteJobPost(
    id: string,
    user: TEmployerSession | TCompanySession
  ): Promise<TPostResponse> {
    try {
      if (!user) {
        throw errorServices.handleAuthError();
      }

      // Get the job post and check if it exists
      const [jobPost] = await drizzlePool
        .select()
        .from(jobHiringPostTable)
        .where(eq(jobHiringPostTable.id, id));

      if (!jobPost) {
        throw errorServices.handleNotFoundError("Job post");
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
        throw errorServices.handleForbiddenError(
          "You are not authorized to delete this job post"
        );
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
      throw errorServices.handleServerError(error);
    }
  }

  private async getJobPostSkills(postId: string, type: "hiring" | "finding") {
    const skillsTable =
      type === "hiring" ? jobHiringPostSkillTable : jobFindingPostSkillTable;
    const postIdField =
      type === "hiring" ? "jobHiringPostId" : "jobFindingPostId";

    return await drizzlePool
      .select({
        id: skillTable.id,
        name: skillTable.name,
        description: skillTable.description,
      })
      .from(skillsTable)
      .innerJoin(skillTable, eq(skillsTable.skillId, skillTable.id))
      .where(eq(skillsTable[postIdField], postId));
  }

  private async getJobPostCategories(
    postId: string,
    type: "hiring" | "finding"
  ) {
    const categoriesTable =
      type === "hiring" ? jobHireCategoryTable : jobFindCategoryTable;
    const postIdField =
      type === "hiring" ? "jobHiringPostId" : "jobFindingPostId";

    return await drizzlePool
      .select({
        id: jobCategoryTable.id,
        name: jobCategoryTable.name,
        description: jobCategoryTable.description,
      })
      .from(categoriesTable)
      .innerJoin(
        jobCategoryTable,
        eq(categoriesTable.jobCategoryId, jobCategoryTable.id)
      )
      .where(eq(categoriesTable[postIdField], postId));
  }

  async getAllJobFindingPosts(queryParams: {
    title?: string;
    provinces?: string | string[];
    jobCategories?: string | string[];
    salaryRange?: string;
    sortBy?: string;
    salarySort?: string;
    page?: number;
  }): Promise<TPostsResponse<TJobFindingPost>> {
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
              id: jobFindingPostTable.id,
              title: jobFindingPostTable.title,
              description: jobFindingPostTable.description,
              jobLocation: jobFindingPostTable.jobLocation,
              expectedSalary: jobFindingPostTable.expectedSalary,
              workDates: jobFindingPostTable.workDates,
              workHoursRange: jobFindingPostTable.workHoursRange,
              status: jobFindingPostTable.status,
              jobPostType: jobFindingPostTable.jobPostType,
              jobSeekerType: jobFindingPostTable.jobSeekerType,
              jobSeekerId: jobFindingPostTable.jobSeekerId,
              oauthJobSeekerId: jobFindingPostTable.oauthJobSeekerId,
              createdAt: jobFindingPostTable.createdAt,
              updatedAt: jobFindingPostTable.updatedAt,
            })
            .from(jobFindingPostTable)
            .orderBy(
              salarySort === "high-low"
                ? desc(jobFindingPostTable.expectedSalary)
                : salarySort === "low-high"
                ? jobFindingPostTable.expectedSalary
                : sortBy === "desc"
                ? desc(jobFindingPostTable.createdAt)
                : jobFindingPostTable.createdAt
            )
            .limit(ITEMS_PER_PAGE)
            .offset(offset),
          drizzlePool
            .select({ count: sql<number>`count(*)` })
            .from(jobFindingPostTable),
        ]);

        const count = countResult[0].count;

        // After fetching the posts, get skills and categories for each post
        const postsWithRelations = await Promise.all(
          posts.map(async (post) => {
            const [skills, categories] = await Promise.all([
              this.getJobPostSkills(post.id, "finding"),
              this.getJobPostCategories(post.id, "finding"),
            ]);
            return {
              ...post,
              skills,
              jobCategories: categories,
            } as TJobFindingPost;
          })
        );

        return {
          success: true,
          status: 200,
          msg: "Successfully retrieved job finding posts",
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
          sql`LOWER(${jobFindingPostTable.title}) ILIKE LOWER(${
            "%" + title + "%"
          })`
        );
      }

      // Provinces filter (multiple provinces support)
      if (provinces) {
        const provinceList = Array.isArray(provinces)
          ? provinces.map((p) => p.toString())
          : [provinces.toString()];
        conditions.push(
          sql`${jobFindingPostTable.jobLocation} = ANY(${provinceList})`
        );
      }

      // Salary range filter
      if (salaryRange) {
        const salary = Number(salaryRange);
        if (!isNaN(salary)) {
          conditions.push(
            sql`${jobFindingPostTable.expectedSalary} <= ${salary}`
          );
        }
      }

      // Build the base query
      const baseQuery = sql`
        SELECT DISTINCT
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
        ${
          jobCategories
            ? sql`
          LEFT JOIN job_find_category jfc ON jp.id = jfc.job_finding_post_id
          WHERE jfc.job_category_id = ANY(${
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
            ? sql`ORDER BY jp.expected_salary DESC`
            : salarySort === "low-high"
            ? sql`ORDER BY jp.expected_salary ASC`
            : sortBy === "desc"
            ? sql`ORDER BY jp.created_at DESC`
            : sql`ORDER BY jp.created_at ASC`
        }
        LIMIT ${ITEMS_PER_PAGE}
        OFFSET ${offset}
      `;

      // Get total count
      const countQuery = sql`
        SELECT COUNT(DISTINCT jp.id) as count
        FROM job_finding_post jp
        ${
          jobCategories
            ? sql`
          LEFT JOIN job_find_category jfc ON jp.id = jfc.job_finding_post_id
          WHERE jfc.job_category_id = ANY(${
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

      const jobPosts = jobPostsResult as unknown as TJobFindingPost[];
      const count = (countResult as unknown as [{ count: number }])[0].count;

      // After fetching the posts, get skills and categories for each post
      const postsWithRelations = await Promise.all(
        jobPosts.map(async (post) => {
          const [skills, categories] = await Promise.all([
            this.getJobPostSkills(post.id, "finding"),
            this.getJobPostCategories(post.id, "finding"),
          ]);
          return {
            ...post,
            skills,
            jobCategories: categories,
          } as TJobFindingPost;
        })
      );

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved job finding posts",
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
      console.error("Error in getAllJobFindingPosts:", error);
      throw errorServices.handleServerError(error);
    }
  }

  public async createJobFindingPost(
    jobPostData: jobFindingPostType,
    user: TJobSeekerSession
  ): Promise<TPostResponse> {
    try {
      const [newPost] = await drizzlePool
        .insert(jobFindingPostTable)
        .values({
          title: jobPostData.title,
          description: jobPostData.description ?? null,
          jobLocation: jobPostData.jobLocation,
          expectedSalary: jobPostData.expectedSalary,
          workDates: jobPostData.workDates,
          workHoursRange: jobPostData.workHoursRange,
          jobPostType: jobPostData.jobPostType,
          jobSeekerType: jobPostData.jobSeekerType,
          status: postStatusEnum.enumValues[1], // UNMATCHED
          jobSeekerId: user.type === "NORMAL" ? user.id : null,
          oauthJobSeekerId: user.type === "OAUTH" ? user.id : null,
        })
        .returning();

      if (jobPostData.skills) {
        await drizzlePool.insert(jobFindingPostSkillTable).values(
          jobPostData.skills.map((skillId) => ({
            jobFindingPostId: newPost.id,
            skillId,
          }))
        );
      }

      if (jobPostData.jobCategories) {
        await drizzlePool.insert(jobFindCategoryTable).values(
          jobPostData.jobCategories.map((categoryId) => ({
            jobFindingPostId: newPost.id,
            jobCategoryId: categoryId,
          }))
        );
      }

      const [skills, categories] = await Promise.all([
        this.getJobPostSkills(newPost.id, "finding"),
        this.getJobPostCategories(newPost.id, "finding"),
      ]);

      return {
        success: true,
        status: 201,
        msg: "Successfully created job finding post",
        data: {
          ...newPost,
          skills,
          jobCategories: categories,
        } as TJobFindingPost,
      };
    } catch (error) {
      console.error("Error in createJobFindingPost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  public async updateJobFindingPost(
    postId: string,
    jobPostData: jobFindingPostType,
    user: TJobSeekerSession
  ): Promise<TPostResponse> {
    try {
      const existingPost = await drizzlePool
        .select()
        .from(jobFindingPostTable)
        .where(
          and(
            eq(jobFindingPostTable.id, postId),
            user.type === "NORMAL"
              ? eq(jobFindingPostTable.jobSeekerId, user.id)
              : eq(jobFindingPostTable.oauthJobSeekerId, user.id)
          )
        )
        .limit(1);

      if (!existingPost.length) {
        throw errorServices.handleNotFoundError("Job finding post");
      }

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

      const [skills, categories] = await Promise.all([
        this.getJobPostSkills(postId, "finding"),
        this.getJobPostCategories(postId, "finding"),
      ]);

      return {
        success: true,
        status: 200,
        msg: "Successfully updated job finding post",
        data: {
          ...updatedPost,
          skills,
          jobCategories: categories,
        } as TJobFindingPost,
      };
    } catch (error) {
      console.error("Error in updateJobFindingPost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  public async getJobFindingPost(postId: string): Promise<TPostResponse> {
    try {
      const [post] = await drizzlePool
        .select({
          id: jobFindingPostTable.id,
          title: jobFindingPostTable.title,
          description: jobFindingPostTable.description,
          jobLocation: jobFindingPostTable.jobLocation,
          expectedSalary: jobFindingPostTable.expectedSalary,
          workDates: jobFindingPostTable.workDates,
          workHoursRange: jobFindingPostTable.workHoursRange,
          status: jobFindingPostTable.status,
          jobPostType: jobFindingPostTable.jobPostType,
          jobSeekerType: jobFindingPostTable.jobSeekerType,
          jobSeekerId: jobFindingPostTable.jobSeekerId,
          oauthJobSeekerId: jobFindingPostTable.oauthJobSeekerId,
          createdAt: jobFindingPostTable.createdAt,
          updatedAt: jobFindingPostTable.updatedAt,
        })
        .from(jobFindingPostTable)
        .where(eq(jobFindingPostTable.id, postId))
        .limit(1);

      if (!post) {
        throw errorServices.handleNotFoundError("Job finding post");
      }

      const [skills, categories] = await Promise.all([
        this.getJobPostSkills(postId, "finding"),
        this.getJobPostCategories(postId, "finding"),
      ]);

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved job finding post",
        data: { ...post, skills, jobCategories: categories } as TJobFindingPost,
      };
    } catch (error) {
      console.error("Error in getJobFindingPost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  public async deleteJobFindingPost(
    postId: string,
    user: TJobSeekerSession
  ): Promise<TPostResponse> {
    try {
      const [deletedPost] = await drizzlePool
        .delete(jobFindingPostTable)
        .where(
          and(
            eq(jobFindingPostTable.id, postId),
            user.type === "NORMAL"
              ? eq(jobFindingPostTable.jobSeekerId, user.id)
              : eq(jobFindingPostTable.oauthJobSeekerId, user.id)
          )
        )
        .returning();

      if (!deletedPost) {
        throw errorServices.handleNotFoundError("Job finding post");
      }

      return {
        success: true,
        status: 200,
        msg: "Successfully deleted job finding post",
        data: deletedPost as TJobFindingPost,
      };
    } catch (error) {
      console.error("Error in deleteJobFindingPost:", error);
      throw errorServices.handleServerError(error);
    }
  }

  public async getJobFindingPostsByUser(
    userId: string,
    isOauth: boolean
  ): Promise<TPostsResponse<TJobFindingPost>> {
    try {
      const posts = await drizzlePool
        .select({
          id: jobFindingPostTable.id,
          title: jobFindingPostTable.title,
          description: jobFindingPostTable.description,
          jobLocation: jobFindingPostTable.jobLocation,
          expectedSalary: jobFindingPostTable.expectedSalary,
          workDates: jobFindingPostTable.workDates,
          workHoursRange: jobFindingPostTable.workHoursRange,
          status: jobFindingPostTable.status,
          jobPostType: jobFindingPostTable.jobPostType,
          jobSeekerType: jobFindingPostTable.jobSeekerType,
          jobSeekerId: jobFindingPostTable.jobSeekerId,
          oauthJobSeekerId: jobFindingPostTable.oauthJobSeekerId,
          createdAt: jobFindingPostTable.createdAt,
          updatedAt: jobFindingPostTable.updatedAt,
        })
        .from(jobFindingPostTable)
        .where(
          isOauth
            ? eq(jobFindingPostTable.oauthJobSeekerId, userId)
            : eq(jobFindingPostTable.jobSeekerId, userId)
        );

      const postsWithRelations = await Promise.all(
        posts.map(async (post) => {
          const [skills, categories] = await Promise.all([
            this.getJobPostSkills(post.id, "finding"),
            this.getJobPostCategories(post.id, "finding"),
          ]);
          return {
            ...post,
            skills,
            jobCategories: categories,
          } as TJobFindingPost;
        })
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
      console.error("Error in getJobFindingPostsByUser:", error);
      throw errorServices.handleServerError(error);
    }
  }

  public async getJobPostsByEmployer(
    userId: string,
    isOauth: boolean
  ): Promise<TPostsResponse> {
    try {
      const posts = await drizzlePool
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
          jobPostType: jobHiringPostTable.jobPostType,
          employerId: jobHiringPostTable.employerId,
          oauthEmployerId: jobHiringPostTable.oauthEmployerId,
          companyId: jobHiringPostTable.companyId,
          createdAt: jobHiringPostTable.createdAt,
          updatedAt: jobHiringPostTable.updatedAt,
        })
        .from(jobHiringPostTable)
        .where(
          isOauth
            ? eq(jobHiringPostTable.oauthEmployerId, userId)
            : eq(jobHiringPostTable.employerId, userId)
        );

      const postsWithRelations = await Promise.all(
        posts.map(async (post) => {
          const [skills, categories] = await Promise.all([
            this.getJobPostSkills(post.id, "hiring"),
            this.getJobPostCategories(post.id, "hiring"),
          ]);
          return { ...post, skills, jobCategories: categories } as TPost;
        })
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
      console.error("Error in getJobPostsByEmployer:", error);
      throw errorServices.handleServerError(error);
    }
  }

  public async getJobPostsByCompany(
    companyId: string
  ): Promise<TPostsResponse> {
    try {
      const posts = await drizzlePool
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
          jobPostType: jobHiringPostTable.jobPostType,
          employerId: jobHiringPostTable.employerId,
          oauthEmployerId: jobHiringPostTable.oauthEmployerId,
          companyId: jobHiringPostTable.companyId,
          createdAt: jobHiringPostTable.createdAt,
          updatedAt: jobHiringPostTable.updatedAt,
        })
        .from(jobHiringPostTable)
        .where(eq(jobHiringPostTable.companyId, companyId));

      // Get company name
      const [company] = await drizzlePool
        .select({ officialName: companyTable.officialName })
        .from(companyTable)
        .where(eq(companyTable.id, companyId));

      const companyName = company ? company.officialName : null;

      const postsWithRelations = await Promise.all(
        posts.map(async (post) => {
          const [skills, categories] = await Promise.all([
            this.getJobPostSkills(post.id, "hiring"),
            this.getJobPostCategories(post.id, "hiring"),
          ]);
          return {
            ...post,
            companyName,
            skills,
            jobCategories: categories,
          } as TPost;
        })
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
      console.error("Error in getJobPostsByCompany:", error);
      throw errorServices.handleServerError(error);
    }
  }
}
