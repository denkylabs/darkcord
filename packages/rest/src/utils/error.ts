export class DiscordAPIError extends Error {
  constructor(public router: string, public method: string, public code: number, errors: Record<string, unknown>) {
    super();

    this.name = "DiscordAPIError";
    if (Array.isArray(errors)) {
      errors.push({ code, method, router });
    } else {
      errors.code = code;
      errors.method = method;
      errors.router = router;
    }
    this.message = JSON.stringify(errors, null, 4);
  }
}

export class RequestError extends Error {
  constructor(public router: string, public method: string, public message: string, public name: string, public code: number) {
    super();
    this.name = "RequestError";
  }
}
