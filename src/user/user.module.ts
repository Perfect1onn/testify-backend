import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Module } from "../../decorators";
import { UserRepository } from "./repository/user.repository";

@Module({
	controller: UserController,
	service: UserService,
	repository: UserRepository
})
export class UserModule {}
