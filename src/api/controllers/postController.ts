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
export async function handleGetAllJobPosts(req: Request, res: Response) {
  const result = await postServices.instance().getAllJobPosts(req.query);
  res.status(result.status).json({
    success: result.success,
    data: result.data,  
    message: result.msg,
  });
}
export async function handleCreateJobPostFromEmp(req: Request, res: Response) {
  try {
    // Validate request body against schema
    const validatedData = jobPostSchema.parse(req.body);
    const user = req.user as TEmployerSession;
    
    const result = await postServices.instance().createJobPostFromEmp(validatedData, user);
    
    res.status(result.status).json({
      success: result.success,
      data: result.data,
      message: result.msg,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create job hiring post",
    });
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
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create job hiring post",
    });
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
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update job hiring post",
      error: error.message,
    });
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
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch job post",
      error: error.message,
    });
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
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete job hiring post",
      error: error.message,
    });
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
  const result = await postServices.instance().getAllJobFindingPosts(req.query);
  res.status(result.status).json({
    success: result.success,
    data: result.data,  
    message: result.msg,
  });
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
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create job finding post",
    });
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
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update job finding post",
      error: error.message,
    });
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
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch job finding post",
      error: error.message,
    });
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
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete job finding post",
      error: error.message,
    });
  }
}
