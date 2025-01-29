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
        JobPostRequest: {
          type: "object",
          required: [
            "title",
            "jobLocation",
            "salary",
            "workDates",
            "workHoursRange"
          ],
          properties: {
            title: {
              type: "string",
              maxLength: 255,
              example: "Senior Software Engineer"
            },
            description: {
              type: "string",
              maxLength: 540,
              example: "Looking for an experienced developer"
            },
            jobLocation: {
              type: "string",
              maxLength: 255,
              example: "Bangkok"
            },
            salary: {
              type: "integer",
              minimum: 1,
              example: 50000
            },
            workDates: {
              type: "string",
              maxLength: 1024,
              example: "Monday-Friday"
            },
            workHoursRange: {
              type: "string",
              maxLength: 255,
              example: "9:00-18:00"
            },
            hiredAmount: {
              type: "integer",
              minimum: 1,
              default: 1,
              example: 2
            }
          }
        },
        JobPost: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid"
            },
            title: {
              type: "string"
            },
            description: {
              type: "string",
              nullable: true
            },
            jobLocation: {
              type: "string"
            },
            salary: {
              type: "integer"
            },
            workDates: {
              type: "string"
            },
            workHoursRange: {
              type: "string"
            },
            status: {
              type: "string",
              enum: ["UNMATCHED", "MATCHED", "MATCHED_INPROG"]
            },
            hiredAmount: {
              type: "integer"
            },
            jobHirerType: {
              type: "string",
              enum: ["EMPLOYER", "OAUTHEMPLOYER", "COMPANY"]
            },
            employerId: {
              type: "string",
              format: "uuid",
              nullable: true
            },
            oauthEmployerId: {
              type: "string",
              format: "uuid",
              nullable: true
            },
            companyId: {
              type: "string",
              format: "uuid",
              nullable: true
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        JobPostResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            data: {
              $ref: "#/components/schemas/JobPost"
            },
            message: {
              type: "string",
              example: "Job hiring post created successfully"
            }
          }
        }
      }
    }
  },
  apis: [
    path.join(__dirname, "routes", "*.ts"),
    path.join(__dirname, "routes", "**", "*.ts")
  ],
};

const swaggerOption = swaggerJsDoc(options);

export default swaggerOption;
