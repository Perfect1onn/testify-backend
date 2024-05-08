import { UserService } from "../user";
import { TestRepository } from "./repository/test.repository";

export class TestService {
	constructor(
		private readonly userService: UserService,
		private readonly testRepository: TestRepository
	) {}
}
