import { drizzlePool } from "../../db/conn";
import { eq } from "drizzle-orm";
import { ServicesResponse } from "../types/responseTypes";
import { errorServices } from "./errorServices";
import { Table } from "drizzle-orm";

// Base type for database records
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Base type for input data
export interface BaseEntityInput<T = any> {
  [key: string]: T;
}

export abstract class Services<
  T extends BaseEntity,
  TInput extends BaseEntityInput = BaseEntityInput
> {
  //singleton design
  //protected to allow access in child classes
  protected static ServicesInstances: Map<string, Services<any, any>> =
    new Map();
  //readonly table
  protected readonly table: Table;

  protected constructor(table: Table) {
    this.table = table;
  }

  protected static getInstance<S extends Services<any, any>>(
    this: new (...args: any[]) => S,
    ...args: any[]
  ): S {
    const key = this.name;
    if (!Services.ServicesInstances.has(key)) {
      Services.ServicesInstances.set(key, new this(...args));
    }
    return Services.ServicesInstances.get(key) as S;
  }

  async getAll(): Promise<ServicesResponse<T[]>> {
    try {
      const items = await drizzlePool.select().from(this.table);
      return {
        success: true,
        status: 200,
        msg: "Items fetched successfully",
        data: items as T[],
      };
    } catch (error) {
      console.error("Error fetching items:", error);
      throw errorServices.handleServerError(error);
    }
  }

  async getById(id: string): Promise<ServicesResponse<T>> {
    try {
      const [item] = await drizzlePool
        .select()
        .from(this.table)
        .where(eq((this.table as any).id, id));

      if (!item) {
        throw errorServices.handleNotFoundError("Item");
      }

      return {
        success: true,
        status: 200,
        msg: "Item fetched successfully",
        data: item as T,
      };
    } catch (error) {
      console.error("Error fetching item by id:", error);
      throw errorServices.handleServerError(error);
    }
  }

  async create(data: TInput): Promise<ServicesResponse<T>> {
    try {
      const [newItem] = await drizzlePool
        .insert(this.table)
        .values(data)
        .returning();

      return {
        success: true,
        status: 201,
        msg: "Item created successfully",
        data: newItem as T,
      };
    } catch (error) {
      console.error("Error creating item:", error);
      if (error.code === "23505") {
        throw errorServices.handleValidationError(
          "Item with this name already exists"
        );
      }
      throw errorServices.handleServerError(error);
    }
  }

  async update(id: string, data: TInput): Promise<ServicesResponse<T>> {
    try {
      const [updatedItem] = await drizzlePool
        .update(this.table)
        .set({
          ...data,
          updatedAt: new Date(),
        })

        .where(eq((this.table as any).id, id))
        .returning();

      if (!updatedItem) {
        throw errorServices.handleNotFoundError("Item");
      }

      return {
        success: true,
        status: 200,
        msg: "Item updated successfully",
        data: updatedItem as T,
      };
    } catch (error) {
      console.error("Error updating item:", error);
      if (error.code === "23505") {
        throw errorServices.handleValidationError(
          "Item with this name already exists"
        );
      }
      throw errorServices.handleServerError(error);
    }
  }

  async delete(id: string): Promise<ServicesResponse<T>> {
    try {
      const [deletedItem] = await drizzlePool
        .delete(this.table)
        .where(eq((this.table as any).id, id))
        .returning();

      if (!deletedItem) {
        throw errorServices.handleNotFoundError("Item");
      }

      return {
        success: true,
        status: 200,
        msg: "Item deleted successfully",
        data: deletedItem as T,
      };
    } catch (error) {
      console.error("Error deleting item:", error);
      throw errorServices.handleServerError(error);
    }
  }
}
