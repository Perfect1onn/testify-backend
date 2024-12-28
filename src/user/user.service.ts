import { User } from "./entites/user.enitity";
import { UserRepository } from "./repository/user.repository";

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async createUser(user: User) {
		return await this.userRepository.createUser({
			...user,
		} as User);
	}

	async getUsers() {
		return await this.userRepository.getUsers();
	}

	async getUserById(id: number) {
		return await this.userRepository.getUserBy({ id });
	}

	async getUserByEmail(email: string) {
		return await this.userRepository.getUserBy({ email: email });
	}

	async getUserByToken(token: string) {
		console.log(token, "getUserByToken")
		return await this.userRepository.getUserBy({ refreshToken: token });
	}
}
