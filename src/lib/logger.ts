type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(context && { context }),
    });
  }

  info(message: string, context?: Record<string, unknown>) {
    console.log(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    console.error(
      this.formatMessage("error", message, {
        ...context,
        error: errorDetails,
      })
    );
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      console.log(this.formatMessage("debug", message, context));
    }
  }
}

export const logger = new Logger();
