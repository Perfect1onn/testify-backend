import { config } from "dotenv";
config();

import cors from "cors";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { Nestling, json, urlencoded } from "nestling.js";
import fileUpload from "express-fileupload";
import modemailer from "nodemailer";
import { sequelize } from "./db";
import ConvertApi from "convertapi";

export const mailTransporter = modemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: +process.env.MAIL_PORT!,
	secure: false,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	},
});

export const convertapi = new ConvertApi(process.env.CONVERT_API_SECRET!);

const main = async () => {
	try {
		const app = Nestling.create(
			AppModule,
			cors(),
			cookieParser(),
			fileUpload(),
			urlencoded({
				extended: false,
			}),
			json()
		);

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
