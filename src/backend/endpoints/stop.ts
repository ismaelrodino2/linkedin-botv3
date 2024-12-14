import { Request, Response } from "express";
import { setStopProcessing } from "../apply-linkedin/scripts/stop";

export const handleStop = async (_req: Request, res: Response) => {
  try {
    setStopProcessing(true); // Sinaliza para parar
    res.status(200).send("Processamento será interrompido.");
  } catch (error) {
    console.error("Error during browser launch:", error);
    res.status(500).json({
      error: "Failed to launch browser",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
