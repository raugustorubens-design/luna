import http from "node:http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { config } from "./config";
import { readLocalGitStatus } from "./git";
import { attachTerminal } from "./terminal";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", workingDirectory: config.workingDirectory });
});

app.get("/api/git-status", async (_req, res) => {
  const status = await readLocalGitStatus(config.workingDirectory);
  res.json(status);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/terminal" });
attachTerminal(wss, config.workingDirectory);

server.listen(config.port, () => {
  console.log(`LUNA Forge local server listening on port ${config.port}`);
  console.log(`Working directory: ${config.workingDirectory}`);
  console.log(`LUNA backend base URL: ${config.lunaApiBaseUrl}`);
});
