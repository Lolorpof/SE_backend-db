import { desc, relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  unique,
  primaryKey,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

const undef = "UNDEFINED";

// Enum

// {User}
export const userTypeEnum = pgEnum("userType", [
  "JOBSEEKER",
  "OAUTH_JOBSEEKER",
  "EMPLOYER",
  "OAUTH_EMPLOYER",
  "COMPANY",
  "OAUTH_COMPANY",
  "ADMIN",
  "OAUTH_ADMIN",
]);

export const normalUserTypeEnum = pgEnum("normalUserType", [
  "JOBSEEKER",
  "OAUTHJOBSEEKER",
  "EMPLOYER",
  "OAUTHEMPLOYER",
  "COMPANY",
  "OAUTHCOMPANY",
]);

export const jobSeekerTypeEnum = pgEnum("jobSeekerType", ["NORMAL", "OAUTH"]);

export const jobHirerTypeEnum = pgEnum("jobHirerType", [
  "EMPLOYER",
  "OAUTHEMPLOYER",
  "COMPANY",
  "OAUTHCOMPANY",
]);

export const adminTypeEnum = pgEnum("adminType", ["NORMAL", "OAUTH"]);

// {Status}

export const publicStatusEnum = pgEnum("publicStatus", ["SHOWN", "HIDDEN"]);

export const postStatusEnum = pgEnum("postStatus", [
  "MATCHED",
  "UNMATCHED",
  "MATCHED_INPROG",
]);

export const jobMatchedStatusEnum = pgEnum("jobMatchedStatus", [
  "INPROGRESS",
  "ACCEPTED",
  "DENIED",
]);

export const approvalStatusEnum = pgEnum("approvalStatus", [
  "ACCEPTED",
  "DENIED",
  "UNAPPROVED",
]);

export const notificationStatusEnum = pgEnum("notificationStatus", [
  "READ",
  "UNREAD",
]);

// {Others}

export const severityLvlEnum = pgEnum("severityLvl", ["LOW", "MEDIUM", "HIGH"]);

export const oauthTypeEnum = pgEnum("oauthType", ["GOOGLE", "LINE"]);

// Tables

export const registrationApprovalTable = pgTable("registration_approval", {
  id: uuid("id").primaryKey(),
  status: approvalStatusEnum("status").notNull().default("UNAPPROVED"),
  userType: normalUserTypeEnum("user_type").notNull(), // user's approved
  jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id),
  oauthJobSeekerId: uuid("oauth_job_seeker_id").references(
    () => oauthJobSeekerTable.id
  ),
  employerId: uuid("employer_id").references(() => employerTable.id),
  oauthEmployerId: uuid("oauth_employer_id").references(
    () => oauthEmployerTable.id
  ),
  companyId: uuid("company_id").references(() => companyTable.id),
  oauthCompanyId: uuid("oauth_company_id").references(
    () => oauthCompanyTable.id
  ),
  adminType: adminTypeEnum("admin_type").notNull(), // approved by
  adminId: uuid("admin_id").references(() => adminTable.id),
  oauthAdminId: uuid("oauth_admin_id").references(() => oauthAdminTable.id),
});

