// src/logger.ts
import pino from "pino";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";
import path from "path";
import pinoPretty from "pino-pretty";

const isDev = process.env.NODE_ENV !== "production";
const LOG_FILE = path.resolve(process.cwd(), "tests/testLogs/test-logs.ndjson");
const fileDest = isDev // Makes the logger synchronous, ensures writing finishes before next task / exit process
	? pino.destination({ dest: LOG_FILE, sync: true })
	: pino.destination({ dest: LOG_FILE }); // async, buffered

const prettyStream = pinoPretty({
	translateTime: "SYS:standard",
	singleLine: false,
	colorize: true,
	messageKey: "msg",
	ignore: "pid,hostname",
});

export const logger = pino(
	{
		// Pino logger instance that you can import elsewhere in your code to log messages (e.g. logger.info('Server started')).
		// Instance has methods to record logs
		// Instead of console.log() -> logger.info()
		// Logger Methods
		// logger.fatal() - Critical failures such as app not starting
		// logger.error() - Errors such as database failures
		// logger.info() - Normal runtime information
		// logger.debug() - Verbose development information
		// logger.trace() - Extremely detailed low-level information

		// Below is specifc configs for our logger

		level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
		// Set LOG_LEVEL via environment variable. If not available and mode is dev, then give detailed level of data

		// base: {
		//   // add your service metadata here if you want
		//   service: process.env.SERVICE_NAME ?? 'api',
		//   version: process.env.COMMIT_SHA,
		// },
		messageKey: "msg", // Explicitly assigns the maing message of the log to the msg key in the output
		formatters: { level: (label) => ({ level: label }) },
	},
	pino.multistream([
		// Allows writing same data to multiple outputs at once
		{ stream: fileDest }, // Write output to file in either dev or production
		...(isDev ? [{ stream: prettyStream }] : []), // Write output to stdout in non-production
	] as any),
);

// src/httpLogger.ts

export const httpLogger = pinoHttp({
	// pinoHttp function creates HTTP middleware for logging requests and responses in JSON format
	// Pino logs the data after a response is returned.

	logger, // Use the logger instance created above

	// Generate a request ID and set on both request and resopnse for traceability
	// Makes it easy to correlate logs from the same request across distributed systems
	// ID is accessible via req.headers.x-request-id
	genReqId: (req: IncomingMessage, res: ServerResponse) => {
		const hdr = (req.headers["x-request-id"] ||
			req.headers["x-correlation-id"]) as string | undefined;
		const id = hdr || randomUUID();
		(req as any).id = id;
		res.setHeader("x-request-id", id);
		return id;
	},

	// Serializer controls what data gets logged
	// Summary Log
	// -- Will always include req & res, additionally err if an error occured
	// -- Event logs only include the objects we choose to log in errorMiddleware
	serializers: {
		// For errors, we use pino built in serialiser (these can convert Error objects into JSON-safe form)
		// Using here extracts message and stack trace using Pino standard serializer
		err: pino.stdSerializers.err,

		// For requests, we use the above created request id, method,
		req: (req: any) => ({
			id: req.id,
			method: req.method,
			url: req.url, // Path and query string of HTTP request
			// optional: remote address data (comment if noisy)
			// remoteAddress: req.socket?.remoteAddress,
			// remotePort: req.socket?.remotePort,
			headers: {
				"user-agent": req.headers["user-agent"],
			},
		}),
		res: pino.stdSerializers.res,
	},

	// --------- Log Configs --- Apply to SUMARRY LOGS ONLY
	// Allows us to change log level dynamically, directly mapping our res.status() code to our logger methods
	// Pino follows the request and when a response is returned it uses the res.status() code to determine logger method to use.
	customLogLevel: function (
		_req: IncomingMessage,
		res: ServerResponse<IncomingMessage>,
		err?: Error,
	) {
		if (err || res.statusCode >= 500) return "error";
		if (res.statusCode >= 400) return "warn";
		return "info";
	},

	// Customise text of log messages
	customSuccessMessage: function (req, res) {
		return "http_request_success";
	},
	customErrorMessage: function (_req, res) {
		return res.statusCode >= 500 ? "http_request_failed" : "http_request_error";
	},

	// Allows us to inject extra fields into each log line
	customProps: function (req, res) {
		const start = (req as any).startTime as bigint | undefined;
		const durMs = start
			? Number((process.hrtime.bigint() - start) / 1_000_000n)
			: undefined;
		return {
			reqId: (req as any).id,
			durationMs: durMs,
			path: (req as any).originalUrl || (req as any).url,
		};
	},
});

// tiny starter to capture precise start time
export function startTimer(req: any, _res: any, next: any) {
	req.startTime = process.hrtime.bigint();
	next();
}
