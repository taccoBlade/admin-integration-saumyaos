import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    // If the error is an instance of Error, return its message
    if (e instanceof Error) {
      return e.message;
    }
    // Return a default error message for unknown errors
    return "An unexpected error occurred while processing your request.";
  },
});
