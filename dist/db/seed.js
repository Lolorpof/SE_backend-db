"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conn_1 = require("./conn");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const schema_1 = require("./schema");
const SALT_ROUNDS = 10;
async function seed() {
    try {
        // Clear existing data
        await conn_1.drizzlePool.delete(schema_1.notificationTable);
        await conn_1.drizzlePool.delete(schema_1.registrationApprovalTable);
        await conn_1.drizzlePool.delete(schema_1.jobHiringPostSkillTable);
        await conn_1.drizzlePool.delete(schema_1.jobFindingPostSkillTable);
        await conn_1.drizzlePool.delete(schema_1.jobHireCategoryTable);
        await conn_1.drizzlePool.delete(schema_1.jobFindCategoryTable);
        await conn_1.drizzlePool.delete(schema_1.jobHiringPostTable);
        await conn_1.drizzlePool.delete(schema_1.jobFindingPostTable);
        await conn_1.drizzlePool.delete(schema_1.jobSeekerVulnerabilityTable);
        await conn_1.drizzlePool.delete(schema_1.jobSeekerSkillTable);
        await conn_1.drizzlePool.delete(schema_1.jobCategoryTable);
        await conn_1.drizzlePool.delete(schema_1.vulnerabilityTypeTable);
        await conn_1.drizzlePool.delete(schema_1.skillTable);
        await conn_1.drizzlePool.delete(schema_1.adminTable);
        await conn_1.drizzlePool.delete(schema_1.companyTable);
        await conn_1.drizzlePool.delete(schema_1.employerTable);
        await conn_1.drizzlePool.delete(schema_1.jobSeekerTable);
        // Seed Admin
        const adminPassword = await bcryptjs_1.default.hash("admin123", SALT_ROUNDS);
        const [admin1, admin2, admin3] = await conn_1.drizzlePool
            .insert(schema_1.adminTable)
            .values([
            {
                username: "admin",
                password: adminPassword,
                email: "admin@example.com",
                contact: "+66123456789",
            },
            {
                username: "admin2",
                password: adminPassword,
                email: "admin2@example.com",
                contact: "+66123456790",
            },
            {
                username: "admin3",
                password: adminPassword,
                email: "admin3@example.com",
                contact: "+66123456791",
            },
        ])
            .returning();
        // Seed Job Seekers
        const jobSeekerPassword = await bcryptjs_1.default.hash("seeker123", SALT_ROUNDS);
        const [jobSeeker1, jobSeeker2, jobSeeker3, jobSeeker4, jobSeeker5, jobSeeker6,] = await conn_1.drizzlePool
            .insert(schema_1.jobSeekerTable)
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
            {
                username: "jobseeker3",
                password: jobSeekerPassword,
                firstName: "Mike",
                lastName: "Johnson",
                email: "mike.johnson@example.com",
                contact: "+66987654323",
                aboutMe: "Senior UX designer with 5 years experience",
                address: "789 Design St, Bangkok",
                approvalStatus: "APPROVED",
            },
            {
                username: "jobseeker4",
                password: jobSeekerPassword,
                firstName: "Sarah",
                lastName: "Wilson",
                email: "sarah.wilson@example.com",
                contact: "+66987654324",
                aboutMe: "Data scientist specializing in AI/ML",
                address: "321 Tech St, Bangkok",
                approvalStatus: "APPROVED",
            },
            {
                username: "jobseeker5",
                password: jobSeekerPassword,
                firstName: "David",
                lastName: "Brown",
                email: "david.brown@example.com",
                contact: "+66987654325",
                aboutMe: "Project manager with agile certification",
                address: "654 Agile St, Bangkok",
                approvalStatus: "UNAPPROVED",
            },
            {
                username: "jobseeker6",
                password: jobSeekerPassword,
                firstName: "Lisa",
                lastName: "Anderson",
                email: "lisa.anderson@example.com",
                contact: "+66987654326",
                aboutMe: "Full-stack developer focused on MERN stack",
                address: "987 Stack St, Bangkok",
                approvalStatus: "APPROVED",
            },
        ])
            .returning();
        // Seed Employers
        const employerPassword = await bcryptjs_1.default.hash("employer123", SALT_ROUNDS);
        const [employer1, employer2, employer3, employer4, employer5, employer6] = await conn_1.drizzlePool
            .insert(schema_1.employerTable)
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
            {
                username: "employer3",
                password: employerPassword,
                firstName: "Tom",
                lastName: "Davis",
                email: "tom.davis@example.com",
                contact: "+66987654325",
                aboutMe: "Technical Recruiter at Global Tech",
                address: "456 Tech St, Bangkok",
                approvalStatus: "APPROVED",
            },
            {
                username: "employer4",
                password: employerPassword,
                firstName: "Emma",
                lastName: "Miller",
                email: "emma.miller@example.com",
                contact: "+66987654326",
                aboutMe: "IT Company Director",
                address: "789 IT St, Bangkok",
                approvalStatus: "APPROVED",
            },
            {
                username: "employer5",
                password: employerPassword,
                firstName: "James",
                lastName: "Wilson",
                email: "james.wilson@example.com",
                contact: "+66987654327",
                aboutMe: "Software Development Manager",
                address: "321 Dev St, Bangkok",
                approvalStatus: "UNAPPROVED",
            },
            {
                username: "employer6",
                password: employerPassword,
                firstName: "Sophie",
                lastName: "Taylor",
                email: "sophie.taylor@example.com",
                contact: "+66987654328",
                aboutMe: "HR Director at Innovation Corp",
                address: "654 Innovation St, Bangkok",
                approvalStatus: "APPROVED",
            },
        ])
            .returning();
        // Seed OAuth Job Seekers
        const [oauthJobSeeker1, oauthJobSeeker2, oauthJobSeeker3, oauthJobSeeker4, oauthJobSeeker5, oauthJobSeeker6,] = await conn_1.drizzlePool
            .insert(schema_1.oauthJobSeekerTable)
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
            {
                providerId: "google_123457",
                username: "oauth.jobseeker3",
                firstName: "Chris",
                lastName: "Lee",
                email: "chris.lee@gmail.com",
                contact: "+66987654329",
                aboutMe: "Backend developer specializing in Python",
                address: "123 Backend St, Bangkok",
                provider: "GOOGLE",
                approvalStatus: "APPROVED",
            },
            {
                providerId: "line_123457",
                username: "oauth.jobseeker4",
                firstName: "Emily",
                lastName: "Chen",
                email: "emily.chen@line.me",
                contact: "+66987654330",
                aboutMe: "Frontend developer with React expertise",
                address: "456 Frontend St, Bangkok",
                provider: "LINE",
                approvalStatus: "APPROVED",
            },
            {
                providerId: "google_123458",
                username: "oauth.jobseeker5",
                firstName: "Daniel",
                lastName: "Kim",
                email: "daniel.kim@gmail.com",
                contact: "+66987654331",
                aboutMe: "Mobile app developer with iOS focus",
                address: "789 Mobile St, Bangkok",
                provider: "GOOGLE",
                approvalStatus: "UNAPPROVED",
            },
            {
                providerId: "line_123458",
                username: "oauth.jobseeker6",
                firstName: "Anna",
                lastName: "Wang",
                email: "anna.wang@line.me",
                contact: "+66987654332",
                aboutMe: "DevOps engineer with cloud expertise",
                address: "321 Cloud St, Bangkok",
                provider: "LINE",
                approvalStatus: "APPROVED",
            },
        ])
            .returning();
        // Seed OAuth Employers
        const [oauthEmployer1, oauthEmployer2, oauthEmployer3, oauthEmployer4, oauthEmployer5, oauthEmployer6,] = await conn_1.drizzlePool
            .insert(schema_1.oauthEmployerTable)
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
            {
                providerId: "google_789013",
                username: "oauth.employer3",
                firstName: "Alex",
                lastName: "Wong",
                email: "alex.wong@gmail.com",
                contact: "+66987654331",
                aboutMe: "Engineering Manager at Tech Startup",
                address: "789 Startup St, Bangkok",
                provider: "GOOGLE",
                approvalStatus: "APPROVED",
            },
            {
                providerId: "line_789013",
                username: "oauth.employer4",
                firstName: "Jessica",
                lastName: "Park",
                email: "jessica.park@line.me",
                contact: "+66987654332",
                aboutMe: "Product Manager at Digital Corp",
                address: "321 Product St, Bangkok",
                provider: "LINE",
                approvalStatus: "APPROVED",
            },
            {
                providerId: "google_789014",
                username: "oauth.employer5",
                firstName: "Ryan",
                lastName: "Zhang",
                email: "ryan.zhang@gmail.com",
                contact: "+66987654333",
                aboutMe: "CTO at Innovation Labs",
                address: "654 Labs St, Bangkok",
                provider: "GOOGLE",
                approvalStatus: "UNAPPROVED",
            },
            {
                providerId: "line_789014",
                username: "oauth.employer6",
                firstName: "Michelle",
                lastName: "Tan",
                email: "michelle.tan@line.me",
                contact: "+66987654334",
                aboutMe: "Talent Acquisition Lead",
                address: "987 Talent St, Bangkok",
                provider: "LINE",
                approvalStatus: "APPROVED",
            },
        ])
            .returning();
        // Seed Companies
        const companyPassword = await bcryptjs_1.default.hash("company123", SALT_ROUNDS);
        const [company1, company2, company3, company4, company5, company6] = await conn_1.drizzlePool
            .insert(schema_1.companyTable)
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
            {
                officialName: "Future Systems Co., Ltd.",
                password: companyPassword,
                email: "contact@futuresystems.com",
                contact: "+66987654327",
                aboutUs: "Next-generation software development",
                address: "300 Future Road, Bangkok",
                approvalStatus: "APPROVED",
            },
            {
                officialName: "Smart Solutions Co., Ltd.",
                password: companyPassword,
                email: "contact@smartsolutions.com",
                contact: "+66987654328",
                aboutUs: "Smart city technology provider",
                address: "400 Smart Lane, Bangkok",
                approvalStatus: "APPROVED",
            },
            {
                officialName: "Cloud Tech Co., Ltd.",
                password: companyPassword,
                email: "contact@cloudtech.com",
                contact: "+66987654329",
                aboutUs: "Cloud computing solutions",
                address: "500 Cloud Road, Bangkok",
                approvalStatus: "UNAPPROVED",
            },
            {
                officialName: "AI Innovations Co., Ltd.",
                password: companyPassword,
                email: "contact@aiinnovations.com",
                contact: "+66987654330",
                aboutUs: "Artificial intelligence research and development",
                address: "600 AI Lane, Bangkok",
                approvalStatus: "APPROVED",
            },
        ])
            .returning();
        // Seed Skills
        const [skill1, skill2, skill3, skill4, skill5, skill6, skill7, skill8, skill9, skill10, skill11, skill12, skill13, skill14, skill15, skill16, skill17, skill18,] = await conn_1.drizzlePool
            .insert(schema_1.skillTable)
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
            {
                name: "React",
                description: "Frontend JavaScript library",
            },
            {
                name: "Node.js",
                description: "JavaScript runtime for backend development",
            },
            {
                name: "DevOps",
                description: "Development and IT operations",
            },
            {
                name: "UI/UX Design",
                description: "User interface and experience design",
            },
            {
                name: "Data Science",
                description: "Statistical analysis and machine learning",
            },
            {
                name: "Cloud Computing",
                description: "AWS, Azure, and GCP platforms",
            },
            // New non-IT skills
            {
                name: "Financial Analysis",
                description: "Analysis of financial data and market trends",
            },
            {
                name: "Digital Marketing",
                description: "Online marketing strategies and campaigns",
            },
            {
                name: "Mechanical Engineering",
                description: "Design and maintenance of mechanical systems",
            },
            {
                name: "Clinical Research",
                description: "Medical research and clinical trials",
            },
            {
                name: "Teaching",
                description: "Educational instruction and curriculum development",
            },
            {
                name: "Graphic Design",
                description: "Visual content creation and branding",
            },
            {
                name: "HR Management",
                description: "Human resources and talent management",
            },
            {
                name: "Sales Strategy",
                description: "Sales techniques and customer relationship",
            },
            {
                name: "Supply Chain Management",
                description: "Logistics and supply chain optimization",
            },
        ])
            .returning();
        // Seed Vulnerability Types
        const [vulType1, vulType2, vulType3, vulType4, vulType5, vulType6] = await conn_1.drizzlePool
            .insert(schema_1.vulnerabilityTypeTable)
            .values([
            {
                name: "Physical Disability",
                description: "Physical impairment that affects mobility",
            },
            {
                name: "Visual Impairment",
                description: "Partial or complete loss of vision",
            },
            {
                name: "Hearing Impairment",
                description: "Partial or complete hearing loss",
            },
            {
                name: "Speech Impairment",
                description: "Difficulty with verbal communication",
            },
            {
                name: "Cognitive Disability",
                description: "Affects learning and information processing",
            },
            {
                name: "Neurodivergent",
                description: "Different neurological variations",
            },
        ])
            .returning();
        // Seed Job Categories
        const [category1, category2, category3, category4, category5, category6, category7, category8, category9, category10, category11, category12, category13, category14, category15, category16, category17, category18,] = await conn_1.drizzlePool
            .insert(schema_1.jobCategoryTable)
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
            {
                name: "UI/UX Design",
                description: "User interface and experience design roles",
            },
            {
                name: "DevOps Engineering",
                description: "Development operations and infrastructure roles",
            },
            {
                name: "Quality Assurance",
                description: "Software testing and quality control roles",
            },
            {
                name: "Product Management",
                description: "Product development and strategy roles",
            },
            {
                name: "Technical Writing",
                description: "Documentation and technical content roles",
            },
            {
                name: "Digital Marketing",
                description: "Online marketing and SEO roles",
            },
            // New non-IT categories
            {
                name: "Finance and Banking",
                description: "Financial services and banking roles",
            },
            {
                name: "Marketing and Communications",
                description: "Marketing strategy and brand management roles",
            },
            {
                name: "Engineering",
                description: "Various engineering disciplines and roles",
            },
            {
                name: "Healthcare and Medical",
                description: "Medical and healthcare professional roles",
            },
            {
                name: "Education and Training",
                description: "Teaching and educational roles",
            },
            {
                name: "Creative Design",
                description: "Creative and artistic design roles",
            },
            {
                name: "Human Resources",
                description: "HR management and recruitment roles",
            },
            {
                name: "Sales",
                description: "Sales and business development roles",
            },
            {
                name: "Logistics and Supply Chain",
                description: "Supply chain and logistics management roles",
            },
        ])
            .returning();
        // Seed Job Seeker Skills
        await conn_1.drizzlePool.insert(schema_1.jobSeekerSkillTable).values([
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
                skillId: skill16.id,
            },
            {
                jobSeekerId: jobSeeker3.id,
                skillId: skill15.id,
            },
            {
                jobSeekerId: jobSeeker3.id,
                skillId: skill7.id,
            },
            {
                jobSeekerId: jobSeeker4.id,
                skillId: skill10.id,
            },
            {
                jobSeekerId: jobSeeker4.id,
                skillId: skill11.id,
            },
            {
                jobSeekerId: jobSeeker5.id,
                skillId: skill12.id,
            },
            {
                jobSeekerId: jobSeeker6.id,
                skillId: skill13.id,
            },
        ]);
        // Seed Job Seeker Vulnerabilities
        await conn_1.drizzlePool.insert(schema_1.jobSeekerVulnerabilityTable).values([
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
            {
                jobSeekerId: jobSeeker3.id,
                vulnerabilityTypeId: vulType3.id,
                severity: "HIGH",
                publicStatus: "SHOWN",
            },
            {
                jobSeekerId: jobSeeker4.id,
                vulnerabilityTypeId: vulType4.id,
                severity: "LOW",
                publicStatus: "HIDDEN",
            },
            {
                jobSeekerId: jobSeeker5.id,
                vulnerabilityTypeId: vulType5.id,
                severity: "MEDIUM",
                publicStatus: "SHOWN",
            },
            {
                jobSeekerId: jobSeeker6.id,
                vulnerabilityTypeId: vulType6.id,
                severity: "HIGH",
                publicStatus: "HIDDEN",
            },
        ]);
        // Seed Job Finding Posts
        const [findingPost1, findingPost2, findingPost3, findingPost4, findingPost5, findingPost6,] = await conn_1.drizzlePool
            .insert(schema_1.jobFindingPostTable)
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
                title: "HR Manager Position Wanted",
                description: "Experienced in talent acquisition and management",
                jobLocation: "Bangkok",
                expectedSalary: 45000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                jobSeekerType: "NORMAL",
                jobSeekerId: jobSeeker2.id,
                jobPostType: "FULLTIME",
            },
            {
                title: "Creative Designer Position",
                description: "5 years of experience in graphic and UI design",
                jobLocation: "Bangkok",
                expectedSalary: 60000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                jobSeekerType: "NORMAL",
                jobSeekerId: jobSeeker3.id,
                jobPostType: "FULLTIME",
            },
            {
                title: "Financial Analyst Position",
                description: "Seeking role in financial analysis and planning",
                jobLocation: "Bangkok",
                expectedSalary: 70000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                jobSeekerType: "NORMAL",
                jobSeekerId: jobSeeker4.id,
                jobPostType: "FULLTIME",
            },
            {
                title: "Mechanical Engineer Position",
                description: "Experienced in mechanical system design",
                jobLocation: "Bangkok",
                expectedSalary: 65000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                jobSeekerType: "NORMAL",
                jobSeekerId: jobSeeker5.id,
                jobPostType: "FULLTIME",
            },
            {
                title: "Clinical Research Position",
                description: "Medical researcher with clinical trial experience",
                jobLocation: "Bangkok",
                expectedSalary: 55000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                jobSeekerType: "NORMAL",
                jobSeekerId: jobSeeker6.id,
                jobPostType: "FULLTIME",
            },
        ])
            .returning();
        // Seed Job Hiring Posts
        const [hiringPost1, hiringPost2, hiringPost3, hiringPost4, hiringPost5, hiringPost6,] = await conn_1.drizzlePool
            .insert(schema_1.jobHiringPostTable)
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
                title: "Marketing Manager",
                description: "Looking for experienced marketing professional",
                jobLocation: "Bangkok",
                salary: 70000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                hiredAmount: 1,
                jobHirerType: "COMPANY",
                companyId: company1.id,
                jobPostType: "FULLTIME",
            },
            {
                title: "Senior Graphic Designer",
                description: "Creative designer needed for branding projects",
                jobLocation: "Bangkok",
                salary: 55000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                hiredAmount: 1,
                jobHirerType: "EMPLOYER",
                employerId: employer2.id,
                jobPostType: "FULLTIME",
            },
            {
                title: "Supply Chain Manager",
                description: "Experienced in logistics and supply chain",
                jobLocation: "Bangkok",
                salary: 65000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                hiredAmount: 1,
                jobHirerType: "COMPANY",
                companyId: company2.id,
                jobPostType: "FULLTIME",
            },
            {
                title: "Medical Researcher",
                description: "Clinical research position in healthcare",
                jobLocation: "Bangkok",
                salary: 45000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                hiredAmount: 1,
                jobHirerType: "EMPLOYER",
                employerId: employer3.id,
                jobPostType: "FULLTIME",
            },
            {
                title: "Sales Director",
                description: "Senior sales position for experienced professional",
                jobLocation: "Bangkok",
                salary: 75000,
                workDates: "Monday-Friday",
                workHoursRange: "9:00-18:00",
                status: "UNMATCHED",
                hiredAmount: 1,
                jobHirerType: "COMPANY",
                companyId: company3.id,
                jobPostType: "FULLTIME",
            },
        ])
            .returning();
        // Seed Job Categories for Posts
        await conn_1.drizzlePool.insert(schema_1.jobFindCategoryTable).values([
            {
                jobFindingPostId: findingPost1.id,
                jobCategoryId: category1.id,
            },
            {
                jobFindingPostId: findingPost2.id,
                jobCategoryId: category16.id,
            },
            {
                jobFindingPostId: findingPost3.id,
                jobCategoryId: category15.id,
            },
            {
                jobFindingPostId: findingPost4.id,
                jobCategoryId: category10.id,
            },
            {
                jobFindingPostId: findingPost5.id,
                jobCategoryId: category12.id,
            },
            {
                jobFindingPostId: findingPost6.id,
                jobCategoryId: category13.id,
            },
        ]);
        await conn_1.drizzlePool.insert(schema_1.jobHireCategoryTable).values([
            {
                jobHiringPostId: hiringPost1.id,
                jobCategoryId: category1.id,
            },
            {
                jobHiringPostId: hiringPost2.id,
                jobCategoryId: category11.id,
            },
            {
                jobHiringPostId: hiringPost3.id,
                jobCategoryId: category15.id,
            },
            {
                jobHiringPostId: hiringPost4.id,
                jobCategoryId: category18.id,
            },
            {
                jobHiringPostId: hiringPost5.id,
                jobCategoryId: category13.id,
            },
            {
                jobHiringPostId: hiringPost6.id,
                jobCategoryId: category17.id,
            },
        ]);
        // Seed Skills for Posts
        await conn_1.drizzlePool.insert(schema_1.jobFindingPostSkillTable).values([
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
                skillId: skill16.id,
            },
            {
                jobFindingPostId: findingPost3.id,
                skillId: skill15.id,
            },
            {
                jobFindingPostId: findingPost4.id,
                skillId: skill10.id,
            },
            {
                jobFindingPostId: findingPost5.id,
                skillId: skill12.id,
            },
            {
                jobFindingPostId: findingPost6.id,
                skillId: skill13.id,
            },
        ]);
        await conn_1.drizzlePool.insert(schema_1.jobHiringPostSkillTable).values([
            {
                jobHiringPostId: hiringPost1.id,
                skillId: skill1.id,
            },
            {
                jobHiringPostId: hiringPost2.id,
                skillId: skill11.id,
            },
            {
                jobHiringPostId: hiringPost3.id,
                skillId: skill15.id,
            },
            {
                jobHiringPostId: hiringPost4.id,
                skillId: skill18.id,
            },
            {
                jobHiringPostId: hiringPost5.id,
                skillId: skill13.id,
            },
            {
                jobHiringPostId: hiringPost6.id,
                skillId: skill17.id,
            },
        ]);
        // Seed Registration Approvals
        await conn_1.drizzlePool.insert(schema_1.registrationApprovalTable).values([
            {
                status: "ACCEPTED",
                userType: "JOBSEEKER",
                jobSeekerId: jobSeeker1.id,
                adminId: admin1.id,
                approvedAt: new Date(),
            },
            {
                status: "UNAPPROVED",
                userType: "JOBSEEKER",
                jobSeekerId: jobSeeker2.id,
            },
            {
                status: "ACCEPTED",
                userType: "JOBSEEKER",
                jobSeekerId: jobSeeker3.id,
                adminId: admin2.id,
                approvedAt: new Date(),
            },
            {
                status: "ACCEPTED",
                userType: "JOBSEEKER",
                jobSeekerId: jobSeeker4.id,
                adminId: admin3.id,
                approvedAt: new Date(),
            },
            {
                status: "UNAPPROVED",
                userType: "JOBSEEKER",
                jobSeekerId: jobSeeker5.id,
            },
            {
                status: "ACCEPTED",
                userType: "JOBSEEKER",
                jobSeekerId: jobSeeker6.id,
                adminId: admin1.id,
                approvedAt: new Date(),
            },
            {
                status: "ACCEPTED",
                userType: "EMPLOYER",
                employerId: employer1.id,
                adminId: admin1.id,
                approvedAt: new Date(),
            },
            {
                status: "ACCEPTED",
                userType: "EMPLOYER",
                employerId: employer3.id,
                adminId: admin2.id,
                approvedAt: new Date(),
            },
            {
                status: "ACCEPTED",
                userType: "EMPLOYER",
                employerId: employer4.id,
                adminId: admin3.id,
                approvedAt: new Date(),
            },
            {
                status: "ACCEPTED",
                userType: "COMPANY",
                companyId: company1.id,
                adminId: admin1.id,
                approvedAt: new Date(),
            },
            {
                status: "ACCEPTED",
                userType: "COMPANY",
                companyId: company3.id,
                adminId: admin2.id,
                approvedAt: new Date(),
            },
            {
                status: "ACCEPTED",
                userType: "COMPANY",
                companyId: company4.id,
                adminId: admin3.id,
                approvedAt: new Date(),
            },
        ]);
        // Seed Notifications
        await conn_1.drizzlePool.insert(schema_1.notificationTable).values([
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
                userType: "JOBSEEKER",
                jobSeekerId: jobSeeker3.id,
            },
            {
                status: "UNREAD",
                title: "Application Approved",
                description: "Your registration has been approved",
                userType: "JOBSEEKER",
                jobSeekerId: jobSeeker4.id,
            },
            {
                status: "UNREAD",
                title: "Application Approved",
                description: "Your registration has been approved",
                userType: "JOBSEEKER",
                jobSeekerId: jobSeeker6.id,
            },
            {
                status: "READ",
                title: "Application Approved",
                description: "Your registration has been approved",
                userType: "EMPLOYER",
                employerId: employer1.id,
            },
            {
                status: "READ",
                title: "New Application",
                description: "You have received a new job application",
                userType: "EMPLOYER",
                employerId: employer1.id,
            },
            {
                status: "UNREAD",
                title: "Profile View",
                description: "Someone viewed your company profile",
                userType: "EMPLOYER",
                employerId: employer1.id,
            },
            {
                status: "UNREAD",
                title: "Application Approved",
                description: "Your registration has been approved",
                userType: "EMPLOYER",
                employerId: employer1.id,
            },
            {
                status: "UNREAD",
                title: "New Message",
                description: "You have a new message from a candidate",
                userType: "EMPLOYER",
                employerId: employer1.id,
            },
            {
                status: "UNREAD",
                title: "Interview Reminder",
                description: "Upcoming interview tomorrow",
                userType: "EMPLOYER",
                employerId: employer1.id,
            },
            {
                status: "UNREAD",
                title: "Application Update",
                description: "A candidate has updated their application",
                userType: "EMPLOYER",
                employerId: employer3.id,
            },
            {
                status: "UNREAD",
                title: "Application Approved",
                description: "Your registration has been approved",
                userType: "EMPLOYER",
                employerId: employer4.id,
            },
            {
                status: "UNREAD",
                title: "Application Approved",
                description: "Your registration has been approved",
                userType: "COMPANY",
                companyId: company1.id,
            },
            {
                status: "READ",
                title: "Application Approved",
                description: "Your registration has been approved",
                userType: "COMPANY",
                companyId: company3.id,
            },
            {
                status: "UNREAD",
                title: "Application Approved",
                description: "Your registration has been approved",
                userType: "COMPANY",
                companyId: company4.id,
            },
        ]);
        // Add OAuth Job Seeker Skills
        await conn_1.drizzlePool.insert(schema_1.oauthJobSeekerSkillTable).values([
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
                skillId: skill7.id,
            },
            {
                oauthJobSeekerId: oauthJobSeeker3.id,
                skillId: skill2.id,
            },
            {
                oauthJobSeekerId: oauthJobSeeker4.id,
                skillId: skill4.id,
            },
            {
                oauthJobSeekerId: oauthJobSeeker5.id,
                skillId: skill5.id,
            },
            {
                oauthJobSeekerId: oauthJobSeeker6.id,
                skillId: skill6.id,
            },
        ]);
        // Add OAuth Job Seeker Vulnerabilities
        await conn_1.drizzlePool.insert(schema_1.oauthJobSeekerVulnerabilityTable).values([
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
            {
                oauthJobSeekerId: oauthJobSeeker3.id,
                vulnerabilityTypeId: vulType3.id,
                severity: "HIGH",
                publicStatus: "SHOWN",
            },
            {
                oauthJobSeekerId: oauthJobSeeker4.id,
                vulnerabilityTypeId: vulType4.id,
                severity: "LOW",
                publicStatus: "HIDDEN",
            },
            {
                oauthJobSeekerId: oauthJobSeeker5.id,
                vulnerabilityTypeId: vulType5.id,
                severity: "MEDIUM",
                publicStatus: "SHOWN",
            },
            {
                oauthJobSeekerId: oauthJobSeeker6.id,
                vulnerabilityTypeId: vulType6.id,
                severity: "HIGH",
                publicStatus: "HIDDEN",
            },
        ]);
        // Seed Job Hiring Post Matches
        const [hiringMatch1, hiringMatch2, hiringMatch3] = await conn_1.drizzlePool
            .insert(schema_1.jobHiringPostMatchedTable)
            .values([
            {
                jobHiringPostId: hiringPost1.id,
            },
            {
                jobHiringPostId: hiringPost2.id,
            },
            {
                jobHiringPostId: hiringPost3.id,
            },
        ])
            .returning();
        // Seed Job Hiring Post Matched Seekers
        await conn_1.drizzlePool.insert(schema_1.jobHiringPostMatchedSeekersTable).values([
            {
                jobSeekerType: "NORMAL",
                jobSeekerId: jobSeeker1.id,
                jobHiringPostMatchedId: hiringMatch1.id,
                status: "INPROGRESS",
            },
            {
                jobSeekerType: "NORMAL",
                jobSeekerId: jobSeeker2.id,
                jobHiringPostMatchedId: hiringMatch1.id,
                status: "ACCEPTED",
                approvedAt: new Date(),
            },
            {
                jobSeekerType: "OAUTH",
                oauthJobSeekerId: oauthJobSeeker1.id,
                jobHiringPostMatchedId: hiringMatch1.id,
                status: "DENIED",
            },
            {
                jobSeekerType: "NORMAL",
                jobSeekerId: jobSeeker3.id,
                jobHiringPostMatchedId: hiringMatch2.id,
                status: "INPROGRESS",
            },
            {
                jobSeekerType: "OAUTH",
                oauthJobSeekerId: oauthJobSeeker2.id,
                jobHiringPostMatchedId: hiringMatch2.id,
                status: "ACCEPTED",
                approvedAt: new Date(),
            },
            {
                jobSeekerType: "NORMAL",
                jobSeekerId: jobSeeker4.id,
                jobHiringPostMatchedId: hiringMatch3.id,
                status: "INPROGRESS",
            },
        ]);
        // Seed Job Finding Post Matches
        await conn_1.drizzlePool.insert(schema_1.jobFindingPostMatchedTable).values([
            {
                jobFindingPostId: findingPost1.id,
                status: "INPROGRESS",
                jobHirerType: "EMPLOYER",
                employerId: employer1.id,
            },
            {
                jobFindingPostId: findingPost2.id,
                status: "ACCEPTED",
                jobHirerType: "COMPANY",
                companyId: company1.id,
                approvedAt: new Date(),
            },
            {
                jobFindingPostId: findingPost3.id,
                status: "DENIED",
                jobHirerType: "OAUTHEMPLOYER",
                oauthEmployerId: oauthEmployer1.id,
            },
            {
                jobFindingPostId: findingPost4.id,
                status: "INPROGRESS",
                jobHirerType: "EMPLOYER",
                employerId: employer2.id,
            },
        ]);
        console.log("Database seeded successfully!");
    }
    catch (error) {
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
    await conn_1.pool.end();
});
