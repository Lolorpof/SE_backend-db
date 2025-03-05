"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminModels = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const conn_1 = require("../../db/conn");
const schema_1 = require("../../db/schema");
class adminModels {
    static adminModel;
    static instance() {
        if (!this.adminModel) {
            this.adminModel = new adminModels();
        }
        return this.adminModel;
    }
    async getById(id) {
        const user = await conn_1.drizzlePool.query.adminTable.findFirst({
            columns: { password: false, createdAt: false, updatedAt: false },
            where: (0, drizzle_orm_1.eq)(schema_1.adminTable.id, id),
        });
        return user;
    }
    async matchNameEmail(nameEmail) {
        const users = await conn_1.drizzlePool.query.adminTable.findMany({
            columns: { id: true, password: true },
            where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.adminTable.username, nameEmail), (0, drizzle_orm_1.eq)(schema_1.adminTable.email, nameEmail)),
        });
        return users;
    }
    async create(username, hashedPassword) {
        const user = await conn_1.drizzlePool
            .insert(schema_1.adminTable)
            .values({ username: username, password: hashedPassword })
            .returning({ id: schema_1.adminTable.id, username: schema_1.adminTable.username });
        return user[0];
    }
    async getCurrent() { }
}
exports.adminModels = adminModels;
