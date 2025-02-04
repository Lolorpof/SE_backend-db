import { jobHirerTypeEnum, postStatusEnum, jobPostTypeEnum } from "../../db/schema";

// Base type for job hiring post data
export type TPost = {
  // Basic post information
  id: string;
  title: string;
  description: string | null;
  jobLocation: string;
  salary: number;
  workDates: string;
  workHoursRange: string;
  hiredAmount: number;
  status: typeof postStatusEnum.enumValues[number]; // "MATCHED" | "UNMATCHED" | "MATCHED_INPROG"
  jobHirerType: typeof jobHirerTypeEnum.enumValues[number]; // "EMPLOYER" | "OAUTHEMPLOYER" | "COMPANY"
  jobPostType: typeof jobPostTypeEnum.enumValues[number]; // "FULLTIME" | "PARTTIME" | "FREELANCE"
  
  // Foreign key references
  employerId: string | null;
  oauthEmployerId: string | null;
  companyId: string | null;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Additional joined data
  companyName?: string | null; // From company table join
  
  // Skills and Categories
  skills?: {
    id: string;
    name: string;
    description: string | null;
  }[];
  
  jobCategories?: {
    id: string;
    name: string;
    description: string | null;
  }[];
};

// Type for single job post response
export type TPostResponse = {
  success: boolean;
  status: number;
  msg: string;
  data: TPost;
};

// Type for paginated job posts response
export type TPostsResponse = {
  success: boolean;
  status: number;
  msg: string;
  data: {
    jobPosts: TPost[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
};

// Type for service response with job hiring post data
export type TPostServiceResponse = SerivcesResponse<TPostResponse | TPostsResponse>;
