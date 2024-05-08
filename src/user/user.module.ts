import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Module } from "nestling.js";
import { UserRepository } from "./repository/user.repository";

@Module({
	controller: UserController,
	service: UserService,
	repository: UserRepository
})
export class UserModule {}
