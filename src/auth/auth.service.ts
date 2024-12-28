import { UserService } from "../user";
import { AuthRepository } from "./repository/auth.repository";
import { mailTransporter } from "../main";
import { ErrorHandler } from "../utlis";
import jwt from "jsonwebtoken";
import { User } from "../user/entites/user.enitity";
import { server } from "@passwordless-id/webauthn";
import {
	AuthenticationJSON,
	RegistrationInfo,
	RegistrationJSON,
} from "@passwordless-id/webauthn/dist/esm/types";

interface TokenPayload {
	name: string;
	email: string;
}

export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly authRepository: AuthRepository
	) {}

	async createChallenge(email: string) {
		if (!email) {
			throw new ErrorHandler("email is invalid", 400);
		}

		const savedChallenge = await this.authRepository.getChallenge(email);

		if (savedChallenge) {
			await this.authRepository.deleteChallenge(email);
		}

		const newChallenge = server.randomChallenge();

		return await this.authRepository.createChallenge(email, newChallenge);
	}

	async authenticate(email: string, authenticationJSON: AuthenticationJSON) {
		const challengeObject = await this.authRepository.getChallenge(email);

		if (!challengeObject) {
			throw new ErrorHandler(
				`challenge with such mail ${email} does not exist`,
				400
			);
		}

		const user = await this.userService.getUserByEmail(email);

		if (!user) {
			throw new ErrorHandler(
				`user with such mail ${email} does not exist`,
				400
			);
		}

		const credential = await this.authRepository.getCredential(
			user.dataValues.id
		);

		if (!credential) {
			throw new ErrorHandler(
				`user with such mail ${email} does not exist`,
				400
			);
		}

		const { id, algorithm, publicKey, transports } = credential;

		const expected = {
			challenge: challengeObject.challenge,
			origin: process.env.FRONTEND_URL!,
			userVerified: true, // should be set if `userVerification` was set to `required` in the authentication options (default)
		};

		await server.verifyAuthentication(
			authenticationJSON,
			{
				id,
				algorithm,
				publicKey,
				transports: JSON.parse(transports),
			} as RegistrationInfo["credential"],
			expected
		);

		const { accessToken, refreshToken } = this.generateTokens({
			email: user.email,
			name: user.name,
		});

		await this.saveRefreshToken(user, refreshToken);

		return { ...user.dataValues, accessToken };
	}

	async verifyChallange(publicKeyCredentialData: RegistrationJSON) {
		const email = publicKeyCredentialData.user.displayName!;
		const challengeObject = await this.authRepository.getChallenge(email);

		if (!challengeObject) {
			throw new ErrorHandler(
				`challenge with such mail ${email} does not exist`,
				400
			);
		}

		const expected = {
			challenge: challengeObject.challenge,
			origin: process.env.FRONTEND_URL!,
		};

		try {
			const registrationParsed = await server.verifyRegistration(
				publicKeyCredentialData,
				expected
			);
			const [name, surname] = registrationParsed.user.name.split(" ");
			const newUser = {
				name,
				surname,
				email,
			} as User;

			const user = await this.signUp(newUser);

			console.log(user);
			await this.authRepository.saveCredential(
				user.dataValues.id,
				registrationParsed["credential"]
			);

			const { accessToken, refreshToken } = this.generateTokens({
				email: user.email,
				name: user.name,
			});

			await this.saveRefreshToken(user, refreshToken);

			return { ...user.dataValues, accessToken };
		} catch (error) {
			console.log(error);
			throw new ErrorHandler(
				`verify challenge was ${JSON.stringify(error)} failed`,
				400
			);
		}
	}

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

	async login(email: string) {
		const user = await this.userService.getUserByEmail(email);

		if (!user) {
			throw new ErrorHandler("User not found", 404);
		}

		const credential = await this.authRepository.getCredential(
			user.dataValues.id
		);

		if (!credential) {
			throw new ErrorHandler(
				`user with such mail ${email} does not exist`,
				400
			);
		}

		const { challenge } = await this.createChallenge(email);

		return {
			challenge,
			allowCredentials: [
				{ id: credential.id, transports: JSON.parse(credential.transports) },
			],
		};
	}

	generateTokens(payload: TokenPayload) {
		const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET!, {
			expiresIn: "30d",
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
			throw new ErrorHandler("access token is invalid", 400);
		}

		const user = await this.userService.getUserByToken(refreshTokenFromCookie);

		if (!user) {
			throw new ErrorHandler("refresh token is invalid", 404);
		}

		jwt.verify(user.refreshToken, process.env.REFRESH_SECRET!);

		const { accessToken } = this.generateTokens({
			email: user.email,
			name: user.name,
		});

		return { accessToken };
	}

	async saveRefreshToken(user: User, refreshToken: string) {
		return await this.authRepository.saveRefreshToken(user, refreshToken);
	}
}
