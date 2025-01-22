import express from "express";
import { usersControllers } from "../controllers/usersControllers";
import { checkAuthenticated, checkUnauthenticated } from "../middlewares/auth";

const userRouter = express.Router();

// {/user}

// job seeker, fetch(GET), register(POST), delete account(DELETE)
userRouter
  .route("/job-seeker")
  .post(checkUnauthenticated, usersControllers.jobSeekerRegister);

export { userRouter };
