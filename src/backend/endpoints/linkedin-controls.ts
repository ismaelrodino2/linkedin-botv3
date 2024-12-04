import { Request, Response } from "express";
import { ServerContext } from "./types";
import { scrollToBottomAndBackSmoothly, sleep } from "../utils";
import { applyScript } from "../apply-linkedin/scripts/applyScript";
import { JobInfo } from "../types";
import { navigateToNextPage } from "../apply-linkedin/scripts/generate-pagination-links";

export const handleLinkedinApply = async (
  _req: Request, 
  res: Response, 
  context: ServerContext
) => {
  context.stopApplyingLinkedin = false;
  const maxIterations = (global as any).globalVars.maxApplications;

  while (
    context.appliedJobsLinkedin.length < maxIterations && 
    !context.stopApplyingLinkedin
  ) {
    try {
      if (!context.pageInstance) throw new Error("Browser not initialized");
      
      await scrollToBottomAndBackSmoothly(
        context.pageInstance,
        ".scaffold-layout__list  > div"
      );
      await sleep(600);
      
      await applyScript(
        context.pageInstance,
        context.model,
        (job: JobInfo) => context.appliedJobsLinkedin.push(job),
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
  if (context.pageInstance) await context.pageInstance.close();
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