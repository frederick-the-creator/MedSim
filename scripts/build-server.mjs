import { build } from "esbuild";
import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths";

await build({
	entryPoints: ["server/index.ts"],
	platform: "node",
	packages: "external",
	bundle: true,
	format: "esm",
	outdir: "dist",
	target: ["node20"],
	plugins: [TsconfigPathsPlugin({ tsconfig: "tsconfig.json" })],
});
