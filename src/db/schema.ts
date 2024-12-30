import { desc, relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  unique,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";

const undef = "UNDEFINED";

// Enum
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

export const severityLvlEnum = pgEnum("severityLvl", ["LOW", "MEDIUM", "HIGH"]);

export const publicStatusEnum = pgEnum("publicStatus", ["SHOWN", "HIDDEN"]);

export const oauthTypeEnum = pgEnum("oauthType", ["GOOGLE", "LINE"]);

export const postStatusEnum = pgEnum("postStatus", ["MATCHED", "UNMATCHED"]);

export const jobSeekerTypeEnum = pgEnum("jobSeekerType", ["AUTHEN", "OAUTH"]);

export const jobHirerTypeEnum = pgEnum("jobHirerType", [
  "AUTHENEMPLOYER",
  "OAUTHEMPLOYER",
  "AUTHENCOMPANY",
  "OAUTHCOMPANY",
]);

// Tables

export const generalAddressTable = pgTable(
  "general_address",
  {
    id: uuid("id").primaryKey(),
    province: varchar("province").notNull(),
    district: varchar("district").notNull(),
    subdistrict: varchar("sub_district").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    {
      uniqueAddr: unique().on(t.province, t.district, t.subdistrict),
    },
  ]
);

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
    generalAddrId: uuid("general_addr_id").references(
      () => generalAddressTable.id
    ),
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
    generalAddrId: uuid("general_addr_id").references(
      () => generalAddressTable.id
    ),
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
    generalAddrId: uuid("general_addr_id").references(
      () => generalAddressTable.id
    ),
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
    generalAddrId: uuid("general_addr_id").references(
      () => generalAddressTable.id
    ),
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
  generalAddrId: uuid("general_addr_id").references(
    () => generalAddressTable.id
  ),
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
  generalAddrId: uuid("general_addr_id").references(
    () => generalAddressTable.id
  ),
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

export const jobFindingPostTable = pgTable("job_finding_post", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 540 }),
  status: postStatusEnum("status").notNull().default("UNMATCHED"),
  userType: jobSeekerTypeEnum("user_type").notNull(),
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
  status: postStatusEnum("status").notNull().default("UNMATCHED"),
  userType: jobHirerTypeEnum("job_hirer_type").notNull(),
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

export const jobCategoryTable = pgTable("job_category", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 540 }),
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
    jobHiringPostId: uuid("job_hiring_id")
      .notNull()
      .references(() => jobHiringPostTable.id),
    jobCategoryId: uuid("job_category_id")
      .notNull()
      .references(() => jobCategoryTable.id),
  },
  (t) => [
    {
      hireCategoryPK: primaryKey({
        columns: [t.jobHiringPostId, t.jobCategoryId],
      }),
    },
  ]
);

export const vulnerabilityTypeTable = pgTable("vulnerability_type", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 2048 }),
});

export const oauthJobSeekerVulnerabilityTable = pgTable(
  "oauth_job_seeker_vulnerability",
  {
    id: uuid("id").primaryKey(),
    severity: severityLvlEnum("severity").notNull().default("LOW"),
    publicStatus: publicStatusEnum("public_status").notNull().default("SHOWN"),
    oauthJobSeekerId: uuid("oauth_job_seeker_id")
      .notNull()
      .references(() => oauthJobSeekerTable.id),
    vulnerabilityTypeId: uuid("vulnerability_type_id")
      .notNull()
      .references(() => vulnerabilityTypeTable.id),
  },
  (t) => [
    {
      userVulUnique: unique().on(t.oauthJobSeekerId, t.vulnerabilityTypeId),
    },
  ]
);

export const jobSeekerVulnerabilityTable = pgTable(
  "job_seeker_vulnerability",
  {
    id: uuid("id").primaryKey(),
    severity: severityLvlEnum("severity").notNull().default("LOW"),
    publicStatus: publicStatusEnum("public_status").notNull().default("SHOWN"),
    jobSeekerId: uuid("job_seeker_id")
      .notNull()
      .references(() => jobSeekerTable.id),
    vulnerabilityTypeId: uuid("vulnerability_type_id")
      .notNull()
      .references(() => vulnerabilityTypeTable.id),
  },
  (t) => [
    {
      userVulUnique: unique("user_vul_unique").on(
        t.jobSeekerId,
        t.vulnerabilityTypeId
      ),
    },
  ]
);

// Relations
