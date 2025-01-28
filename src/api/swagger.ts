import swaggerJsDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import path from "path";

// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Matching API Documentation",
      version: "1.0.0",
      description: "API for job posting and matching system"
    },
  },
  servers: [
    {
      url: "http://localhost:6977",
      description: "Development server"
    }
  ],
  apis: [
    path.join(__dirname, "./routes/*.ts"),
    path.join(__dirname, "./routes/*.js"),
  ],
};

const swaggerOption = swaggerJsDoc(options);

export default swaggerOption;
