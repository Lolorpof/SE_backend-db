import { Request, Response } from "express";
import { BaseEntity, BaseEntityInput, Services } from "../services/services";
import { SerivcesResponse } from "../types/responseTypes";

export abstract class Controllers<
  T extends BaseEntity,
  TInput extends BaseEntityInput,
  TService extends Services<T, TInput>
> {
  private static ControllersInstances: Map<string, Controllers<any, any, any>> = new Map();
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
    const result = await this.service.getAll();
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

  async getById(req: Request, res: Response) {
    const result = await this.service.getById(req.params.id);
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

  async create(req: Request, res: Response) {
    const result = await this.service.create(req.body);
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

  async update(req: Request, res: Response) {
    const result = await this.service.update(req.params.id, req.body);
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

  async delete(req: Request, res: Response) {
    const result = await this.service.delete(req.params.id);
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
}
