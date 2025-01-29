import { Request, Response } from "express";
import {
  jobHiringPostTable,
  jobHiringPostSkillTable,
  jobHireCategoryTable,
  companyTable,
  jobFindingPostTable,
} from "../../db/schema"; // Import the relevant tables
import { drizzlePool } from "../../db/conn";
import { and, eq, lte, gte, ilike, SQL, inArray, sql } from "drizzle-orm";
import { jobPostSchema } from "../schemas/api-schema";

// Remove or comment out the "Initialize the database connection" comment since we're importing drizzlePool

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

export async function handleGetJobSeeker(req: Request, res: Response) {
  try {
    const {
      officialName,
      jobCategories,
      skills,
      province,
      jobLocation,
      salaryRange,
      workHoursRange,
    } = req.query;

    const filters: SQL[] = [];

    // Company name filter
    if (officialName) {
      filters.push(
        ilike(companyTable.officialName, `%${officialName as string}%`)
      );
    }

    // Location filters
    if (province) {
      filters.push(eq(jobHiringPostTable.jobLocation, province as string));
    }
    if (jobLocation) {
      filters.push(
        ilike(jobHiringPostTable.jobLocation, `%${jobLocation as string}%`)
      );
    }

    // Salary range filter
    if (salaryRange) {
      const range = JSON.parse(salaryRange as string);
      if (range.min) {
        filters.push(gte(jobHiringPostTable.salary, range.min));
      }
      if (range.max) {
        filters.push(lte(jobHiringPostTable.salary, range.max));
      }
    }

    // Work hours filter
    if (workHoursRange) {
      filters.push(
        eq(jobHiringPostTable.workHoursRange, workHoursRange as string)
      );
    }

    // Build base query with joins
    const baseQuery = drizzlePool
      .select({
        id: jobHiringPostTable.id,
        title: jobHiringPostTable.title,
        description: jobHiringPostTable.description,
        jobLocation: jobHiringPostTable.jobLocation,
        salary: jobHiringPostTable.salary,
        workDates: jobHiringPostTable.workDates,
        workHoursRange: jobHiringPostTable.workHoursRange,
        hiredAmount: jobHiringPostTable.hiredAmount,
        companyName: companyTable.officialName,
      })
      .from(jobHiringPostTable)
      .leftJoin(
        companyTable,
        eq(jobHiringPostTable.companyId, companyTable.id)
      );

    // Add category join if needed
    if (jobCategories) {
      const categoryIds = (jobCategories as string).split(",");
      filters.push(inArray(jobHireCategoryTable.jobCategoryId, categoryIds));
      baseQuery.leftJoin(
        jobHireCategoryTable,
        eq(jobHiringPostTable.id, jobHireCategoryTable.jobHiringPostId)
      );
    }

    // Add skills join if needed
    if (skills) {
      const skillIds = (skills as string).split(",");
      filters.push(inArray(jobHiringPostSkillTable.skillId, skillIds));
      baseQuery.leftJoin(
        jobHiringPostSkillTable,
        eq(jobHiringPostTable.id, jobHiringPostSkillTable.jobHiringPostId)
      );
    }

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
    console.error("Error fetching job posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job posts",
      error: error.message,
    });
  }
}
//ensure schema -> fix controller -> update api-doc
// Need review
export async function handleCreateJobPost(req: Request, res: Response) {
  try {
    // Validate request body against schema
    const validatedData = jobPostSchema.parse(req.body);
    const user = req.user;
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
          // Fields waiting for implementation:
          status: "UNMATCHED", // Default value from schema
          jobHirerType: undefined, // Required field waiting for implementation
          employerId: undefined, // Optional field waiting for implementation
          oauthEmployerId: undefined, // Optional field waiting for implementation  
          companyId: undefined, // Optional field waiting for implementation
          oauthCompanyId: undefined // Optional field waiting for implementation
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

// Empty handlers for job posts
export async function dummyHandler(req: Request, res: Response) {
  res.json({
    success: true,
    message: "Dummy handler",
  });
}
