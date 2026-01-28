import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || path.join(__dirname, "..", ".env"),
});

import app from "./app";
import { initDatabase } from "./config/database";

const port = Number(process.env.PORT) || 5000;

initDatabase();

app.listen(port, () => {
  console.log(`Hadaf backend listening on http://localhost:${port}`);
});
