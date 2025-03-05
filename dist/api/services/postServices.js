"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postServices = void 0;
const conn_1 = require("../../db/conn");
require("../types/usersTypes");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const errorServices_1 = require("./errorServices");
class postServices {
    // singleton design
    static postService;
    static instance() {
        if (!this.postService) {
            this.postService = new postServices();
        }
        return this.postService;
    }
    async getAllJobPosts(queryParams) {
        try {
            const { title, provinces, jobCategories, salaryRange, sortBy = "desc", salarySort, page = 1, } = queryParams;
            const ITEMS_PER_PAGE = 10;
            const offset = (Number(page) - 1) * ITEMS_PER_PAGE;
            // Check if any filters are applied
            const hasFilters = !!(title || provinces || jobCategories || salaryRange);
            if (!hasFilters) {
                // Use simple Drizzle query for no filters case
                const [posts, countResult] = await Promise.all([
                    conn_1.drizzlePool
                        .select({
                        id: schema_1.jobHiringPostTable.id,
                        title: schema_1.jobHiringPostTable.title,
                        description: schema_1.jobHiringPostTable.description,
                        jobLocation: schema_1.jobHiringPostTable.jobLocation,
                        salary: schema_1.jobHiringPostTable.salary,
                        workDates: schema_1.jobHiringPostTable.workDates,
                        workHoursRange: schema_1.jobHiringPostTable.workHoursRange,
                        hiredAmount: schema_1.jobHiringPostTable.hiredAmount,
                        status: schema_1.jobHiringPostTable.status,
                        jobHirerType: schema_1.jobHiringPostTable.jobHirerType,
                        jobPostType: schema_1.jobHiringPostTable.jobPostType,
                        companyId: schema_1.jobHiringPostTable.companyId,
                        employerId: schema_1.jobHiringPostTable.employerId,
                        oauthEmployerId: schema_1.jobHiringPostTable.oauthEmployerId,
                        createdAt: schema_1.jobHiringPostTable.createdAt,
                        updatedAt: schema_1.jobHiringPostTable.updatedAt,
                    })
                        .from(schema_1.jobHiringPostTable)
                        .orderBy(salarySort === "high-low"
                        ? (0, drizzle_orm_1.desc)(schema_1.jobHiringPostTable.salary)
                        : salarySort === "low-high"
                            ? schema_1.jobHiringPostTable.salary
                            : sortBy === "desc"
                                ? (0, drizzle_orm_1.desc)(schema_1.jobHiringPostTable.createdAt)
                                : schema_1.jobHiringPostTable.createdAt)
                        .limit(ITEMS_PER_PAGE)
                        .offset(offset),
                    conn_1.drizzlePool
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.jobHiringPostTable),
                ]);
                const jobPosts = posts;
                const count = countResult[0].count;
                // After fetching the posts, get company names, skills and categories for each post
                const postsWithRelations = await Promise.all(jobPosts.map(async (post) => {
                    // Get company name if companyId exists
                    let companyName = null;
                    if (post.companyId) {
                        const company = await conn_1.drizzlePool
                            .select({ officialName: schema_1.companyTable.officialName })
                            .from(schema_1.companyTable)
                            .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, post.companyId));
                        if (company && company.length > 0) {
                            companyName = company[0].officialName;
                        }
                    }
                    const [skills, categories] = await Promise.all([
                        this.getJobPostSkills(post.id, "hiring"),
                        this.getJobPostCategories(post.id, "hiring"),
                    ]);
                    return {
                        ...post,
                        companyName,
                        skills,
                        jobCategories: categories,
                    };
                }));
                return {
                    success: true,
                    status: 200,
                    msg: "Successfully retrieved job posts",
                    data: {
                        jobPosts: postsWithRelations,
                        pagination: {
                            currentPage: Number(page),
                            totalPages: Math.ceil(count / ITEMS_PER_PAGE),
                            totalItems: count,
                            itemsPerPage: ITEMS_PER_PAGE,
                        },
                    },
                };
            }
            // Build the WHERE clause conditions for filtered case
            const conditions = [];
            // Title filter
            if (title) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.jobHiringPostTable.title} ILIKE ${`%${title}%`}`);
            }
            // Provinces filter (multiple provinces support)
            if (provinces) {
                const provinceList = Array.isArray(provinces)
                    ? provinces.map((p) => p.toString())
                    : [provinces.toString()];
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.jobHiringPostTable.jobLocation} = ANY(${provinceList})`);
            }
            // Salary range filter
            if (salaryRange) {
                const salary = Number(salaryRange);
                if (!isNaN(salary)) {
                    conditions.push((0, drizzle_orm_1.sql) `${schema_1.jobHiringPostTable.salary} <= ${salary}`);
                }
            }
            // Build the base query
            const baseQuery = (0, drizzle_orm_1.sql) `
        SELECT 
          jp.id,
          jp.title,
          jp.description,
          jp.job_location as "jobLocation",
          jp.salary,
          jp.work_dates as "workDates",
          jp.work_hours_range as "workHoursRange",
          jp.hired_amount as "hiredAmount",
          jp.status,
          jp.job_hirer_type as "jobHirerType",
          jp.job_post_type as "jobPostType",
          jp.company_id as "companyId",
          jp.employer_id as "employerId",
          jp.oauth_employer_id as "oauthEmployerId",
          jp.created_at as "createdAt",
          jp.updated_at as "updatedAt"
        FROM job_hiring_post jp
        ${jobCategories
                ? (0, drizzle_orm_1.sql) `
          LEFT JOIN job_hire_category jhc ON jp.id = jhc.job_hiring_post_id
          WHERE jhc.job_category_id = ANY(${Array.isArray(jobCategories)
                    ? jobCategories.map((id) => id.toString())
                    : [jobCategories.toString()]})
          ${conditions.length ? (0, drizzle_orm_1.sql) `AND ${(0, drizzle_orm_1.and)(...conditions)}` : (0, drizzle_orm_1.sql) ``}
        `
                : conditions.length
                    ? (0, drizzle_orm_1.sql) `WHERE ${(0, drizzle_orm_1.and)(...conditions)}`
                    : (0, drizzle_orm_1.sql) ``}
        ${salarySort === "high-low"
                ? (0, drizzle_orm_1.sql) `ORDER BY jp.salary DESC`
                : salarySort === "low-high"
                    ? (0, drizzle_orm_1.sql) `ORDER BY jp.salary ASC`
                    : sortBy === "desc"
                        ? (0, drizzle_orm_1.sql) `ORDER BY jp.created_at DESC`
                        : (0, drizzle_orm_1.sql) `ORDER BY jp.created_at ASC`}
        LIMIT ${ITEMS_PER_PAGE}
        OFFSET ${offset}
      `;
            // Get total count
            const countQuery = (0, drizzle_orm_1.sql) `
        SELECT COUNT(*) as count
        FROM job_hiring_post jp
        ${jobCategories
                ? (0, drizzle_orm_1.sql) `
          LEFT JOIN job_hire_category jhc ON jp.id = jhc.job_hiring_post_id
          WHERE jhc.job_category_id = ANY(${Array.isArray(jobCategories)
                    ? jobCategories.map((id) => id.toString())
                    : [jobCategories.toString()]})
          ${conditions.length ? (0, drizzle_orm_1.sql) `AND ${(0, drizzle_orm_1.and)(...conditions)}` : (0, drizzle_orm_1.sql) ``}
        `
                : conditions.length
                    ? (0, drizzle_orm_1.sql) `WHERE ${(0, drizzle_orm_1.and)(...conditions)}`
                    : (0, drizzle_orm_1.sql) ``}
      `;
            // Execute both queries concurrently
            const [jobPostsResult, countResult] = await Promise.all([
                conn_1.drizzlePool.execute(baseQuery),
                conn_1.drizzlePool.execute(countQuery),
            ]);
            // Type cast with intermediate unknown type
            const jobPosts = jobPostsResult;
            const count = countResult[0].count;
            // After fetching the posts, get company names, skills and categories for each post
            const postsWithRelations = await Promise.all(jobPosts.map(async (post) => {
                // Get company name if companyId exists
                let companyName = null;
                if (post.companyId) {
                    const company = await conn_1.drizzlePool
                        .select({ officialName: schema_1.companyTable.officialName })
                        .from(schema_1.companyTable)
                        .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, post.companyId));
                    if (company && company.length > 0) {
                        companyName = company[0].officialName;
                    }
                }
                const [skills, categories] = await Promise.all([
                    this.getJobPostSkills(post.id, "hiring"),
                    this.getJobPostCategories(post.id, "hiring"),
                ]);
                return {
                    ...post,
                    companyName,
                    skills,
                    jobCategories: categories,
                };
            }));
            return {
                success: true,
                status: 200,
                msg: "Successfully retrieved job posts",
                data: {
                    jobPosts: postsWithRelations,
                    pagination: {
                        currentPage: Number(page),
                        totalPages: Math.ceil(Number(count) / ITEMS_PER_PAGE),
                        totalItems: Number(count),
                        itemsPerPage: ITEMS_PER_PAGE,
                    },
                },
            };
        }
        catch (error) {
            console.error("Error fetching job posts:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async createJobPostFromEmp(jobPostData, user) {
        try {
            if (!user) {
                throw errorServices_1.errorServices.handleAuthError();
            }
            // Create the job hiring post
            const [jobPost] = await conn_1.drizzlePool
                .insert(schema_1.jobHiringPostTable)
                .values({
                title: jobPostData.title,
                description: jobPostData.description ?? null,
                jobLocation: jobPostData.jobLocation,
                salary: jobPostData.salary,
                workDates: jobPostData.workDates,
                workHoursRange: jobPostData.workHoursRange,
                hiredAmount: jobPostData.hiredAmount,
                status: schema_1.postStatusEnum.enumValues[1], // UNMATCHED
                jobPostType: jobPostData.jobPostType,
                jobHirerType: user.isOauth
                    ? schema_1.jobHirerTypeEnum.enumValues[1]
                    : schema_1.jobHirerTypeEnum.enumValues[0], // OAUTH_EMPLOYER or EMPLOYER
                employerId: user.isOauth ? null : user.id,
                oauthEmployerId: user.isOauth ? user.id : null,
                companyId: null,
            })
                .returning();
            // Insert skills if provided
            if (jobPostData.skills && jobPostData.skills.length > 0) {
                await conn_1.drizzlePool.insert(schema_1.jobHiringPostSkillTable).values(jobPostData.skills.map((skillId) => ({
                    jobHiringPostId: jobPost.id,
                    skillId,
                })));
            }
            // Insert categories if provided
            if (jobPostData.jobCategories && jobPostData.jobCategories.length > 0) {
                await conn_1.drizzlePool.insert(schema_1.jobHireCategoryTable).values(jobPostData.jobCategories.map((categoryId) => ({
                    jobHiringPostId: jobPost.id,
                    jobCategoryId: categoryId,
                })));
            }
            // Get the skills and categories for the response
            const [skills, categories] = await Promise.all([
                this.getJobPostSkills(jobPost.id, "hiring"),
                this.getJobPostCategories(jobPost.id, "hiring"),
            ]);
            return {
                success: true,
                status: 201,
                msg: "Job hiring post created successfully",
                data: { ...jobPost, skills, jobCategories: categories },
            };
        }
        catch (error) {
            console.error("Error creating job hiring post:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async createJobPostFromCompany(jobPostData, user) {
        try {
            if (!user) {
                throw errorServices_1.errorServices.handleAuthError();
            }
            // Create the job hiring post
            const [jobPost] = await conn_1.drizzlePool
                .insert(schema_1.jobHiringPostTable)
                .values({
                title: jobPostData.title,
                description: jobPostData.description ?? null,
                jobLocation: jobPostData.jobLocation,
                salary: jobPostData.salary,
                workDates: jobPostData.workDates,
                workHoursRange: jobPostData.workHoursRange,
                hiredAmount: jobPostData.hiredAmount,
                status: schema_1.postStatusEnum.enumValues[1], // UNMATCHED
                jobPostType: jobPostData.jobPostType,
                jobHirerType: schema_1.jobHirerTypeEnum.enumValues[2], // COMPANY
                employerId: null,
                oauthEmployerId: null,
                companyId: user.id,
            })
                .returning();
            // Insert skills if provided
            if (jobPostData.skills && jobPostData.skills.length > 0) {
                await conn_1.drizzlePool.insert(schema_1.jobHiringPostSkillTable).values(jobPostData.skills.map((skillId) => ({
                    jobHiringPostId: jobPost.id,
                    skillId,
                })));
            }
            // Insert categories if provided
            if (jobPostData.jobCategories && jobPostData.jobCategories.length > 0) {
                await conn_1.drizzlePool.insert(schema_1.jobHireCategoryTable).values(jobPostData.jobCategories.map((categoryId) => ({
                    jobHiringPostId: jobPost.id,
                    jobCategoryId: categoryId,
                })));
            }
            // Get the skills and categories for the response
            const [skills, categories] = await Promise.all([
                this.getJobPostSkills(jobPost.id, "hiring"),
                this.getJobPostCategories(jobPost.id, "hiring"),
            ]);
            // Get company name
            const [company] = await conn_1.drizzlePool
                .select({ officialName: schema_1.companyTable.officialName })
                .from(schema_1.companyTable)
                .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, user.id));
            return {
                success: true,
                status: 201,
                msg: "Job hiring post created successfully",
                data: {
                    ...jobPost,
                    companyName: company?.officialName || null,
                    skills,
                    jobCategories: categories,
                },
            };
        }
        catch (error) {
            console.error("Error creating job hiring post:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async updateJobPost(id, jobPostData, user) {
        try {
            if (!user) {
                throw errorServices_1.errorServices.handleAuthError();
            }
            // Get the job post and check if it exists
            const [jobPost] = await conn_1.drizzlePool
                .select()
                .from(schema_1.jobHiringPostTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.id, id));
            if (!jobPost) {
                throw errorServices_1.errorServices.handleNotFoundError("Job post");
            }
            // Check if the user is the owner of the post
            let isOwner = false;
            if ("isOauth" in user) {
                // TEmployerSession
                isOwner = user.isOauth
                    ? jobPost.oauthEmployerId === user.id
                    : jobPost.employerId === user.id;
            }
            else {
                // TCompanySession
                isOwner = jobPost.companyId === user.id;
            }
            if (!isOwner) {
                throw errorServices_1.errorServices.handleForbiddenError("You are not authorized to update this job post");
            }
            // Start a transaction to update everything atomically
            return await conn_1.drizzlePool.transaction(async (tx) => {
                // Update the job post
                const [updatedPost] = await tx
                    .update(schema_1.jobHiringPostTable)
                    .set({
                    title: jobPostData.title,
                    description: jobPostData.description ?? null,
                    jobLocation: jobPostData.jobLocation,
                    salary: jobPostData.salary,
                    workDates: jobPostData.workDates,
                    workHoursRange: jobPostData.workHoursRange,
                    hiredAmount: jobPostData.hiredAmount,
                    jobPostType: jobPostData.jobPostType,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.id, id))
                    .returning();
                // Always delete existing relations first
                await tx
                    .delete(schema_1.jobHiringPostSkillTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.jobHiringPostSkillTable.jobHiringPostId, id));
                await tx
                    .delete(schema_1.jobHireCategoryTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.jobHireCategoryTable.jobHiringPostId, id));
                // Insert new skills relations if provided
                if (jobPostData.skills && jobPostData.skills.length > 0) {
                    await tx.insert(schema_1.jobHiringPostSkillTable).values(jobPostData.skills.map((skillId) => ({
                        jobHiringPostId: id,
                        skillId: skillId,
                    })));
                }
                // Insert new job category relations if provided
                if (jobPostData.jobCategories && jobPostData.jobCategories.length > 0) {
                    await tx.insert(schema_1.jobHireCategoryTable).values(jobPostData.jobCategories.map((categoryId) => ({
                        jobHiringPostId: id,
                        jobCategoryId: categoryId,
                    })));
                }
                // Get updated skills and categories
                const skills = jobPostData.skills && jobPostData.skills.length > 0
                    ? await tx
                        .select()
                        .from(schema_1.skillTable)
                        .where((0, drizzle_orm_1.inArray)(schema_1.skillTable.id, jobPostData.skills))
                    : [];
                const categories = jobPostData.jobCategories && jobPostData.jobCategories.length > 0
                    ? await tx
                        .select()
                        .from(schema_1.jobCategoryTable)
                        .where((0, drizzle_orm_1.inArray)(schema_1.jobCategoryTable.id, jobPostData.jobCategories))
                    : [];
                return {
                    success: true,
                    status: 200,
                    msg: "Job post updated successfully",
                    data: {
                        ...updatedPost,
                        skills,
                        jobCategories: categories,
                    },
                };
            });
        }
        catch (error) {
            console.error("Error updating job post:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async getJobPost(id) {
        try {
            const jobPost = await conn_1.drizzlePool
                .select({
                id: schema_1.jobHiringPostTable.id,
                title: schema_1.jobHiringPostTable.title,
                description: schema_1.jobHiringPostTable.description,
                jobLocation: schema_1.jobHiringPostTable.jobLocation,
                salary: schema_1.jobHiringPostTable.salary,
                workDates: schema_1.jobHiringPostTable.workDates,
                workHoursRange: schema_1.jobHiringPostTable.workHoursRange,
                hiredAmount: schema_1.jobHiringPostTable.hiredAmount,
                status: schema_1.jobHiringPostTable.status,
                jobHirerType: schema_1.jobHiringPostTable.jobHirerType,
                jobPostType: schema_1.jobHiringPostTable.jobPostType,
                employerId: schema_1.jobHiringPostTable.employerId,
                oauthEmployerId: schema_1.jobHiringPostTable.oauthEmployerId,
                companyId: schema_1.jobHiringPostTable.companyId,
                createdAt: schema_1.jobHiringPostTable.createdAt,
                updatedAt: schema_1.jobHiringPostTable.updatedAt,
            })
                .from(schema_1.jobHiringPostTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.id, id));
            if (!jobPost || jobPost.length === 0) {
                throw errorServices_1.errorServices.handleNotFoundError("Job post");
            }
            // Fetch company name if companyId exists
            let companyName = null;
            if (jobPost[0].companyId) {
                const company = await conn_1.drizzlePool
                    .select({ officialName: schema_1.companyTable.officialName })
                    .from(schema_1.companyTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, jobPost[0].companyId));
                if (company && company.length > 0) {
                    companyName = company[0].officialName;
                }
            }
            // Fetch skills and categories
            const [skills, categories] = await Promise.all([
                this.getJobPostSkills(id, "hiring"),
                this.getJobPostCategories(id, "hiring"),
            ]);
            const postWithRelations = {
                ...jobPost[0],
                companyName,
                skills,
                jobCategories: categories,
            };
            return {
                success: true,
                status: 200,
                msg: "Job post fetched successfully",
                data: postWithRelations,
            };
        }
        catch (error) {
            console.error("Error fetching job post:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async deleteJobPost(id, user) {
        try {
            if (!user) {
                throw errorServices_1.errorServices.handleAuthError();
            }
            // Get the job post and check if it exists
            const [jobPost] = await conn_1.drizzlePool
                .select()
                .from(schema_1.jobHiringPostTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.id, id));
            if (!jobPost) {
                throw errorServices_1.errorServices.handleNotFoundError("Job post");
            }
            // Check if the user is the owner of the post
            let isOwner = false;
            if ("isOauth" in user) {
                // TEmployerSession
                isOwner = user.isOauth
                    ? jobPost.oauthEmployerId === user.id
                    : jobPost.employerId === user.id;
            }
            else {
                // TCompanySession
                isOwner = jobPost.companyId === user.id;
            }
            if (!isOwner) {
                throw errorServices_1.errorServices.handleForbiddenError("You are not authorized to delete this job post");
            }
            // Delete the job post
            const [deletedPost] = await conn_1.drizzlePool
                .delete(schema_1.jobHiringPostTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.id, id))
                .returning();
            return {
                success: true,
                status: 200,
                msg: "Job post deleted successfully",
                data: deletedPost,
            };
        }
        catch (error) {
            console.error("Error deleting job post:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async getJobPostSkills(postId, type) {
        const skillsTable = type === "hiring" ? schema_1.jobHiringPostSkillTable : schema_1.jobFindingPostSkillTable;
        const postIdField = type === "hiring" ? "jobHiringPostId" : "jobFindingPostId";
        return await conn_1.drizzlePool
            .select({
            id: schema_1.skillTable.id,
            name: schema_1.skillTable.name,
            description: schema_1.skillTable.description,
        })
            .from(skillsTable)
            .innerJoin(schema_1.skillTable, (0, drizzle_orm_1.eq)(skillsTable.skillId, schema_1.skillTable.id))
            .where((0, drizzle_orm_1.eq)(skillsTable[postIdField], postId));
    }
    async getJobPostCategories(postId, type) {
        const categoriesTable = type === "hiring" ? schema_1.jobHireCategoryTable : schema_1.jobFindCategoryTable;
        const postIdField = type === "hiring" ? "jobHiringPostId" : "jobFindingPostId";
        return await conn_1.drizzlePool
            .select({
            id: schema_1.jobCategoryTable.id,
            name: schema_1.jobCategoryTable.name,
            description: schema_1.jobCategoryTable.description,
        })
            .from(categoriesTable)
            .innerJoin(schema_1.jobCategoryTable, (0, drizzle_orm_1.eq)(categoriesTable.jobCategoryId, schema_1.jobCategoryTable.id))
            .where((0, drizzle_orm_1.eq)(categoriesTable[postIdField], postId));
    }
    async getAllJobFindingPosts(queryParams) {
        try {
            const { title, provinces, jobCategories, salaryRange, sortBy = "desc", salarySort, page = 1, } = queryParams;
            const ITEMS_PER_PAGE = 10;
            const offset = (Number(page) - 1) * ITEMS_PER_PAGE;
            // Check if any filters are applied
            const hasFilters = !!(title || provinces || jobCategories || salaryRange);
            if (!hasFilters) {
                // Use simple Drizzle query for no filters case
                const [posts, countResult] = await Promise.all([
                    conn_1.drizzlePool
                        .select({
                        id: schema_1.jobFindingPostTable.id,
                        title: schema_1.jobFindingPostTable.title,
                        description: schema_1.jobFindingPostTable.description,
                        jobLocation: schema_1.jobFindingPostTable.jobLocation,
                        expectedSalary: schema_1.jobFindingPostTable.expectedSalary,
                        workDates: schema_1.jobFindingPostTable.workDates,
                        workHoursRange: schema_1.jobFindingPostTable.workHoursRange,
                        status: schema_1.jobFindingPostTable.status,
                        jobPostType: schema_1.jobFindingPostTable.jobPostType,
                        jobSeekerType: schema_1.jobFindingPostTable.jobSeekerType,
                        jobSeekerId: schema_1.jobFindingPostTable.jobSeekerId,
                        oauthJobSeekerId: schema_1.jobFindingPostTable.oauthJobSeekerId,
                        createdAt: schema_1.jobFindingPostTable.createdAt,
                        updatedAt: schema_1.jobFindingPostTable.updatedAt,
                    })
                        .from(schema_1.jobFindingPostTable)
                        .orderBy(salarySort === "high-low"
                        ? (0, drizzle_orm_1.desc)(schema_1.jobFindingPostTable.expectedSalary)
                        : salarySort === "low-high"
                            ? schema_1.jobFindingPostTable.expectedSalary
                            : sortBy === "desc"
                                ? (0, drizzle_orm_1.desc)(schema_1.jobFindingPostTable.createdAt)
                                : schema_1.jobFindingPostTable.createdAt)
                        .limit(ITEMS_PER_PAGE)
                        .offset(offset),
                    conn_1.drizzlePool
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.jobFindingPostTable),
                ]);
                const count = countResult[0].count;
                // After fetching the posts, get skills and categories for each post
                const postsWithRelations = await Promise.all(posts.map(async (post) => {
                    const [skills, categories] = await Promise.all([
                        this.getJobPostSkills(post.id, "finding"),
                        this.getJobPostCategories(post.id, "finding"),
                    ]);
                    return {
                        ...post,
                        skills,
                        jobCategories: categories,
                    };
                }));
                return {
                    success: true,
                    status: 200,
                    msg: "Successfully retrieved job finding posts",
                    data: {
                        jobPosts: postsWithRelations,
                        pagination: {
                            currentPage: Number(page),
                            totalPages: Math.ceil(count / ITEMS_PER_PAGE),
                            totalItems: count,
                            itemsPerPage: ITEMS_PER_PAGE,
                        },
                    },
                };
            }
            // Build the WHERE clause conditions for filtered case
            const conditions = [];
            // Title filter
            if (title) {
                conditions.push((0, drizzle_orm_1.sql) `LOWER(${schema_1.jobFindingPostTable.title}) ILIKE LOWER(${"%" + title + "%"})`);
            }
            // Provinces filter (multiple provinces support)
            if (provinces) {
                const provinceList = Array.isArray(provinces)
                    ? provinces.map((p) => p.toString())
                    : [provinces.toString()];
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.jobFindingPostTable.jobLocation} = ANY(${provinceList})`);
            }
            // Salary range filter
            if (salaryRange) {
                const salary = Number(salaryRange);
                if (!isNaN(salary)) {
                    conditions.push((0, drizzle_orm_1.sql) `${schema_1.jobFindingPostTable.expectedSalary} <= ${salary}`);
                }
            }
            // Build the base query
            const baseQuery = (0, drizzle_orm_1.sql) `
        SELECT DISTINCT
          jp.id,
          jp.title,
          jp.description,
          jp.job_location as "jobLocation",
          jp.expected_salary as "expectedSalary",
          jp.work_dates as "workDates",
          jp.work_hours_range as "workHoursRange",
          jp.status,
          jp.job_post_type as "jobPostType",
          jp.job_seeker_type as "jobSeekerType",
          jp.job_seeker_id as "jobSeekerId",
          jp.oauth_job_seeker_id as "oauthJobSeekerId",
          jp.created_at as "createdAt",
          jp.updated_at as "updatedAt"
        FROM job_finding_post jp
        ${jobCategories
                ? (0, drizzle_orm_1.sql) `
          LEFT JOIN job_find_category jfc ON jp.id = jfc.job_finding_post_id
          WHERE jfc.job_category_id = ANY(${Array.isArray(jobCategories)
                    ? jobCategories.map((id) => id.toString())
                    : [jobCategories.toString()]})
          ${conditions.length ? (0, drizzle_orm_1.sql) `AND ${(0, drizzle_orm_1.and)(...conditions)}` : (0, drizzle_orm_1.sql) ``}
        `
                : conditions.length
                    ? (0, drizzle_orm_1.sql) `WHERE ${(0, drizzle_orm_1.and)(...conditions)}`
                    : (0, drizzle_orm_1.sql) ``}
        ${salarySort === "high-low"
                ? (0, drizzle_orm_1.sql) `ORDER BY jp.expected_salary DESC`
                : salarySort === "low-high"
                    ? (0, drizzle_orm_1.sql) `ORDER BY jp.expected_salary ASC`
                    : sortBy === "desc"
                        ? (0, drizzle_orm_1.sql) `ORDER BY jp.created_at DESC`
                        : (0, drizzle_orm_1.sql) `ORDER BY jp.created_at ASC`}
        LIMIT ${ITEMS_PER_PAGE}
        OFFSET ${offset}
      `;
            // Get total count
            const countQuery = (0, drizzle_orm_1.sql) `
        SELECT COUNT(DISTINCT jp.id) as count
        FROM job_finding_post jp
        ${jobCategories
                ? (0, drizzle_orm_1.sql) `
          LEFT JOIN job_find_category jfc ON jp.id = jfc.job_finding_post_id
          WHERE jfc.job_category_id = ANY(${Array.isArray(jobCategories)
                    ? jobCategories.map((id) => id.toString())
                    : [jobCategories.toString()]})
          ${conditions.length ? (0, drizzle_orm_1.sql) `AND ${(0, drizzle_orm_1.and)(...conditions)}` : (0, drizzle_orm_1.sql) ``}
        `
                : conditions.length
                    ? (0, drizzle_orm_1.sql) `WHERE ${(0, drizzle_orm_1.and)(...conditions)}`
                    : (0, drizzle_orm_1.sql) ``}
      `;
            // Execute both queries concurrently
            const [jobPostsResult, countResult] = await Promise.all([
                conn_1.drizzlePool.execute(baseQuery),
                conn_1.drizzlePool.execute(countQuery),
            ]);
            const jobPosts = jobPostsResult;
            const count = countResult[0].count;
            // After fetching the posts, get skills and categories for each post
            const postsWithRelations = await Promise.all(jobPosts.map(async (post) => {
                const [skills, categories] = await Promise.all([
                    this.getJobPostSkills(post.id, "finding"),
                    this.getJobPostCategories(post.id, "finding"),
                ]);
                return {
                    ...post,
                    skills,
                    jobCategories: categories,
                };
            }));
            return {
                success: true,
                status: 200,
                msg: "Successfully retrieved job finding posts",
                data: {
                    jobPosts: postsWithRelations,
                    pagination: {
                        currentPage: Number(page),
                        totalPages: Math.ceil(Number(count) / ITEMS_PER_PAGE),
                        totalItems: Number(count),
                        itemsPerPage: ITEMS_PER_PAGE,
                    },
                },
            };
        }
        catch (error) {
            console.error("Error in getAllJobFindingPosts:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async createJobFindingPost(jobPostData, user) {
        try {
            if (!user) {
                throw errorServices_1.errorServices.handleAuthError();
            }
            // Determine if user is OAuth or normal job seeker
            const isOauth = user.isOauth;
            const [newPost] = await conn_1.drizzlePool
                .insert(schema_1.jobFindingPostTable)
                .values({
                title: jobPostData.title,
                description: jobPostData.description ?? null,
                jobLocation: jobPostData.jobLocation,
                expectedSalary: jobPostData.expectedSalary,
                workDates: jobPostData.workDates,
                workHoursRange: jobPostData.workHoursRange,
                jobPostType: jobPostData.jobPostType,
                jobSeekerType: isOauth ? "OAUTH" : "NORMAL",
                status: schema_1.postStatusEnum.enumValues[1], // UNMATCHED
                jobSeekerId: isOauth ? null : user.id,
                oauthJobSeekerId: isOauth ? user.id : null,
            })
                .returning();
            if (jobPostData.skills && jobPostData.skills.length > 0) {
                await conn_1.drizzlePool.insert(schema_1.jobFindingPostSkillTable).values(jobPostData.skills.map((skillId) => ({
                    jobFindingPostId: newPost.id,
                    skillId,
                })));
            }
            if (jobPostData.jobCategories && jobPostData.jobCategories.length > 0) {
                await conn_1.drizzlePool.insert(schema_1.jobFindCategoryTable).values(jobPostData.jobCategories.map((categoryId) => ({
                    jobFindingPostId: newPost.id,
                    jobCategoryId: categoryId,
                })));
            }
            const [skills, categories] = await Promise.all([
                this.getJobPostSkills(newPost.id, "finding"),
                this.getJobPostCategories(newPost.id, "finding"),
            ]);
            return {
                success: true,
                status: 201,
                msg: "Successfully created job finding post",
                data: {
                    ...newPost,
                    skills,
                    jobCategories: categories,
                },
            };
        }
        catch (error) {
            console.error("Error in createJobFindingPost:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async updateJobFindingPost(postId, jobPostData, user) {
        try {
            const existingPost = await conn_1.drizzlePool
                .select()
                .from(schema_1.jobFindingPostTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.id, postId), user.isOauth
                ? (0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.oauthJobSeekerId, user.id)
                : (0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.jobSeekerId, user.id)))
                .limit(1);
            if (!existingPost.length) {
                throw errorServices_1.errorServices.handleNotFoundError("Job finding post");
            }
            const [updatedPost] = await conn_1.drizzlePool
                .update(schema_1.jobFindingPostTable)
                .set({
                title: jobPostData.title,
                description: jobPostData.description ?? null,
                jobLocation: jobPostData.jobLocation,
                expectedSalary: jobPostData.expectedSalary,
                workDates: jobPostData.workDates,
                workHoursRange: jobPostData.workHoursRange,
                jobPostType: jobPostData.jobPostType,
                jobSeekerType: jobPostData.jobSeekerType,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.id, postId))
                .returning();
            if (jobPostData.skills) {
                await conn_1.drizzlePool
                    .delete(schema_1.jobFindingPostSkillTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.jobFindingPostSkillTable.jobFindingPostId, postId));
                await conn_1.drizzlePool.insert(schema_1.jobFindingPostSkillTable).values(jobPostData.skills.map((skillId) => ({
                    jobFindingPostId: postId,
                    skillId,
                })));
            }
            if (jobPostData.jobCategories) {
                await conn_1.drizzlePool
                    .delete(schema_1.jobFindCategoryTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.jobFindCategoryTable.jobFindingPostId, postId));
                await conn_1.drizzlePool.insert(schema_1.jobFindCategoryTable).values(jobPostData.jobCategories.map((categoryId) => ({
                    jobFindingPostId: postId,
                    jobCategoryId: categoryId,
                })));
            }
            const [skills, categories] = await Promise.all([
                this.getJobPostSkills(postId, "finding"),
                this.getJobPostCategories(postId, "finding"),
            ]);
            return {
                success: true,
                status: 200,
                msg: "Successfully updated job finding post",
                data: {
                    ...updatedPost,
                    skills,
                    jobCategories: categories,
                },
            };
        }
        catch (error) {
            console.error("Error in updateJobFindingPost:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async getJobFindingPost(postId) {
        try {
            const [post] = await conn_1.drizzlePool
                .select({
                id: schema_1.jobFindingPostTable.id,
                title: schema_1.jobFindingPostTable.title,
                description: schema_1.jobFindingPostTable.description,
                jobLocation: schema_1.jobFindingPostTable.jobLocation,
                expectedSalary: schema_1.jobFindingPostTable.expectedSalary,
                workDates: schema_1.jobFindingPostTable.workDates,
                workHoursRange: schema_1.jobFindingPostTable.workHoursRange,
                status: schema_1.jobFindingPostTable.status,
                jobPostType: schema_1.jobFindingPostTable.jobPostType,
                jobSeekerType: schema_1.jobFindingPostTable.jobSeekerType,
                jobSeekerId: schema_1.jobFindingPostTable.jobSeekerId,
                oauthJobSeekerId: schema_1.jobFindingPostTable.oauthJobSeekerId,
                createdAt: schema_1.jobFindingPostTable.createdAt,
                updatedAt: schema_1.jobFindingPostTable.updatedAt,
            })
                .from(schema_1.jobFindingPostTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.id, postId))
                .limit(1);
            if (!post) {
                throw errorServices_1.errorServices.handleNotFoundError("Job finding post");
            }
            const [skills, categories] = await Promise.all([
                this.getJobPostSkills(postId, "finding"),
                this.getJobPostCategories(postId, "finding"),
            ]);
            return {
                success: true,
                status: 200,
                msg: "Successfully retrieved job finding post",
                data: { ...post, skills, jobCategories: categories },
            };
        }
        catch (error) {
            console.error("Error in getJobFindingPost:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async deleteJobFindingPost(postId, user) {
        try {
            // First check if the post exists and belongs to the user
            const [existingPost] = await conn_1.drizzlePool
                .select()
                .from(schema_1.jobFindingPostTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.id, postId))
                .limit(1);
            if (!existingPost) {
                throw errorServices_1.errorServices.handleNotFoundError("Job finding post");
            }
            // Check ownership based on user type (using isOauth)
            const isOwner = user.isOauth
                ? existingPost.oauthJobSeekerId === user.id
                : existingPost.jobSeekerId === user.id;
            if (!isOwner) {
                throw errorServices_1.errorServices.handleForbiddenError("You are not authorized to delete this job post");
            }
            // Now delete the post
            const [deletedPost] = await conn_1.drizzlePool
                .delete(schema_1.jobFindingPostTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.id, postId))
                .returning();
            return {
                success: true,
                status: 200,
                msg: "Successfully deleted job finding post",
                data: deletedPost,
            };
        }
        catch (error) {
            console.error("Error in deleteJobFindingPost:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async getJobFindingPostsByUser(userId, isOauth) {
        try {
            const posts = await conn_1.drizzlePool
                .select({
                id: schema_1.jobFindingPostTable.id,
                title: schema_1.jobFindingPostTable.title,
                description: schema_1.jobFindingPostTable.description,
                jobLocation: schema_1.jobFindingPostTable.jobLocation,
                expectedSalary: schema_1.jobFindingPostTable.expectedSalary,
                workDates: schema_1.jobFindingPostTable.workDates,
                workHoursRange: schema_1.jobFindingPostTable.workHoursRange,
                status: schema_1.jobFindingPostTable.status,
                jobPostType: schema_1.jobFindingPostTable.jobPostType,
                jobSeekerType: schema_1.jobFindingPostTable.jobSeekerType,
                jobSeekerId: schema_1.jobFindingPostTable.jobSeekerId,
                oauthJobSeekerId: schema_1.jobFindingPostTable.oauthJobSeekerId,
                createdAt: schema_1.jobFindingPostTable.createdAt,
                updatedAt: schema_1.jobFindingPostTable.updatedAt,
            })
                .from(schema_1.jobFindingPostTable)
                .where(isOauth
                ? (0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.oauthJobSeekerId, userId)
                : (0, drizzle_orm_1.eq)(schema_1.jobFindingPostTable.jobSeekerId, userId));
            const postsWithRelations = await Promise.all(posts.map(async (post) => {
                const [skills, categories] = await Promise.all([
                    this.getJobPostSkills(post.id, "finding"),
                    this.getJobPostCategories(post.id, "finding"),
                ]);
                return {
                    ...post,
                    skills,
                    jobCategories: categories,
                };
            }));
            return {
                success: true,
                status: 200,
                msg: "Successfully retrieved user's job finding posts",
                data: {
                    jobPosts: postsWithRelations,
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: postsWithRelations.length,
                        itemsPerPage: postsWithRelations.length,
                    },
                },
            };
        }
        catch (error) {
            console.error("Error in getJobFindingPostsByUser:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async getJobPostsByEmployer(userId, isOauth) {
        try {
            const posts = await conn_1.drizzlePool
                .select({
                id: schema_1.jobHiringPostTable.id,
                title: schema_1.jobHiringPostTable.title,
                description: schema_1.jobHiringPostTable.description,
                jobLocation: schema_1.jobHiringPostTable.jobLocation,
                salary: schema_1.jobHiringPostTable.salary,
                workDates: schema_1.jobHiringPostTable.workDates,
                workHoursRange: schema_1.jobHiringPostTable.workHoursRange,
                hiredAmount: schema_1.jobHiringPostTable.hiredAmount,
                status: schema_1.jobHiringPostTable.status,
                jobHirerType: schema_1.jobHiringPostTable.jobHirerType,
                jobPostType: schema_1.jobHiringPostTable.jobPostType,
                employerId: schema_1.jobHiringPostTable.employerId,
                oauthEmployerId: schema_1.jobHiringPostTable.oauthEmployerId,
                companyId: schema_1.jobHiringPostTable.companyId,
                createdAt: schema_1.jobHiringPostTable.createdAt,
                updatedAt: schema_1.jobHiringPostTable.updatedAt,
            })
                .from(schema_1.jobHiringPostTable)
                .where(isOauth
                ? (0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.oauthEmployerId, userId)
                : (0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.employerId, userId));
            const postsWithRelations = await Promise.all(posts.map(async (post) => {
                const [skills, categories] = await Promise.all([
                    this.getJobPostSkills(post.id, "hiring"),
                    this.getJobPostCategories(post.id, "hiring"),
                ]);
                return { ...post, skills, jobCategories: categories };
            }));
            return {
                success: true,
                status: 200,
                msg: "Successfully retrieved employer's job posts",
                data: {
                    jobPosts: postsWithRelations,
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: postsWithRelations.length,
                        itemsPerPage: postsWithRelations.length,
                    },
                },
            };
        }
        catch (error) {
            console.error("Error in getJobPostsByEmployer:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
    async getJobPostsByCompany(companyId) {
        try {
            const posts = await conn_1.drizzlePool
                .select({
                id: schema_1.jobHiringPostTable.id,
                title: schema_1.jobHiringPostTable.title,
                description: schema_1.jobHiringPostTable.description,
                jobLocation: schema_1.jobHiringPostTable.jobLocation,
                salary: schema_1.jobHiringPostTable.salary,
                workDates: schema_1.jobHiringPostTable.workDates,
                workHoursRange: schema_1.jobHiringPostTable.workHoursRange,
                hiredAmount: schema_1.jobHiringPostTable.hiredAmount,
                status: schema_1.jobHiringPostTable.status,
                jobHirerType: schema_1.jobHiringPostTable.jobHirerType,
                jobPostType: schema_1.jobHiringPostTable.jobPostType,
                employerId: schema_1.jobHiringPostTable.employerId,
                oauthEmployerId: schema_1.jobHiringPostTable.oauthEmployerId,
                companyId: schema_1.jobHiringPostTable.companyId,
                createdAt: schema_1.jobHiringPostTable.createdAt,
                updatedAt: schema_1.jobHiringPostTable.updatedAt,
            })
                .from(schema_1.jobHiringPostTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobHiringPostTable.companyId, companyId));
            // Get company name
            const [company] = await conn_1.drizzlePool
                .select({ officialName: schema_1.companyTable.officialName })
                .from(schema_1.companyTable)
                .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, companyId));
            const companyName = company ? company.officialName : null;
            const postsWithRelations = await Promise.all(posts.map(async (post) => {
                const [skills, categories] = await Promise.all([
                    this.getJobPostSkills(post.id, "hiring"),
                    this.getJobPostCategories(post.id, "hiring"),
                ]);
                return {
                    ...post,
                    companyName,
                    skills,
                    jobCategories: categories,
                };
            }));
            return {
                success: true,
                status: 200,
                msg: "Successfully retrieved company's job posts",
                data: {
                    jobPosts: postsWithRelations,
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: postsWithRelations.length,
                        itemsPerPage: postsWithRelations.length,
                    },
                },
            };
        }
        catch (error) {
            console.error("Error in getJobPostsByCompany:", error);
            throw errorServices_1.errorServices.handleServerError(error);
        }
    }
}
exports.postServices = postServices;
