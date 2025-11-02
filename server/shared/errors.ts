export class DomainError extends Error {
	status: number;
	code: string;
	details?: Record<string, unknown>;

	constructor(
		code: string,
		message: string,
		status = 422,
		details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "DomainError";
		this.code = code;
		this.status = status;
		this.details = details;
	}
}


