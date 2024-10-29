import { GenerativeModel } from "@google/generative-ai";
import { Page } from "puppeteer";
import { generateLinks, wait } from "./generate-links";
import { applyJobs } from "./apply";
import { JobInfo } from "../../callserver";
import { PageWithCursor } from "puppeteer-real-browser";

async function clickDismissButton(page: PageWithCursor) {
  try {
    // Seleciona o botão e clica nele
    await page.click('button[aria-label="Dismiss"]');
    console.log("Dismiss button clicked.");
  } catch (error) {
    console.log("Dismiss button not found or click failed:", error);
  }
}

export async function applyScript(page: PageWithCursor, model: GenerativeModel, addJobToArrayLinkedin: (jobs: JobInfo)=>void, appliedJobsLinkedin: JobInfo[], maxIterations: number) {
  const validLinks = await generateLinks(page);

  console.log("validLinks", validLinks, validLinks.length);

  if (validLinks.length === 0) {
    console.log("No valid links found. Skipping applyJobs.");
    return; // Ou outra lógica que você queira implementar
  }

  for (const link of validLinks) {
    if (appliedJobsLinkedin.length >= maxIterations) {
      // Sai do loop se o comprimento de appliedJobsIndeed atingir maxIterations
      page.close()
      break;
    }
    await wait(350);
    if (link) {
      await applyJobs({ link, model, page, addJobToArrayLinkedin });
      await wait(100);
      await clickDismissButton(page);
      await wait(100);
    }
  }
}
