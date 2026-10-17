import createApp from "./app.js";
import ENV from "./config/env.js";
import logger from "./utils/logger.js";
import prisma from "./config/db.js";

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  logger.info(`CareFlow Backend API listening on port ${ENV.PORT}`);
  logger.info(`Environment: ${ENV.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${ENV.PORT}${ENV.API_PREFIX}/health`);
  logger.info(`Database: Connected via Prisma ORM (SQL)`);
});

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    logger.info("HTTP server closed.");
    try {
      await prisma.$disconnect();
      logger.info("Prisma database connection closed.");
    } catch (err) {
      logger.error("Error during database disconnect:", err);
    }
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
