import { Controller, Get, Post } from "../../decorators";
import { IRequest, IResponse } from "../types";
import { ErrorHandler } from "../utlis";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("signUp")
	async signUp(req: IRequest, res: IResponse) {
		try {
			const { user, refreshToken } = await this.authService.signUp(req.body);

			return res
				.status(201)
				.cookie("refreshToken", refreshToken, {
					maxAge: 20 * 24 * 60 * 60 * 1000,
					httpOnly: true,
				})
				.send(user);
		} catch (error) {
			if (error instanceof ErrorHandler) {
				return res.status(error.code).send(error.message);
			}
			return res.status(500).send(error);
		}
	}

	@Post("login")
	async login(req: IRequest, res: IResponse) {
		const { email, password } = req.body;

		try {
			const { accessToken, refreshToken } = await this.authService.login(
				email,
				password
			);

			return res
				.status(201)
				.cookie("refreshToken", refreshToken, {
					maxAge: 20 * 24 * 60 * 60 * 1000,
					httpOnly: true,
				})
				.send({ accessToken });
		} catch (error) {
			if (error instanceof ErrorHandler) {
				return res.status(error.code).send(error.message);
			}
			return res.status(500).send(error);
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
			if (error instanceof ErrorHandler) {
				return res.status(error.code).send(error.message);
			}
			return res.status(500).send(error);
		}
	}
}
