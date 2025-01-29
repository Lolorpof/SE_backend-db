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
      title: "SkillBridge API",
      version: "1.0.0",
    },
  },servers: [
    {
      url: "http://localhost:6977",
      description: "Development server"
    }
  ],
  apis: [
    path.join(__dirname, "./index.ts"),
    path.join(__dirname, "./index.js"),
    path.join(__dirname, "./routes/*.ts"),
    path.join(__dirname, "./routes/*.js"),
  ], // files containing annotations as above
};

const swaggerOption = swaggerJsDoc(options);

export default swaggerOption;
