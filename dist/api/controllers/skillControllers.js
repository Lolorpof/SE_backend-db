"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getSkillById = exports.getAllSkills = void 0;
const skillServices_1 = require("../services/skillServices");
const controllers_1 = require("./controllers");
class SkillControllers extends controllers_1.Controllers {
    constructor() {
        super(skillServices_1.skillServices.instance());
    }
    static instance() {
        return controllers_1.Controllers.getInstance.call(SkillControllers);
    }
}
// Create a single instance
const controller = SkillControllers.instance();
// Export bound methods
exports.getAllSkills = controller.getAll.bind(controller);
exports.getSkillById = controller.getById.bind(controller);
exports.createSkill = controller.create.bind(controller);
exports.updateSkill = controller.update.bind(controller);
exports.deleteSkill = controller.delete.bind(controller);
