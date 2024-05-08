import { Controller, Get, Request, Response } from "nestling.js";
import { TestService } from "./test.service";

@Controller("tests")
export class TestController {
	constructor(
		private readonly testService: TestService
	) {}

	@Get()
	async createTest(req: Request, res: Response) {
		// TODO
	}
}
