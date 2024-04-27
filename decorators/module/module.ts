import { Router } from "express";
import { Methods } from "../routes";

interface Constructor {
	new (...args: any[]): any;
}

interface Options {
	controller: Constructor;
	service: Constructor;
	foreignServices?: Constructor[];
	repository: Constructor;
}

export function Module({
	controller: Controller,
	service: Service,
	foreignServices = [],
	repository: Repostitory,
}: Options) {
	const serviceInstances = foreignServices.map(
		(module) => Object.getPrototypeOf(new module()).service
	);

	return function (constructor: Function) {
		/*
			Depedency injection
		*/
		const service = new Service(...serviceInstances, new Repostitory());
		const controller = new Controller(service);

		/*
			Добавление методов к роутеру
		*/
		const prototype = Object.getPrototypeOf(controller);
		const router = Router();
		
		for (let key in prototype) {
			if (typeof prototype[key] === "function") {
				const endpoint = prototype[key];
				const [path, method] = endpoint.pathname as [string, Methods];
				const methodMiddlewares = prototype[key].middlewares
					? prototype[key].middlewares
					: [];
				router[method](
					path,
					...methodMiddlewares,
					prototype[key].bind(controller)
				);
			}
		}

		/* 
			Добавление свойства к прототипу конструктора: router: [modulePath, controllerMiddleware, router]
		*/
		const controllerMiddlewares = prototype.middlewares;

		constructor.prototype["service"] = service;
		constructor.prototype["router"] = [
			prototype.path,
			...controllerMiddlewares,
			router,
		];
	};
}
