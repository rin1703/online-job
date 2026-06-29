import "./src/config/env.config";
import express, { Express } from "express";
import * as database from "./src/config/database.config";
import {
  mainv1Routes,
  paymentWebhookRoutes,
} from "./src/api/routers/index.router";
import { corsConfig } from "./src/config/cors.config";
import { confirmWebhook } from "./src/api/service/payment.service";
import jobRouter from "./src/api/routers/jobsFavorite.route";
import { runAllCrons } from "./src/api/cron/index.cron";
import { setupSocket } from "./src/socket";
import http from "http";

database.connect();

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(corsConfig);
paymentWebhookRoutes(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
mainv1Routes(app);

// Tạo HTTP server dùng chung cho Express + Socket.io
const server = http.createServer(app);

server.listen(port, async () => {
  console.log(`🚀 Server & Socket running at http://localhost:${port}`);
  console.log("Server restarted at", new Date().toISOString());

  try {
    await confirmWebhook();
  } catch (err) {
    console.log("Webhook confirmation failed:", (err as Error).message);
  }

  runAllCrons();
  setupSocket(server);
});
