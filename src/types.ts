import { Request, Response } from "express";

export interface IRequest extends Request {
      tosh: string,
      salam: string,
}

export interface IResponse extends Response {}