"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Models = void 0;
const conn_1 = require("../../db/conn");
class Models {
    // boilerplate
    static ModelsInstances = new Map();
    table;
    constructor(table) {
        this.table = table;
    }
    static instances(table) {
        if (!this.ModelsInstances.get(table)) {
            this.ModelsInstances.set(table, new Models(table));
        }
        return this.ModelsInstances.get(table);
    }
    // real part
    // get all
    async getAll() {
        let result;
        if (this.table === "jobSeeker") {
            result = await conn_1.drizzlePool.query.jobSeekerTable.findMany({
                columns: {
                    id: false,
                    createdAt: false,
                    updatedAt: false,
                    approvalStatus: false,
                },
                with: {
                    skills: { with: { toSkill: { columns: { name: true } } } },
                    vulnerabilities: {
                        with: { toVulnerabilityType: { columns: { name: true } } },
                    },
                },
            });
        }
        return result;
    }
    // getUser
    async getUser(id) { }
}
exports.Models = Models;
