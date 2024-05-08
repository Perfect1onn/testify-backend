import { config } from "dotenv";
config();

import { Nestling, json } from "nestling.js";
import { AppModule } from "./app.module";
import { sequelize } from "./db";
import cors from "cors";
import cookieParser from "cookie-parser";
import modemailer from "nodemailer";

export const mailTransporter = modemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: +process.env.MAIL_PORT!,
	secure: false,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	},
});

const main = async () => {
	try {
		const app = Nestling.create(AppModule, cors(), cookieParser(), json());

		const port = process.env.PORT || 3000;

		await sequelize.authenticate();
		await sequelize.sync();

		app.listen(port, () => {
			console.log(`[server]: Server is running at http://localhost:${port}`);
		});
	} catch (e) {
		console.log(e);
	}
};

main();
