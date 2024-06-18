class ApplicationError extends Error {
  constructor(
    public severity: "error" | "warn" | "info",
    message: string,
    public details?: string,
  ) {
    super(message);
  }

  static unexpectedError(details: string): ApplicationError {
    return new ApplicationError(
      "error",
      "An unexpected error occurred",
      details,
    );
  }

  static invalidUrl(): ApplicationError {
    return new ApplicationError(
      "warn",
      "The url of the current page is not valid",
    );
  }

  static alreadyRegistered(): ApplicationError {
    return new ApplicationError("warn", "That url is already registered");
  }

  static notRegistered(): ApplicationError {
    return new ApplicationError("warn", "That url isn't registered");
  }

  static userDeniedAuthorization(): ApplicationError {
    return new ApplicationError("warn", "Extra permission got denied");
  }
}

export default ApplicationError;
