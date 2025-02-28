export const notificationRoutesDoc = {
  components: {
    schemas: {
      Notification: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "123e4567-e89b-12d3-a456-426614174000"
          },
          status: {
            type: "string",
            enum: ["READ", "UNREAD"],
            example: "UNREAD"
          },
          title: {
            type: "string",
            example: "New Job Match"
          },
          description: {
            type: "string",
            example: "A new job matching your skills has been posted"
          },
          userType: {
            type: "string",
            enum: ["JOBSEEKER", "OAUTHJOBSEEKER", "EMPLOYER", "OAUTHEMPLOYER", "COMPANY"],
            example: "JOBSEEKER"
          },
          jobSeekerId: {
            type: "string",
            format: "uuid",
            nullable: true,
            example: "123e4567-e89b-12d3-a456-426614174000"
          },
          oauthJobSeekerId: {
            type: "string",
            format: "uuid",
            nullable: true
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
      NotificationResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Notification"
            },
            description: "Array of notifications sorted by status (UNREAD first, then READ) and then by creation date (newest first)"
          }
        }
      },
      SingleNotificationResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          data: {
            $ref: "#/components/schemas/Notification"
          }
        }
      }
    }
  },
  paths: {
    "/api/notification": {
      get: {
        tags: ["Notification"],
        summary: "Get all notifications",
        description: "Retrieve all notifications for the authenticated user with optional status filter. Results are sorted by status (UNREAD first, then READ) and then by creation date (newest first).",
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: ["all", "READ", "UNREAD"],
              default: "all"
            },
            description: "Filter notifications by status. When not specified or set to 'all', returns all notifications sorted by status and date."
          }
        ],
        responses: {
          200: {
            description: "Successfully retrieved notifications, sorted by status (UNREAD first, then READ) and creation date (newest first)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/NotificationResponse"
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
          500: {
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
    "/api/notification/{id}/read": {
      post: {
        tags: ["Notification"],
        summary: "Mark notification as read",
        description: "Mark a specific notification as read for the authenticated user",
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            },
            description: "ID of the notification to mark as read"
          }
        ],
        responses: {
          200: {
            description: "Successfully marked notification as read",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SingleNotificationResponse"
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
          404: {
            description: "Notification not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error"
                }
              }
            }
          },
          500: {
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
    "/api/notification/mark-all-read": {
      post: {
        tags: ["Notification"],
        summary: "Mark all notifications as read",
        description: "Mark all unread notifications as read for the authenticated user",
        security: [
          {
            sessionAuth: []
          }
        ],
        responses: {
          200: {
            description: "Successfully marked all notifications as read",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/NotificationResponse"
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
          500: {
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
    }
  }
}; 