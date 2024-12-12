import { Request, Response } from "express";
import { ServerContext } from "./types";
import { scrollToBottomAndBackSmoothly, sleep } from "../utils";
import { applyScript } from "../apply-linkedin/scripts/applyScript";
import { JobInfo } from "../types";
import { navigateToNextPage } from "../apply-linkedin/scripts/generate-pagination-links";
import { WebSocket } from "ws";
import { User } from "../../types/user";
import { SubscriptionService } from "../../services/subscription-service";

export const handleLinkedinApply = async (
  req: Request, 
  res: Response, 
  context: ServerContext
) => {
  context.stopApplyingLinkedin = false;
  const user: User = req.body.user; // Recebe o usuário da requisição

  if (!context.pageInstance) {
    return res.status(400).json({ 
      error: "Browser page not initialized. Please open LinkedIn first." 
    });
  }

  // Verifica os limites do usuário
  const subscriptionStatus = SubscriptionService.checkSubscriptionStatus(user);
  
  if (!subscriptionStatus.canApply) {
    return res.status(403).json({ 
      error: subscriptionStatus.reason || "You cannot apply at this moment" 
    });
  }

  const remainingApplications = subscriptionStatus.dailyLimit - user.dailyUsage;

  while (
    context.appliedJobsLinkedin.length < remainingApplications && 
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
        remainingApplications,
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