import { eq } from "drizzle-orm";
import { drizzlePool as db } from "../../db/conn";
import { jobCategoryTable } from "../../db/schema";
import { categoryType } from "../schemas/requestBodySchema";
import { SerivcesResponse } from "../types/responseTypes";
type TJobCategory = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};


export class categoryServices {
  private static categoryService: categoryServices | undefined;

  static instance() {
    if (!this.categoryService) {
      this.categoryService = new categoryServices();
    }
    return this.categoryService;
  }

  async getAll(): Promise<SerivcesResponse<TJobCategory[]>> {
    try {
      const categories = await db.select().from(jobCategoryTable);
      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved categories",
        data: categories,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        success: false,
        status: 500,
        msg: "Failed to fetch categories",
      };
    }
  }

  async getById(id: string): Promise<SerivcesResponse<TJobCategory>> {
    try {
      const category = await db
        .select()

        .from(jobCategoryTable)
        .where(eq(jobCategoryTable.id, id));

      if (!category || category.length === 0) {
        return {
          success: false,
          status: 404,
          msg: "Category not found",
        };
      }

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved category",
        data: category[0],
      };
    } catch (error) {
      console.error("Error fetching category:", error);
      return {
        success: false,
        status: 500,
        msg: "Failed to fetch category",
      };
    }
  }

  async create(categoryData: categoryType): Promise<SerivcesResponse<TJobCategory>> {
    try {
      const newCategory = await db

        .insert(jobCategoryTable)
        .values({
          name: categoryData.name,
          description: categoryData.description,
        })
        .returning();

      return {
        success: true,
        status: 201,
        msg: "Successfully created category",
        data: newCategory[0],
      };
    } catch (error) {
      console.error("Error creating category:", error);
      if (error.code === "23505") {
        // Unique constraint violation
        return {
          success: false,
          status: 400,
          msg: "Category with this name already exists",
        };
      }
      return {
        success: false,
        status: 500,
        msg: "Failed to create category",
      };
    }
  }

  async update(id: string, categoryData: categoryType): Promise<SerivcesResponse<TJobCategory>> {
    try {
      const updatedCategory = await db

        .update(jobCategoryTable)
        .set({
          name: categoryData.name,
          description: categoryData.description,
          updatedAt: new Date(),
        })
        .where(eq(jobCategoryTable.id, id))
        .returning();

      if (!updatedCategory || updatedCategory.length === 0) {
        return {
          success: false,
          status: 404,
          msg: "Category not found",
        };
      }

      return {
        success: true,
        status: 200,
        msg: "Successfully updated category",
        data: updatedCategory[0],
      };
    } catch (error) {
      console.error("Error updating category:", error);
      if (error.code === "23505") {
        // Unique constraint violation
        return {
          success: false,
          status: 400,
          msg: "Category with this name already exists",
        };
      }
      return {
        success: false,
        status: 500,
        msg: "Failed to update category",
      };
    }
  }

  async delete(id: string): Promise<SerivcesResponse<TJobCategory>> {
    try {
      const deletedCategory = await db

        .delete(jobCategoryTable)
        .where(eq(jobCategoryTable.id, id))
        .returning();

      if (!deletedCategory || deletedCategory.length === 0) {
        return {
          success: false,
          status: 404,
          msg: "Category not found",
        };
      }

      return {
        success: true,
        status: 200,
        msg: "Successfully deleted category",
        data: deletedCategory[0],
      };
    } catch (error) {
      console.error("Error deleting category:", error);
      return {
        success: false,
        status: 500,
        msg: "Failed to delete category",
      };
    }
  }
}
