import type { Express } from "express";
import { createServer as createHttpServer, type Server as HttpServer } from "http";
import { createServer as createHttpsServer, type Server as HttpsServer } from "https";
import fs from "fs";
import path from "path";

import { assessmentRoute } from "./features/assessment/routes/assessment";
import { coachRoute } from "./features/coach/routes/coach";

export async function registerRoutes(app: Express): Promise<HttpServer | HttpsServer> {
	// prefix all routes with /api

	app.post("/api/assessment", assessmentRoute);

	// Chat streaming endpoint
	app.post("/api/chat", coachRoute);

	const useLocalHttps =
		app.get("env") === "development" && process.env.LOCAL_HTTPS === "1";

	if (useLocalHttps) {
		const keyPath = path.resolve(import.meta.dirname, "..", "certs", "key.pem");
		const certPath = path.resolve(import.meta.dirname, "..", "certs", "cert.pem");
		const key = fs.readFileSync(keyPath);
		const cert = fs.readFileSync(certPath);
		return createHttpsServer({ key, cert }, app);
	}

	return createHttpServer(app);
}
