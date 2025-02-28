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
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["INPROGRESS", "ACCEPTED", "DENIED"],
            example: "ACCEPTED"
          }
        }
      },
      // Response Bodies
      HiringMatchResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          msg: {
            type: "string",
            example: "Successfully matched with hiring post"
          },
          data: {
            type: "object",
            properties: {
              jobSeekerType: {
                type: "string",
                example: "NORMAL"
              },
              jobSeekerId: {
                type: "string",
                format: "uuid"
              },
              oauthJobSeekerId: {
                type: "string",
                format: "uuid"
              },
              jobHiringPostMatchedId: {
                type: "string",
                format: "uuid"
              },
              status: {
                type: "string",
                example: "INPROGRESS"
              },
              createdAt: {
                type: "string",
                format: "date-time"
              },
              approvedAt: {
                type: "string",
                format: "date-time"
              },
              updatedAt: {
                type: "string",
                format: "date-time"
              }
            }
          },
          status: {
            type: "integer",
            example: 201
          }
        }
      },
      FindingMatchResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          msg: {
            type: "string",
            example: "Finding post match created successfully"
          },
          data: {
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
                example: "INPROGRESS"
              },
              jobHirerType: {
                type: "string",
                example: "EMPLOYER"
              },
              employerId: {
                type: "string",
                format: "uuid"
              },
              oauthEmployerId: {
                type: "string",
                format: "uuid"
              },
              companyId: {
                type: "string",
                format: "uuid"
              },
              createdAt: {
                type: "string",
                format: "date-time"
              },
              approvedAt: {
                type: "string",
                format: "date-time"
              },
              updatedAt: {
                type: "string",
                format: "date-time"
              }
            }
          },
          status: {
            type: "integer",
            example: 201
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
                    toMatchSeekers: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/HiringMatchResponse/properties/data"
                      }
                    }
                  }
                }
              },
              findingMatches: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/FindingMatchResponse/properties/data"
                }
              }
            }
          },
          status: {
            type: "integer",
            example: 200
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
            description: "Bad request",
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
                    }
                  }
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
          404: {
            description: "Match not found",
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
        summary: "Create a match for a finding post",
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
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/FindingMatchHirerRequest"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Successfully created finding post match",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FindingMatchResponse"
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
          403: {
            description: "Forbidden - Admin access required",
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