import { query, Request, Response } from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  jobHiringPostTable,
  jobHiringPostSkillTable,
  jobHireCategoryTable,
} from "../db/schema"; // Import the relevant tables
import { Pool } from "pg"; // Import the Pool from pg
import { and, desc, eq, lte, gte, ilike, SQL } from "drizzle-orm";
import { createJobHiringPostSchema } from "../schemas/api-schema";

// Initialize the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set
});

const db = drizzle(pool);

export async function handleGetEmp(req: Request, res: Response) {
  try {
    const { title, province, location, salary, workHoursRange } = req.query;

    // Build the query using Drizzle ORM
    const filters: SQL[] = [];
    if (title) {
      filters.push(eq(jobHiringPostTable.title, title as string));
    }
    if (province) {
      filters.push(eq(jobHiringPostTable.jobLocation, province as string));
    }
    if (location) {
      filters.push(ilike(jobHiringPostTable.jobLocation, location as string));
    }
    if (salary) {
      filters.push(gte(jobHiringPostTable.salary, parseInt(salary as string)));
    }
    if (workHoursRange) {
      filters.push(
        eq(jobHiringPostTable.workHoursRange, workHoursRange as string)
      );
    }
    // Execute the query
    const results = await db
      .select()
      .from(jobHiringPostTable)
      .where(and(...filters));

    // Send the results back in the response
    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error fetching job posts:", error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
}

export function handlePost(req: Request, res: Response) {
  res.json({ success: true, msg: "hello world" });
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
