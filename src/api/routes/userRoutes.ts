import express from "express";
import { jobSeekerControllers } from "../controllers/jobSeekerControllers";
import { checkAuthenticated, checkUnauthenticated } from "../middlewares/auth";

const userRouter = express.Router();

// {/user}

// job seeker, fetch(GET), register(POST), delete account(DELETE)
userRouter
  .route("/job-seeker")
  .post(
    checkUnauthenticated,
    jobSeekerControllers.instance().jobSeekerRegister
  );

userRouter.route("/employer").post(checkUnauthenticated);

export { userRouter };
