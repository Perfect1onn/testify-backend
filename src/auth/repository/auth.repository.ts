import { User } from "../../user/entites/user.enitity";
import { OTPEntity } from "../enitites/otp.enitity";

export class AuthRepository {
	async saveRefreshToken(user: User, refreshToken: string) {
		try {
			user.refreshToken = refreshToken;
			const savedUser = await user.save();

			return savedUser;
		} catch (error) {
			throw error;
		}
	}

	async saveOTP(userId: number, otp: string) {
		const otpInstance = OTPEntity.build({
			otp,
		});

		otpInstance.set("userId", userId);

		await otpInstance.save();
	}

	async findOTP(userId: number, otp: string) {
		return await OTPEntity.findOne({
			where: {
				userId,
				otp,
			},
		});
	}

	async deleteOTPS(userId: number) {
		await OTPEntity.destroy({
			where: {
				userId,
			},
		});
	}
}
