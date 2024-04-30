import { UserEntity } from "../../user";

export class AuthRepository {
	async saveRefreshToken(user: UserEntity, refreshToken: string) {
		try {
			user.refreshToken = refreshToken;
			const savedUser = await user.save();

			return savedUser;
		} catch (error) {
			throw error;
		}
	}
}
