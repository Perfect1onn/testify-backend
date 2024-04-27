import type { NextFunction } from "express";
import type { IRequest, IResponse } from "../../src/types";


/*
	Декоратор миддлвары добавляет в метод свойство middlewares: [fn, fn, fn].


	Note: Сначала выполняютсся миддлвары контроллера только потом метода.
	Note: Декораторы выполянются снизу вверх.
*/
export function Middleware(
	...midlewares: ((req: IRequest, res: IResponse, next: NextFunction) => void)[]
) {
	return function (
		target: any,
		propertyName: string,
		descriptor: PropertyDescriptor
	) {
		descriptor.value["middlewares"]
			? descriptor.value["middlewares"].push(...midlewares)
			: (descriptor.value["middlewares"] = [...midlewares]);
	};
}
