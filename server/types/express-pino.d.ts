// src/types/express-pino.d.ts

// Augment the Request type
import type { Logger } from "pino";

declare global {
	namespace Express {
		interface Request {
			log: Logger;
			id?: string;
			startTime?: bigint;
		}
	}
}

// make this file a module
export {};
