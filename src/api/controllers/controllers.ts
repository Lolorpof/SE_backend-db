import { Request, Response } from "express";
import { BaseEntity, BaseEntityInput, Services } from "../services/services";
import { ServicesResponse } from "../types/responseTypes";
import { handleControllerError } from "../utilities/controllerUtils";

export abstract class Controllers<
  T extends BaseEntity,
  TInput extends BaseEntityInput,
  TService extends Services<T, TInput>
> {
  private static ControllersInstances: Map<string, Controllers<any, any, any>> =
    new Map();
  protected service: TService;

  protected constructor(service: TService) {
    this.service = service;
  }

  protected static getInstance<C extends Controllers<any, any, any>>(
    this: new (...args: any[]) => C,
    ...args: any[]
  ): C {
    const key = this.name;
    if (!Controllers.ControllersInstances.has(key)) {
      Controllers.ControllersInstances.set(key, new this(...args));
    }
    return Controllers.ControllersInstances.get(key) as C;
  }

  async getAll(req: Request, res: Response) {
    try {
      const result = await this.service.getAll();
      res.status(result.status).json({
        success: result.success,
        message: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await this.service.getById(req.params.id);
      res.status(result.status).json({
        success: result.success,
        message: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await this.service.create(req.body);
      res.status(result.status).json({
        success: result.success,
        message: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await this.service.update(req.params.id, req.body);
      res.status(result.status).json({
        success: result.success,
        message: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await this.service.delete(req.params.id);
      res.status(result.status).json({
        success: result.success,
        message: result.msg,
        data: result.data,
      });
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
