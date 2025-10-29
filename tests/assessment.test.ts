import request from "supertest";
import app from "../server/index"; // wherever you export your Express app
import { medicalCases } from "../shared/cases";

describe("POST /api/assessment", () => {
	it("logs and accepts a MedicalCase", async () => {
		const conversationId = "conv_3501k8c3kr6werjt8z23559x9yks";
		const medicalCase = medicalCases.find((c) => c.id === 4) ?? medicalCases[0];

		const res = await request(app)
			.post("/api/assessment")
			.set("Content-Type", "application/json")
			.send({ conversationId, medicalCase });

		console.log("Transcript:", res.body.transcript);
		console.log("Assessment:", res.body.assessment);
		expect(res.status).toBeLessThan(500); // adjust to your route’s expected status (e.g., 200)
		// optionally assert on response shape if your route returns something
	}, 50000);
});
