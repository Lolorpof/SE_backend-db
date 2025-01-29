import { IVerifyOptions } from "passport-local";
import { Models } from "../models/models";
import {
  singleUserRegisterSchema,
  schemaValidation,
} from "../validators/usersValidator";

export class Services<T> {
  // boilerplate
  private static ServicesInstances: Map<string, Services<any>> = new Map();
  private table: string;

  private constructor(table: string) {
    this.table = table;
  }

  static instances<T>(table: string): Services<T> {
    if (!this.ServicesInstances.get(table)) {
      this.ServicesInstances.set(table, new Services<T>(table));
    }
    return this.ServicesInstances.get(table) as Services<T>;
  }

  // real part
  // get all
  async getAll() {}
}
