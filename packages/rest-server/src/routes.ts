import { Express } from "express";
import { mcp } from "./mcp/mcps";

export const registerRoutes = (server: Express) => {
  server.get("/mcp", mcp);
};
