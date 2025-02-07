import { Request, Response } from "express";
import {
  jobPostSchema,
  jobPostType,
  validUidSchema,
  validUidType,
  jobFindingPostSchema,
  jobFindingPostType,
  getAllJobPostsType,
} from "../schemas/requestBodySchema";
import { postServices } from "../services/postServices";
import { ServerError } from "../types/errorTypes";
import { errorServices } from "../services/errorServices";
import { ZodError } from "zod";
import { handleControllerError } from "../utilities/controllerUtils";

export async function handleGetAllJobPosts(req: Request, res: Response) {
  try {
    const result = await postServices.instance().getAllJobPosts(req.query);
    res.status(result.status).json({
      success: result.success,
      data: result.data,  
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleCreateJobPostFromEmp(req: Request, res: Response) {
  try {
    const validatedData = jobPostSchema.parse(req.body);
    const user = req.user as TEmployerSession;
    
    const result = await postServices.instance().createJobPostFromEmp(validatedData, user);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleCreateJobPostFromCompany(req: Request, res: Response) {
  try {
    // Validate request body against schema
    const validatedData = jobPostSchema.parse(req.body);
    const user = req.user as TCompanySession;
    
    const result = await postServices.instance().createJobPostFromCompany(validatedData, user);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleUpdateJobPost(req: Request, res: Response) {
  try {
    // Validate request params (job post ID)
    const validatedId = validUidSchema.parse(req.params);
    // Validate request body against schema
    const validatedData = jobPostSchema.parse(req.body);
    const user = req.user as TEmployerSession | TCompanySession;

    const result = await postServices.instance().updateJobPost(validatedId.id, validatedData, user);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleGetJobPost(req: Request, res: Response) {
  try {
    const validatedId = validUidSchema.parse(req.params);
    const result = await postServices.instance().getJobPost(validatedId.id);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleDeleteJobPost(req: Request, res: Response) {
  try {
    const validatedId = validUidSchema.parse(req.params);
    const user = req.user as TEmployerSession | TCompanySession;

    const result = await postServices.instance().deleteJobPost(validatedId.id, user);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

// Empty handlers for job posts
export async function dummyHandler(req: Request, res: Response) {
  res.json({
    success: true,
    message: "Dummy handler",
  });
}

export async function handleGetAllJobFindingPosts(req: Request, res: Response) {
  // const result = await postServices.instance().getAllJobFindingPosts(req.query);
  // res.status(result.status).json({
  //   success: result.success,
  //   data: result.data,  
  //   message: result.msg,
  // });
  try {
    const result = await postServices.instance().getAllJobFindingPosts(req.query);
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) { 
    handleControllerError(error, res);
  }
}


export async function handleCreateJobFindingPost(req: Request, res: Response) {
  try {
    const validatedData = jobFindingPostSchema.parse(req.body);
    const user = req.user as TJobSeekerSession;
    
    const result = await postServices.instance().createJobFindingPost(validatedData, user);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}


export async function handleUpdateJobFindingPost(req: Request, res: Response) {
  try {
    const validatedId = validUidSchema.parse(req.params);
    const validatedData = jobFindingPostSchema.parse(req.body);
    const user = req.user as TJobSeekerSession;

    const result = await postServices.instance().updateJobFindingPost(validatedId.id, validatedData, user);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleGetJobFindingPost(req: Request, res: Response) {
  try {
    const validatedId = validUidSchema.parse(req.params);
    const result = await postServices.instance().getJobFindingPost(validatedId.id);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleDeleteJobFindingPost(req: Request, res: Response) {
  try {
    const validatedId = validUidSchema.parse(req.params);
    const user = req.user as TJobSeekerSession;

    const result = await postServices.instance().deleteJobFindingPost(validatedId.id, user);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleGetUserJobFindingPosts(req: Request, res: Response) {
  try {
    const user = req.user as TJobSeekerSession;
    if (!user) {
      throw errorServices.handleAuthError();
    }

    const result = await postServices.instance().getJobFindingPostsByUser(user.id, user.type === "OAUTH");
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleGetEmployerJobPosts(req: Request, res: Response) {
  try {
    const user = req.user as TEmployerSession;
    if (!user) {
      throw errorServices.handleAuthError();
    }

    const result = await postServices.instance().getJobPostsByEmployer(user.id, user.isOauth);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}

export async function handleGetCompanyJobPosts(req: Request, res: Response) {
  try {
    const user = req.user as TCompanySession;
    if (!user) {
      throw errorServices.handleAuthError();
    }

    const result = await postServices.instance().getJobPostsByCompany(user.id);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    handleControllerError(error, res);
  }
}
