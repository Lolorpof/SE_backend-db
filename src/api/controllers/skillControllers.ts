import { Request, Response } from "express";
import { skillServices } from "../services/skillServices";

export const getAllSkills = async (req: Request, res: Response) => {
  const result = await skillServices.instance().getAllSkills();
  res.status(result.status).json(result);
};

export const getSkillById = async (req: Request, res: Response) => {
  const result = await skillServices.instance().getSkillById(req.params.id);
  res.status(result.status).json(result);
};

export const createSkill = async (req: Request, res: Response) => {
  const result = await skillServices.instance().createSkill(req.body);
  res.status(result.status).json(result);
};

export const updateSkill = async (req: Request, res: Response) => {
  const result = await skillServices.instance().updateSkill(req.params.id, req.body);
  res.status(result.status).json(result);
};

export const deleteSkill = async (req: Request, res: Response) => {
  const result = await skillServices.instance().deleteSkill(req.params.id);
  res.status(result.status).json(result);
};






