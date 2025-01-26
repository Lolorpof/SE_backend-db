import { query, Request, Response } from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { jobHiringPostTable } from "../db/schema"; // Import the relevant table
import { Pool } from "pg"; // Import the Pool from pg
import { and, desc, eq, lte, gte, ilike, SQL } from "drizzle-orm";

// Initialize the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set
});

const db = drizzle(pool);

export async function handleGet(req: Request, res: Response) {
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
