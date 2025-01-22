import express from "express";
import { usersController } from "../controllers/usersController";

export const usersRouter = express.Router();

// {/user}
usersRouter.route("/").get(async (req, res) => {
  return usersController.getAllUsers();
});
