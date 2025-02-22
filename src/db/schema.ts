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
  json,
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
  "ADMIN",
]);

export const normalUserTypeEnum = pgEnum("normalUserType", [
  "JOBSEEKER",
  "OAUTHJOBSEEKER",
  "EMPLOYER",
  "OAUTHEMPLOYER",
  "COMPANY",
]);

export const jobSeekerTypeEnum = pgEnum("jobSeekerType", ["NORMAL", "OAUTH"]);

export const jobHirerTypeEnum = pgEnum("jobHirerType", [
  "EMPLOYER",
  "OAUTHEMPLOYER",
  "COMPANY",
]);

export const jobPostTypeEnum = pgEnum("jobPostType", [
  "FULLTIME",
  "PARTTIME",
  "FREELANCE",
]);

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
]); // in 'registration_approval' table

export const usersApprovalStatusEnum = pgEnum("userApprovalStatus", [
  "APPROVED",
  "UNAPPROVED",
]);

export const notificationStatusEnum = pgEnum("notificationStatus", [
  "READ",
  "UNREAD",
]);

// {Others}

export const severityLvlEnum = pgEnum("severityLvl", ["LOW", "MEDIUM", "HIGH"]);

export const providerEnum = pgEnum("providerType", ["GOOGLE", "LINE"]);

// Tables

