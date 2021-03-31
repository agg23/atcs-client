import express from "express";
import { loadConfig } from "./config/config";
import { registerRoutes } from "./routes";

if (process.argv.length < 2) {
  throw new Error("Config path is required");
}

const configPath = process.argv[2];

if (!configPath) {
  throw new Error("Invalid config path");
}

loadConfig(configPath);

const server = express();

registerRoutes(server);

server.listen(3000, () => {
  console.log("Listening at http://localhost:3000");
});
