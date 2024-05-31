import { Controller, Get, Post, Request, Response } from "nestling.js";
import { sendError } from "../utlis";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

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
		const { email, password } = req.body;
		try {
			const user = await this.authService.login(email, password);

			res.status(200).send(user);
		} catch (error) {
			sendError(res, error);
		}
	}

	@Get("refresh")
	async refresh(req: Request, res: Response) {
		try {
			const { refreshToken: refreshTokenFromCookie } = req.cookies;

			const { accessToken, refreshToken } = await this.authService.refresh(
				refreshTokenFromCookie
			);

			res
				.status(201)
				.cookie("refreshToken", refreshToken, {
					maxAge: 20 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					secure: true,
					sameSite: "none"
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
					sameSite: 'none'
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
