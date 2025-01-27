import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { drizzlePool } from "../db/conn";
import postRoutes from "../routes/postRoutes";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const port = process.env.BACKEND_PORT; //6977

const app = express();

app.use(express.json());


//swagger definition
const swaggerOption = {
  definition:{
    openapi: "3.0.0",
    info:{
      title: "Job Matching API Documentation",
      version: "1.0.0",
      description: "API for job posting and matching system"  
    }
  },
  servers: [
    {
      url: "http://localhost:6977",
      description: "Development server"
    }
  ],
  apis: ["./src/routes/*.ts"],
}

const swaggerSpec = swaggerJSDoc(swaggerOption);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
