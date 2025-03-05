"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillServices = void 0;
const schema_1 = require("../../db/schema");
const services_1 = require("./services");
class skillServices extends services_1.Services {
    constructor() {
        super(schema_1.skillTable);
    }
    static instance() {
        return services_1.Services.getInstance.call(skillServices);
    }
}
exports.skillServices = skillServices;
