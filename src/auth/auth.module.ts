import { Module } from "nestling.js";
import { UserModule } from "../user";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./repository/auth.repository";

@Module({
	controller: AuthController,
	service: AuthService,
	repository: AuthRepository,
	foreignServices: [
		{ module: UserModule, injectController: false, injectService: true },
	],
})
export class AuthModule {}
