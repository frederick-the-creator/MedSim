import fs from "fs";
import path from "path";
import request from "supertest";
import app from "../server/index"; // wherever you export your Express app
import { medicalCases } from "../shared/cases";

describe("POST /api/assessment", () => {
	// it("logs and accepts a MedicalCase", async () => {
	// 	const conversationId = "conv_3501k8c3kr6werjt8z23559x9yks";
	// 	const medicalCase = medicalCases.find((c) => c.id === 4) ?? medicalCases[0];

	// 	const res = await request(app)
	// 		.post("/api/assessment")
	// 		.set("Content-Type", "application/json")
	// 		.send({ conversationId, medicalCase });

	// 	expect(res.status).toBeLessThan(500); // adjust to your route’s expected status (e.g., 200)
	// 	// optionally assert on response shape if your route returns something
	// }, 50000);

	it("Check output schema for assessment with 5 loops", async () => {
		// Case 2 - Dry AMD
		// Mr Ramesh Sharma
		// Transcript is 8:37

		// --- Configuration ---
		const NUM_RUNS = 1; // number of loops
		const logFilePath = path.join(
			import.meta.dirname,
			"testLogs/assessment_log.txt",
		);

		// --- Test data ---
		// Case 2 - Dry AMD
		// Mr Ramesh Sharma
		// Transcript is 8:37
		// const conversationId = "conv_5801k8xfjz0pfm3ryemjs0a0c4fs";
		// const medicalCase = medicalCases.find((c) => c.id === 2) ?? medicalCases[0];

		// Case 3 - Bacterial Conjuncitivis
		// Obi Eze
		// Transcript is 2:23
		// Returned just a single string in summar
		const conversationId = "conv_1801k8xx7enyfxka5n4tyctnbazx";
		const medicalCase = medicalCases.find((c) => c.id === 3) ?? medicalCases[0];

		// --- Loop runs ---
		for (let i = 1; i <= NUM_RUNS; i++) {
			console.log(`\nRun ${i} of ${NUM_RUNS}...`);

			const res = await request(app)
				.post("/api/assessment")
				.set("Content-Type", "application/json")
				.send({ conversationId, medicalCase });

			const logEntry = `
			======================
			Run #${i} — ${new Date().toISOString()}
			======================
			Transcript:
			${res.body.transcript}
			
			Assessment returned from API:
			${JSON.stringify(res.body.assessment, null, 2)}
			
			`;

			// Write to log file (append mode)
			fs.appendFileSync(logFilePath, logEntry, "utf8");
			fs.appendFileSync(logFilePath, `${JSON.stringify(res, null, 2)}`);

			// console.log("Response returned from API");
			// console.log(res);
			console.log(`Run ${i} complete. Logged to ${logFilePath}`);
		}
	}, 120000); // Increase timeout if needed
});
