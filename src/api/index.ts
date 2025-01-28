import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { drizzlePool } from "../db/conn";
import postRoutes from "./routes/postRoutes";
import swaggerUi from "swagger-ui-express";
import swaggerOption from "./swagger";
const port = process.env.BACKEND_PORT; //6977

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOption));

app.use([
  cors({
    origin: `http://localhost:${process.env.FRONTEND_PORT}`,
    credentials: true,
  }),
  helmet(),
]);

app.use("/api/post", postRoutes);

app.get("/", async (req, res) => {
  res.json({ success: true, msg: "hello world" });
});

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
