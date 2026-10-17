import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET || "careflow_dev_jwt_secret_key_2026_demo_only",
  API_PREFIX: "/api/v1",
} as const;

export default ENV;
