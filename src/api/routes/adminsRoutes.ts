import { Request, Response, Router } from "express";

const adminRouter = Router();

// {/admin}
adminRouter.route("/");

export { adminRouter };
