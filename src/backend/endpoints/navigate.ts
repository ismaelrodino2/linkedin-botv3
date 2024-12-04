import { Request, Response } from "express";
import { ServerContext } from "./types";

export const handleNavigate = async (
  req: Request, 
  res: Response, 
  context: ServerContext
) => {
  const url: string = req.body.url;

  try {
    if (!context.pageInstance) {
      throw new Error("Browser not initialized");
    }

    await context.pageInstance.goto(url, {
      waitUntil: ["domcontentloaded", "networkidle2"],
    });

    res.send("Navigation completed successfully");
  } catch (error) {
    console.error("Navigation error:", error);
    res.status(500).send("Navigation failed");
  }
}; 