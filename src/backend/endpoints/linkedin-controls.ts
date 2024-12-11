import { Request, Response } from "express";
import { ServerContext } from "./types";
import { scrollToBottomAndBackSmoothly, sleep } from "../utils";
import { applyScript } from "../apply-linkedin/scripts/applyScript";
import { JobInfo } from "../types";
import { navigateToNextPage } from "../apply-linkedin/scripts/generate-pagination-links";
import { MAX_LINKEDIN_APPLICATIONS } from "../constants";
import { WebSocket } from "ws";

export const handleLinkedinApply = async (
  _req: Request, 
  res: Response, 
  context: ServerContext
) => {
  context.stopApplyingLinkedin = false;
  const maxIterations = MAX_LINKEDIN_APPLICATIONS;

  console.log("maxIterations:", maxIterations);

  if (!context.pageInstance) {
    return res.status(400).json({ 
      error: "Browser page not initialized. Please open LinkedIn first." 
    });
  }

  while (
    context.appliedJobsLinkedin.length < maxIterations && 
    !context.stopApplyingLinkedin
  ) {
    try {
      await scrollToBottomAndBackSmoothly(
        context.pageInstance,
        ".scaffold-layout__list  > div"
      );
      await sleep(600);
      
      await applyScript(
        context.pageInstance,
        context.model,
        (job: JobInfo) => {
          context.appliedJobsLinkedin.push(job);
          if (context.websocket?.readyState === WebSocket.OPEN) {
            context.websocket.send(JSON.stringify({
              type: "newJob",
              data: job
            }));
          } else {
            console.warn("WebSocket não está conectado");
          }
        },
        context.appliedJobsLinkedin,
        maxIterations,
        context.stopApplyingLinkedin,
        context.pauseApplyingLinkedin
      );
      
      await sleep(350);
      await navigateToNextPage(context.pageInstance, 25);
      await sleep(350);
    } catch (error) {
      console.error(`Error LinkedIn`, error);
    }
  }

  res.send("Application process completed");
};

export const handleLinkedinPause = (_req: Request, res: Response, context: ServerContext) => {
  context.pauseApplyingLinkedin = true;
  res.send("Application process paused");
};

export const handleLinkedinResume = (_req: Request, res: Response, context: ServerContext) => {
  context.pauseApplyingLinkedin = false;
  res.send("Application process resumed");
};

export const handleLinkedinStop = (_req: Request, res: Response, context: ServerContext) => {
  context.stopApplyingLinkedin = true;
  res.send("Application process stopped");
}; 