"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Services = void 0;
const conn_1 = require("../../db/conn");
const drizzle_orm_1 = require("drizzle-orm");
const errorServices_1 = require("./errorServices");
class Services {
    //singleton design
    //protected to allow access in child classes
    static ServicesInstances = new Map();
    //readonly table
    table;
    constructor(table) {
        this.table = table;
    }
    static getInstance(...args) {
        const key = this.name;
        if (!Services.ServicesInstances.has(key)) {
            Services.ServicesInstances.set(key, new this(...args));
        }
        return Services.ServicesInstances.get(key);
    }
    async getAll() {
        try {
            const items = await conn_1.drizzlePool.select().from(this.table);
            return {
                success: true,
                status: 200,
                msg: "Items fetched successfully",
                data: items,
            };
        }
        catch (error) {
            console.error("Error fetching items:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async getById(id) {
        try {
            const [item] = await conn_1.drizzlePool
                .select()
                .from(this.table)
                .where((0, drizzle_orm_1.eq)(this.table.id, id));
            if (!item) {
                throw errorServices_1.errorServices.handleNotFoundError("Item");
            }
            return {
                success: true,
                status: 200,
                msg: "Item fetched successfully",
                data: item,
            };
        }
        catch (error) {
            console.error("Error fetching item by id:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async create(data) {
        try {
            const [newItem] = await conn_1.drizzlePool
                .insert(this.table)
                .values(data)
                .returning();
            return {
                success: true,
                status: 201,
                msg: "Item created successfully",
                data: newItem,
            };
        }
        catch (error) {
            console.error("Error creating item:", error);
            if (error.code === "23505") {
                throw errorServices_1.errorServices.handleValidationError("Item with this name already exists");
            }
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async update(id, data) {
        try {
            const [updatedItem] = await conn_1.drizzlePool
                .update(this.table)
                .set({
                ...data,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(this.table.id, id))
                .returning();
            if (!updatedItem) {
                throw errorServices_1.errorServices.handleNotFoundError("Item");
            }
            return {
                success: true,
                status: 200,
                msg: "Item updated successfully",
                data: updatedItem,
            };
        }
        catch (error) {
            console.error("Error updating item:", error);
            if (error.code === "23505") {
                throw errorServices_1.errorServices.handleValidationError("Item with this name already exists");
            }
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async delete(id) {
        try {
            const [deletedItem] = await conn_1.drizzlePool
                .delete(this.table)
                .where((0, drizzle_orm_1.eq)(this.table.id, id))
                .returning();
            if (!deletedItem) {
                throw errorServices_1.errorServices.handleNotFoundError("Item");
            }
            return {
                success: true,
                status: 200,
                msg: "Item deleted successfully",
                data: deletedItem,
            };
        }
        catch (error) {
            console.error("Error deleting item:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
}
exports.Services = Services;
