import { Controller, Get, Post, Request, Response } from "nestling.js";
import { sendError } from "../utlis";
import { AuthService } from "./auth.service";
import { RegistrationJSON } from "@passwordless-id/webauthn/dist/esm/types";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("challenge")
	async createChallenge(req: Request, res: Response) {
		try {
			const email = req.body.email as string;
			const createdChallenge = await this.authService.createChallenge(email);
			return res.status(201).send(createdChallenge);
		} catch (error) {
			sendError(res, error);
		}
	}

	@Post("verify-challenge")
	async verifyChallenge(req: Request, res: Response) {
		try {
			const publicKeyCredentialData = req.body as RegistrationJSON;
			const { refreshToken, accessToken, ...user } =
				await this.authService.verifyChallange(publicKeyCredentialData);

			return res
				.status(201)
				.cookie("refreshToken", refreshToken, {
					maxAge: 20 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					secure: false,
					sameSite: "lax",
				})
				.send({ ...user, accessToken });
		} catch (error) {
			sendError(res, error);
		}
	}

	@Post("signUp")
	async signUp(req: Request, res: Response) {
		try {
			const user = await this.authService.signUp(req.body);
			return res.status(201).send(user);
		} catch (error) {
			sendError(res, error);
		}
	}

	@Post("login")
	async login(req: Request, res: Response) {
		const { email } = req.body;
		try {
			const user = await this.authService.login(email);

			res.status(200).send(user);
		} catch (error) {
			sendError(res, error);
		}
	}

	@Post("authenticate")
	async authenticate(req: Request, res: Response) {
		const { email, authenticationJSON } = req.body;
		const { refreshToken, accessToken, ...user } =
			await this.authService.authenticate(email, authenticationJSON);
		try {
			res
				.status(201)
				.cookie("refreshToken", refreshToken, {
					maxAge: 20 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					secure: false,
					sameSite: "lax",
				})
				.send({ ...user, accessToken });
		} catch (error) {
			sendError(res, error);
		}
	}

	@Get("refresh")
	async refresh(req: Request, res: Response) {
		try {
			const { refreshToken } = req.cookies;

			const { accessToken } = await this.authService.refresh(
				refreshToken
			);

			res
				.status(201)
				.cookie("refreshToken", refreshToken, {
					maxAge: 20 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					secure: false,
					sameSite: "lax",
				})
				.send({ accessToken });
		} catch (error) {
			sendError(res, error);
		}
	}

	@Post("verification")
	async sendOTP(req: Request, res: Response) {
		const email = req.body.email;

		try {
			await this.authService.sendOTP(email);
			res.status(201).send("OTP successfully sent");
		} catch (error) {
			sendError(res, error);
		}
	}

	@Post("verify")
	async verifyOTP(req: Request, res: Response) {
		try {
			const id = req.body.id;
			const otp = req.body.otp;

			const { user, refreshToken } = await this.authService.verifyOTP(id, otp);

			return res
				.status(201)
				.cookie("refreshToken", refreshToken, {
					maxAge: 20 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					secure: true,
					sameSite: "none",
				})
				.send(user);
		} catch (error) {
			sendError(res, error);
		}
	}

	@Get("logout")
	async logout(req: Request, res: Response) {
		res.clearCookie("refreshToken");
		res.sendStatus(200);
	}
}
