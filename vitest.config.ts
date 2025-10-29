import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	// Ensure Vitest runs from the repo root (not Vite's client root)
	root: path.resolve(__dirname),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "client", "src"),
			"@shared": path.resolve(__dirname, "shared"),
			"@prompts": path.resolve(__dirname, "shared", "prompts"),
			"@assets": path.resolve(__dirname, "attached_assets"),
			"@server": path.resolve(__dirname, "server"),
			"@middleware": path.resolve(__dirname, "server", "middleware"),
		},
	},
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
		globals: true,
	},
});
