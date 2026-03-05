import { prisma } from "./prisma";

interface LogContext {
  userId?: string;
  organizationId?: string | null;
  [key: string]: any;
}

export const logger = {
  /**
   * Logs an error to the database and console.
   * This is a fire-and-forget function that will not block execution.
   */
  error: (action: string, error: unknown, context?: LogContext) => {
    // Determine message and stack trace
    let message = "Unknown error";
    let stackTrace: string | null = null;

    if (error instanceof Error) {
      message = error.message;
      stackTrace = error.stack ?? null;
    } else if (typeof error === "string") {
      message = error;
    } else {
      message = JSON.stringify(error);
    }

    // Always log to console in development or for server logs
    console.error(`[ERROR][${action}]`, message, error, context);

    // Persist to DB without awaiting
    safeLogToDb("ERROR", action, message, stackTrace, context);
  },

  /**
   * Logs a warning to the database and console.
   */
  warn: (action: string, message: string, context?: LogContext) => {
    console.warn(`[WARN][${action}]`, message, context);
    safeLogToDb("WARN", action, message, null, context);
  },

  /**
   * Logs an info message to the database and console.
   */
  info: (action: string, message: string, context?: LogContext) => {
    console.info(`[INFO][${action}]`, message, context);
    safeLogToDb("INFO", action, message, null, context);
  },
};

/**
 * Helper to safely save a log to the database without throwing uncaught exceptions.
 */
function safeLogToDb(
  level: string,
  action: string,
  message: string,
  stackTrace: string | null,
  context?: LogContext,
) {
  // Extract known context fields
  const userId = context?.userId || null;
  const organizationId = context?.organizationId || null;

  // Cleanup context to be stored as metadata
  const metadataValue = context ? { ...context } : null;
  if (metadataValue) {
    delete metadataValue.userId;
    delete metadataValue.organizationId;
  }

  const metadataString =
    metadataValue && Object.keys(metadataValue).length > 0
      ? JSON.stringify(metadataValue)
      : null;

  // Fire and forget
  prisma.errorLog
    .create({
      data: {
        level,
        action,
        message,
        stackTrace,
        metadata: metadataString,
        userId,
        organizationId,
      },
    })
    .catch((dbError) => {
      // Fallback if the database log also fails
      console.error("Failed to write to ErrorLog database table:", dbError);
    });
}
