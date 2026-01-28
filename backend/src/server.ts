import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || path.join(__dirname, "..", ".env"),
});

import app from "./app";
import { initDatabase } from "./config/database";
import { logger } from "./utils/logger";

const port = Number(process.env.PORT) || 5000;

try {
  initDatabase();
} catch (err) {
  logger.error("Failed to initialize database", err);
  process.exit(1);
}

app.listen(port, () => {
  logger.info(`Hadaf backend listening on http://localhost:${port}`);
});
