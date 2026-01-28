import express from "express";
import cors from "cors";
import morgan from "morgan";

import categoryRoutes from "./routes/categoryRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import recurringRoutes from "./routes/recurringRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import exportRoutes from "./routes/exportRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sendSuccess } from "./utils/apiResponse";

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173", // Vite default
  "http://localhost:5174", // Vite alternative
  "http://localhost:3000", // Alternative dev port
  "http://localhost:4173", // Vite preview
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  return sendSuccess(res, {
    data: {
      health: "/api/health",
      categories: "/api/categories",
      transactions: "/api/transactions",
      dashboard: "/api/dashboard/summary",
    },
    message: "Hadaf API",
  });
});

app.get("/api/health", (req, res) => {
  return sendSuccess(res, { data: { status: "ok" }, message: "OK" });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/export", exportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
