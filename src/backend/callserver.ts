import express from "express";
import { json } from "body-parser";
import cors from "cors";
import { WebSocket, WebSocketServer } from "ws";
import { PORT } from "./constants";
import { ServerContext } from "./endpoints/types";
import { handleOpen } from "./endpoints/open";
import { handleNavigate } from "./endpoints/navigate";
import {
  handleLinkedinApply,
} from "./endpoints/linkedin-controls";
import { handleFetchAccount } from "./endpoints/account-handler";
import { handleStop } from "./endpoints/stop";
import { returnStart } from "./endpoints/return-start";

export function callServer() {
  const app = express();
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Create WebSocket server
  const wss = new WebSocketServer({ server });

  const serverContext: ServerContext = {
    pageInstance: null,
    genAI: null,
    model: null,
    pauseApplyingLinkedin: false,
    appliedJobsLinkedin: [],
    websocket: null,
    browser: null,
  };

  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected to WebSocket");
    serverContext.websocket = ws;

    // Enviar jobs existentes quando cliente conectar
    if (serverContext.appliedJobsLinkedin.length > 0) {
      serverContext.appliedJobsLinkedin.forEach((job) => {
        ws.send(
          JSON.stringify({
            type: "newJob",
            data: job,
          })
        );
      });
    }

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
      serverContext.websocket = null;
    });
  });

  app.use(cors());
  app.use(json());

  // Routes
  app.post("/open", (req, res) => {
    handleOpen(req, res, serverContext).catch((error) => {
      console.error("Error in handleOpen:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  });

  app.post("/stop", (req, res) => {
    handleStop(req, res).catch((error) => {
      console.error("Error in handleOpen:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  });
  app.post("/return-start", (req, res) => {
    returnStart(req, res).catch((error) => {
      console.error("Error in handleOpen:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  });

  app.post("/navigate", (req, res) => handleNavigate(req, res, serverContext));

  // LinkedIn routes
  app.post("/apply-linkedin", async (req, res) => {
    try {
      await handleLinkedinApply(req, res, serverContext);
    } catch (error) {
      console.error("Error in handleLinkedinApply:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.post("/fetch-account", (req, res) =>
    handleFetchAccount(req, res, serverContext)
  );

  return server;
}
