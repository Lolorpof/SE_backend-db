import { Request, Response } from "express";
import {
  jobHiringPostTable,
  jobHiringPostSkillTable,
  jobHireCategoryTable,
  companyTable,
  jobFindingPostTable,
  jobHirerTypeEnum,
  postStatusEnum,
} from "../../db/schema"; // Import the relevant tables
import { drizzlePool } from "../../db/conn";
import { and, eq, lte, gte, ilike, SQL, inArray, sql, desc } from "drizzle-orm";
import { jobPostSchema, jobPostType } from "../schemas/api-schema";

//need fix
export async function handleGetEmp(req: Request, res: Response) {
  try {
    const { title, province, jobLocation, salaryRange, workHoursRange } =
      req.query;

    const filters: SQL[] = [];

    // Title filter
    if (title) {
      filters.push(ilike(jobFindingPostTable.title, `%${title as string}%`));
    }

    // Location filters
    if (province) {
      filters.push(eq(jobFindingPostTable.jobLocation, province as string));
    }
    if (jobLocation) {
      filters.push(
        ilike(jobFindingPostTable.jobLocation, `%${jobLocation as string}%`)
      );
    }

    // Salary range filter
    if (salaryRange) {
      const range = JSON.parse(salaryRange as string);
      if (range.min) {
        filters.push(gte(jobFindingPostTable.expectedSalary, range.min));
      }
      if (range.max) {
        filters.push(lte(jobFindingPostTable.expectedSalary, range.max));
      }
    }

    // Work hours filter
    if (workHoursRange) {
      filters.push(
        eq(jobFindingPostTable.workHoursRange, workHoursRange as string)
      );
    }

    // Build base query with job seeker information
    const baseQuery = drizzlePool
      .select({
        id: jobFindingPostTable.id,
        title: jobFindingPostTable.title,
        description: jobFindingPostTable.description,
        jobLocation: jobFindingPostTable.jobLocation,
        expectedSalary: jobFindingPostTable.expectedSalary,
        workDates: jobFindingPostTable.workDates,
        workHoursRange: jobFindingPostTable.workHoursRange,
        status: jobFindingPostTable.status,
        jobSeekerType: jobFindingPostTable.jobSeekerType,
        jobSeekerName: sql<string>`
          CASE 
            WHEN ${jobFindingPostTable.jobSeekerType} = 'NORMAL' THEN 
              (SELECT concat(first_name, ' ', last_name) FROM job_seeker WHERE id = ${jobFindingPostTable.jobSeekerId})
            ELSE 
              (SELECT concat(first_name, ' ', last_name) FROM oauth_job_seeker WHERE id = ${jobFindingPostTable.oauthJobSeekerId})
          END
        `,
      })
      .from(jobFindingPostTable);

    // Execute query with all filters
    const results = await (filters.length > 0
      ? baseQuery.where(and(...filters))
      : baseQuery);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error fetching job finding posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job finding posts",
      error: error.message,
    });
  }
}
//need fix
export async function handleGetAllJobPosts(req: Request, res: Response) {
  try {
    const {
      title,
      provinces,
      jobCategories,
      salaryRange,
      sortBy = 'desc',
      salarySort,
      page = 1
    } = req.query;

    const ITEMS_PER_PAGE = 10;
    const offset = (Number(page) - 1) * ITEMS_PER_PAGE;

    // Check if any filters are applied
    const hasFilters = !!(title || provinces || jobCategories || salaryRange);

    if (!hasFilters) {
      // Use simple Drizzle query for no filters case
      const [jobPosts, countResult] = await Promise.all([
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
            companyName: companyTable.officialName,
          })
          .from(jobHiringPostTable)
          .leftJoin(companyTable, eq(jobHiringPostTable.companyId, companyTable.id))
          .orderBy(
            salarySort === 'high-low' 
              ? desc(jobHiringPostTable.salary)
              : salarySort === 'low-high'
              ? jobHiringPostTable.salary
              : sortBy === 'desc'
              ? desc(jobHiringPostTable.createdAt)
              : jobHiringPostTable.createdAt
          )
          .limit(ITEMS_PER_PAGE)
          .offset(offset),
        drizzlePool
          .select({ count: sql<number>`count(*)` })
          .from(jobHiringPostTable)
      ]);

       res.json({
        success: true,
        data: jobPosts,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(countResult[0].count / ITEMS_PER_PAGE),
          totalItems: countResult[0].count,
          itemsPerPage: ITEMS_PER_PAGE
        }
      });
      return;
    }

    // Build the WHERE clause conditions for filtered case
    const conditions: SQL[] = [];

    // Title filter
    if (title) {
      conditions.push(sql`${jobHiringPostTable.title} ILIKE ${`%${title as string}%`}`);
    }

    // Provinces filter (multiple provinces support)
    if (provinces) {
      const provinceList = Array.isArray(provinces) 
        ? provinces.map(p => p.toString()) 
        : [provinces.toString()];
      conditions.push(sql`${jobHiringPostTable.jobLocation} = ANY(${provinceList})`);
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
        jp.updated_at as "updatedAt",
        c.official_name as "companyName"
      FROM job_hiring_post jp
      LEFT JOIN company c ON jp.company_id = c.id
      ${jobCategories ? sql`
        LEFT JOIN job_hire_category jhc ON jp.id = jhc.job_hiring_post_id
        WHERE jhc.job_category_id = ANY(${Array.isArray(jobCategories) 
          ? jobCategories.map(id => id.toString()) 
          : [jobCategories.toString()]})
        ${conditions.length ? sql`AND ${and(...conditions)}` : sql``}
      ` : conditions.length ? sql`WHERE ${and(...conditions)}` : sql``}
      ${salarySort === 'high-low' 
        ? sql`ORDER BY jp.salary DESC` 
        : salarySort === 'low-high'
        ? sql`ORDER BY jp.salary ASC`
        : sortBy === 'desc'
        ? sql`ORDER BY jp.created_at DESC`
        : sql`ORDER BY jp.created_at ASC`}
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset}
    `;

    // Get total count
    const countQuery = sql`
      SELECT COUNT(*) as count
      FROM job_hiring_post jp
      ${jobCategories ? sql`
        LEFT JOIN job_hire_category jhc ON jp.id = jhc.job_hiring_post_id
        WHERE jhc.job_category_id = ANY(${Array.isArray(jobCategories) 
          ? jobCategories.map(id => id.toString()) 
          : [jobCategories.toString()]})
        ${conditions.length ? sql`AND ${and(...conditions)}` : sql``}
      ` : conditions.length ? sql`WHERE ${and(...conditions)}` : sql``}
    `;

    type JobPost = {
      id: string;
      title: string;
      description: string | null;
      jobLocation: string;
      salary: number;
      workDates: string;
      workHoursRange: string;
      hiredAmount: number;
      status: string;
      jobHirerType: string;
      companyId: string | null;
      employerId: string | null;
      oauthEmployerId: string | null;
      createdAt: Date;
      updatedAt: Date;
      companyName: string | null;
    };

    // Execute both queries concurrently
    const [jobPostsResult, countResult] = await Promise.all([
      drizzlePool.execute(baseQuery),
      drizzlePool.execute(countQuery)
    ]);

    // Type cast with intermediate unknown type
    const jobPosts = (jobPostsResult as unknown) as JobPost[];
    const count = ((countResult as unknown) as [{ count: number }])[0].count;

    res.json({
      success: true,
      data: jobPosts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(Number(count) / ITEMS_PER_PAGE),
        totalItems: Number(count),
        itemsPerPage: ITEMS_PER_PAGE
      }
    });
  } catch (error) {
    console.error("Error fetching job posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job posts",
      error: error.message,
    });
  }
}
export async function handleCreateJobPostFromEmp(req: Request, res: Response) {
  try {
    // Validate request body against schema
    const validatedData : jobPostType = jobPostSchema.parse(req.body) ;
    const user : TEmployerSession = req.user as TEmployerSession;
    if(!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }
    // Start a transaction since we need to insert into multiple tables
    const result = await drizzlePool.transaction(async (tx) => {
      // Create the job hiring post
      const [jobPost] = await tx
        .insert(jobHiringPostTable)
        .values({
          title: validatedData.title,
          description: validatedData.description ?? null,
          jobLocation: validatedData.jobLocation,
          salary: validatedData.salary,
          workDates: validatedData.workDates,
          workHoursRange: validatedData.workHoursRange,
          hiredAmount: validatedData.hiredAmount,
          status: postStatusEnum.enumValues[1], // UNMATCHED
          jobHirerType: user.isOauth ? jobHirerTypeEnum.enumValues[1] : jobHirerTypeEnum.enumValues[0], // OAUTH_EMPLOYER or EMPLOYER
          employerId: user.isOauth ? null : user.id,
          oauthEmployerId: user.isOauth ? user.id : null,
          companyId: null
        })
        .returning();

      return jobPost;
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Job hiring post created successfully",
    });
  } catch (error) {
    console.error("Error creating job hiring post:", error);

    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data", 
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create job hiring post",
    });
  }
}

export async function handleUpdateJobPostFromEmp(req: Request, res: Response) {
  res.json({
      success: true,
    message: "Dummy handler",
    });
}

// Empty handlers for job posts
export async function dummyHandler(req: Request, res: Response) {
  res.json({
    success: true,
    message: "Dummy handler",
  });
}
