import { usersService } from "../services/usersService";

export class usersController {
  //
  static async getAllUsers(): Promise<any> {
    return usersService.getAllUsers();
  }
}
