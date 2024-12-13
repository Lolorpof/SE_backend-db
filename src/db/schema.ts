import { desc, relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";

const undef = "UNDEFINED";

// Enum
export const userRoleEnum = pgEnum("userRole", ["MEMBER", "ADMIN"]);

export const severityLvlEnum = pgEnum("severityLvl", ["LOW", "MEDIUM", "HIGH"]);

export const publicStatusEnum = pgEnum("publicStatus", ["SHOWN", "HIDDEN"]);

// Tables

export const userTable = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: userRoleEnum("role").notNull().default("MEMBER"),
  },
  (t) => [
    {
      userPassUnique: unique("user_pass").on(t.username, t.password),
    },
  ]
);

export const oauthUserTable = pgTable("oauth_user", {
  id: uuid("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique().default(undef),
  role: userRoleEnum("role").notNull().default("MEMBER"),
});

export const userProfileTable = pgTable("user_profile", {
  id: uuid("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull().unique(),
  lastName: varchar("last_name", { length: 255 }).notNull().unique(),
  about: varchar("about", { length: 2048 }),
  profilePicture: varchar("profile_picture", { length: 255 })
    .notNull()
    .unique(),
  contact: varchar("contact", { length: 255 }).notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .default("UNDEFINED")
    .references(() => userTable.id),
  oauthUserId: uuid("oauth_user_id")
    .notNull()
    .default("UNDEFINED")
    .references(() => oauthUserTable.id),
});

export const companyTable = pgTable("company", {
  id: uuid("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
});

export const companyProfileTable = pgTable("company_profile", {
  id: uuid("id").primaryKey(),
  about: varchar("about", { length: 2048 }),
  profilePicture: varchar("profile_picture", { length: 255 }),
  contact: varchar("contact", { length: 255 }),
  location: varchar("location", { length: 255 }),
  companyId: uuid("company_id")
    .notNull()
    .unique()
    .references(() => companyTable.id),
});

export const jobSearchingTable = pgTable("job_searching", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 540 }),
  userId: uuid("user_id")
    .notNull()
    .default("UNDEFINED")
    .references(() => userTable.id),
  oauthUserId: uuid("oauth_user_id")
    .notNull()
    .default("UNDEFINED")
    .references(() => oauthUserTable.id),
});

export const jobHiringTable = pgTable("job_hiring", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 540 }),
  companyId: uuid("company_id")
    .notNull()
    .default("UNDEFINED")
    .references(() => companyTable.id),
});

export const jobCategoryTable = pgTable("job_category", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 540 }),
});

export const jobSearchCategoryTable = pgTable(
  "job_search_category",
  {
    jobSearchingId: uuid("job_searching_id")
      .notNull()
      .references(() => jobSearchingTable.id),
    jobCategoryId: uuid("job_category_id")
      .notNull()
      .references(() => jobCategoryTable.id),
  },
  (t) => [
    {
      searchCategoryPK: primaryKey({
        columns: [t.jobSearchingId, t.jobCategoryId],
      }),
    },
  ]
);

export const jobHireCategoryTable = pgTable(
  "job_hire_category",
  {
    jobHiringId: uuid("job_hiring_id")
      .notNull()
      .references(() => jobHiringTable.id),
    jobCategoryId: uuid("job_category_id")
      .notNull()
      .references(() => jobCategoryTable.id),
  },
  (t) => [
    {
      hireCategoryPK: primaryKey({
        columns: [t.jobHiringId, t.jobCategoryId],
      }),
    },
  ]
);

export const vulnerabilityTypeTable = pgTable("vulnerability_type", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 2048 }),
});

export const oauthUserVulnerabilityTable = pgTable(
  "oauth_user_vulnerability",
  {
    id: uuid("id").primaryKey(),
    severity: severityLvlEnum("severity").notNull().default("LOW"),
    publicStatus: publicStatusEnum("public_status").notNull().default("SHOWN"),
    oauthUserId: uuid("oauth_user_id")
      .notNull()
      .references(() => oauthUserTable.id),
    vulnerabilityTypeId: uuid("vulnerability_type_id")
      .notNull()
      .references(() => vulnerabilityTypeTable.id),
  },
  (t) => [
    {
      userVulUnique: unique().on(t.oauthUserId, t.vulnerabilityTypeId),
    },
  ]
);

export const userVulnerabilityTable = pgTable(
  "user_vulnerability",
  {
    id: uuid("id").primaryKey(),
    severity: severityLvlEnum("severity").notNull().default("LOW"),
    publicStatus: publicStatusEnum("public_status").notNull().default("SHOWN"),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id),
    vulnerabilityTypeId: uuid("vulnerability_type_id")
      .notNull()
      .references(() => vulnerabilityTypeTable.id),
  },
  (t) => [
    {
      userVulUnique: unique("user_vul_unique").on(
        t.userId,
        t.vulnerabilityTypeId
      ),
    },
  ]
);

