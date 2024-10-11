import { GenerativeModel } from "@google/generative-ai";
import { Page } from "puppeteer";
import { generateLinks, wait } from "./generate-links";
import { applyJobs } from "./apply";

export async function applyScriptIndeed(page: Page, model: GenerativeModel) {
  const validLinks = await generateLinks(page);

  console.log("validLinks", validLinks, validLinks.length);

  // if (validLinks.length === 0) {
  //   console.log("No valid links found. Skipping applyJobs.");
  //   return; // Ou outra lógica que você queira implementar
  // }

  for (const link of validLinks) {
    await wait(1000);
    if (link) {
      console.log("indo para link",link)
      await applyJobs({ link, model, page });
      await wait(2000);
      //await clickDismissButton(page);
    }
  }
}
