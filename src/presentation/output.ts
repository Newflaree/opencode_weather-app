import { green, red, yellow, cyan } from "../utils/colors.ts";

export const success = (msg: string): void => console.log(green(msg));
export const error = (msg: string): void => console.log(red(msg));
export const warn = (msg: string): void => console.log(yellow(msg));
export const info = (msg: string): void => console.log(msg);
export const title = (msg: string): void => console.log(cyan(msg));