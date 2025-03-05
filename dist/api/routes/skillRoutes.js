"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requestBodySchema_1 = require("../schemas/requestBodySchema");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const auth_1 = require("../middlewares/auth");
const rolesChecker_1 = require("../middlewares/rolesChecker");
const skillControllers_1 = require("../controllers/skillControllers");
const skillRoutes = (0, express_1.Router)();
skillRoutes.route('/')
    .get(skillControllers_1.getAllSkills)
    .post(auth_1.checkAuthenticated, rolesChecker_1.checkAdmin, (0, validationMiddleware_1.validateData)(requestBodySchema_1.skillSchema), skillControllers_1.createSkill);
skillRoutes.route('/:id')
    .get(skillControllers_1.getSkillById)
    .put(auth_1.checkAuthenticated, rolesChecker_1.checkAdmin, (0, validationMiddleware_1.validateData)(requestBodySchema_1.skillSchema), skillControllers_1.updateSkill)
    .delete(auth_1.checkAuthenticated, rolesChecker_1.checkAdmin, skillControllers_1.deleteSkill);
exports.default = skillRoutes;
