import { UserEntity } from "../../user";
import OTPEnitity from "../enitites/otp.enitity";

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

	async saveOTP(userId: number, otp: string) {
		const otpInstance = OTPEnitity.build({
			otp,
		});

		otpInstance.set("userId", userId);

		await otpInstance.save();
	}

	async findOTP(userId: number, otp: string) {
		return await OTPEnitity.findOne({
			where: {
				userId,
				otp,
			},
		});
	}

	async deleteOTPS(userId: number) {
		await OTPEnitity.destroy({
			where: {
				userId,
			},
		});
	}
}
