"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const url_1 = require("url");
const path_1 = __importDefault(require("path"));
const postRoutes_docs_1 = require("./docs/postRoutes.docs");
const vulnerabilityRoutes_docs_1 = require("./docs/vulnerabilityRoutes.docs");
const skillRoutes_docs_1 = require("./docs/skillRoutes.docs");
const categoryRoutes_docs_1 = require("./docs/categoryRoutes.docs");
const notificationRoutes_docs_1 = require("./docs/notificationRoutes.docs");
const matchingRoutes_docs_1 = require("./docs/matchingRoutes.docs");
// Get the __dirname equivalent in ES modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
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
                ...postRoutes_docs_1.postRoutesDoc.components.schemas,
                ...vulnerabilityRoutes_docs_1.vulnerabilityRoutesDoc.components.schemas,
                ...skillRoutes_docs_1.skillRoutesDoc.components.schemas,
                ...categoryRoutes_docs_1.categoryRoutesDoc.components.schemas,
                ...notificationRoutes_docs_1.notificationRoutesDoc.components.schemas,
                ...matchingRoutes_docs_1.matchingRoutesDoc.components.schemas
            },
        },
        paths: {
            ...postRoutes_docs_1.postRoutesDoc.paths,
            ...vulnerabilityRoutes_docs_1.vulnerabilityRoutesDoc.paths,
            ...skillRoutes_docs_1.skillRoutesDoc.paths,
            ...categoryRoutes_docs_1.categoryRoutesDoc.paths,
            ...notificationRoutes_docs_1.notificationRoutesDoc.paths,
            ...matchingRoutes_docs_1.matchingRoutesDoc.paths
        }
    },
    apis: [
        path_1.default.join(__dirname, "./routes/*.ts"),
        path_1.default.join(__dirname, "./docs/*.ts")
    ]
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.default = specs;
