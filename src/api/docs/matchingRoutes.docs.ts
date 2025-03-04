export const matchingRoutesDoc = {
  components: {
    schemas: {
      // Request Bodies
      HiringMatchSeekerRequest: {
        type: "object",
        properties: {
          jobSeekerType: {
            type: "string",
            enum: ["NORMAL", "OAUTH"],
            example: "NORMAL"
          },
          jobSeekerId: {
            type: "string",
            format: "uuid",
            example: "123e4567-e89b-12d3-a456-426614174000"
          },
          oauthJobSeekerId: {
            type: "string",
            format: "uuid",
            example: "123e4567-e89b-12d3-a456-426614174000"
          }
        }
      },
      FindingMatchHirerRequest: {
        type: "object",
        properties: {
          jobHirerType: {
            type: "string",
            enum: ["EMPLOYER", "OAUTHEMPLOYER", "COMPANY"],
            example: "EMPLOYER"
          },
          employerId: {
            type: "string",
            format: "uuid",
            example: "123e4567-e89b-12d3-a456-426614174000"
          },
          oauthEmployerId: {
            type: "string",
            format: "uuid",
            example: "123e4567-e89b-12d3-a456-426614174000"
          },
          companyId: {
            type: "string",
            format: "uuid",
            example: "123e4567-e89b-12d3-a456-426614174000"
          }
        }
      },
      MatchStatusRequest: {
        type: "object",
        required: ["status", "seekerId"],
        properties: {
          status: {
            type: "string",
            enum: ["INPROGRESS", "ACCEPTED", "DENIED"],
            example: "ACCEPTED"
          },
          seekerId: {
            type: "string",
            format: "uuid",
            example: "123e4567-e89b-12d3-a456-426614174000",
            description: "ID of the job seeker whose status is being updated"
          }
        }
      },
      // Response Bodies
      JobHiringPostMatchedSeeker: {
        type: "object",
        properties: {
          jobSeekerType: {
            type: "string",
            enum: ["NORMAL", "OAUTH"],
            example: "NORMAL"
          },
          jobSeekerId: {
            type: "string",
            format: "uuid",
            nullable: true
          },
          oauthJobSeekerId: {
            type: "string",
            format: "uuid",
            nullable: true
          },
          jobHiringPostMatchedId: {
            type: "string",
            format: "uuid"
          },
          status: {
            type: "string",
            enum: ["INPROGRESS", "ACCEPTED", "DENIED"],
            example: "INPROGRESS"
          },
          createdAt: {
            type: "string",
            format: "date-time"
          },
          approvedAt: {
            type: "string",
            format: "date-time",
            nullable: true
          },
          updatedAt: {
            type: "string",
            format: "date-time"
          },
          userData: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", format: "uuid" },
              username: { type: "string" },
              password: { type: "string" },
              firstName: { type: "string", nullable: true },
              lastName: { type: "string", nullable: true },
              email: { type: "string" },
              profilePicture: { type: "string", nullable: true },
              aboutMe: { type: "string", nullable: true },
              contact: { type: "string", nullable: true },
              resume: { type: "string", nullable: true },
              provinceAddress: { type: "string", nullable: true },
              address: { type: "string", nullable: true },
              approvalStatus: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" }
            }
          }
        }
      },
      JobHiringPostMatched: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid"
          },
          jobHiringPostId: {
            type: "string",
            format: "uuid"
          },
          createdAt: {
            type: "string",
            format: "date-time"
          },
          updatedAt: {
            type: "string",
            format: "date-time"
          },
          toMatchSeekers: {
            type: "array",
            items: {
              $ref: "#/components/schemas/JobHiringPostMatchedSeeker"
            }
          }
        }
      },
      JobHiringPost: {
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
            type: "string"
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
            enum: ["MATCHED", "UNMATCHED", "MATCHED_INPROG"]
          },
          hiredAmount: {
            type: "integer"
          },
          jobPostType: {
            type: "string",
            enum: ["FULLTIME", "PARTTIME", "FREELANCE"]
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
          },
          userData: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", format: "uuid" },
              username: { type: "string", nullable: true },
              officialName: { type: "string", nullable: true },
              firstName: { type: "string", nullable: true },
              lastName: { type: "string", nullable: true },
              email: { type: "string" },
              profilePicture: { type: "string", nullable: true },
              aboutMe: { type: "string", nullable: true },
              contact: { type: "string", nullable: true },
              provinceAddress: { type: "string", nullable: true },
              address: { type: "string", nullable: true },
              approvalStatus: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" }
            }
          },
          postMatched: {
            type: "array",
            items: {
              $ref: "#/components/schemas/JobHiringPostMatched"
            }
          }
        }
      },
      JobFindingPost: {
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
            type: "string"
          },
          jobLocation: {
            type: "string"
          },
          expectedSalary: {
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
            enum: ["MATCHED", "UNMATCHED", "MATCHED_INPROG"]
          },
          jobPostType: {
            type: "string",
            enum: ["FULLTIME", "PARTTIME", "FREELANCE"]
          },
          jobSeekerType: {
            type: "string",
            enum: ["NORMAL", "OAUTH"]
          },
          jobSeekerId: {
            type: "string",
            format: "uuid",
            nullable: true
          },
          oauthJobSeekerId: {
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
          },
          userData: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", format: "uuid" },
              username: { type: "string" },
              email: { type: "string" },
              firstName: { type: "string", nullable: true },
              lastName: { type: "string", nullable: true },
              profilePicture: { type: "string", nullable: true },
              aboutMe: { type: "string", nullable: true },
              contact: { type: "string", nullable: true },
              address: { type: "string", nullable: true },
              approvalStatus: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" }
            }
          }
        }
      },
      JobFindingPostMatched: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid"
          },
          jobFindingPostId: {
            type: "string",
            format: "uuid"
          },
          status: {
            type: "string",
            enum: ["INPROGRESS", "ACCEPTED", "DENIED"]
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
          approvedAt: {
            type: "string",
            format: "date-time",
            nullable: true
          },
          updatedAt: {
            type: "string",
            format: "date-time"
          },
          userData: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", format: "uuid" },
              username: { type: "string", nullable: true },
              officialName: { type: "string", nullable: true },
              email: { type: "string" },
              firstName: { type: "string", nullable: true },
              lastName: { type: "string", nullable: true },
              profilePicture: { type: "string", nullable: true },
              aboutMe: { type: "string", nullable: true },
              contact: { type: "string", nullable: true },
              address: { type: "string", nullable: true },
              approvalStatus: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" }
            }
          },
          toPost: {
            $ref: "#/components/schemas/JobFindingPost"
          }
        }
      },
      UserMatchingStatusResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          msg: {
            type: "string",
            example: "User matching status retrieved successfully"
          },
          data: {
            type: "object",
            properties: {
              hiringMatches: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/JobHiringPost"
                }
              },
              findingMatches: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/JobFindingPostMatched"
                }
              }
            }
          },
          status: {
            type: "integer",
            example: 200
          }
        }
      },
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
      }
    }
  },
  paths: {
    "/api/matching/hiring/{postId}/match": {
      post: {
        tags: ["Matching"],
        summary: "Job seeker matches with a hiring post",
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "postId",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            },
            description: "ID of the hiring post"
          }
        ],
        responses: {
          201: {
            description: "Successfully matched with hiring post",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HiringMatchResponse"
                }
              }
            }
          },
          400: {
            description: "Bad request or already matched",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          401: {
            description: "Unauthorized - User not authenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          403: {
            description: "Forbidden - Only job seekers can match with hiring posts",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          404: {
            description: "Hiring post not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      get: {
        tags: ["Matching"],
        summary: "Get all matches for a hiring post",
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "postId",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            },
            description: "ID of the hiring post"
          }
        ],
        responses: {
          200: {
            description: "Successfully retrieved matches",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true
                    },
                    msg: {
                      type: "string",
                      example: "Matches retrieved successfully"
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/HiringMatchResponse/properties/data"
                      }
                    },
                    status: {
                      type: "integer",
                      example: 200
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
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
    "/api/matching/hiring/match/{matchId}/status": {
      put: {
        tags: ["Matching"],
        summary: "Update hiring match status",
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "matchId",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            },
            description: "ID of the match"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MatchStatusRequest"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successfully updated match status",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HiringMatchResponse"
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          403: {
            description: "Forbidden - Only employers can update match status",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          404: {
            description: "Match not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
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
    "/api/matching/finding/{postId}/match": {
      post: {
        tags: ["Matching"],
        summary: "Match with a finding post",
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "postId",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            },
            description: "ID of the finding post"
          }
        ],
        responses: {
          201: {
            description: "Successfully matched with finding post",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FindingMatchResponse"
                }
              }
            }
          },
          400: {
            description: "Bad request or already matched",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          404: {
            description: "Finding post not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      get: {
        tags: ["Matching"],
        summary: "Get match for a finding post",
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "postId",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            },
            description: "ID of the finding post"
          }
        ],
        responses: {
          200: {
            description: "Successfully retrieved match",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FindingMatchResponse"
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          404: {
            description: "Match not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
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
    "/api/matching/finding/match/{matchId}/status": {
      put: {
        tags: ["Matching"],
        summary: "Update finding match status",
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "matchId",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            },
            description: "ID of the match"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MatchStatusRequest"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successfully updated match status",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FindingMatchResponse"
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          404: {
            description: "Match not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
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
    "/api/matching/user/tracking": {
      get: {
        tags: ["Matching"],
        summary: "Get user's matching status",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Successfully retrieved user matching status",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserMatchingStatusResponse"
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
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
    "/api/matching/admin/tracking": {
      get: {
        tags: ["Matching"],
        summary: "Get all matching status (admin only)",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Successfully retrieved all matching status",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserMatchingStatusResponse"
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          403: {
            description: "Forbidden - Admin access required",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
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
    "/api/matching/hiring/match/{matchId}": {
      delete: {
        tags: ["Matching"],
        summary: "Delete a hiring match (only by the job seeker who created it)",
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "matchId",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            },
            description: "ID of the match to delete"
          }
        ],
        responses: {
          200: {
            description: "Successfully deleted match",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true
                    },
                    msg: {
                      type: "string",
                      example: "Match deleted successfully"
                    },
                    data: {
                      $ref: "#/components/schemas/HiringMatchResponse/properties/data"
                    },
                    status: {
                      type: "integer",
                      example: 200
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          403: {
            description: "Forbidden - Only job seekers can delete their own matches",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          404: {
            description: "Match not found or user doesn't have permission",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
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
    "/api/matching/finding/match/{matchId}": {
      delete: {
        tags: ["Matching"],
        summary: "Delete a finding match (only by the employer/company who created it)",
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "matchId",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            },
            description: "ID of the match to delete"
          }
        ],
        responses: {
          200: {
            description: "Successfully deleted match",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true
                    },
                    msg: {
                      type: "string",
                      example: "Match deleted successfully"
                    },
                    data: {
                      $ref: "#/components/schemas/FindingMatchResponse/properties/data"
                    },
                    status: {
                      type: "integer",
                      example: 200
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          403: {
            description: "Forbidden - Only employers/companies can delete their own matches",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          404: {
            description: "Match not found or user doesn't have permission",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
            description: "Server error",
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
    }
  }
}; 