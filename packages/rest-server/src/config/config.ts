import fs from "fs";
import { Config } from "./types";
import { parseMCPIni } from "@packages/decoder/dist/config/mcpConfig";
import { ATCSMcpDef } from "@packages/decoder/dist/config/mcp";

export let mcps: Record<string, ATCSMcpDef> = {};

export const loadConfig = (path: string) => {
  const config = loadJsonConfig(path);

  const loadedMcps = loadMCPs(config);

  console.log(`Loaded ${Object.keys(loadedMcps).length} MCPs`);

  mcps = loadedMcps;
};

const loadJsonConfig = (path: string): Config => {
  const configBuffer = fs.readFileSync(path);
  const config = JSON.parse(configBuffer.toString("utf-8"));

  if (!("url" in config) || !config["url"]) {
    throw new Error("No provider URL specified");
  }

  if (!("location" in config) || !config["location"]) {
    throw new Error("No location specified");
  }

  const location = config["location"];

  if (
    typeof location !== "object" ||
    typeof location["lat"] !== "number" ||
    typeof location["long"] !== "number"
  ) {
    throw new Error("Invalid location specified");
  }

  if (!("mcpConfigs" in config) || !config["mcpConfigs"]) {
    throw new Error("No mcpConfigs specified");
  }

  const mcpConfigs = config["mcpConfigs"];

  if (
    !Array.isArray(mcpConfigs) ||
    !mcpConfigs.every((c) => typeof c === "string")
  ) {
    throw new Error("Invalid mcpConfigs specified");
  }

  return config;
};

const loadMCPs = (config: Config): Record<string, ATCSMcpDef> => {
  let mcps: Record<string, ATCSMcpDef> = {};

  const mcpArray = config.mcpConfigs.map(parseMCPIni);

  for (const mcpConfig of mcpArray) {
    mcps = {
      ...mcps,
      ...mcpConfig,
    };
  }

  return mcps;
};
