"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryServices = void 0;
const schema_1 = require("../../db/schema");
const services_1 = require("./services");
class categoryServices extends services_1.Services {
    constructor() {
        super(schema_1.jobCategoryTable);
    }
    static instance() {
        return services_1.Services.getInstance.call(categoryServices);
    }
}
exports.categoryServices = categoryServices;
