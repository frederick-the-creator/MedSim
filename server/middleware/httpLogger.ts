import { type Request, type Response, type NextFunction } from "express";
import { log } from "@server/vite";

export function httpLogger(req: Request, res: Response, next: NextFunction) {
	const start = Date.now();
	const path = req.path;
	let capturedJsonResponse: Record<string, any> | undefined = undefined;

	type JsonArgs = Parameters<typeof res.json>;
	const originalResJson = res.json.bind(res);
	res.json = function (...args: JsonArgs) {
		capturedJsonResponse = args[0] as Record<string, any>;
		return originalResJson(...args);
	} as any;

	res.on("finish", () => {
		const duration = Date.now() - start;
		if (path.startsWith("/api")) {
			let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
			if (capturedJsonResponse) {
				logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
			}

			if (logLine.length > 80) {
				logLine = logLine.slice(0, 79) + "…";
			}

			log(logLine);
		}
	});

	next();
}
