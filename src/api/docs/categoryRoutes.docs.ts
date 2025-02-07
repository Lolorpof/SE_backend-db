/**
 * Category routes OpenAPI documentation
 */

export const categoryRoutesDoc = {
  components: {
    schemas: {
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          name: {
            type: 'string',
            example: 'Software Development'
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Jobs related to software development and programming'
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
      CategoryResponse: {
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
            example: 'Successfully retrieved category'
          },
          data: {
            $ref: '#/components/schemas/Category'
          }
        }
      },
      CategoriesResponse: {
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
            example: 'Successfully retrieved categories'
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Category'
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/category': {
      get: {
        tags: ['Categories'],
        summary: 'Get all categories',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Successfully retrieved categories',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoriesResponse'
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
                      example: 'Failed to fetch categories'
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a new category (Admin only)',
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
                    example: 'Software Development'
                  },
                  description: {
                    type: 'string',
                    nullable: true,
                    example: 'Jobs related to software development and programming'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Category created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoryResponse'
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
    '/api/category/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get a specific category by ID',
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
            description: 'The category ID'
          }
        ],
        responses: {
          200: {
            description: 'Successfully retrieved category',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoryResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Category not found' },
          500: { description: 'Server error' }
        }
      },
      put: {
        tags: ['Categories'],
        summary: 'Update a specific category (Admin only)',
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
            description: 'The category ID to update'
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
                    example: 'Updated Software Development'
                  },
                  description: {
                    type: 'string',
                    nullable: true,
                    example: 'Updated description for software development jobs'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Category updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoryResponse'
                }
              }
            }
          },
          400: { description: 'Invalid request data' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin access required' },
          404: { description: 'Category not found' },
          500: { description: 'Server error' }
        }
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete a specific category (Admin only)',
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
            description: 'The category ID to delete'
          }
        ],
        responses: {
          200: {
            description: 'Category deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoryResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin access required' },
          404: { description: 'Category not found' },
          500: { description: 'Server error' }
        }
      }
    }
  }
}; 