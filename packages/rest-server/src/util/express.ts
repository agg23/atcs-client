import { Response } from "express";

export const setJSONContentType = (response: Response) => {
  response.setHeader("Content-Type", "application/json");
};