//{Users Type}
export const jobSeekerTable = pgTable(
  "job_seeker",
  {
    id: uuid("id").primaryKey().defaultRandom(),
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
    provinceAddress: varchar("province_address", { length: 64 }),
    address: varchar("address", { length: 255 }),
    approvalStatus: usersApprovalStatusEnum("approval_status")
      .notNull()
      .default("UNAPPROVED"),
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
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
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
    provider: providerEnum("provider").notNull(),
    provinceAddress: varchar("province_address", { length: 64 }),
    address: varchar("address", { length: 255 }),
    approvalStatus: usersApprovalStatusEnum("approval_status")
      .notNull()
      .default("UNAPPROVED"),
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
    id: uuid("id").primaryKey().defaultRandom(),
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
    provinceAddress: varchar("province_address", { length: 64 }),
    address: varchar("address", { length: 255 }),
    approvalStatus: usersApprovalStatusEnum("approval_status")
      .notNull()
      .default("UNAPPROVED"),
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
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    profilePicture: varchar("profile_picture", { length: 255 })
      .notNull()
      .default(undef),
    aboutMe: varchar("about_me", { length: 2050 }),
    contact: varchar("contact", { length: 255 }),
    provider: providerEnum("provider").notNull(),
    provinceAddress: varchar("province_address", { length: 64 }),
    address: varchar("address", { length: 255 }),
    approvalStatus: usersApprovalStatusEnum("approval_status")
      .notNull()
      .default("UNAPPROVED"),
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
  id: uuid("id").primaryKey().defaultRandom(),
  officialName: varchar("official_name", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profile_picture: varchar("profile_picture", { length: 255 })
    .notNull()
    .default(undef),
  aboutUs: varchar("about_us", { length: 2050 }),
  contact: varchar("contact", { length: 255 }),
  provinceAddress: varchar("province_address", { length: 64 }),
  address: varchar("address", { length: 255 }),
  approvalStatus: usersApprovalStatusEnum("approval_status")
    .notNull()
    .default("UNAPPROVED"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const adminTable = pgTable(
  "admin",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique(),
    profilePicture: varchar("profile_picture", { length: 255 })
      .notNull()
      .default(undef),
    contact: varchar("contact", { length: 255 }),
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

// {Jobs}

export const jobCategoryTable = pgTable("job_category", {
  id: uuid("id").primaryKey().defaultRandom(),
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
      .references(() => jobFindingPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    jobCategoryId: uuid("job_category_id")
      .notNull()
      .references(() => jobCategoryTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
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
      .references(() => jobHiringPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    jobCategoryId: uuid("job_category_id")
      .notNull()
      .references(() => jobCategoryTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
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
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 540 }),
  jobLocation: varchar("job_location", { length: 255 }).notNull(),
  expectedSalary: integer("expected_salary").notNull(),
  workDates: varchar("work_dates", { length: 1024 }).notNull(),
  workHoursRange: varchar("work_hours_range", { length: 255 }).notNull(),
  status: postStatusEnum("status").notNull().default("UNMATCHED"),
  jobPostType: jobPostTypeEnum("job_post_type").notNull(),
  jobSeekerType: jobSeekerTypeEnum("job_seeker_type").notNull(),
  jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  oauthJobSeekerId: uuid("oauth_job_seeker_id").references(
    () => oauthJobSeekerTable.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    }
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const jobHiringPostTable = pgTable("job_hiring_post", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 540 }),
  jobLocation: varchar("job_location", { length: 255 }).notNull(),
  salary: integer("salary").notNull(),
  workDates: varchar("work_dates", { length: 1024 }).notNull(),
  workHoursRange: varchar("work_hours_range", { length: 255 }).notNull(),
  status: postStatusEnum("status").notNull().default("UNMATCHED"),
  hiredAmount: integer("hired_amount").notNull().default(1),
  jobPostType: jobPostTypeEnum("job_post_type").notNull(),
  jobHirerType: jobHirerTypeEnum("job_hirer_type").notNull(),
  employerId: uuid("employer_id").references(() => employerTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  oauthEmployerId: uuid("oauth_employer_id").references(
    () => oauthEmployerTable.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    }
  ),
  companyId: uuid("company_id").references(() => companyTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const jobHiringPostMatchedTable = pgTable("job_hiring_post_matched", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobHiringPostId: uuid("job_hiring_post_id")
    .notNull()
    .references(() => jobHiringPostTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
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
    jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    oauthJobSeekerId: uuid("oauth_job_seeker_id").references(
      () => oauthJobSeekerTable.id,
      {
        onDelete: "cascade",
        onUpdate: "cascade",
      }
    ),
    jobHiringPostMatchedId: uuid("job_hiring_post_matched_id")
      .references(() => jobHiringPostMatchedTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
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
  id: uuid("id").primaryKey().defaultRandom(),
  jobFindingPostId: uuid("job_finding_post_id")
    .references(() => jobFindingPostTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  status: jobMatchedStatusEnum("status").notNull().default("INPROGRESS"),
  jobHirerType: jobHirerTypeEnum("job_hirer_type").notNull(),
  employerId: uuid("employer_id").references(() => employerTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  oauthEmployerId: uuid("oauth_employer_id").references(
    () => oauthEmployerTable.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    }
  ),
  companyId: uuid("company_id").references(() => companyTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(), //registered time
  approvedAt: timestamp("approved_at"),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// {Job Seeker's Vulnerability}

export const vulnerabilityTypeTable = pgTable("vulnerability_type", {
  id: uuid("id").primaryKey().defaultRandom(),
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
      .references(() => oauthJobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    vulnerabilityTypeId: uuid("vulnerability_type_id")
      .notNull()
      .references(() => vulnerabilityTypeTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
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
      .references(() => jobSeekerTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    vulnerabilityTypeId: uuid("vulnerability_type_id")
      .notNull()
      .references(() => vulnerabilityTypeTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
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
  id: uuid("id").primaryKey().defaultRandom(),
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
      () => oauthJobSeekerTable.id,
      {
        onDelete: "cascade",
        onUpdate: "cascade",
      }
    ),
    skillId: uuid("skill_id").references(() => skillTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
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
    jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    skillId: uuid("skill_id").references(() => skillTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
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

// {Skill in Post}
export const jobFindingPostSkillTable = pgTable(
  "job_finding_post_skill",
  {
    jobFindingPostId: uuid("job_finding_post_id")
      .references(() => jobFindingPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    skillId: uuid("skill_id")
      .references(() => skillTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
  },
  (t) => [
    { postSkillKey: primaryKey({ columns: [t.jobFindingPostId, t.skillId] }) },
  ]
);

export const jobHiringPostSkillTable = pgTable(
  "job_hiring_post_skill",
  {
    jobHiringPostId: uuid("job_hiring_post_id")
      .references(() => jobHiringPostTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    skillId: uuid("skill_id")
      .references(() => skillTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
  },
  (t) => [
    { postSkillKey: primaryKey({ columns: [t.jobHiringPostId, t.skillId] }) },
  ]
);

// {Others}

export const registrationApprovalTable = pgTable("registration_approval", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: approvalStatusEnum("status").notNull().default("UNAPPROVED"),
  imageUrl: varchar("image_url").notNull().default(undef),
  userType: normalUserTypeEnum("user_type").notNull(), // user's approved
  jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  oauthJobSeekerId: uuid("oauth_job_seeker_id").references(
    () => oauthJobSeekerTable.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    }
  ),
  employerId: uuid("employer_id").references(() => employerTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  oauthEmployerId: uuid("oauth_employer_id").references(
    () => oauthEmployerTable.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    }
  ),
  companyId: uuid("company_id").references(() => companyTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  // approved by
  adminId: uuid("admin_id").references(() => adminTable.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(), // registered time
  approvedAt: timestamp("approved_at"),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const notificationTable = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: notificationStatusEnum("status").notNull().default("UNREAD"),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1024 }).notNull(),
  userType: normalUserTypeEnum("user_type").notNull(), // normal user
  jobSeekerId: uuid("job_seeker_id").references(() => jobSeekerTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  oauthJobSeekerId: uuid("oauth_job_seeker_id").references(
    () => oauthJobSeekerTable.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    }
  ),
  employerId: uuid("employer_id").references(() => employerTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  oauthEmployerId: uuid("oauth_employer_id").references(
    () => oauthEmployerTable.id,
    {
      onDelete: "cascade",
      onUpdate: "cascade",
    }
  ),
  companyId: uuid("company_id").references(() => companyTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(), // notify time
  updatedAt: timestamp("updated_at") // read time
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userSessionsTable = pgTable("user_sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Relations

// {Users}

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

export const employerRelation = relations(employerTable, ({ many }) => {
  return {
    registrationApproval: many(registrationApprovalTable),
    jobHiringPosted: many(jobHiringPostTable),
    matchedJobFindingPost: many(jobFindingPostMatchedTable),
    notify: many(notificationTable),
  };
});

export const oauthEmployerRelation = relations(
  oauthEmployerTable,
  ({ many }) => {
    return {
      registrationApproval: many(registrationApprovalTable),
      jobHiringPosted: many(jobHiringPostTable),
      matchedJobFindingPost: many(jobFindingPostMatchedTable),
      notify: many(notificationTable),
    };
  }
);

export const companyRelation = relations(companyTable, ({ many }) => {
  return {
    registrationApproval: many(registrationApprovalTable),
    jobHiringPosted: many(jobHiringPostTable),
    matchedJobFindingPost: many(jobFindingPostMatchedTable),
    notify: many(notificationTable),
  };
});

export const adminRelation = relations(adminTable, ({ many }) => {
  return {
    approvedBy: many(registrationApprovalTable),
  };
});

// {Jobs}

export const jobFindingPostRelation = relations(
  jobFindingPostTable,
  ({ one, many }) => {
    return {
      postMatched: many(jobFindingPostMatchedTable), //only one should be accepted
      inCategory: many(jobFindCategoryTable),
      postByNormal: one(jobSeekerTable, {
        fields: [jobFindingPostTable.jobSeekerId],
        references: [jobSeekerTable.id],
      }),
      postByOauth: one(oauthJobSeekerTable, {
        fields: [jobFindingPostTable.oauthJobSeekerId],
        references: [oauthJobSeekerTable.id],
      }),
    };
  }
);

export const jobHiringPostRelation = relations(
  jobHiringPostTable,
  ({ one, many }) => {
    return {
      postMatched: many(jobHiringPostMatchedTable), //only one should be accepted
      inCategory: many(jobHireCategoryTable),
      postByEmployer: one(employerTable, {
        fields: [jobHiringPostTable.employerId],
        references: [employerTable.id],
      }),
      postByOauthEmployer: one(oauthEmployerTable, {
        fields: [jobHiringPostTable.oauthEmployerId],
        references: [oauthEmployerTable.id],
      }),
      postByCompany: one(companyTable, {
        fields: [jobHiringPostTable.companyId],
        references: [companyTable.id],
      }),
    };
  }
);

export const jobCategoryRelation = relations(jobCategoryTable, ({ many }) => {
  return {
    toFindingPost: many(jobFindCategoryTable),
    toHiringPost: many(jobHireCategoryTable),
  };
});

export const jobFindCategoryRelation = relations(
  jobFindCategoryTable,
  ({ one }) => {
    return {
      toPost: one(jobFindingPostTable, {
        fields: [jobFindCategoryTable.jobFindingPostId],
        references: [jobFindingPostTable.id],
      }),
      toCategory: one(jobCategoryTable, {
        fields: [jobFindCategoryTable.jobCategoryId],
        references: [jobCategoryTable.id],
      }),
    };
  }
);

export const jobHireCategoryRelation = relations(
  jobHireCategoryTable,
  ({ one }) => {
    return {
      toPost: one(jobHiringPostTable, {
        fields: [jobHireCategoryTable.jobHiringPostId],
        references: [jobHiringPostTable.id],
      }),
      toCategory: one(jobCategoryTable, {
        fields: [jobHireCategoryTable.jobCategoryId],
        references: [jobCategoryTable.id],
      }),
    };
  }
);

export const jobFindingPostMatchedRelation = relations(
  jobFindingPostMatchedTable,
  ({ one }) => {
    return {
      toPost: one(jobFindingPostTable, {
        fields: [jobFindingPostMatchedTable.jobFindingPostId],
        references: [jobFindingPostTable.id],
      }),
      toEmployer: one(employerTable, {
        fields: [jobFindingPostMatchedTable.employerId],
        references: [employerTable.id],
      }),
      toOauthEmployer: one(oauthEmployerTable, {
        fields: [jobFindingPostMatchedTable.oauthEmployerId],
        references: [oauthEmployerTable.id],
      }),
      toCompany: one(companyTable, {
        fields: [jobFindingPostMatchedTable.companyId],
        references: [companyTable.id],
      }),
    };
  }
);

export const jobHiringPostMatchedRelation = relations(
  jobHiringPostMatchedTable,
  ({ one, many }) => {
    return {
      toPost: one(jobHiringPostTable, {
        fields: [jobHiringPostMatchedTable.jobHiringPostId],
        references: [jobHiringPostTable.id],
      }),
      toMatchSeekers: many(jobHiringPostMatchedSeekersTable),
    };
  }
);

export const jobHiringPostMatchedSeekersRelation = relations(
  jobHiringPostMatchedSeekersTable,
  ({ one }) => {
    return {
      toPostMatched: one(jobHiringPostMatchedTable, {
        fields: [jobHiringPostMatchedSeekersTable.jobHiringPostMatchedId],
        references: [jobHiringPostMatchedTable.id],
      }),
      toJobSeeker: one(jobSeekerTable, {
        fields: [jobHiringPostMatchedSeekersTable.jobSeekerId],
        references: [jobSeekerTable.id],
      }),
      toOauthJobSeeker: one(oauthJobSeekerTable, {
        fields: [jobHiringPostMatchedSeekersTable.oauthJobSeekerId],
        references: [oauthJobSeekerTable.id],
      }),
    };
  }
);

// {Job Seeker's Skill}

export const skillRelation = relations(skillTable, ({ many }) => {
  return {
    toJobSeeker: many(jobSeekerTable),
    toOauthJobSeeker: many(oauthJobSeekerTable),
  };
});

export const jobSeekerSkillRelation = relations(
  jobSeekerSkillTable,
  ({ one }) => {
    return {
      toJobSeeker: one(jobSeekerTable, {
        fields: [jobSeekerSkillTable.jobSeekerId],
        references: [jobSeekerTable.id],
      }),
      toSkill: one(skillTable, {
        fields: [jobSeekerSkillTable.skillId],
        references: [skillTable.id],
      }),
    };
  }
);

export const oauthJobSeekerSkillRelation = relations(
  oauthJobSeekerSkillTable,
  ({ one }) => {
    return {
      toOauthJobSeeker: one(oauthJobSeekerTable, {
        fields: [oauthJobSeekerSkillTable.oauthJobSeekerId],
        references: [oauthJobSeekerTable.id],
      }),
      toSkill: one(skillTable, {
        fields: [oauthJobSeekerSkillTable.skillId],
        references: [skillTable.id],
      }),
    };
  }
);

// {Skill in Post}
export const jobFindingPostSkillRelation = relations(
  jobFindingPostSkillTable,
  ({ one }) => {
    return {
      toFindingPost: one(jobFindingPostTable),
      toSkill: one(skillTable),
    };
  }
);

export const jobHiringPostSkillRelation = relations(
  jobHiringPostSkillTable,
  ({ one }) => {
    return {
      toHiringPost: one(jobHiringPostTable),
      toSkill: one(skillTable),
    };
  }
);

// {Job Seeker's Vulnerability}

export const vulnerabilityTypeRelation = relations(
  vulnerabilityTypeTable,
  ({ many }) => {
    return {
      toJobSeeker: many(jobSeekerVulnerabilityTable),
      toOauthJobSeeker: many(oauthJobSeekerVulnerabilityTable),
    };
  }
);

export const jobSeekerVulnerabilityRelation = relations(
  jobSeekerVulnerabilityTable,
  ({ one }) => {
    return {
      toJobSeeker: one(jobSeekerTable, {
        fields: [jobSeekerVulnerabilityTable.jobSeekerId],
        references: [jobSeekerTable.id],
      }),
      toVulnerabilityType: one(vulnerabilityTypeTable, {
        fields: [jobSeekerVulnerabilityTable.vulnerabilityTypeId],
        references: [vulnerabilityTypeTable.id],
      }),
    };
  }
);

export const oauthJobSeekerVulnerabilityRelation = relations(
  oauthJobSeekerVulnerabilityTable,
  ({ one }) => {
    return {
      toOauthJobSeeker: one(oauthJobSeekerTable, {
        fields: [oauthJobSeekerVulnerabilityTable.oauthJobSeekerId],
        references: [oauthJobSeekerTable.id],
      }),
      toVulnerabilityType: one(vulnerabilityTypeTable, {
        fields: [oauthJobSeekerVulnerabilityTable.vulnerabilityTypeId],
        references: [vulnerabilityTypeTable.id],
      }),
    };
  }
);

// {Others}

export const registrationApprovalRelation = relations(
  registrationApprovalTable,
  ({ one, many }) => {
    return {
      // being approved
      approveJobSeeker: one(jobSeekerTable, {
        fields: [registrationApprovalTable.jobSeekerId],
        references: [jobSeekerTable.id],
      }),
      approveOauthJobSeeker: one(oauthJobSeekerTable, {
        fields: [registrationApprovalTable.oauthJobSeekerId],
        references: [oauthJobSeekerTable.id],
      }),
      approveEmployer: one(employerTable, {
        fields: [registrationApprovalTable.employerId],
        references: [employerTable.id],
      }),
      approveOauthEmployer: one(oauthEmployerTable, {
        fields: [registrationApprovalTable.oauthEmployerId],
        references: [oauthEmployerTable.id],
      }),
      approveCompany: one(companyTable, {
        fields: [registrationApprovalTable.companyId],
        references: [companyTable.id],
      }),
      // approved by
      approvedByAdmin: one(adminTable, {
        fields: [registrationApprovalTable.adminId],
        references: [adminTable.id],
      }),
    };
  }
);

export const notificationRelation = relations(notificationTable, ({ one }) => {
  return {
    notifyJobSeeker: one(jobSeekerTable, {
      fields: [notificationTable.jobSeekerId],
      references: [jobSeekerTable.id],
    }),
    notifyOauthJobSeeker: one(oauthJobSeekerTable, {
      fields: [notificationTable.oauthJobSeekerId],
      references: [oauthJobSeekerTable.id],
    }),
    notifyEmployer: one(employerTable, {
      fields: [notificationTable.employerId],
      references: [employerTable.id],
    }),
    notifyOauthEmployer: one(oauthEmployerTable, {
      fields: [notificationTable.oauthEmployerId],
      references: [oauthEmployerTable.id],
    }),
    notifyCompany: one(companyTable, {
      fields: [notificationTable.companyId],
      references: [companyTable.id],
    }),
  };
});
