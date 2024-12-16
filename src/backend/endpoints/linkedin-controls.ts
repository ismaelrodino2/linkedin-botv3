import { Request, Response } from "express";
import { ServerContext } from "./types";
import { scrollToBottomAndBackSmoothly, sleep } from "../utils";
import { applyScript } from "../apply-linkedin/scripts/applyScript";
import { JobInfo } from "../types";
import { navigateToNextPage } from "../apply-linkedin/scripts/generate-pagination-links";
import { WebSocket } from "ws";
import { getStopProcessing } from "../apply-linkedin/scripts/stop";

export const handleLinkedinApply = async (
  req: Request,
  res: Response,
  context: ServerContext
) => {

  if (!context.pageInstance) {
    return res.status(400).json({
      error: "Browser page not initialized. Please open LinkedIn first.",
    });
  }

  const { remainingApplications } = req.body; // Captura o objeto user enviado pelo body

  while (
    context.appliedJobsLinkedin.length < remainingApplications
  ) {
    // context.browser?.on('disconnected', () => {
    //   console.log('O navegador foi fechado!');
    //   res.status(200).send("Processamento interrompido.");
    //   return;
    // });
    if (!context.pageInstance) {
      return res.status(400).json({
        error: "Browser page not initialized. Please open LinkedIn first.",
      });
    }
  
    try {
      if (getStopProcessing()) {
        await context.browser?.close();
        res.status(200).send("Processamento interrompido.");
        return;
      }

      await scrollToBottomAndBackSmoothly(
        context.pageInstance,
        ".scaffold-layout__list  > div",
        context.browser,
        res
      );
      await sleep(600);

      await applyScript(
        res,
        context.pageInstance,
        context.model,
        (job: JobInfo) => {
          context.appliedJobsLinkedin.push(job);
          if (context.websocket?.readyState === WebSocket.OPEN) {
            context.websocket.send(
              JSON.stringify({
                type: "newJob",
                data: job,
              })
            );
          } else {
            console.warn("WebSocket não está conectado");
          }
        },
        context.appliedJobsLinkedin,
        remainingApplications,
        context.browser
      );

      await sleep(350);
      await navigateToNextPage(context.pageInstance, 25);
      await sleep(350);
    } catch (error) {
      console.error(`Error LinkedIn`, error);
      if (getStopProcessing()) {
        await context.browser?.close();
        res.status(200).send("Processamento interrompido.");
        return;
      }
    }
  }

  res.send("Application process completed");
};

export const handleLinkedinPause = (
  _req: Request,
  res: Response,
  context: ServerContext
) => {
  context.pauseApplyingLinkedin = true;
  res.send("Application process paused");
};

export const handleLinkedinResume = (
  _req: Request,
  res: Response,
  context: ServerContext
) => {
  context.pauseApplyingLinkedin = false;
  res.send("Application process resumed");
};

// export const handleLinkedinStop = (_req: Request, res: Response, context: ServerContext) => {
//   context.stopApplyingLinkedin = true;
//   res.send("Application process stopped");
// };
