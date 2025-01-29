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
            },
            skills: {
              type: "array",
              items: {
                type: "string",
                format: "uuid"
              },
              description: "List of skill IDs required for the job"
            },
            jobCategories: {
              type: "array",
              items: {
                type: "string",
                format: "uuid"
              },
              description: "List of job category IDs"
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
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid"
                  },
                  name: {
                    type: "string"
                  }
                }
              }
            },
            jobCategories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid"
                  },
                  name: {
                    type: "string"
                  }
                }
              }
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
            msg: {
              type: "string",
              example: "Job hiring post created successfully"
            },
            data: {
              $ref: "#/components/schemas/JobPost"
            },
            status: {
              type: "integer",
              example: 201
            }
          }
        },
        JobPostsResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            msg: {
              type: "string",
              example: "Successfully retrieved job posts"
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/JobPost"
              }
            },
            status: {
              type: "integer",
              example: 200
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error"
              }
            }
          }
        },
        ValidationError: {
          description: "Invalid input data",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationError"
              }
            }
          }
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error"
              }
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
