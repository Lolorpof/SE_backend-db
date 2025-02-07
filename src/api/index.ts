import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { sessionStore } from "./utilities/sessionStore";
import passport from "passport";
import { userRouter } from "./routes/userRoutes";
import swaggerUi from "swagger-ui-express";
import swaggerOption from "./swagger";
import { adminRouter } from "./routes/adminRoutes";
import postRoutes from "./routes/postRoutes";
import skillRoutes from "./routes/skillRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import vulnerabilityRoutes from "./routes/vulnerabilityRoutes";
const port = process.env.BACKEND_PORT; //6977
const cookieExpireTime = { real: 1000 * 60 * 60 * 4, dev: 1000 * 60 * 5 };

const app = express();

app.use(express.json());

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
  express.json(),
]);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOption));



app.get("/", async (req, res) => {
  res.json({ success: true, msg: "hello world" });
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/post", postRoutes);
app.use("/api/skill", skillRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/vulnerability", vulnerabilityRoutes);

// HTTP Server setup
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
