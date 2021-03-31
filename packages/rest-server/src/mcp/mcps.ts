import { RequestHandler } from "express";
import { mcps } from "../config/config";
import { setJSONContentType } from "../util/express";

export const mcp: RequestHandler = (request, response) => {
  setJSONContentType(response);

  response.json(mcps);
};
