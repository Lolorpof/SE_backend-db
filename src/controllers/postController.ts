import { query, Request, Response } from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  jobHiringPostTable,
  jobHiringPostSkillTable,
  jobHireCategoryTable,
  companyTable,
  skillTable,
  jobCategoryTable,
} from "../db/schema"; // Import the relevant tables
import { Pool } from "pg"; // Import the Pool from pg
import { and, desc, eq, lte, gte, ilike, SQL, inArray } from "drizzle-orm";
import { createJobHiringPostSchema } from "../schemas/api-schema";

// Initialize the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set
});

const db = drizzle(pool);

export async function handleGetEmp(req: Request, res: Response) {
  try {
    const { title, province, jobLocation, salaryRange, workHoursRange } =
      req.query;

    const filters: SQL[] = [];

    // Title filter
    if (title) {
      filters.push(ilike(jobHiringPostTable.title, `%${title as string}%`));
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

    // Build base query with company information
    const baseQuery = db
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
    const baseQuery = db
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

export async function createJobHiringPost(req: Request, res: Response) {
  try {
    // Validate request body against schema
    const validatedData = createJobHiringPostSchema.parse(req.body);

    // Start a transaction since we need to insert into multiple tables
    const result = await db.transaction(async (tx) => {
      // Create the job hiring post
      const [jobPost] = await tx
        .insert(jobHiringPostTable)
        .values({
          title: validatedData.title,
          description: validatedData.description,
          jobLocation: validatedData.jobLocation,
          salary: validatedData.salary,
          workDates: validatedData.workDates,
          workHoursRange: validatedData.workHoursRange,
          hiredAmount: validatedData.hiredAmount,
          // Note: jobHirerType and employer/company IDs would come from auth
          // TODO: Add auth middleware to get the user type and IDs
          jobHirerType: "EMPLOYER", // Temporary default, should come from auth
        })
        .returning();

      // Insert skills for the job post
      if (validatedData.skills.length > 0) {
        await tx.insert(jobHiringPostSkillTable).values(
          validatedData.skills.map((skillId) => ({
            jobHiringPostId: jobPost.id,
            skillId: skillId,
          }))
        );
      }

      // Insert job categories for the job post
      if (validatedData.jobCategories.length > 0) {
        await tx.insert(jobHireCategoryTable).values(
          validatedData.jobCategories.map((categoryId) => ({
            jobHiringPostId: jobPost.id,
            jobCategoryId: categoryId,
          }))
        );
      }

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
