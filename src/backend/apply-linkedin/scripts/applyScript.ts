import { GenerativeModel } from "@google/generative-ai";
import { Page } from "puppeteer";
import { generateLinks, wait } from "./generate-links";
import { applyJobs } from "./apply";

async function clickDismissButton(page: Page) {
  try {
    // Aguarda que o botão esteja disponível na página
    await page.waitForSelector('[aria-labelledby="post-apply-modal"] button[aria-label="Dismiss"]', { timeout: 5000 });

    // Seleciona o botão e clica nele
    await page.click('button[aria-label="Dismiss"]');
    console.log('Dismiss button clicked.');
  } catch (error) {
    console.log('Dismiss button not found or click failed:', error);
  }
}

export async function applyScript(page: Page, model: GenerativeModel) {
  const validLinks = await generateLinks(page);

  console.log("validLinks", validLinks, validLinks.length);

  if (validLinks.length === 0) {
    console.log("No valid links found. Skipping applyJobs.");
    return; // Ou outra lógica que você queira implementar
  }

  for (const link of validLinks) {
    await wait(1000);
    if (link) {
      await applyJobs({ link, model, page });
      await wait(2000);
      await clickDismissButton(page);
      await wait(1000)
    }
  }
}
