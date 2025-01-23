import { Request, Response } from "express";
import { Services } from "../services/services";

export class Controllers<T> {
  // boilerplate
  private static ControllerInstances: Map<string, Controllers<any>> = new Map();
  private table: string;

  private constructor(table: string) {
    this.table = table;
  }

  static instances<T>(table: string): Controllers<T> {
    if (!this.ControllerInstances.get(table)) {
      this.ControllerInstances.set(table, new Controllers<T>(table));
    }
    return this.ControllerInstances.get(table) as Controllers<T>;
  }

  // real part
  // get all
  async getAll() {}
}