//{Users Type}
export const jobSeekerTable = pgTable(
  "job_seeker",
  {
    id: uuid("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    profilePicture: varchar("profile_picture", { length: 255 })
      .notNull()
      .default(undef),
    aboutMe: varchar("about_me", { length: 2050 }),
    contact: varchar("contact", { length: 255 }),
    resume: varchar("resume", { length: 255 }).notNull().default(undef),
    address: varchar("address", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      uniqueName: unique().on(t.firstName, t.lastName),
      uniqueAccount: unique().on(t.username, t.password),
    },
  ]
);

export const oauthJobSeekerTable = pgTable(
  "oauth_job_seeker",
  {
    id: uuid("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    profilePicture: varchar("profile_picture", { length: 255 })
      .notNull()
      .default(undef),
    aboutMe: varchar("about_me", { length: 2050 }),
    contact: varchar("contact", { length: 255 }),
    resume: varchar("resume", { length: 255 }).notNull().default(undef),
    oauthType: oauthTypeEnum("oauth_type").notNull(),
    address: varchar("address", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      uniqueName: unique().on(t.firstName, t.lastName),
    },
  ]
);

export const employerTable = pgTable(
  "employer",
  {
    id: uuid("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    profilePicture: varchar("profile_picture", { length: 255 })
      .notNull()
      .default(undef),
    aboutMe: varchar("about_me", { length: 2050 }),
    contact: varchar("contact", { length: 255 }),
    address: varchar("address", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      uniqueName: unique().on(t.firstName, t.lastName),
      uniqueAccount: unique().on(t.username, t.password),
    },
  ]
);

export const oauthEmployerTable = pgTable(
  "oauth_employer",
  {
    id: uuid("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    profilePicture: varchar("profile_picture", { length: 255 })
      .notNull()
      .default(undef),
    aboutMe: varchar("about_me", { length: 2050 }),
    contact: varchar("contact", { length: 255 }),
    oauthType: oauthTypeEnum("oauth_type").notNull(),
    address: varchar("address", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      uniqueName: unique().on(t.firstName, t.lastName),
    },
  ]
);

export const companyTable = pgTable("company", {
  id: uuid("id").primaryKey(),
  officialName: varchar("official_name", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profile_picture: varchar("profile_picture", { length: 255 })
    .notNull()
    .default(undef),
  aboutUs: varchar("about_us", { length: 2050 }),
  contact: varchar("contact", { length: 255 }),
  address: varchar("address", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const oauthCompanyTable = pgTable("oauth_company", {
  id: uuid("id").primaryKey(),
  officialName: varchar("official_name", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profile_picture: varchar("profile_picture", { length: 255 })
    .notNull()
    .default(undef),
  aboutUs: varchar("about_us", { length: 2050 }),
  contact: varchar("contact", { length: 255 }),
  oauthType: oauthTypeEnum("oauth_type").notNull(),
  address: varchar("address", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const adminTable = pgTable(
  "admin",
  {
    id: uuid("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    password: varchar("varchar", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    profilePicture: varchar("profile_picture", { length: 255 })
      .notNull()
      .default(undef),
    contact: varchar("varchar", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      uniqueAccount: unique().on(t.username, t.password),
    },
  ]
);

export const oauthAdminTable = pgTable("oauth_admin", {
  id: uuid("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profilePicture: varchar("profile_picture", { length: 255 })
    .notNull()
    .default(undef),
  contact: varchar("varchar", { length: 255 }),
  oauthType: oauthTypeEnum("oauth_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// {Jobs}

export const jobCategoryTable = pgTable("job_category", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 540 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const jobFindCategoryTable = pgTable(
  "job_find_category",
  {
    jobFindingPostId: uuid("job_finding_post_id")
      .notNull()
      .references(() => jobFindingPostTable.id),
    jobCategoryId: uuid("job_category_id")
      .notNull()
      .references(() => jobCategoryTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      searchCategoryPK: primaryKey({
        columns: [t.jobFindingPostId, t.jobCategoryId],
      }),
    },
  ]
);

export const jobHireCategoryTable = pgTable(
  "job_hire_category",
  {
    jobHiringPostId: uuid("job_hiring_post_id")
      .notNull()
      .references(() => jobHiringPostTable.id),
    jobCategoryId: uuid("job_category_id")
      .notNull()
      .references(() => jobCategoryTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      hireCategoryPK: primaryKey({
        columns: [t.jobHiringPostId, t.jobCategoryId],
      }),
    },
  ]
);

export const jobFindingPostTable = pgTable("job_finding_post", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 540 }),
  jobLocation: varchar("job_location", { length: 255 }).notNull(),
  expectedSalary: integer("expected_salary").notNull(),
  workDates: varchar("work_dates", { length: 1024 }).notNull(),
  workHoursRange: varchar("work_hours_range", { length: 255 }).notNull(),
  status: postStatusEnum("status").notNull().default("UNMATCHED"),
  jobSeekerType: jobSeekerTypeEnum("job_seeker_type").notNull(),
  jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id),
  oauthJobSeekerId: uuid("oauth_job_seeker_id").references(
    () => oauthJobSeekerTable.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const jobHiringPostTable = pgTable("job_hiring_post", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 540 }),
  jobLocation: varchar("job_location", { length: 255 }).notNull(),
  salary: integer("salary").notNull(),
  workDates: varchar("work_dates", { length: 1024 }).notNull(),
  workHoursRange: varchar("work_hours_range", { length: 255 }).notNull(),
  status: postStatusEnum("status").notNull().default("UNMATCHED"),
  hiredAmount: integer("hired_amount").notNull().default(1),
  jobHirerType: jobHirerTypeEnum("job_hirer_type").notNull(),
  employerId: uuid("employer_id").references(() => employerTable.id),
  oauthEmployerId: uuid("oauth_employer_id").references(
    () => oauthEmployerTable.id
  ),
  companyId: uuid("company_id").references(() => companyTable.id),
  oauthCompanyId: uuid("oauth_company_id").references(
    () => oauthCompanyTable.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const jobHiringPostMatchedTable = pgTable("job_hiring_post_matched", {
  id: uuid("id").primaryKey(),
  jobHiringPostId: uuid("job_hiring_post_id")
    .notNull()
    .references(() => jobHiringPostTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const jobHiringPostMatchedSeekersTable = pgTable(
  "job_hiring_post_matched_seekers",
  {
    jobSeekerType: jobSeekerTypeEnum("job_seeker_type").notNull(),
    jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id),
    oauthJobSeekerId: uuid("oauth_job_seeker_id").references(
      () => oauthJobSeekerTable.id
    ),
    jobHiringPostMatchedId: uuid("job_hiring_post_matched_id")
      .references(() => jobHiringPostMatchedTable.id)
      .notNull(),
    status: jobMatchedStatusEnum("status").notNull().default("INPROGRESS"),
    createdAt: timestamp("created_at").notNull().defaultNow(), //registered time
    approvedAt: timestamp("approved_at"),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      seekerPostKey: primaryKey({
        columns: [t.jobSeekerId, t.oauthJobSeekerId, t.jobHiringPostMatchedId],
      }),
      seekerTypeKey: unique().on(t.jobSeekerId, t.oauthJobSeekerId),
    },
  ]
);

export const jobFindingPostMatchedTable = pgTable("job_finding_post_matched", {
  id: uuid("id").primaryKey(),
  jobFindingPostId: uuid("job_finding_post_id")
    .references(() => jobFindingPostTable.id)
    .notNull(),
  status: jobMatchedStatusEnum("status").notNull().default("INPROGRESS"),
  jobHirerType: jobHirerTypeEnum("job_hirer_type").notNull(),
  employerId: uuid("employer_id").references(() => employerTable.id),
  oauthEmployerId: uuid("oauth_employer_id").references(
    () => oauthEmployerTable.id
  ),
  companyId: uuid("company_id").references(() => companyTable.id),
  oauthCompanyId: uuid("oauth_company_id").references(
    () => oauthCompanyTable.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(), //registered time
  approvedAt: timestamp("approved_at"),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// {Job Seeker's Vulnerability}

export const vulnerabilityTypeTable = pgTable("vulnerability_type", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 2048 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const oauthJobSeekerVulnerabilityTable = pgTable(
  "oauth_job_seeker_vulnerability",
  {
    severity: severityLvlEnum("severity").notNull().default("LOW"),
    publicStatus: publicStatusEnum("public_status").notNull().default("SHOWN"),
    oauthJobSeekerId: uuid("oauth_job_seeker_id")
      .notNull()
      .references(() => oauthJobSeekerTable.id),
    vulnerabilityTypeId: uuid("vulnerability_type_id")
      .notNull()
      .references(() => vulnerabilityTypeTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      userVulKey: primaryKey({
        columns: [t.oauthJobSeekerId, t.vulnerabilityTypeId],
      }),
    },
  ]
);

export const jobSeekerVulnerabilityTable = pgTable(
  "job_seeker_vulnerability",
  {
    severity: severityLvlEnum("severity").notNull().default("LOW"),
    publicStatus: publicStatusEnum("public_status").notNull().default("SHOWN"),
    jobSeekerId: uuid("job_seeker_id")
      .notNull()
      .references(() => jobSeekerTable.id),
    vulnerabilityTypeId: uuid("vulnerability_type_id")
      .notNull()
      .references(() => vulnerabilityTypeTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      userVulKey: primaryKey({
        columns: [t.jobSeekerId, t.vulnerabilityTypeId],
      }),
    },
  ]
);

// {Job Seeker's Skill}

export const skillTable = pgTable("skill", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 1024 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const oauthJobSeekerSkillTable = pgTable(
  "oauth_job_seeker_skill",
  {
    oauthJobSeekerId: uuid("oauth_job_seeker_id").references(
      () => oauthJobSeekerTable.id
    ),
    skillId: uuid("skill_id").references(() => skillTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      userSkillKey: primaryKey({ columns: [t.oauthJobSeekerId, t.skillId] }),
    },
  ]
);

export const jobSeekerSkillTable = pgTable(
  "job_seeker_skill",
  {
    jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id),
    skillId: uuid("skill_id").references(() => skillTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      userSkillKey: primaryKey({ columns: [t.jobSeekerId, t.skillId] }),
    },
  ]
);

// {Others}

export const notificationTable = pgTable("notification", {
  id: uuid("id").primaryKey(),
  status: notificationStatusEnum("status").notNull().default("UNREAD"),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1024 }).notNull(),
  userType: normalUserTypeEnum("user_type").notNull(), // normal user
  jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id),
  oauthJobSeekerId: uuid("oauth_job_seeker_id").references(
    () => oauthJobSeekerTable.id
  ),
  employerId: uuid("employer_id").references(() => employerTable.id),
  oauthEmployerId: uuid("oauth_employer_id").references(
    () => oauthEmployerTable.id
  ),
  companyId: uuid("company_id").references(() => companyTable.id),
  oauthCompanyId: uuid("oauth_company_id").references(
    () => oauthCompanyTable.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(), // notify time
  updatedAt: timestamp("updated_at") // read time
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Relations

export const jobSeekerRelation = relations(jobSeekerTable, ({ many }) => {
  return {
    vulnerabilities: many(jobSeekerVulnerabilityTable),
    skills: many(jobSeekerSkillTable),
    registrationApproval: many(registrationApprovalTable),
    jobFindingPosted: many(jobFindingPostTable),
    matchedJobHiringPost: many(jobHiringPostMatchedSeekersTable),
    notify: many(notificationTable),
  };
});

export const oauthJobSeekerRelation = relations(
  oauthJobSeekerTable,
  ({ many }) => {
    return {
      vulnerabilities: many(oauthJobSeekerVulnerabilityTable),
      skills: many(oauthJobSeekerSkillTable),
      registrationApproval: many(registrationApprovalTable),
      jobFindingPosted: many(jobFindingPostTable),
      matchedJobHiringPost: many(jobHiringPostMatchedSeekersTable),
      notify: many(notificationTable),
    };
  }
);
