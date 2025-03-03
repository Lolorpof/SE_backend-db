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
import notificationRoutes from "./routes/notificationRoutes";
import matchingRoutes from "./routes/matchingRoutes";
import { testMinioConnection } from "./utilities/minio";

const port = process.env.BACKEND_PORT; //6977
const cookieExpireTime = { real: 1000 * 60 * 60 * 4, dev: 1000 * 60 * 5 };

const app = express();

// Test MinIO connection on startup
testMinioConnection()
  .then((success) => {
    if (!success) {
      console.error('Failed to connect to MinIO. Check your configuration.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Error testing MinIO connection:', error);
    process.exit(1);
  });

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

// Test MinIO connection endpoint
app.get("/test-minio", async (req, res) => {
  try {
    const success = await testMinioConnection();
    if (success) {
      res.json({ success: true, msg: "MinIO connection successful" });
    } else {
      res.status(500).json({ success: false, msg: "MinIO connection failed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error testing MinIO connection", error });
  }
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/post", postRoutes);
app.use("/api/skill", skillRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/vulnerability", vulnerabilityRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/matching", matchingRoutes);

// HTTP Server setup
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
