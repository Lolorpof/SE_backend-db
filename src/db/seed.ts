import { drizzlePool as db, pool } from "./conn";
import bcrypt from "bcryptjs";
import {
  adminTable,
  jobSeekerTable,
  employerTable,
  companyTable,
  skillTable,
  vulnerabilityTypeTable,
  jobCategoryTable,
  jobSeekerSkillTable,
  jobSeekerVulnerabilityTable,
  jobFindingPostTable,
  jobHiringPostTable,
  jobFindCategoryTable,
  jobHireCategoryTable,
  jobFindingPostSkillTable,
  jobHiringPostSkillTable,
  registrationApprovalTable,
  notificationTable,
  oauthJobSeekerTable,
  oauthEmployerTable,
  oauthJobSeekerSkillTable,
  oauthJobSeekerVulnerabilityTable,
} from "./schema";

const SALT_ROUNDS = 10;

async function seed() {
  try {
    // Clear existing data
    await db.delete(notificationTable);
    await db.delete(registrationApprovalTable);
    await db.delete(jobHiringPostSkillTable);
    await db.delete(jobFindingPostSkillTable);
    await db.delete(jobHireCategoryTable);
    await db.delete(jobFindCategoryTable);
    await db.delete(jobHiringPostTable);
    await db.delete(jobFindingPostTable);
    await db.delete(jobSeekerVulnerabilityTable);
    await db.delete(jobSeekerSkillTable);
    await db.delete(jobCategoryTable);
    await db.delete(vulnerabilityTypeTable);
    await db.delete(skillTable);
    await db.delete(adminTable);
    await db.delete(companyTable);
    await db.delete(employerTable);
    await db.delete(jobSeekerTable);

    // Seed Admin
    const adminPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
    const [admin] = await db
      .insert(adminTable)
      .values({
        username: "admin",
        password: adminPassword,
        email: "admin@example.com",
        contact: "+66123456789",
      })
      .returning();

    // Seed Job Seekers
    const jobSeekerPassword = await bcrypt.hash("seeker123", SALT_ROUNDS);
    const [jobSeeker1, jobSeeker2] = await db
      .insert(jobSeekerTable)
      .values([
        {
          username: "jobseeker1",
          password: jobSeekerPassword,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          contact: "+66987654321",
          aboutMe: "Experienced software developer",
          address: "123 Main St, Bangkok",
          approvalStatus: "APPROVED",
        },
        {
          username: "jobseeker2",
          password: jobSeekerPassword,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          contact: "+66987654322",
          aboutMe: "Fresh graduate looking for opportunities",
          address: "456 Side St, Bangkok",
          approvalStatus: "UNAPPROVED",
        },
      ])
      .returning();

    // Seed Employers
    const employerPassword = await bcrypt.hash("employer123", SALT_ROUNDS);
    const [employer1, employer2] = await db
      .insert(employerTable)
      .values([
        {
          username: "employer1",
          password: employerPassword,
          firstName: "Bob",
          lastName: "Johnson",
          email: "bob.johnson@example.com",
          contact: "+66987654323",
          aboutMe: "HR Manager at Tech Corp",
          address: "789 Corp St, Bangkok",
          approvalStatus: "APPROVED",
        },
        {
          username: "employer2",
          password: employerPassword,
          firstName: "Alice",
          lastName: "Williams",
          email: "alice.williams@example.com",
          contact: "+66987654324",
          aboutMe: "Startup Founder",
          address: "321 Start St, Bangkok",
          approvalStatus: "UNAPPROVED",
        },
      ])
      .returning();

    // Seed OAuth Job Seekers
    const [oauthJobSeeker1, oauthJobSeeker2] = await db
      .insert(oauthJobSeekerTable)
      .values([
        {
          providerId: "google_123456",
          username: "oauth.jobseeker1",
          firstName: "Michael",
          lastName: "Brown",
          email: "michael.brown@gmail.com",
          contact: "+66987654327",
          aboutMe: "Full-stack developer with Google experience",
          address: "567 OAuth St, Bangkok",
          provider: "GOOGLE",
          approvalStatus: "APPROVED",
        },
        {
          providerId: "line_123456",
          username: "oauth.jobseeker2",
          firstName: "Sarah",
          lastName: "Wilson",
          email: "sarah.wilson@line.me",
          contact: "+66987654328",
          aboutMe: "UX Designer with Line experience",
          address: "890 Line St, Bangkok",
          provider: "LINE",
          approvalStatus: "UNAPPROVED",
        },
      ])
      .returning();

    // Seed OAuth Employers
    const [oauthEmployer1, oauthEmployer2] = await db
      .insert(oauthEmployerTable)
      .values([
        {
          providerId: "google_789012",
          username: "oauth.employer1",
          firstName: "David",
          lastName: "Lee",
          email: "david.lee@gmail.com",
          contact: "+66987654329",
          aboutMe: "Tech Lead at Google Thailand",
          address: "123 Google St, Bangkok",
          provider: "GOOGLE",
          approvalStatus: "APPROVED",
        },
        {
          providerId: "line_789012",
          username: "oauth.employer2",
          firstName: "Emily",
          lastName: "Chen",
          email: "emily.chen@line.me",
          contact: "+66987654330",
          aboutMe: "HR Director at Line Thailand",
          address: "456 Line St, Bangkok",
          provider: "LINE",
          approvalStatus: "UNAPPROVED",
        },
      ])
      .returning();

    // Seed Companies
    const companyPassword = await bcrypt.hash("company123", SALT_ROUNDS);
    const [company1, company2] = await db
      .insert(companyTable)
      .values([
        {
          officialName: "Tech Solutions Co., Ltd.",
          password: companyPassword,
          email: "contact@techsolutions.com",
          contact: "+66987654325",
          aboutUs: "Leading technology solutions provider",
          address: "100 Tech Road, Bangkok",
          approvalStatus: "APPROVED",
        },
        {
          officialName: "Digital Innovations Co., Ltd.",
          password: companyPassword,
          email: "contact@digitalinnovations.com",
          contact: "+66987654326",
          aboutUs: "Digital transformation consultancy",
          address: "200 Digital Lane, Bangkok",
          approvalStatus: "UNAPPROVED",
        },
      ])
      .returning();

    // Seed Skills
    const [skill1, skill2, skill3] = await db
      .insert(skillTable)
      .values([
        {
          name: "JavaScript",
          description: "Programming language for web development",
        },
        {
          name: "Python",
          description: "General-purpose programming language",
        },
        {
          name: "Project Management",
          description: "Ability to manage projects and teams",
        },
      ])
      .returning();

    // Seed Vulnerability Types
    const [vulType1, vulType2] = await db
      .insert(vulnerabilityTypeTable)
      .values([
        {
          name: "Physical Disability",
          description: "Physical impairment that affects mobility",
        },
        {
          name: "Visual Impairment",
          description: "Partial or complete loss of vision",
        },
      ])
      .returning();

    // Seed Job Categories
    const [category1, category2, category3] = await db
      .insert(jobCategoryTable)
      .values([
        {
          name: "Software Development",
          description: "Programming and software engineering roles",
        },
        {
          name: "Project Management",
          description: "Project planning and team management roles",
        },
        {
          name: "Data Science",
          description: "Data analysis and machine learning roles",
        },
      ])
      .returning();

    // Seed Job Seeker Skills
    await db.insert(jobSeekerSkillTable).values([
      {
        jobSeekerId: jobSeeker1.id,
        skillId: skill1.id,
      },
      {
        jobSeekerId: jobSeeker1.id,
        skillId: skill2.id,
      },
      {
        jobSeekerId: jobSeeker2.id,
        skillId: skill3.id,
      },
    ]);

    // Seed Job Seeker Vulnerabilities
    await db.insert(jobSeekerVulnerabilityTable).values([
      {
        jobSeekerId: jobSeeker1.id,
        vulnerabilityTypeId: vulType1.id,
        severity: "LOW",
        publicStatus: "SHOWN",
      },
      {
        jobSeekerId: jobSeeker2.id,
        vulnerabilityTypeId: vulType2.id,
        severity: "MEDIUM",
        publicStatus: "HIDDEN",
      },
    ]);

    // Seed Job Finding Posts
    const [findingPost1, findingPost2] = await db
      .insert(jobFindingPostTable)
      .values([
        {
          title: "Looking for Software Developer Position",
          description: "Experienced in JavaScript and Python",
          jobLocation: "Bangkok",
          expectedSalary: 50000,
          workDates: "Monday-Friday",
          workHoursRange: "9:00-18:00",
          status: "UNMATCHED",
          jobSeekerType: "NORMAL",
          jobSeekerId: jobSeeker1.id,
          jobPostType: "FULLTIME",
        },
        {
          title: "Seeking Project Manager Role",
          description: "Fresh graduate with leadership skills",
          jobLocation: "Bangkok",
          expectedSalary: 35000,
          workDates: "Monday-Friday",
          workHoursRange: "9:00-18:00",
          status: "UNMATCHED",
          jobSeekerType: "NORMAL",
          jobSeekerId: jobSeeker2.id,
          jobPostType: "PARTTIME",
        },
      ])
      .returning();


    // Seed Job Hiring Posts
    const [hiringPost1, hiringPost2] = await db
      .insert(jobHiringPostTable)
      .values([
        {
          title: "Senior Software Developer",
          description: "Looking for experienced JavaScript developer",
          jobLocation: "Bangkok",
          salary: 60000,
          workDates: "Monday-Friday",
          workHoursRange: "9:00-18:00",
          status: "UNMATCHED",
          hiredAmount: 2,
          jobHirerType: "EMPLOYER",
          employerId: employer1.id,
          jobPostType: "FULLTIME",
        },
        {
          title: "Data Scientist",
          description: "Looking for data science expert",
          jobLocation: "Bangkok",
          salary: 70000,
          workDates: "Monday-Friday",
          workHoursRange: "9:00-18:00",
          status: "UNMATCHED",
          hiredAmount: 1,
          jobHirerType: "COMPANY",
          companyId: company1.id,
          jobPostType: "PARTTIME",
        },
      ])
      .returning();


    // Seed Job Categories for Posts
    await db.insert(jobFindCategoryTable).values([
      {
        jobFindingPostId: findingPost1.id,
        jobCategoryId: category1.id,
      },
      {
        jobFindingPostId: findingPost2.id,
        jobCategoryId: category2.id,
      },
    ]);

    await db.insert(jobHireCategoryTable).values([
      {
        jobHiringPostId: hiringPost1.id,
        jobCategoryId: category1.id,
      },
      {
        jobHiringPostId: hiringPost2.id,
        jobCategoryId: category3.id,
      },
    ]);

    // Seed Skills for Posts
    await db.insert(jobFindingPostSkillTable).values([
      {
        jobFindingPostId: findingPost1.id,
        skillId: skill1.id,
      },
      {
        jobFindingPostId: findingPost1.id,
        skillId: skill2.id,
      },
      {
        jobFindingPostId: findingPost2.id,
        skillId: skill3.id,
      },
    ]);

    await db.insert(jobHiringPostSkillTable).values([
      {
        jobHiringPostId: hiringPost1.id,
        skillId: skill1.id,
      },
      {
        jobHiringPostId: hiringPost2.id,
        skillId: skill2.id,
      },
    ]);

    // Seed Registration Approvals
    await db.insert(registrationApprovalTable).values([
      {
        status: "ACCEPTED",
        userType: "JOBSEEKER",
        jobSeekerId: jobSeeker1.id,
        adminId: admin.id,
        approvedAt: new Date(),
      },
      {
        status: "UNAPPROVED",
        userType: "JOBSEEKER",
        jobSeekerId: jobSeeker2.id,
      },
      {
        status: "ACCEPTED",
        userType: "EMPLOYER",
        employerId: employer1.id,
        adminId: admin.id,
        approvedAt: new Date(),
      },
      {
        status: "ACCEPTED",
        userType: "COMPANY",
        companyId: company1.id,
        adminId: admin.id,
        approvedAt: new Date(),
      },
    ]);

    // Seed Notifications
    await db.insert(notificationTable).values([
      {
        status: "UNREAD",
        title: "Application Approved",
        description: "Your registration has been approved",
        userType: "JOBSEEKER",
        jobSeekerId: jobSeeker1.id,
      },
      {
        status: "UNREAD",
        title: "New Job Match",
        description: "A new job matching your skills has been posted",
        userType: "JOBSEEKER",
        jobSeekerId: jobSeeker1.id,
      },
      {
        status: "UNREAD",
        title: "Application Approved",
        description: "Your registration has been approved",
        userType: "EMPLOYER",
        employerId: employer1.id,
      },
    ]);

    // Add OAuth Job Seeker Skills
    await db.insert(oauthJobSeekerSkillTable).values([
      {
        oauthJobSeekerId: oauthJobSeeker1.id,
        skillId: skill1.id,
      },
      {
        oauthJobSeekerId: oauthJobSeeker1.id,
        skillId: skill2.id,
      },
      {
        oauthJobSeekerId: oauthJobSeeker2.id,
        skillId: skill3.id,
      },
    ]);

    // Add OAuth Job Seeker Vulnerabilities
    await db.insert(oauthJobSeekerVulnerabilityTable).values([
      {
        oauthJobSeekerId: oauthJobSeeker1.id,
        vulnerabilityTypeId: vulType1.id,
        severity: "LOW",
        publicStatus: "SHOWN",
      },
      {
        oauthJobSeekerId: oauthJobSeeker2.id,
        vulnerabilityTypeId: vulType2.id,
        severity: "MEDIUM",
        publicStatus: "HIDDEN",
      },
    ]);

    // Add OAuth Job Finding Posts
    const [oauthFindingPost1, oauthFindingPost2] = await db
      .insert(jobFindingPostTable)
      .values([
        {
          title: "Senior Full-stack Developer Position",
          description: "Experienced in MERN stack and Python",
          jobLocation: "Bangkok",
          expectedSalary: 80000,
          workDates: "Monday-Friday",
          workHoursRange: "9:00-18:00",
          status: "UNMATCHED",
          jobSeekerType: "OAUTH",
          jobPostType: "FULLTIME",
          oauthJobSeekerId: oauthJobSeeker1.id,
        },
        {
          title: "UX Designer Position",

          description: "Experienced in user research and prototyping",
          jobLocation: "Bangkok",
          expectedSalary: 60000,
          workDates: "Monday-Friday",
          workHoursRange: "9:00-18:00",
          status: "UNMATCHED",
          jobSeekerType: "OAUTH",
          jobPostType: "PARTTIME",
          oauthJobSeekerId: oauthJobSeeker2.id,
        },
      ])

      .returning();

    // Add OAuth Job Hiring Posts
    const [oauthHiringPost1, oauthHiringPost2] = await db
      .insert(jobHiringPostTable)
      .values([
        {
          title: "Full-stack Developer",
          description: "Looking for experienced MERN stack developer",
          jobLocation: "Bangkok",
          salary: 85000,
          workDates: "Monday-Friday",
          workHoursRange: "9:00-18:00",
          status: "UNMATCHED",
          hiredAmount: 2,
          jobHirerType: "OAUTHEMPLOYER",
          oauthEmployerId: oauthEmployer1.id,
          jobPostType: "FULLTIME",
        },
        {
          title: "Senior UX Designer",

          description: "Looking for experienced UX designer",
          jobLocation: "Bangkok",
          salary: 75000,
          workDates: "Monday-Friday",
          workHoursRange: "9:00-18:00",
          status: "UNMATCHED",
          hiredAmount: 1,
          jobHirerType: "OAUTHEMPLOYER",
          oauthEmployerId: oauthEmployer2.id,
          jobPostType: "PARTTIME",
        },
      ])
      .returning();


    // Add Categories for OAuth Posts
    await db.insert(jobFindCategoryTable).values([
      {
        jobFindingPostId: oauthFindingPost1.id,
        jobCategoryId: category1.id,
      },
      {
        jobFindingPostId: oauthFindingPost2.id,
        jobCategoryId: category2.id,
      },
    ]);

    await db.insert(jobHireCategoryTable).values([
      {
        jobHiringPostId: oauthHiringPost1.id,
        jobCategoryId: category1.id,
      },
      {
        jobHiringPostId: oauthHiringPost2.id,
        jobCategoryId: category2.id,
      },
    ]);

    // Add Skills for OAuth Posts
    await db.insert(jobFindingPostSkillTable).values([
      {
        jobFindingPostId: oauthFindingPost1.id,
        skillId: skill1.id,
      },
      {
        jobFindingPostId: oauthFindingPost1.id,
        skillId: skill2.id,
      },
      {
        jobFindingPostId: oauthFindingPost2.id,
        skillId: skill3.id,
      },
    ]);

    await db.insert(jobHiringPostSkillTable).values([
      {
        jobHiringPostId: oauthHiringPost1.id,
        skillId: skill1.id,
      },
      {
        jobHiringPostId: oauthHiringPost2.id,
        skillId: skill2.id,
      },
    ]);

    // Add OAuth Registration Approvals
    await db.insert(registrationApprovalTable).values([
      {
        status: "ACCEPTED",
        userType: "OAUTHJOBSEEKER",
        oauthJobSeekerId: oauthJobSeeker1.id,
        adminId: admin.id,
        approvedAt: new Date(),
      },
      {
        status: "UNAPPROVED",
        userType: "OAUTHJOBSEEKER",
        oauthJobSeekerId: oauthJobSeeker2.id,
      },
      {
        status: "ACCEPTED",
        userType: "OAUTHEMPLOYER",
        oauthEmployerId: oauthEmployer1.id,
        adminId: admin.id,
        approvedAt: new Date(),
      },
      {
        status: "UNAPPROVED",
        userType: "OAUTHEMPLOYER",
        oauthEmployerId: oauthEmployer2.id,
      },
    ]);

    // Add OAuth Notifications
    await db.insert(notificationTable).values([
      {
        status: "UNREAD",
        title: "OAuth Application Approved",
        description: "Your OAuth registration has been approved",
        userType: "OAUTHJOBSEEKER",
        oauthJobSeekerId: oauthJobSeeker1.id,
      },
      {
        status: "UNREAD",
        title: "New Job Match for OAuth User",
        description: "A new job matching your skills has been posted",
        userType: "OAUTHJOBSEEKER",
        oauthJobSeekerId: oauthJobSeeker1.id,
      },
      {
        status: "UNREAD",
        title: "OAuth Application Approved",
        description: "Your OAuth registration has been approved",
        userType: "OAUTHEMPLOYER",
        oauthEmployerId: oauthEmployer1.id,
      },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  }); 