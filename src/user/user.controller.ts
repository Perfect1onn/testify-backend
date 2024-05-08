import { Controller, Get, Request, Response } from "nestling.js";
import { authMiddleware } from "../auth/middlewares";
import { UserService } from "./user.service";

@Controller("users", authMiddleware)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async getUsers(req: Request, res: Response) {
		return res.status(200).send(await this.userService.getUsers());
	}

	@Get(":id")
	async getUserById(req: Request, res: Response) {
		return res
			.status(200)
			.send(await this.userService.getUserById(+req.params.id));
	}
}
