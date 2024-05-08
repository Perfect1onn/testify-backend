import { ErrorHandler } from "../utlis";
import { UserEntity, User } from "./entites/user.enitity";
import { UserRepository } from "./repository/user.repository";
import bcrypt from "bcrypt";

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async createUser(user: User) {
		if (!user.password) {
			throw new ErrorHandler("Password is not valid", 400);
		}
		const passwordHashed = await bcrypt.hash(user.password, 3);
		return await this.userRepository.createUser({
			...user,
			password: passwordHashed,
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
		return await this.userRepository.getUserBy({ refreshToken: token });
	}
}
