import { ErrorHandler } from "../../utlis";
import { User, UserEntity } from "../entites/user.enitity";
import { ValidationError } from "sequelize";

export class UserRepository {
	async createUser(user: User) {
		try {
			const builtUser = UserEntity.build({ ...user });
			return await builtUser.save();
		} catch (error: unknown) {
			if (error instanceof ValidationError) {
				throw new ErrorHandler(error.errors[0].message, 400);
			}
		}
	}

	async getUsers() {
		return await UserEntity.findAll();
	}

	async getUserBy(search: { [key: string]: any }) {
		return await UserEntity.findOne({
			where: search,
		});
	}
}
