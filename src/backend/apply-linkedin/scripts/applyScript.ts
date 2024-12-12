import { GenerativeModel } from "@google/generative-ai";
import { generateLinks, wait } from "./generate-links";
import { applyJobs } from "./apply";
import { Browser, Page } from "puppeteer";
import { JobInfo } from "../../types";
import { getStopProcessing } from "./stop";
import { Response } from "express";

async function clickDismissButton(page: Page) {
  try {
    await page.click('button[aria-label="Dismiss"]');
    console.log("Dismiss button clicked.");
  } catch (error) {
    console.log("Dismiss button not found or click failed:", error);
  }
}

export async function applyScript(
  res: Response,
  page: Page,
  model: GenerativeModel,
  addJobToArrayLinkedin: (job: JobInfo) => void,
  appliedJobsLinkedin: JobInfo[],
  remainingApplications: number,
  browser: Browser | null
) {
  let validLinks = await generateLinks(page);
  console.log("validLinks", validLinks, validLinks.length);

  if (validLinks.length === 0) {
    console.log("No valid links found. Skipping applyJobs.");
    return;
  }

  for (const link of validLinks) {
    if (getStopProcessing()) {
      res.status(200).send("Processamento interrompido.");
      await browser?.close();
      return;
    }

    if (appliedJobsLinkedin.length >= remainingApplications) {
      console.log("Daily application limit reached");
      res.status(200).send("Processamento interrompido.");
      await browser?.close();
      return;
    }

    await wait(350);
    if (link) {
      await applyJobs({
        res,
        page,
        model,
        link,
        addJobToArrayLinkedin,
        browser,
        appliedJobsLinkedin: appliedJobsLinkedin.length,
        remainingApplications
      });
      await wait(100);
      await clickDismissButton(page);
      await wait(100);
    }
  }
}
