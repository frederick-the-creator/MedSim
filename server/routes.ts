import type { Express } from "express";
import { createServer, type Server } from "http";

import { assessmentRoute } from "./features/assessment/routes/assessment";
import { coachRoute } from "./features/coach/routes/coach";

export async function registerRoutes(app: Express): Promise<Server> {
	// prefix all routes with /api

	app.post("/api/assessment", assessmentRoute);

	// Chat streaming endpoint
	app.post("/api/chat", coachRoute);

	const httpServer = createServer(app);
	return httpServer;
}
