import swaggerJsDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import path from "path";
import { postRoutesDoc } from "./docs/postRoutes.docs";
import { vulnerabilityRoutesDoc } from "./docs/vulnerabilityRoutes.docs";

// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SkillBridge API",
      version: "1.0.0",
      description: "API documentation for SkillBridge backend",
    },
    servers: [
      {
        url: "http://localhost:6977",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid"
        }
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            msg: {
              type: "string",
              example: "Error message"
            },
            status: {
              type: "integer",
              example: 400
            }
          }
        },
        ValidationError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            msg: {
              type: "string",
              example: "Validation failed"
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string"
                  },
                  message: {
                    type: "string"
                  }
                }
              }
            },
            status: {
              type: "integer",
              example: 400
            }
          }
        },
        ...postRoutesDoc.components.schemas,
        ...vulnerabilityRoutesDoc.components.schemas
      },
    },
    paths: {
      ...postRoutesDoc.paths,
      ...vulnerabilityRoutesDoc.paths
    }
  },
  apis: [
    path.join(__dirname, "./routes/*.ts"),
    path.join(__dirname, "./docs/*.ts")
  ]
};

const specs = swaggerJsDoc(options);

export default specs;
