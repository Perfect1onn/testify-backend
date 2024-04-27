import { UserRepository } from "./repository/user.repository";

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}
}
