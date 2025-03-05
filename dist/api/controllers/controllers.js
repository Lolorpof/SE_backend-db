"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controllers = void 0;
const controllerUtils_1 = require("../utilities/controllerUtils");
class Controllers {
    static ControllersInstances = new Map();
    service;
    constructor(service) {
        this.service = service;
    }
    static getInstance(...args) {
        const key = this.name;
        if (!Controllers.ControllersInstances.has(key)) {
            Controllers.ControllersInstances.set(key, new this(...args));
        }
        return Controllers.ControllersInstances.get(key);
    }
    async getAll(req, res) {
        try {
            const result = await this.service.getAll();
            res.status(result.status).json({
                success: result.success,
                message: result.msg,
                data: result.data,
            });
        }
        catch (error) {
            (0, controllerUtils_1.handleControllerError)(error, res);
        }
    }
    async getById(req, res) {
        try {
            const result = await this.service.getById(req.params.id);
            res.status(result.status).json({
                success: result.success,
                message: result.msg,
                data: result.data,
            });
        }
        catch (error) {
            (0, controllerUtils_1.handleControllerError)(error, res);
        }
    }
    async create(req, res) {
        try {
            const result = await this.service.create(req.body);
            res.status(result.status).json({
                success: result.success,
                message: result.msg,
                data: result.data,
            });
        }
        catch (error) {
            (0, controllerUtils_1.handleControllerError)(error, res);
        }
    }
    async update(req, res) {
        try {
            const result = await this.service.update(req.params.id, req.body);
            res.status(result.status).json({
                success: result.success,
                message: result.msg,
                data: result.data,
            });
        }
        catch (error) {
            (0, controllerUtils_1.handleControllerError)(error, res);
        }
    }
    async delete(req, res) {
        try {
            const result = await this.service.delete(req.params.id);
            res.status(result.status).json({
                success: result.success,
                message: result.msg,
                data: result.data,
            });
        }
        catch (error) {
            (0, controllerUtils_1.handleControllerError)(error, res);
        }
    }
}
exports.Controllers = Controllers;
