import { config } from "dotenv";
config();

import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { sequelize } from "./db";

const main = async () => {
	try {
		const app: Express = express();

		app.use(express.json());
		app.use(cookieParser());
		app.use(cors());

		const appModule = new AppModule();

		/* 
		
			Добавление роутера модуля к роутеру приложения

			Пример:
			AppModule = {
				userModule: {...} => prototype => router: [ path , router ];
				authModule: {...} => prototype => router: [ path , router ];
			}

		 */
		Object.entries(appModule).forEach(([moduleName, module]) => {
			console.log(`[module]: ${moduleName} is connected`);
			app.use(...Object.getPrototypeOf(module).router);
		});

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
