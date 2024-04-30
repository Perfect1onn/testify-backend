import { UserEntity, UserService } from "../user";
import { AuthRepository } from "./repository/auth.repository";
import { ErrorHandler } from "../utlis";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

interface TokenPayload {
	name: string;
	email: string;
}

export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly authRepository: AuthRepository
	) {}

	async signUp(userDTO: UserEntity) {
		const user = (await this.userService.createUser(userDTO)) as UserEntity;

		const { accessToken, refreshToken } = this.generateTokens({
			email: user.email,
			name: user.name,
		});

		const savedUser = await this.saveRefreshToken(user, refreshToken);

		return { user: { ...savedUser.dataValues, accessToken }, refreshToken };
	}

	async login(email: string, password: string) {
		const user = await this.userService.getUserByEmail(email);

		if (!user) {
			throw new ErrorHandler("User not found", 404);
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);

		if (!isPasswordCorrect) {
			throw new ErrorHandler("User not found", 404);
		}

		const { accessToken, refreshToken } = this.generateTokens({
			email: user.email,
			name: user.name,
		});

		await this.saveRefreshToken(user, refreshToken);

		return { accessToken, refreshToken };
	}

	generateTokens(payload: TokenPayload) {
		const accessToken = jwt.sign(payload, "access_secret", {
			expiresIn: "15m",
		});

		const refreshToken = jwt.sign(payload, "resfresh_secret", {
			expiresIn: "20d",
		});

		return {
			accessToken,
			refreshToken,
		};
	}

	async refresh(refreshTokenFromCookie: string | undefined) {
		if (!refreshTokenFromCookie) {
			throw new ErrorHandler("refresh token is invalid", 400);
		}

		jwt.verify(refreshTokenFromCookie, "resfresh_secret");
		const user = await this.userService.getUserByToken(refreshTokenFromCookie);

		if(!user) {
			throw new ErrorHandler("refresh token is invalid", 404);
		}

		const {accessToken, refreshToken} = this.generateTokens({
			email: user.email,
			name: user.name
		})

		await this.saveRefreshToken(user, refreshToken)

		return {accessToken, refreshToken}
	}

	async saveRefreshToken(user: UserEntity, refreshToken: string) {
		return await this.authRepository.saveRefreshToken(user, refreshToken);
	}
}
