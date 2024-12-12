import { GenerativeModel } from "@google/generative-ai";
import { generateLinks, wait } from "./generate-links";
import { applyJobs } from "./apply";
import { Page } from "puppeteer";
import { JobInfo } from "../../types";

async function clickDismissButton(page: Page) {
  try {
    await page.click('button[aria-label="Dismiss"]');
    console.log("Dismiss button clicked.");
  } catch (error) {
    console.log("Dismiss button not found or click failed:", error);
  }
}

export async function applyScript(
  page: Page,
  model: GenerativeModel,
  addJobToArrayLinkedin: (job: JobInfo) => void,
  appliedJobsLinkedin: JobInfo[],
  remainingApplications: number,
  stopApplyingLinkedin: boolean,
  pauseApplyingLinkedin: boolean
) {
  let validLinks = await generateLinks(page);

  console.log("validLinks", validLinks, validLinks.length);

  if (validLinks.length === 0) {
    console.log("No valid links found. Skipping applyJobs.");
    return;
  }

  for (const link of validLinks) {
    if (appliedJobsLinkedin.length >= remainingApplications) {
      console.log("Daily application limit reached");
      break;
    }

    while (pauseApplyingLinkedin) {
      console.log("Processo pausado...");
      await wait(500);
    }

    if (stopApplyingLinkedin) {
      break;
    }

    await wait(350);
    if (link) {
      await applyJobs({
        page,
        model,
        link,
        addJobToArrayLinkedin
      });
      await wait(100);
      await clickDismissButton(page);
      await wait(100);
    }
  }
}
