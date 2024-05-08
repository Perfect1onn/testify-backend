import { Module } from "nestling.js";
import { UserModule } from "../user";
import { TestRepository } from "./repository/test.repository";
import { TestController } from "./test.controller";
import { TestService } from "./test.service";

@Module({
	controller: TestController,
	service: TestService,
	repository: TestRepository,
	foreignServices: [
		{ module: UserModule, injectController: false, injectService: true },
	],
})
export class TestModule {}
