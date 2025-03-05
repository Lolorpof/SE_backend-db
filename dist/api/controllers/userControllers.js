"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const userServices_1 = require("../services/userServices");
class userControllers {
    static userController;
    static instance() {
        if (!this.userController) {
            this.userController = new userControllers();
        }
        return this.userController;
    }
    /**
     * Get current authenticated user information
     * @param req Express Request object
     * @param res Express Response object
     */
    async getCurrentUser(req, res) {
        try {
            const result = await userServices_1.userServices.instance().getCurrentUser(req.user);
            res.status(result.status).json(result);
        }
        catch (error) {
            console.error("Error in getCurrentUser controller:", error);
            res.status(500).json({
                success: false,
                status: 500,
                msg: "Internal server error",
            });
        }
    }
}
exports.userControllers = userControllers;
