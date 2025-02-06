import { Request, Response } from "express";
import { categoryServices } from "../services/categoryServices";

export async function getAllCategories(req: Request, res: Response) {
  const result = await categoryServices.instance().getAll();
  
  if (!result.success || !result.data) {
    res.status(result.status).json({
      success: result.success,
      msg: result.msg
    });
    return;
  }

  res.status(result.status).json({
    success: result.success,
    msg: result.msg,
    data: result.data
  });
}

export async function getCategoryById(req: Request, res: Response) {
  const result = await categoryServices.instance().getById(req.params.id);
  
  if (!result.success || !result.data) {
    res.status(result.status).json({
      success: result.success,
      msg: result.msg
    });
    return;
  }

  res.status(result.status).json({
    success: result.success,
    msg: result.msg,
    data: result.data
  });
}

export async function createCategory(req: Request, res: Response) {
  const result = await categoryServices.instance().create(req.body);
  
  if (!result.success || !result.data) {
    res.status(result.status).json({
      success: result.success,
      msg: result.msg
    });
    return;
  }

  res.status(result.status).json({
    success: result.success,
    msg: result.msg,
    data: result.data
  });
}

export async function updateCategory(req: Request, res: Response) {
  const result = await categoryServices.instance().update(req.params.id, req.body);
  
  if (!result.success || !result.data) {
    res.status(result.status).json({
      success: result.success,
      msg: result.msg
    });
    return;
  }

  res.status(result.status).json({
    success: result.success,
    msg: result.msg,
    data: result.data
  });
}

export async function deleteCategory(req: Request, res: Response) {
  const result = await categoryServices.instance().delete(req.params.id);
  
  if (!result.success || !result.data) {
    res.status(result.status).json({
      success: result.success,
      msg: result.msg
    });
    return;
  }

  res.status(result.status).json({
    success: result.success,
    msg: result.msg,
    data: result.data
  });
} 