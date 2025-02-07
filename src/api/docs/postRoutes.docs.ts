/**
 * Post routes OpenAPI documentation
 */

export const postRoutesDoc = {
  components: {
    schemas: {
      Skill: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174010'
          },
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
      },
      JobCategory: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174020'
          },
          name: {
            type: 'string',
            example: 'Software Development'
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Development of software applications'
          }
        }
      },
      JobPost: {
        type: 'object',
        required: [
          'title',
          'jobLocation',
          'salary',
          'workDates',
          'workHoursRange',
          'jobPostType'
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          title: {
            type: 'string',
            example: 'Senior Software Engineer'
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Looking for an experienced developer'
          },
          jobLocation: {
            type: 'string',
            example: 'Bangkok'
          },
          salary: {
            type: 'integer',
            example: 50000
          },
          workDates: {
            type: 'string',
            example: 'Monday-Friday'
          },
          workHoursRange: {
            type: 'string',
            example: '9:00-18:00'
          },
          hiredAmount: {
            type: 'integer',
            example: 2
          },
          status: {
            type: 'string',
            enum: ['MATCHED', 'UNMATCHED', 'MATCHED_INPROG'],
            example: 'UNMATCHED'
          },
          jobHirerType: {
            type: 'string',
            enum: ['EMPLOYER', 'OAUTHEMPLOYER', 'COMPANY'],
            example: 'EMPLOYER'
          },
          jobPostType: {
            type: 'string',
            enum: ['FULLTIME', 'PARTTIME', 'FREELANCE'],
            example: 'FULLTIME'
          },
          employerId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            example: '123e4567-e89b-12d3-a456-426614174001'
          },
          oauthEmployerId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            example: null
          },
          companyId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            example: null
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
          },
          companyName: {
            type: 'string',
            nullable: true,
            example: null
          },
          skills: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Skill'
            }
          },
          jobCategories: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/JobCategory'
            }
          }
        }
      },
      JobFindingPost: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          title: {
            type: 'string',
            example: 'Looking for Software Engineer Position'
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Experienced software engineer looking for new opportunities'
          },
          jobLocation: {
            type: 'string',
            example: 'Bangkok'
          },
          expectedSalary: {
            type: 'integer',
            example: 50000
          },
          workDates: {
            type: 'string',
            example: 'Monday-Friday'
          },
          workHoursRange: {
            type: 'string',
            example: '9:00-18:00'
          },
          status: {
            type: 'string',
            enum: ['MATCHED', 'UNMATCHED', 'MATCHED_INPROG'],
            example: 'UNMATCHED'
          },
          jobPostType: {
            type: 'string',
            enum: ['FULLTIME', 'PARTTIME', 'FREELANCE'],
            example: 'FULLTIME'
          },
          jobSeekerType: {
            type: 'string',
            enum: ['NORMAL', 'OAUTH'],
            example: 'NORMAL'
          },
          jobSeekerId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            example: '123e4567-e89b-12d3-a456-426614174001'
          },
          oauthJobSeekerId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            example: null
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
          },
          skills: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Skill'
            }
          },
          jobCategories: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/JobCategory'
            }
          }
        }
      },
      JobPostRequest: {
        type: 'object',
        required: [
          'title',
          'jobLocation',
          'salary',
          'workDates',
          'workHoursRange',
          'jobPostType'
        ],
        properties: {
          title: {
            type: 'string',
            maxLength: 255,
            minLength: 1,
            example: 'Senior Software Engineer'
          },
          description: {
            type: 'string',
            maxLength: 540,
            nullable: true,
            example: 'Looking for an experienced developer'
          },
          jobLocation: {
            type: 'string',
            maxLength: 255,
            minLength: 1,
            example: 'Bangkok'
          },
          salary: {
            type: 'integer',
            minimum: 1,
            example: 50000
          },
          workDates: {
            type: 'string',
            maxLength: 1024,
            minLength: 1,
            example: 'Monday-Friday'
          },
          workHoursRange: {
            type: 'string',
            maxLength: 255,
            minLength: 1,
            example: '9:00-18:00'
          },
          hiredAmount: {
            type: 'integer',
            minimum: 1,
            default: 1,
            example: 2
          },
          jobPostType: {
            type: 'string',
            enum: ['FULLTIME', 'PARTTIME', 'FREELANCE'],
            example: 'FULLTIME'
          },
          skills: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uuid'
            },
            example: ['123e4567-e89b-12d3-a456-426614174010']
          },
          jobCategories: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uuid'
            },
            example: ['123e4567-e89b-12d3-a456-426614174020']
          }
        }
      },
      JobFindingPostRequest: {
        type: 'object',
        required: [
          'title',
          'jobLocation',
          'expectedSalary',
          'workDates',
          'workHoursRange',
          'jobPostType',
          'jobSeekerType'
        ],
        properties: {
          title: {
            type: 'string',
            maxLength: 255,
            minLength: 1,
            example: 'Looking for Software Engineer Position'
          },
          description: {
            type: 'string',
            maxLength: 540,
            nullable: true,
            example: 'Experienced software engineer looking for new opportunities'
          },
          jobLocation: {
            type: 'string',
            maxLength: 255,
            minLength: 1,
            example: 'Bangkok'
          },
          expectedSalary: {
            type: 'integer',
            minimum: 1,
            example: 50000
          },
          workDates: {
            type: 'string',
            maxLength: 1024,
            minLength: 1,
            example: 'Monday-Friday'
          },
          workHoursRange: {
            type: 'string',
            maxLength: 255,
            minLength: 1,
            example: '9:00-18:00'
          },
          jobPostType: {
            type: 'string',
            enum: ['FULLTIME', 'PARTTIME', 'FREELANCE'],
            example: 'FULLTIME'
          },
          jobSeekerType: {
            type: 'string',
            enum: ['NORMAL', 'OAUTH'],
            example: 'NORMAL'
          },
          skills: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uuid'
            },
            example: ['123e4567-e89b-12d3-a456-426614174010']
          },
          jobCategories: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uuid'
            },
            example: ['123e4567-e89b-12d3-a456-426614174020']
          }
        }
      },
      SinglePostResponse: {
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
            example: 'Successfully retrieved job post'
          },
          data: {
            $ref: '#/components/schemas/JobPost'
          }
        }
      },
      MultiplePostsResponse: {
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
            example: 'Successfully retrieved job posts'
          },
          data: {
            type: 'object',
            properties: {
              jobPosts: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/JobPost'
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  currentPage: {
                    type: 'integer',
                    example: 1
                  },
                  totalPages: {
                    type: 'integer',
                    example: 5
                  },
                  totalItems: {
                    type: 'integer',
                    example: 48
                  },
                  itemsPerPage: {
                    type: 'integer',
                    example: 10
                  }
                }
              }
            }
          }
        }
      },
      JobFindingPostResponse: {
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
            example: 'Successfully retrieved job finding post'
          },
          data: {
            $ref: '#/components/schemas/JobFindingPost'
          }
        }
      },
      MultipleJobFindingPostsResponse: {
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
            example: 'Successfully retrieved job finding posts'
          },
          data: {
            type: 'object',
            properties: {
              jobPosts: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/JobFindingPost'
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  currentPage: {
                    type: 'integer',
                    example: 1
                  },
                  totalPages: {
                    type: 'integer',
                    example: 5
                  },
                  totalItems: {
                    type: 'integer',
                    example: 48
                  },
                  itemsPerPage: {
                    type: 'integer',
                    example: 10
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/post/job-posts/employer': {
      post: {
        tags: ['Job Post from Employer'],
        summary: 'Create a new job post as an employer',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/JobPostRequest'
              },
              examples: {
                noSkillsNoCategories: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME'
                  }
                },
                onlySkills: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME',
                    skills: ['123e4567-e89b-12d3-a456-426614174010']
                  }
                },
                onlyCategories: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME',
                    jobCategories: ['123e4567-e89b-12d3-a456-426614174020']
                  }
                },
                bothSkillsAndCategories: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME',
                    skills: ['123e4567-e89b-12d3-a456-426614174010'],
                    jobCategories: ['123e4567-e89b-12d3-a456-426614174020']
                  }
                },
                multipleSkillsAndCategories: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME',
                    skills: ['123e4567-e89b-12d3-a456-426614174010', '123e4567-e89b-12d3-a456-426614174020'],
                    jobCategories: ['123e4567-e89b-12d3-a456-426614174020', '123e4567-e89b-12d3-a456-426614174030']
                  }
                }
              }
            }
          }

        },
        responses: {
          201: {
            description: 'Job post created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SinglePostResponse'
                }
              }
            }
          },
          400: { description: 'Invalid request data' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/post/job-posts/company': {
      post: {
        tags: ['Job Post from Company'],
        summary: 'Create a new job post as a company',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/JobPostRequest'
              },
              examples: {
                noSkillsNoCategories: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME'
                  }
                },
                onlySkills: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME',
                    skills: ['123e4567-e89b-12d3-a456-426614174010']
                  }
                },
                onlyCategories: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME',
                    jobCategories: ['123e4567-e89b-12d3-a456-426614174020']
                  }
                },
                bothSkillsAndCategories: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME',
                    skills: ['123e4567-e89b-12d3-a456-426614174010'],
                    jobCategories: ['123e4567-e89b-12d3-a456-426614174020']
                  }
                },
                multipleSkillsAndCategories: {
                  value: {
                    title: 'Senior Software Engineer',
                    description: 'Looking for an experienced developer',
                    jobLocation: 'Bangkok',
                    salary: 50000,
                    workDates: 'Monday-Friday',
                    workHoursRange: '9:00-18:00',
                    hiredAmount: 2,
                    jobPostType: 'FULLTIME',
                    skills: ['123e4567-e89b-12d3-a456-426614174010', '123e4567-e89b-12d3-a456-426614174020'],
                    jobCategories: ['123e4567-e89b-12d3-a456-426614174020', '123e4567-e89b-12d3-a456-426614174030']
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Job post created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SinglePostResponse'
                }
              }
            }
          },
          400: { description: 'Invalid request data' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/post/job-posts': {
      get: {
        tags: ['Job Post from Company/Employer'],
        summary: 'Get all job posts with filtering, sorting, and pagination',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'title',
            schema: { type: 'string' },
            description: 'Filter by job title (case-insensitive partial match)'
          },
          {
            in: 'query',
            name: 'provinces',
            schema: {
              type: 'array',
              items: { type: 'string' }
            },
            style: 'form',
            explode: true,
            description: 'Filter by multiple provinces'
          },
          {
            in: 'query',
            name: 'jobCategories',
            schema: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
              }
            },
            style: 'form',
            explode: true,
            description: 'Filter by job category IDs'
          },
          {
            in: 'query',
            name: 'salaryRange',
            schema: { type: 'number' },
            description: 'Filter jobs with salary less than or equal to this value'
          },
          {
            in: 'query',
            name: 'sortBy',
            schema: {
              type: 'string',
              enum: ['asc', 'desc']
            },
            default: 'desc',
            description: 'Sort by creation date'
          },
          {
            in: 'query',
            name: 'salarySort',
            schema: {
              type: 'string',
              enum: ['high-low', 'low-high']
            },
            description: 'Sort by salary'
          },
          {
            in: 'query',
            name: 'page',
            schema: {
              type: 'integer',
              minimum: 1
            },
            default: 1,
            description: 'Page number for pagination'
          }
        ],
        responses: {
          200: {
            description: 'Successfully retrieved job posts',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MultiplePostsResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/post/job-posts/{id}': {
      get: {
        tags: ['Job Post from Company/Employer'],
        summary: 'Get a specific job post by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'The job post ID'
          }
        ],
        responses: {
          200: {
            description: 'Successfully retrieved job post',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SinglePostResponse'
                }
              }
            }
          },
          404: { description: 'Job post not found' },
          500: { description: 'Server error' }
        }
      },
      put: {
        tags: ['Job Post from Company/Employer'],
        summary: 'Update a specific job post',
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
            description: 'The job post ID to update'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/JobPostRequest'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Job post updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SinglePostResponse'
                }
              }
            }
          },
          400: { description: 'Invalid request data' },
          401: { description: 'Unauthorized' },
          404: { description: 'Job post not found' },
          500: { description: 'Server error' }
        }
      },
      delete: {
        tags: ['Job Post from Company/Employer'],
        summary: 'Delete a specific job post',
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
            description: 'The job post ID to delete'
          }
        ],
        responses: {
          200: {
            description: 'Job post deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SinglePostResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Job post not found' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/post/user/job-posts': {
      get: {
        tags: ['User Posts'],
        summary: "Get all job posts created by the authenticated employer",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Successfully retrieved employer's job posts",
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MultiplePostsResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/post/company/job-posts': {
      get: {
        tags: ['User Posts'],
        summary: "Get all job posts created by the authenticated company",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Successfully retrieved company's job posts",
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MultiplePostsResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/post/user/finding-posts': {
      get: {
        tags: ['User Posts'],
        summary: "Get all job finding posts created by the authenticated job seeker",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Successfully retrieved user's job finding posts",
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MultipleJobFindingPostsResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/post/finding-posts': {
      get: {
        tags: ['Job Finding Post from Job Seeker'],
        summary: 'Get all job finding posts with filtering, sorting, and pagination',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'title',
            schema: { type: 'string' },
            description: 'Filter by job title (case-insensitive partial match)'
          },
          {
            in: 'query',
            name: 'provinces',
            schema: {
              type: 'array',
              items: { type: 'string' }
            },
            style: 'form',
            explode: true,
            description: 'Filter by multiple provinces'
          },
          {
            in: 'query',
            name: 'jobCategories',
            schema: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
              }
            },
            style: 'form',
            explode: true,
            description: 'Filter by job category IDs'
          },
          {
            in: 'query',
            name: 'salaryRange',
            schema: { type: 'number' },
            description: 'Filter jobs with expected salary less than or equal to this value'
          },
          {
            in: 'query',
            name: 'sortBy',
            schema: {
              type: 'string',
              enum: ['asc', 'desc']
            },
            default: 'desc',
            description: 'Sort by creation date'
          },
          {
            in: 'query',
            name: 'salarySort',
            schema: {
              type: 'string',
              enum: ['high-low', 'low-high']
            },
            description: 'Sort by expected salary'
          },
          {
            in: 'query',
            name: 'page',
            schema: {
              type: 'integer',
              minimum: 1
            },
            default: 1,
            description: 'Page number for pagination'
          }
        ],
        responses: {
          200: {
            description: 'Successfully retrieved job finding posts',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MultipleJobFindingPostsResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      },
      post: {
        tags: ['Job Finding Post from Job Seeker'],
        summary: 'Create a new job finding post',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/JobFindingPostRequest'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Job finding post created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobFindingPostResponse'
                }
              }
            }
          },
          400: { description: 'Invalid request data' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/post/finding-posts/{id}': {
      get: {
        tags: ['Job Finding Post from Job Seeker'],
        summary: 'Get a specific job finding post by ID',
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
            description: 'The job finding post ID'
          }
        ],
        responses: {
          200: {
            description: 'Successfully retrieved job finding post',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobFindingPostResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Job finding post not found' },
          500: { description: 'Server error' }
        }
      },
      put: {
        tags: ['Job Finding Post from Job Seeker'],
        summary: 'Update a specific job finding post',
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
            description: 'The job finding post ID to update'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/JobFindingPostRequest'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Job finding post updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobFindingPostResponse'
                }
              }
            }
          },
          400: { description: 'Invalid request data' },
          401: { description: 'Unauthorized' },
          404: { description: 'Job finding post not found' },
          500: { description: 'Server error' }
        }
      },
      delete: {
        tags: ['Job Finding Post from Job Seeker'],
        summary: 'Delete a specific job finding post',
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
            description: 'The job finding post ID to delete'
          }
        ],
        responses: {
          200: {
            description: 'Job finding post deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobFindingPostResponse'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Job finding post not found' },
          500: { description: 'Server error' }
        }
      }
    }
  }
}; 