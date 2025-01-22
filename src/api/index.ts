import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { sessionStore } from "./utilities/sessionStore";
import passport from "passport";
import { userRouter } from "./routes/usersRoutes";

const port = process.env.BACKEND_PORT; //6977
const cookieExpireTime = { real: 1000 * 60 * 60 * 4, dev: 1000 * 60 * 5 };

const app = express();
app.use([
  cors({
    origin: `http://localhost:${process.env.FRONTEND_PORT}`,
    credentials: true,
  }),
  helmet(),
  session({
    secret: process.env.SESSION_SECRET as string,
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
    cookie: { maxAge: cookieExpireTime.dev, httpOnly: true },
  }),
  passport.initialize(),
  passport.session(),
]);

app.get("/", async (req, res) => {
  res.json({ success: true, msg: "hello world" });
});

// Routes
app.use("/user", userRouter);

// HTTP Server setup
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