// Relations

export const userRelations = relations(userTable, ({ one, many }) => ({
  userProfile: one(userProfileTable),
  inUserVulnerabilities: many(userVulnerabilityTable),
  jobSearchingPosts: many(jobSearchingTable),
}));

export const oauthUserRelations = relations(
  oauthUserTable,
  ({ one, many }) => ({
    userProfile: one(userProfileTable),
    inOauthUserVulnerabilities: many(userVulnerabilityTable),
    jobSearchingPosts: many(jobSearchingTable),
  })
);

export const userProfileRelations = relations(userProfileTable, ({ one }) => ({
  belongsToUser: one(userTable, {
    fields: [userProfileTable.userId],
    references: [userTable.id],
  }),
  belongsToOauthUser: one(oauthUserTable, {
    fields: [userProfileTable.oauthUserId],
    references: [oauthUserTable.id],
  }),
}));

export const companyRelations = relations(companyTable, ({ one, many }) => ({
  companyProfile: one(companyProfileTable),
  jobHiringPosts: many(jobHiringTable),
}));

export const companyProfileRelations = relations(
  companyProfileTable,
  ({ one }) => ({
    belongsToCompany: one(companyTable, {
      fields: [companyProfileTable.companyId],
      references: [companyTable.id],
    }),
  })
);

export const jobCategoryRelations = relations(jobCategoryTable, ({ many }) => ({
  inSearchCategories: many(jobSearchCategoryTable),
  inHireCategories: many(jobHireCategoryTable),
}));

export const jobSearchingRelations = relations(
  jobSearchingTable,
  ({ one, many }) => ({
    belongsToUser: one(userTable, {
      fields: [jobSearchingTable.userId],
      references: [userTable.id],
    }),
    belongsToOauth: one(oauthUserTable, {
      fields: [jobSearchingTable.oauthUserId],
      references: [oauthUserTable.id],
    }),
    inSearchCategories: many(jobSearchCategoryTable),
  })
);

export const jobHiringRelations = relations(
  jobHiringTable,
  ({ one, many }) => ({
    belongsToCompany: one(companyTable, {
      fields: [jobHiringTable.companyId],
      references: [companyTable.id],
    }),
    inHireCategories: many(jobHireCategoryTable),
  })
);

export const jobSearchCategoryRelations = relations(
  jobSearchCategoryTable,
  ({ one }) => ({
    fromSearching: one(jobSearchingTable, {
      fields: [jobSearchCategoryTable.jobSearchingId],
      references: [jobSearchingTable.id],
    }),
    fromCategory: one(jobCategoryTable, {
      fields: [jobSearchCategoryTable.jobCategoryId],
      references: [jobCategoryTable.id],
    }),
  })
);

export const jobHireCategoryRelations = relations(
  jobHireCategoryTable,
  ({ one }) => ({
    fromHiring: one(jobHiringTable, {
      fields: [jobHireCategoryTable.jobHiringId],
      references: [jobHiringTable.id],
    }),
    fromCategory: one(jobCategoryTable, {
      fields: [jobHireCategoryTable.jobCategoryId],
      references: [jobCategoryTable.id],
    }),
  })
);

export const vulnerabilityTypeRelations = relations(
  vulnerabilityTypeTable,
  ({ many }) => ({
    inUserVulnerabilities: many(userVulnerabilityTable),
    inOauthUserVulnerabilities: many(oauthUserVulnerabilityTable),
  })
);

export const userVulnerabilityRelations = relations(
  userVulnerabilityTable,
  ({ one }) => ({
    fromUser: one(userTable, {
      fields: [userVulnerabilityTable.userId],
      references: [userTable.id],
    }),
    fromVulnerabilityType: one(vulnerabilityTypeTable, {
      fields: [userVulnerabilityTable.vulnerabilityTypeId],
      references: [vulnerabilityTypeTable.id],
    }),
  })
);

export const oauthUserVulnerabilityRelations = relations(
  oauthUserVulnerabilityTable,
  ({ one }) => ({
    fromOauthUser: one(oauthUserTable, {
      fields: [oauthUserVulnerabilityTable.oauthUserId],
      references: [oauthUserTable.id],
    }),
    fromVulnerabilityType: one(vulnerabilityTypeTable, {
      fields: [oauthUserVulnerabilityTable.vulnerabilityTypeId],
      references: [vulnerabilityTypeTable.id],
    }),
  })
);
