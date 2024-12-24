import { RegistrationInfo } from "@passwordless-id/webauthn/dist/esm/types";
import { User } from "../../user/entites/user.enitity";
import { ChallengeEntity } from "../enitites/challenge.entity";
import { CredentialEntity } from "../enitites/credential.entity";
import { OTPEntity } from "../enitites/otp.enitity";

export class AuthRepository {

	async createChallenge (email: string, challenge: string) {
		try {
			const createdChallenge = await ChallengeEntity.create({
				email,
				challenge,
			})
			return createdChallenge;
		} catch (error) {
			throw error;
		}
	}

	async getCredential(userId: number) {
		return await CredentialEntity.findOne({
			where: {
				userId
			}
		})
	}

	async saveCredential(userId: number, credentialData: RegistrationInfo['credential']) {
		try {
			return await CredentialEntity.create({
				...credentialData,
				userId,
				transports: JSON.stringify(credentialData.transports)
				
			})
		} catch (error) {
			throw error
		}
	}


	async getChallenge (email: string) {
		try {
			return await ChallengeEntity.findOne({
				where: {
					email
				}
			})
		} catch (error) {
			throw error
		}
	}

	async deleteChallenge (email: string) {
		try {
			return await ChallengeEntity.destroy({
				where: {
					email
				}
			})
		} catch (error) {
			throw error
		}
	}


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
