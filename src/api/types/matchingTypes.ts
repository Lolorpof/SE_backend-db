import { z } from "zod";
import { matchStatusSchema, hiringMatchSeekerSchema, findingMatchHirerSchema } from "../schemas/requestBodySchema";

// Base types from schemas
export type TMatchStatus = z.infer<typeof matchStatusSchema>["status"];
export type THiringMatchSeeker = z.infer<typeof hiringMatchSeekerSchema>;
export type TFindingMatchHirer = z.infer<typeof findingMatchHirerSchema>;

// Database types
export interface TJobHiringPostMatched {
  id: string;
  jobHiringPostId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TJobHiringPostMatchedSeekers {
  jobSeekerType: "NORMAL" | "OAUTH";
  jobSeekerId?: string;
  oauthJobSeekerId?: string;
  jobHiringPostMatchedId: string;
  status: TMatchStatus;
  createdAt: Date;
  approvedAt?: Date;
  updatedAt: Date;
}

export interface TJobFindingPostMatched {
  id: string;
  jobFindingPostId: string;
  status: TMatchStatus;
  jobHirerType: "EMPLOYER" | "OAUTHEMPLOYER" | "COMPANY";
  employerId?: string;
  oauthEmployerId?: string;
  companyId?: string;
  createdAt: Date;
  approvedAt?: Date;
  updatedAt: Date;
} 