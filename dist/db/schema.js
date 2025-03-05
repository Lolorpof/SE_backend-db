"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobFindingPostMatchedRelation = exports.jobHireCategoryRelation = exports.jobFindCategoryRelation = exports.jobCategoryRelation = exports.jobHiringPostRelation = exports.jobFindingPostRelation = exports.adminRelation = exports.companyRelation = exports.oauthEmployerRelation = exports.employerRelation = exports.oauthJobSeekerRelation = exports.jobSeekerRelation = exports.userSessionsTable = exports.notificationTable = exports.registrationApprovalTable = exports.jobHiringPostSkillTable = exports.jobFindingPostSkillTable = exports.jobSeekerSkillTable = exports.oauthJobSeekerSkillTable = exports.skillTable = exports.jobSeekerVulnerabilityTable = exports.oauthJobSeekerVulnerabilityTable = exports.vulnerabilityTypeTable = exports.jobFindingPostMatchedTable = exports.jobHiringPostMatchedSeekersTable = exports.jobHiringPostMatchedTable = exports.jobHiringPostTable = exports.jobFindingPostTable = exports.jobHireCategoryTable = exports.jobFindCategoryTable = exports.jobCategoryTable = exports.adminTable = exports.companyTable = exports.oauthEmployerTable = exports.employerTable = exports.oauthJobSeekerTable = exports.jobSeekerTable = exports.providerEnum = exports.severityLvlEnum = exports.notificationStatusEnum = exports.usersApprovalStatusEnum = exports.approvalStatusEnum = exports.jobMatchedStatusEnum = exports.postStatusEnum = exports.publicStatusEnum = exports.jobPostTypeEnum = exports.jobHirerTypeEnum = exports.jobSeekerTypeEnum = exports.normalUserTypeEnum = exports.userTypeEnum = void 0;
exports.notificationRelation = exports.registrationApprovalRelation = exports.oauthJobSeekerVulnerabilityRelation = exports.jobSeekerVulnerabilityRelation = exports.vulnerabilityTypeRelation = exports.jobHiringPostSkillRelation = exports.jobFindingPostSkillRelation = exports.oauthJobSeekerSkillRelation = exports.jobSeekerSkillRelation = exports.skillRelation = exports.jobHiringPostMatchedSeekersRelation = exports.jobHiringPostMatchedRelation = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const undef = "UNDEFINED";
// Enum
// {User}
exports.userTypeEnum = (0, pg_core_1.pgEnum)("userType", [
    "JOBSEEKER",
    "OAUTH_JOBSEEKER",
    "EMPLOYER",
    "OAUTH_EMPLOYER",
    "COMPANY",
    "ADMIN",
]);
exports.normalUserTypeEnum = (0, pg_core_1.pgEnum)("normalUserType", [
    "JOBSEEKER",
    "OAUTHJOBSEEKER",
    "EMPLOYER",
    "OAUTHEMPLOYER",
    "COMPANY",
]);
exports.jobSeekerTypeEnum = (0, pg_core_1.pgEnum)("jobSeekerType", ["NORMAL", "OAUTH"]);
exports.jobHirerTypeEnum = (0, pg_core_1.pgEnum)("jobHirerType", [
    "EMPLOYER",
    "OAUTHEMPLOYER",
    "COMPANY",
]);
exports.jobPostTypeEnum = (0, pg_core_1.pgEnum)("jobPostType", [
    "FULLTIME",
    "PARTTIME",
    "FREELANCE",
]);
// {Status}
exports.publicStatusEnum = (0, pg_core_1.pgEnum)("publicStatus", ["SHOWN", "HIDDEN"]);
exports.postStatusEnum = (0, pg_core_1.pgEnum)("postStatus", [
    "MATCHED",
    "UNMATCHED",
    "MATCHED_INPROG",
]);
exports.jobMatchedStatusEnum = (0, pg_core_1.pgEnum)("jobMatchedStatus", [
    "INPROGRESS",
    "ACCEPTED",
    "DENIED",
]);
exports.approvalStatusEnum = (0, pg_core_1.pgEnum)("approvalStatus", [
    "ACCEPTED",
    "DENIED",
    "UNAPPROVED",
]); // in 'registration_approval' table
exports.usersApprovalStatusEnum = (0, pg_core_1.pgEnum)("userApprovalStatus", [
    "APPROVED",
    "UNAPPROVED",
]);
exports.notificationStatusEnum = (0, pg_core_1.pgEnum)("notificationStatus", [
    "READ",
    "UNREAD",
]);
// {Others}
exports.severityLvlEnum = (0, pg_core_1.pgEnum)("severityLvl", ["LOW", "MEDIUM", "HIGH"]);
exports.providerEnum = (0, pg_core_1.pgEnum)("providerType", ["GOOGLE", "LINE"]);
// Tables
//{Users Type}
exports.jobSeekerTable = (0, pg_core_1.pgTable)("job_seeker", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    username: (0, pg_core_1.varchar)("username", { length: 255 }).notNull(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 255 }).notNull(),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    profilePicture: (0, pg_core_1.varchar)("profile_picture", { length: 255 })
        .notNull()
        .default(undef),
    aboutMe: (0, pg_core_1.varchar)("about_me", { length: 2050 }),
    contact: (0, pg_core_1.varchar)("contact", { length: 255 }),
    resume: (0, pg_core_1.varchar)("resume", { length: 255 }).notNull().default(undef),
    provinceAddress: (0, pg_core_1.varchar)("province_address", { length: 64 }),
    address: (0, pg_core_1.varchar)("address", { length: 255 }),
    approvalStatus: (0, exports.usersApprovalStatusEnum)("approval_status")
        .notNull()
        .default("UNAPPROVED"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        uniqueName: (0, pg_core_1.unique)().on(t.firstName, t.lastName),
        uniqueAccount: (0, pg_core_1.unique)().on(t.username, t.password),
    },
]);
exports.oauthJobSeekerTable = (0, pg_core_1.pgTable)("oauth_job_seeker", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    providerId: (0, pg_core_1.varchar)("provider_id", { length: 255 }).notNull(),
    username: (0, pg_core_1.varchar)("username", { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 255 }).notNull(),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    profilePicture: (0, pg_core_1.varchar)("profile_picture", { length: 255 })
        .notNull()
        .default(undef),
    aboutMe: (0, pg_core_1.varchar)("about_me", { length: 2050 }),
    contact: (0, pg_core_1.varchar)("contact", { length: 255 }),
    resume: (0, pg_core_1.varchar)("resume", { length: 255 }).notNull().default(undef),
    provider: (0, exports.providerEnum)("provider").notNull(),
    provinceAddress: (0, pg_core_1.varchar)("province_address", { length: 64 }),
    address: (0, pg_core_1.varchar)("address", { length: 255 }),
    approvalStatus: (0, exports.usersApprovalStatusEnum)("approval_status")
        .notNull()
        .default("UNAPPROVED"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        uniqueName: (0, pg_core_1.unique)().on(t.firstName, t.lastName),
    },
]);
exports.employerTable = (0, pg_core_1.pgTable)("employer", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    username: (0, pg_core_1.varchar)("username", { length: 255 }).notNull(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 255 }).notNull(),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    profilePicture: (0, pg_core_1.varchar)("profile_picture", { length: 255 })
        .notNull()
        .default(undef),
    aboutMe: (0, pg_core_1.varchar)("about_me", { length: 2050 }),
    contact: (0, pg_core_1.varchar)("contact", { length: 255 }),
    provinceAddress: (0, pg_core_1.varchar)("province_address", { length: 64 }),
    address: (0, pg_core_1.varchar)("address", { length: 255 }),
    approvalStatus: (0, exports.usersApprovalStatusEnum)("approval_status")
        .notNull()
        .default("UNAPPROVED"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        uniqueName: (0, pg_core_1.unique)().on(t.firstName, t.lastName),
        uniqueAccount: (0, pg_core_1.unique)().on(t.username, t.password),
    },
]);
exports.oauthEmployerTable = (0, pg_core_1.pgTable)("oauth_employer", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    providerId: (0, pg_core_1.varchar)("provider_id", { length: 255 }).notNull(),
    username: (0, pg_core_1.varchar)("username", { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 255 }).notNull(),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    profilePicture: (0, pg_core_1.varchar)("profile_picture", { length: 255 })
        .notNull()
        .default(undef),
    aboutMe: (0, pg_core_1.varchar)("about_me", { length: 2050 }),
    contact: (0, pg_core_1.varchar)("contact", { length: 255 }),
    provider: (0, exports.providerEnum)("provider").notNull(),
    provinceAddress: (0, pg_core_1.varchar)("province_address", { length: 64 }),
    address: (0, pg_core_1.varchar)("address", { length: 255 }),
    approvalStatus: (0, exports.usersApprovalStatusEnum)("approval_status")
        .notNull()
        .default("UNAPPROVED"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        uniqueName: (0, pg_core_1.unique)().on(t.firstName, t.lastName),
    },
]);
exports.companyTable = (0, pg_core_1.pgTable)("company", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    officialName: (0, pg_core_1.varchar)("official_name", { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    profilePicture: (0, pg_core_1.varchar)("profile_picture", { length: 255 })
        .notNull()
        .default(undef),
    aboutUs: (0, pg_core_1.varchar)("about_us", { length: 2050 }),
    contact: (0, pg_core_1.varchar)("contact", { length: 255 }),
    provinceAddress: (0, pg_core_1.varchar)("province_address", { length: 64 }),
    address: (0, pg_core_1.varchar)("address", { length: 255 }),
    approvalStatus: (0, exports.usersApprovalStatusEnum)("approval_status")
        .notNull()
        .default("UNAPPROVED"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.adminTable = (0, pg_core_1.pgTable)("admin", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    username: (0, pg_core_1.varchar)("username", { length: 255 }).notNull(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).unique(),
    profilePicture: (0, pg_core_1.varchar)("profile_picture", { length: 255 })
        .notNull()
        .default(undef),
    contact: (0, pg_core_1.varchar)("contact", { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        uniqueAccount: (0, pg_core_1.unique)().on(t.username, t.password),
    },
]);
// {Jobs}
exports.jobCategoryTable = (0, pg_core_1.pgTable)("job_category", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.varchar)("description", { length: 540 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.jobFindCategoryTable = (0, pg_core_1.pgTable)("job_find_category", {
    jobFindingPostId: (0, pg_core_1.uuid)("job_finding_post_id")
        .notNull()
        .references(() => exports.jobFindingPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    jobCategoryId: (0, pg_core_1.uuid)("job_category_id")
        .notNull()
        .references(() => exports.jobCategoryTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        searchCategoryPK: (0, pg_core_1.primaryKey)({
            columns: [t.jobFindingPostId, t.jobCategoryId],
        }),
    },
]);
exports.jobHireCategoryTable = (0, pg_core_1.pgTable)("job_hire_category", {
    jobHiringPostId: (0, pg_core_1.uuid)("job_hiring_post_id")
        .notNull()
        .references(() => exports.jobHiringPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    jobCategoryId: (0, pg_core_1.uuid)("job_category_id")
        .notNull()
        .references(() => exports.jobCategoryTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        hireCategoryPK: (0, pg_core_1.primaryKey)({
            columns: [t.jobHiringPostId, t.jobCategoryId],
        }),
    },
]);
exports.jobFindingPostTable = (0, pg_core_1.pgTable)("job_finding_post", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, pg_core_1.varchar)("description", { length: 540 }),
    jobLocation: (0, pg_core_1.varchar)("job_location", { length: 255 }).notNull(),
    expectedSalary: (0, pg_core_1.integer)("expected_salary").notNull(),
    workDates: (0, pg_core_1.varchar)("work_dates", { length: 1024 }).notNull(),
    workHoursRange: (0, pg_core_1.varchar)("work_hours_range", { length: 255 }).notNull(),
    status: (0, exports.postStatusEnum)("status").notNull().default("UNMATCHED"),
    jobPostType: (0, exports.jobPostTypeEnum)("job_post_type").notNull(),
    jobSeekerType: (0, exports.jobSeekerTypeEnum)("job_seeker_type").notNull(),
    jobSeekerId: (0, pg_core_1.uuid)("job_seeker_id").references(() => exports.jobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    oauthJobSeekerId: (0, pg_core_1.uuid)("oauth_job_seeker_id").references(() => exports.oauthJobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.jobHiringPostTable = (0, pg_core_1.pgTable)("job_hiring_post", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, pg_core_1.varchar)("description", { length: 540 }),
    jobLocation: (0, pg_core_1.varchar)("job_location", { length: 255 }).notNull(),
    salary: (0, pg_core_1.integer)("salary").notNull(),
    workDates: (0, pg_core_1.varchar)("work_dates", { length: 1024 }).notNull(),
    workHoursRange: (0, pg_core_1.varchar)("work_hours_range", { length: 255 }).notNull(),
    status: (0, exports.postStatusEnum)("status").notNull().default("UNMATCHED"),
    hiredAmount: (0, pg_core_1.integer)("hired_amount").notNull().default(1),
    jobPostType: (0, exports.jobPostTypeEnum)("job_post_type").notNull(),
    jobHirerType: (0, exports.jobHirerTypeEnum)("job_hirer_type").notNull(),
    employerId: (0, pg_core_1.uuid)("employer_id").references(() => exports.employerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    oauthEmployerId: (0, pg_core_1.uuid)("oauth_employer_id").references(() => exports.oauthEmployerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    companyId: (0, pg_core_1.uuid)("company_id").references(() => exports.companyTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.jobHiringPostMatchedTable = (0, pg_core_1.pgTable)("job_hiring_post_matched", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    jobHiringPostId: (0, pg_core_1.uuid)("job_hiring_post_id")
        .notNull()
        .references(() => exports.jobHiringPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.jobHiringPostMatchedSeekersTable = (0, pg_core_1.pgTable)("job_hiring_post_matched_seekers", {
    jobSeekerType: (0, exports.jobSeekerTypeEnum)("job_seeker_type").notNull(),
    jobSeekerId: (0, pg_core_1.uuid)("job_seeker_id")
        .references(() => exports.jobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    oauthJobSeekerId: (0, pg_core_1.uuid)("oauth_job_seeker_id")
        .references(() => exports.oauthJobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    jobHiringPostMatchedId: (0, pg_core_1.uuid)("job_hiring_post_matched_id")
        .references(() => exports.jobHiringPostMatchedTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    })
        .notNull(),
    status: (0, exports.jobMatchedStatusEnum)("status").notNull().default("INPROGRESS"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(), //registered time
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        seekerPostKey: (0, pg_core_1.primaryKey)({
            columns: [t.jobSeekerId, t.oauthJobSeekerId, t.jobHiringPostMatchedId],
        }),
        seekerTypeKey: (0, pg_core_1.unique)().on(t.jobSeekerId, t.oauthJobSeekerId),
    },
]);
exports.jobFindingPostMatchedTable = (0, pg_core_1.pgTable)("job_finding_post_matched", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    jobFindingPostId: (0, pg_core_1.uuid)("job_finding_post_id")
        .references(() => exports.jobFindingPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    })
        .notNull(),
    status: (0, exports.jobMatchedStatusEnum)("status").notNull().default("INPROGRESS"),
    jobHirerType: (0, exports.jobHirerTypeEnum)("job_hirer_type").notNull(),
    employerId: (0, pg_core_1.uuid)("employer_id").references(() => exports.employerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    oauthEmployerId: (0, pg_core_1.uuid)("oauth_employer_id").references(() => exports.oauthEmployerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    companyId: (0, pg_core_1.uuid)("company_id").references(() => exports.companyTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(), //registered time
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
// {Job Seeker's Vulnerability}
exports.vulnerabilityTypeTable = (0, pg_core_1.pgTable)("vulnerability_type", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.varchar)("description", { length: 2048 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.oauthJobSeekerVulnerabilityTable = (0, pg_core_1.pgTable)("oauth_job_seeker_vulnerability", {
    severity: (0, exports.severityLvlEnum)("severity").notNull().default("LOW"),
    publicStatus: (0, exports.publicStatusEnum)("public_status").notNull().default("SHOWN"),
    oauthJobSeekerId: (0, pg_core_1.uuid)("oauth_job_seeker_id")
        .notNull()
        .references(() => exports.oauthJobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    vulnerabilityTypeId: (0, pg_core_1.uuid)("vulnerability_type_id")
        .notNull()
        .references(() => exports.vulnerabilityTypeTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        userVulKey: (0, pg_core_1.primaryKey)({
            columns: [t.oauthJobSeekerId, t.vulnerabilityTypeId],
        }),
    },
]);
exports.jobSeekerVulnerabilityTable = (0, pg_core_1.pgTable)("job_seeker_vulnerability", {
    severity: (0, exports.severityLvlEnum)("severity").notNull().default("LOW"),
    publicStatus: (0, exports.publicStatusEnum)("public_status").notNull().default("SHOWN"),
    jobSeekerId: (0, pg_core_1.uuid)("job_seeker_id")
        .notNull()
        .references(() => exports.jobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    vulnerabilityTypeId: (0, pg_core_1.uuid)("vulnerability_type_id")
        .notNull()
        .references(() => exports.vulnerabilityTypeTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        userVulKey: (0, pg_core_1.primaryKey)({
            columns: [t.jobSeekerId, t.vulnerabilityTypeId],
        }),
    },
]);
// {Job Seeker's Skill}
exports.skillTable = (0, pg_core_1.pgTable)("skill", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.varchar)("description", { length: 1024 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.oauthJobSeekerSkillTable = (0, pg_core_1.pgTable)("oauth_job_seeker_skill", {
    oauthJobSeekerId: (0, pg_core_1.uuid)("oauth_job_seeker_id").references(() => exports.oauthJobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    skillId: (0, pg_core_1.uuid)("skill_id").references(() => exports.skillTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        userSkillKey: (0, pg_core_1.primaryKey)({ columns: [t.oauthJobSeekerId, t.skillId] }),
    },
]);
exports.jobSeekerSkillTable = (0, pg_core_1.pgTable)("job_seeker_skill", {
    jobSeekerId: (0, pg_core_1.uuid)("job_seeker_id").references(() => exports.jobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    skillId: (0, pg_core_1.uuid)("skill_id").references(() => exports.skillTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}, (t) => [
    {
        userSkillKey: (0, pg_core_1.primaryKey)({ columns: [t.jobSeekerId, t.skillId] }),
    },
]);
// {Skill in Post}
exports.jobFindingPostSkillTable = (0, pg_core_1.pgTable)("job_finding_post_skill", {
    jobFindingPostId: (0, pg_core_1.uuid)("job_finding_post_id")
        .references(() => exports.jobFindingPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    })
        .notNull(),
    skillId: (0, pg_core_1.uuid)("skill_id")
        .references(() => exports.skillTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    })
        .notNull(),
}, (t) => [
    { postSkillKey: (0, pg_core_1.primaryKey)({ columns: [t.jobFindingPostId, t.skillId] }) },
]);
exports.jobHiringPostSkillTable = (0, pg_core_1.pgTable)("job_hiring_post_skill", {
    jobHiringPostId: (0, pg_core_1.uuid)("job_hiring_post_id")
        .references(() => exports.jobHiringPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    })
        .notNull(),
    skillId: (0, pg_core_1.uuid)("skill_id")
        .references(() => exports.skillTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    })
        .notNull(),
}, (t) => [
    { postSkillKey: (0, pg_core_1.primaryKey)({ columns: [t.jobHiringPostId, t.skillId] }) },
]);
// {Others}
exports.registrationApprovalTable = (0, pg_core_1.pgTable)("registration_approval", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    status: (0, exports.approvalStatusEnum)("status").notNull().default("UNAPPROVED"),
    imageUrl: (0, pg_core_1.varchar)("image_url").notNull().default(undef),
    userType: (0, exports.normalUserTypeEnum)("user_type").notNull(), // user's approved
    jobSeekerId: (0, pg_core_1.uuid)("job_seeker_id").references(() => exports.jobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    oauthJobSeekerId: (0, pg_core_1.uuid)("oauth_job_seeker_id").references(() => exports.oauthJobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    employerId: (0, pg_core_1.uuid)("employer_id").references(() => exports.employerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    oauthEmployerId: (0, pg_core_1.uuid)("oauth_employer_id").references(() => exports.oauthEmployerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    companyId: (0, pg_core_1.uuid)("company_id").references(() => exports.companyTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    // approved by
    adminId: (0, pg_core_1.uuid)("admin_id").references(() => exports.adminTable.id, {
        onDelete: "set null",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(), // registered time
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.notificationTable = (0, pg_core_1.pgTable)("notification", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    status: (0, exports.notificationStatusEnum)("status").notNull().default("UNREAD"),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, pg_core_1.varchar)("description", { length: 1024 }).notNull(),
    userType: (0, exports.normalUserTypeEnum)("user_type").notNull(), // normal user
    jobSeekerId: (0, pg_core_1.uuid)("job_seeker_id").references(() => exports.jobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    oauthJobSeekerId: (0, pg_core_1.uuid)("oauth_job_seeker_id").references(() => exports.oauthJobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    employerId: (0, pg_core_1.uuid)("employer_id").references(() => exports.employerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    oauthEmployerId: (0, pg_core_1.uuid)("oauth_employer_id").references(() => exports.oauthEmployerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    companyId: (0, pg_core_1.uuid)("company_id").references(() => exports.companyTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(), // notify time
    updatedAt: (0, pg_core_1.timestamp)("updated_at") // read time
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
exports.userSessionsTable = (0, pg_core_1.pgTable)("user_sessions", {
    sid: (0, pg_core_1.varchar)("sid", { length: 255 }).primaryKey(),
    sess: (0, pg_core_1.json)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
});
// Relations
// {Users}
exports.jobSeekerRelation = (0, drizzle_orm_1.relations)(exports.jobSeekerTable, ({ many }) => {
    return {
        vulnerabilities: many(exports.jobSeekerVulnerabilityTable),
        skills: many(exports.jobSeekerSkillTable),
        registrationApproval: many(exports.registrationApprovalTable),
        jobFindingPosted: many(exports.jobFindingPostTable),
        matchedJobHiringPost: many(exports.jobHiringPostMatchedSeekersTable),
        notify: many(exports.notificationTable),
    };
});
exports.oauthJobSeekerRelation = (0, drizzle_orm_1.relations)(exports.oauthJobSeekerTable, ({ many }) => {
    return {
        vulnerabilities: many(exports.oauthJobSeekerVulnerabilityTable),
        skills: many(exports.oauthJobSeekerSkillTable),
        registrationApproval: many(exports.registrationApprovalTable),
        jobFindingPosted: many(exports.jobFindingPostTable),
        matchedJobHiringPost: many(exports.jobHiringPostMatchedSeekersTable),
        notify: many(exports.notificationTable),
    };
});
exports.employerRelation = (0, drizzle_orm_1.relations)(exports.employerTable, ({ many }) => {
    return {
        registrationApproval: many(exports.registrationApprovalTable),
        jobHiringPosted: many(exports.jobHiringPostTable),
        matchedJobFindingPost: many(exports.jobFindingPostMatchedTable),
        notify: many(exports.notificationTable),
    };
});
exports.oauthEmployerRelation = (0, drizzle_orm_1.relations)(exports.oauthEmployerTable, ({ many }) => {
    return {
        registrationApproval: many(exports.registrationApprovalTable),
        jobHiringPosted: many(exports.jobHiringPostTable),
        matchedJobFindingPost: many(exports.jobFindingPostMatchedTable),
        notify: many(exports.notificationTable),
    };
});
exports.companyRelation = (0, drizzle_orm_1.relations)(exports.companyTable, ({ many }) => {
    return {
        registrationApproval: many(exports.registrationApprovalTable),
        jobHiringPosted: many(exports.jobHiringPostTable),
        matchedJobFindingPost: many(exports.jobFindingPostMatchedTable),
        notify: many(exports.notificationTable),
    };
});
exports.adminRelation = (0, drizzle_orm_1.relations)(exports.adminTable, ({ many }) => {
    return {
        approvedBy: many(exports.registrationApprovalTable),
    };
});
// {Jobs}
exports.jobFindingPostRelation = (0, drizzle_orm_1.relations)(exports.jobFindingPostTable, ({ one, many }) => {
    return {
        postMatched: many(exports.jobFindingPostMatchedTable), //only one should be accepted
        inCategory: many(exports.jobFindCategoryTable),
        postByNormal: one(exports.jobSeekerTable, {
            fields: [exports.jobFindingPostTable.jobSeekerId],
            references: [exports.jobSeekerTable.id],
        }),
        postByOauth: one(exports.oauthJobSeekerTable, {
            fields: [exports.jobFindingPostTable.oauthJobSeekerId],
            references: [exports.oauthJobSeekerTable.id],
        }),
    };
});
exports.jobHiringPostRelation = (0, drizzle_orm_1.relations)(exports.jobHiringPostTable, ({ one, many }) => {
    return {
        postMatched: many(exports.jobHiringPostMatchedTable), //only one should be accepted
        inCategory: many(exports.jobHireCategoryTable),
        postByEmployer: one(exports.employerTable, {
            fields: [exports.jobHiringPostTable.employerId],
            references: [exports.employerTable.id],
        }),
        postByOauthEmployer: one(exports.oauthEmployerTable, {
            fields: [exports.jobHiringPostTable.oauthEmployerId],
            references: [exports.oauthEmployerTable.id],
        }),
        postByCompany: one(exports.companyTable, {
            fields: [exports.jobHiringPostTable.companyId],
            references: [exports.companyTable.id],
        }),
    };
});
exports.jobCategoryRelation = (0, drizzle_orm_1.relations)(exports.jobCategoryTable, ({ many }) => {
    return {
        toFindingPost: many(exports.jobFindCategoryTable),
        toHiringPost: many(exports.jobHireCategoryTable),
    };
});
exports.jobFindCategoryRelation = (0, drizzle_orm_1.relations)(exports.jobFindCategoryTable, ({ one }) => {
    return {
        toPost: one(exports.jobFindingPostTable, {
            fields: [exports.jobFindCategoryTable.jobFindingPostId],
            references: [exports.jobFindingPostTable.id],
        }),
        toCategory: one(exports.jobCategoryTable, {
            fields: [exports.jobFindCategoryTable.jobCategoryId],
            references: [exports.jobCategoryTable.id],
        }),
    };
});
exports.jobHireCategoryRelation = (0, drizzle_orm_1.relations)(exports.jobHireCategoryTable, ({ one }) => {
    return {
        toPost: one(exports.jobHiringPostTable, {
            fields: [exports.jobHireCategoryTable.jobHiringPostId],
            references: [exports.jobHiringPostTable.id],
        }),
        toCategory: one(exports.jobCategoryTable, {
            fields: [exports.jobHireCategoryTable.jobCategoryId],
            references: [exports.jobCategoryTable.id],
        }),
    };
});
exports.jobFindingPostMatchedRelation = (0, drizzle_orm_1.relations)(exports.jobFindingPostMatchedTable, ({ one }) => {
    return {
        toPost: one(exports.jobFindingPostTable, {
            fields: [exports.jobFindingPostMatchedTable.jobFindingPostId],
            references: [exports.jobFindingPostTable.id],
        }),
        toEmployer: one(exports.employerTable, {
            fields: [exports.jobFindingPostMatchedTable.employerId],
            references: [exports.employerTable.id],
        }),
        toOauthEmployer: one(exports.oauthEmployerTable, {
            fields: [exports.jobFindingPostMatchedTable.oauthEmployerId],
            references: [exports.oauthEmployerTable.id],
        }),
        toCompany: one(exports.companyTable, {
            fields: [exports.jobFindingPostMatchedTable.companyId],
            references: [exports.companyTable.id],
        }),
    };
});
exports.jobHiringPostMatchedRelation = (0, drizzle_orm_1.relations)(exports.jobHiringPostMatchedTable, ({ one, many }) => {
    return {
        toPost: one(exports.jobHiringPostTable, {
            fields: [exports.jobHiringPostMatchedTable.jobHiringPostId],
            references: [exports.jobHiringPostTable.id],
        }),
        toMatchSeekers: many(exports.jobHiringPostMatchedSeekersTable),
    };
});
exports.jobHiringPostMatchedSeekersRelation = (0, drizzle_orm_1.relations)(exports.jobHiringPostMatchedSeekersTable, ({ one }) => {
    return {
        toPostMatched: one(exports.jobHiringPostMatchedTable, {
            fields: [exports.jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId],
            references: [exports.jobHiringPostMatchedTable.id],
        }),
        toJobSeeker: one(exports.jobSeekerTable, {
            fields: [exports.jobHiringPostMatchedSeekersTable.jobSeekerId],
            references: [exports.jobSeekerTable.id],
        }),
        toOauthJobSeeker: one(exports.oauthJobSeekerTable, {
            fields: [exports.jobHiringPostMatchedSeekersTable.oauthJobSeekerId],
            references: [exports.oauthJobSeekerTable.id],
        }),
    };
});
// {Job Seeker's Skill}
exports.skillRelation = (0, drizzle_orm_1.relations)(exports.skillTable, ({ many }) => {
    return {
        toJobSeeker: many(exports.jobSeekerTable),
        toOauthJobSeeker: many(exports.oauthJobSeekerTable),
    };
});
exports.jobSeekerSkillRelation = (0, drizzle_orm_1.relations)(exports.jobSeekerSkillTable, ({ one }) => {
    return {
        toJobSeeker: one(exports.jobSeekerTable, {
            fields: [exports.jobSeekerSkillTable.jobSeekerId],
            references: [exports.jobSeekerTable.id],
        }),
        toSkill: one(exports.skillTable, {
            fields: [exports.jobSeekerSkillTable.skillId],
            references: [exports.skillTable.id],
        }),
    };
});
exports.oauthJobSeekerSkillRelation = (0, drizzle_orm_1.relations)(exports.oauthJobSeekerSkillTable, ({ one }) => {
    return {
        toOauthJobSeeker: one(exports.oauthJobSeekerTable, {
            fields: [exports.oauthJobSeekerSkillTable.oauthJobSeekerId],
            references: [exports.oauthJobSeekerTable.id],
        }),
        toSkill: one(exports.skillTable, {
            fields: [exports.oauthJobSeekerSkillTable.skillId],
            references: [exports.skillTable.id],
        }),
    };
});
// {Skill in Post}
exports.jobFindingPostSkillRelation = (0, drizzle_orm_1.relations)(exports.jobFindingPostSkillTable, ({ one }) => {
    return {
        toFindingPost: one(exports.jobFindingPostTable),
        toSkill: one(exports.skillTable),
    };
});
exports.jobHiringPostSkillRelation = (0, drizzle_orm_1.relations)(exports.jobHiringPostSkillTable, ({ one }) => {
    return {
        toHiringPost: one(exports.jobHiringPostTable),
        toSkill: one(exports.skillTable),
    };
});
// {Job Seeker's Vulnerability}
exports.vulnerabilityTypeRelation = (0, drizzle_orm_1.relations)(exports.vulnerabilityTypeTable, ({ many }) => {
    return {
        toJobSeeker: many(exports.jobSeekerVulnerabilityTable),
        toOauthJobSeeker: many(exports.oauthJobSeekerVulnerabilityTable),
    };
});
exports.jobSeekerVulnerabilityRelation = (0, drizzle_orm_1.relations)(exports.jobSeekerVulnerabilityTable, ({ one }) => {
    return {
        toJobSeeker: one(exports.jobSeekerTable, {
            fields: [exports.jobSeekerVulnerabilityTable.jobSeekerId],
            references: [exports.jobSeekerTable.id],
        }),
        toVulnerabilityType: one(exports.vulnerabilityTypeTable, {
            fields: [exports.jobSeekerVulnerabilityTable.vulnerabilityTypeId],
            references: [exports.vulnerabilityTypeTable.id],
        }),
    };
});
exports.oauthJobSeekerVulnerabilityRelation = (0, drizzle_orm_1.relations)(exports.oauthJobSeekerVulnerabilityTable, ({ one }) => {
    return {
        toOauthJobSeeker: one(exports.oauthJobSeekerTable, {
            fields: [exports.oauthJobSeekerVulnerabilityTable.oauthJobSeekerId],
            references: [exports.oauthJobSeekerTable.id],
        }),
        toVulnerabilityType: one(exports.vulnerabilityTypeTable, {
            fields: [exports.oauthJobSeekerVulnerabilityTable.vulnerabilityTypeId],
            references: [exports.vulnerabilityTypeTable.id],
        }),
    };
});
// {Others}
exports.registrationApprovalRelation = (0, drizzle_orm_1.relations)(exports.registrationApprovalTable, ({ one, many }) => {
    return {
        // being approved
        approveJobSeeker: one(exports.jobSeekerTable, {
            fields: [exports.registrationApprovalTable.jobSeekerId],
            references: [exports.jobSeekerTable.id],
        }),
        approveOauthJobSeeker: one(exports.oauthJobSeekerTable, {
            fields: [exports.registrationApprovalTable.oauthJobSeekerId],
            references: [exports.oauthJobSeekerTable.id],
        }),
        approveEmployer: one(exports.employerTable, {
            fields: [exports.registrationApprovalTable.employerId],
            references: [exports.employerTable.id],
        }),
        approveOauthEmployer: one(exports.oauthEmployerTable, {
            fields: [exports.registrationApprovalTable.oauthEmployerId],
            references: [exports.oauthEmployerTable.id],
        }),
        approveCompany: one(exports.companyTable, {
            fields: [exports.registrationApprovalTable.companyId],
            references: [exports.companyTable.id],
        }),
        // approved by
        approvedByAdmin: one(exports.adminTable, {
            fields: [exports.registrationApprovalTable.adminId],
            references: [exports.adminTable.id],
        }),
    };
});
exports.notificationRelation = (0, drizzle_orm_1.relations)(exports.notificationTable, ({ one }) => {
    return {
        notifyJobSeeker: one(exports.jobSeekerTable, {
            fields: [exports.notificationTable.jobSeekerId],
            references: [exports.jobSeekerTable.id],
        }),
        notifyOauthJobSeeker: one(exports.oauthJobSeekerTable, {
            fields: [exports.notificationTable.oauthJobSeekerId],
            references: [exports.oauthJobSeekerTable.id],
        }),
        notifyEmployer: one(exports.employerTable, {
            fields: [exports.notificationTable.employerId],
            references: [exports.employerTable.id],
        }),
        notifyOauthEmployer: one(exports.oauthEmployerTable, {
            fields: [exports.notificationTable.oauthEmployerId],
            references: [exports.oauthEmployerTable.id],
        }),
        notifyCompany: one(exports.companyTable, {
            fields: [exports.notificationTable.companyId],
            references: [exports.companyTable.id],
        }),
    };
});
