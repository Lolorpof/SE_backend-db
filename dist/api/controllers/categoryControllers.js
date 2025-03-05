"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const categoryServices_1 = require("../services/categoryServices");
const controllers_1 = require("./controllers");
class CategoryControllers extends controllers_1.Controllers {
    constructor() {
        super(categoryServices_1.categoryServices.instance());
    }
    static instance() {
        return controllers_1.Controllers.getInstance.call(CategoryControllers);
    }
}
// Create a single instance
const controller = CategoryControllers.instance();
// Export bound methods
exports.getAllCategories = controller.getAll.bind(controller);
exports.getCategoryById = controller.getById.bind(controller);
exports.createCategory = controller.create.bind(controller);
exports.updateCategory = controller.update.bind(controller);
exports.deleteCategory = controller.delete.bind(controller);
