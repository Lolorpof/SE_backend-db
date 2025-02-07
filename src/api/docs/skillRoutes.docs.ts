/**
 * Skill routes OpenAPI documentation
 */

export const skillRoutesDoc = {
  components: {
    schemas: {
      Skill: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          name: {
            type: 'string',
            example: 'JavaScript'
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Programming language for web development'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-20T15:30:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-20T15:30:00.000Z'
          }
        }
      },
      SkillResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          status: {
            type: 'integer',
            example: 200
          },
          msg: {
            type: 'string',
            example: 'Successfully retrieved skill'
          },
          data: {
            $ref: '#/components/schemas/Skill'
          }
        }
      },
      SkillsResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          status: {
            type: 'integer',
            example: 200
          },
          msg: {
            type: 'string',
            example: 'Successfully retrieved skills'
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Skill'
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/skill': {
      get: {
        tags: ['Skills'],
        summary: 'Get all skills',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Successfully retrieved skills',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SkillsResponse'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    status: {
                      type: 'integer',
                      example: 401
                    },
                    msg: {
                      type: 'string',
                      example: 'Unauthorized'
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    status: {
                      type: 'integer',
                      example: 500
                    },
                    msg: {
                      type: 'string',
                      example: 'Failed to fetch skills'
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Skills'],
        summary: 'Create a new skill (Admin only)',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: {
                    type: 'string',
                    example: 'JavaScript'
                  },
                  description: {
                    type: 'string',
                    nullable: true,
                    example: 'Programming language for web development'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Skill created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SkillResponse'
                }
              }
            }
          },
          400: {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    message: {
                      type: 'string',
                      example: 'Invalid request data'
                    },
                    errors: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          field: {
                            type: 'string'
                          },
                          message: {
                            type: 'string'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin access required' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/skill/{id}': {
      get: {
        tags: ['Skills'],
        summary: 'Get a specific skill by ID',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'The skill ID'
          }
        ],
        responses: {
          200: {
            description: 'Successfully retrieved skill',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SkillResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Skill not found' },
          500: { description: 'Server error' }
        }
      },
      put: {
        tags: ['Skills'],
        summary: 'Update a specific skill (Admin only)',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'The skill ID to update'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: {
                    type: 'string',
                    example: 'Updated JavaScript'
                  },
                  description: {
                    type: 'string',
                    nullable: true,
                    example: 'Updated description for JavaScript'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Skill updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SkillResponse'
                }
              }
            }
          },
          400: { description: 'Invalid request data' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin access required' },
          404: { description: 'Skill not found' },
          500: { description: 'Server error' }
        }
      },
      delete: {
        tags: ['Skills'],
        summary: 'Delete a specific skill (Admin only)',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'The skill ID to delete'
          }
        ],
        responses: {
          200: {
            description: 'Skill deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SkillResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin access required' },
          404: { description: 'Skill not found' },
          500: { description: 'Server error' }
        }
      }
    }
  }
}; 