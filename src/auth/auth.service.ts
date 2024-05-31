import { UserService } from "../user";
import { AuthRepository } from "./repository/auth.repository";
import { mailTransporter } from "../main";
import { ErrorHandler } from "../utlis";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../user/entites/user.enitity";

interface TokenPayload {
	name: string;
	email: string;
}

export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly authRepository: AuthRepository
	) {}

	async sendOTP(email: string) {
		if (!email) {
			throw new ErrorHandler("email is invalid", 400);
		}

		const user = await this.userService.getUserByEmail(email);

		if (!user) {
			throw new ErrorHandler(
				`user with such mail ${email} does not exist`,
				400
			);
		}

		const otp = this.generateOTP();

		const mailType = user.isEmailConfirmed ? "verification" : "activation";

		await mailTransporter.sendMail({
			from: process.env.MAIL_USER,
			to: email,
			subject: `Account ${mailType} in Testify`,
			text: "",
			html: `    
			<div>
				<h1>Account ${mailType}</h1>
				<p>Do not share the OTP code with anyone</p>
				<h3>OTP:${otp}</p>
			</div>
			    `,
		});

		await this.authRepository.saveOTP(user.id, otp);
	}

	async verifyOTP(id: number, otp: string) {
		if (!id || !otp) {
			throw new ErrorHandler("not enough data", 400);
		}

		const user = await this.userService.getUserById(id);

		if (!user) {
			throw new ErrorHandler("user not found", 404);
		}

		const OTPFromDB = await this.authRepository.findOTP(id, otp);

		if (!OTPFromDB) {
			throw new ErrorHandler("otp is wrong", 404);
		}

		await this.authRepository.deleteOTPS(id);

		if (!user.isEmailConfirmed) {
			user.isEmailConfirmed = true;
			await user.save();
		}

		const { accessToken, refreshToken } = this.generateTokens({
			email: user.email,
			name: user.name,
		});

		await this.saveRefreshToken(user, refreshToken);

		return { user: { accessToken }, refreshToken };
	}

	generateOTP() {
		let code = "";
		for (let i = 0; i < 4; i++) {
			code += Math.floor(Math.random() * 10).toFixed(0);
		}
		return code;
	}

	async signUp(userDTO: User) {
		const user = (await this.userService.createUser(userDTO)) as User;
		return user;
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

		return user;
	}

	generateTokens(payload: TokenPayload) {
		const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET!, {
			expiresIn: "20d",
		});

		const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET!, {
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

		jwt.verify(refreshTokenFromCookie, process.env.REFRESH_SECRET!);
		const tokenPayload = jwt.decode(refreshTokenFromCookie) as TokenPayload

		const user = await this.userService.getUserByEmail(tokenPayload.email)

		if (!user) {
			throw new ErrorHandler("refresh token is invalid", 404);
		}

		const { accessToken, refreshToken } = this.generateTokens({
			email: user.email,
			name: user.name,
		});

		await this.saveRefreshToken(user, refreshToken);

		return { accessToken, refreshToken };
	}

	async saveRefreshToken(user: User, refreshToken: string) {
		return await this.authRepository.saveRefreshToken(user, refreshToken);
	}
}
