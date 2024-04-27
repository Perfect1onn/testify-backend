import { Controller, Get, Middleware, Post } from "../../decorators";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}
}
