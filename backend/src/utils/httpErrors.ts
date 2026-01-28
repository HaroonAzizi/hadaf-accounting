export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor({
    status = 500,
    code = "INTERNAL_ERROR",
    message = "Error",
    details,
  }: {
    status?: number;
    code?: string;
    message?: string;
    details?: unknown;
  } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
