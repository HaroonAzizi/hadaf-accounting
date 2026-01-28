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

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

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
