interface APIErrorMessage {
  message: string;
}

export class APIError extends Error {
  errors: string[];

  constructor(errors: APIErrorMessage[]) {
    super();
    this.errors = errors.map((t) => t.message);
  }
}
