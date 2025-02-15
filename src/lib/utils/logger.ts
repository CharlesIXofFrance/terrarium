import log from 'loglevel';

const isDevelopment =
  typeof import.meta !== 'undefined' && import.meta.env?.DEV;

// Configure default log level based on environment
log.setLevel(isDevelopment ? log.levels.DEBUG : log.levels.INFO);

// Create a namespaced logger factory
const createLogger = (namespace: string) => {
  // Create a prefix plugin for the namespace
  const originalFactory = log.methodFactory;
  const logger = log.getLogger(namespace);

  logger.methodFactory = (methodName, logLevel, loggerName) => {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);
    return function (message?: any, ...args: any[]) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${namespace}]`;
      const logEntry =
        typeof message === 'string'
          ? `${prefix} ${message} ${args.length ? JSON.stringify(args) : ''}\n`
          : `${prefix} ${JSON.stringify(message)} ${args.length ? JSON.stringify(args) : ''}\n`;

      // Log to console
      if (typeof message === 'string') {
        rawMethod(prefix, message, ...args);
      } else {
        rawMethod(prefix, message, ...args);
      }

      // Log to file in development if not disabled
      const isLoggingDisabled =
        typeof import.meta !== 'undefined' &&
        import.meta.env?.VITE_DISABLE_API_LOGGING === 'true';
      if (isDevelopment && !isLoggingDisabled) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/__log', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ entry: logEntry }));
      }
    };
  };

  // Set initial level
  logger.setLevel(isDevelopment ? log.levels.DEBUG : log.levels.INFO);

  return logger;
};

// Create namespaced loggers
export const authLogger = createLogger('auth');
const apiLogger = createLogger('api');
const routerLogger = createLogger('router');

// Development helper to enable all logs
const enableAllLogs = () => {
  log.enableAll();
  [authLogger, apiLogger, routerLogger].forEach((logger) => {
    logger.setLevel(log.levels.TRACE);
  });
};

// Development helper to disable all logs
const disableAllLogs = () => {
  log.disableAll();
  [authLogger, apiLogger, routerLogger].forEach((logger) => {
    logger.setLevel(log.levels.SILENT);
  });
};

// Export default logger for general use
