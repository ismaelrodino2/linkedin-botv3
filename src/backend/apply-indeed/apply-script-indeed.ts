import { GenerativeModel } from "@google/generative-ai";
import { Page } from "puppeteer";
import { generateLinks, wait } from "./generate-links";
import { applyJobs } from "./apply";
import { sleep } from "../callserver";

export async function applyScriptIndeed(page: Page, model: GenerativeModel) {
  const validLinks = await generateLinks(page);

  console.log("validLinks", validLinks, validLinks.length);

  // if (validLinks.length === 0) {
  //   console.log("No valid links found. Skipping applyJobs.");
  //   return; // Ou outra lógica que você queira implementar
  // }

  for (const link of validLinks) {
    await sleep(1000);
    // const button = await page.$('.dd-privacy-allow button');

    // if(button){
    //   await button.click()
    // }

    if (link) {
      console.log("indo para link",link)
      await applyJobs({ link, model, page });
      await sleep(1000);
      //await clickDismissButton(page);
    }
  }
}
