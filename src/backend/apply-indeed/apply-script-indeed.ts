import { GenerativeModel } from "@google/generative-ai";
import { Page } from "puppeteer";
import { generateLinks, wait } from "./generate-links";
import { applyJobs } from "./apply";
import { JobInfo, sleep } from "../callserver";
import { PageWithCursor } from "puppeteer-real-browser";

export async function applyScriptIndeed(
  page: PageWithCursor,
  model: GenerativeModel,
  addJobToArrayIndeed: (jobs: JobInfo) => void,
  appliedJobsIndeed: JobInfo[],
  maxIterations: number
) {
  const validLinks = await generateLinks(page);

  console.log("validLinks", validLinks, validLinks.length);

  for (const link of validLinks) {
    await sleep(350);

    if (appliedJobsIndeed.length >= maxIterations) {
      // Sai do loop se o comprimento de appliedJobsIndeed atingir maxIterations
      break;
    }

    if (link) {
      console.log("indo para link", link);
      await applyJobs({ link, model, page, addJobToArrayIndeed });
      await sleep(350);
    }
  }
}
