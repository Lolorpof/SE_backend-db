"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requestBodySchema_1 = require("../schemas/requestBodySchema");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const auth_1 = require("../middlewares/auth");
const categoryControllers_1 = require("../controllers/categoryControllers");
const rolesChecker_1 = require("../middlewares/rolesChecker");
const categoryRoutes = (0, express_1.Router)();
categoryRoutes.route('/')
    .get(categoryControllers_1.getAllCategories)
    .post(auth_1.checkAuthenticated, rolesChecker_1.checkAdmin, (0, validationMiddleware_1.validateData)(requestBodySchema_1.categorySchema), categoryControllers_1.createCategory);
categoryRoutes.route('/:id')
    .get(categoryControllers_1.getCategoryById)
    .put(auth_1.checkAuthenticated, rolesChecker_1.checkAdmin, (0, validationMiddleware_1.validateData)(requestBodySchema_1.categorySchema), categoryControllers_1.updateCategory)
    .delete(auth_1.checkAuthenticated, rolesChecker_1.checkAdmin, categoryControllers_1.deleteCategory);
exports.default = categoryRoutes;
