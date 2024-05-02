import { Controller, Get, Post } from "../../decorators";
import { IRequest, IResponse } from "../types";
import { sendError } from "../utlis";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("signUp")
	async signUp(req: IRequest, res: IResponse) {
		try {
			const user = await this.authService.signUp(req.body);
			return res.status(201).send(user);
		} catch (error) {
			sendError(res, error);
		}
	}

	@Post("login")
	async login(req: IRequest, res: IResponse) {
		const { email, password } = req.body;

		try {
			const user = await this.authService.login(email, password);

			res.status(200).send(user);
		} catch (error) {
			sendError(res, error);
		}
	}

	@Get("refresh")
	async refresh(req: IRequest, res: IResponse) {
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
				})
				.send({ accessToken });
		} catch (error) {
			sendError(res, error);
		}
	}

	@Post("verification")
	async sendOTP(req: IRequest, res: IResponse) {
		const email = req.body.email;

		try {
			await this.authService.sendOTP(email);
			res.status(201).send("OTP successfully sent");
		} catch (error) {
			sendError(res, error);
		}
	}

	@Post("verify")
	async verifyOTP(req: IRequest, res: IResponse) {
		try {
			const id = req.body.id;
			const otp = req.body.otp;

			const { user, refreshToken } = await this.authService.verifyOTP(id, otp);

			return res
				.status(201)
				.cookie("refreshToken", refreshToken, {
					maxAge: 20 * 24 * 60 * 60 * 1000,
					httpOnly: true,
				})
				.send(user);
		} catch (error) {
			sendError(res, error);
		}
	}

	@Get("logout")
	async logout(req: IRequest, res: IResponse) {
		res.clearCookie("refreshToken")
		res.sendStatus(200)
	}
}
