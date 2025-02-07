import { jobHirerTypeEnum, postStatusEnum, jobPostTypeEnum, jobSeekerTypeEnum } from "../../db/schema";
import { SerivcesResponse } from "./responseTypes";
import { BaseEntity } from "../services/services";

// Base type for common fields between job posts
export type TBasePost = BaseEntity & {
  title: string;
  description: string | null;
  jobLocation: string;
  workDates: string;
  workHoursRange: string;
  status: typeof postStatusEnum.enumValues[number]; // "MATCHED" | "UNMATCHED" | "MATCHED_INPROG"
  jobPostType: typeof jobPostTypeEnum.enumValues[number]; // "FULLTIME" | "PARTTIME" | "FREELANCE"
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;

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

// Type for job hiring post data
export type TPost = TBasePost & {
  salary: number;
  hiredAmount: number;
  jobHirerType: typeof jobHirerTypeEnum.enumValues[number]; // "EMPLOYER" | "OAUTHEMPLOYER" | "COMPANY"
  
  // Foreign key references
  employerId: string | null;
  oauthEmployerId: string | null;
  companyId: string | null;

  // Additional joined data
  companyName?: string | null; // From company table join
};

// Type for job finding post data
export type TJobFindingPost = TBasePost & {
  expectedSalary: number;
  jobSeekerType: typeof jobSeekerTypeEnum.enumValues[number]; // "NORMAL" | "OAUTH"
  jobSeekerId: string | null;
  oauthJobSeekerId: string | null;
};

// Type for single job post response
export type TPostResponse = {
  success: boolean;
  status: number;
  msg: string;
  data: TPost | TJobFindingPost;
};

// Type for paginated job posts response
export type TPostsResponse<T = TPost> = {
  success: boolean;
  status: number;
  msg: string;
  data: {
    jobPosts: T[];
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
