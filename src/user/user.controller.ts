import { Controller, Get } from "../../decorators";
import { authMiddleware } from "../auth/middlewares";
import { IRequest, IResponse } from "../types";
import { UserService } from "./user.service";

@Controller("users", authMiddleware)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async getUsers(req: IRequest, res: IResponse) {
		return res.status(200).send(await this.userService.getUsers());
	}

	@Get(":id")
	async getUserById(req: IRequest, res: IResponse) {
		return res
			.status(200)
			.send(await this.userService.getUserById(+req.params.id));
	}
}
