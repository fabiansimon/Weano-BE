import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' })
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  })
);

const logInfo = (message) => {
  logger.info(`${new Date()}: ${message}\n`);
};
const logError = (message) => {
  logger.error(`${new Date()}: ${message}\n`);
};

export { logInfo, logError };
