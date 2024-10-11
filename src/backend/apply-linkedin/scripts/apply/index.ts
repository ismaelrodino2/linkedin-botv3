import { Page } from "puppeteer";

import { fillFields } from "../fill-fields";
import clickNextButton from "../clickNextButton";
import { GenerativeModel } from "@google/generative-ai";
import { sleep } from "../../../callserver";
import { wait } from "../generate-links";
import { checkProgressBar } from "../../check-progress-bar";
import { selectors } from "../../selectors";

const noop = () => {};

async function clickApplyButton(page: Page): Promise<void> {
  try {
    const buttonText = await page.evaluate((applyButtonSelector) => {
      const button = document.querySelector(applyButtonSelector);
      return button ? button.textContent?.trim() : null;
    }, selectors.applyButton); // Passe o seletor como argumento

    if (buttonText === "Apply" || buttonText === "Continue applying") {
      await page.click(selectors.applyButton);
    }
    await page.click(selectors.easyApplyButtonEnabled);
  } catch (error) {
    console.log(
      "🚀 ~ file: index.ts:18 ~ clickEasyApplyButton ~ error:",
      error
    );
  }
}

export interface ApplicationFormData {
  phone: string;
  cvPath: string;
  homeCity: string;
  coverLetterPath: string;
  yearsOfExperience: { [key: string]: number };
  languageProficiency: { [key: string]: string };
  requiresVisaSponsorship: boolean;
  booleans: { [key: string]: boolean };
  textFields: { [key: string]: string };
  multipleChoiceFields: { [key: string]: string };
}

interface Params {
  page: Page;
  link: string;
  model: GenerativeModel;
}

export async function applyJobs({ page, model, link }: Params) {
  let bar1 = 0;
  let bar2 = 0;
  await page.goto(link, { waitUntil: "load", timeout: 30000 });

  // Verificar a barra de progresso inicial
  bar1 = await checkProgressBar(page);

  await sleep(3000);
  try {
    console.log("Applying to", link);
    // [TODO] change this var
    await clickApplyButton(page);
    await clickApplyButton(page);

    let maxPages = 7;
    // let maxTries = 2;
    while (maxPages--) {
      await sleep(800);
      await fillFields(page, model).catch(noop);

      await clickNextButton(page).catch(noop);

      // Verificar a barra de progresso após clicar no botão "Next"
      bar2 = await checkProgressBar(page);

      // Comparar se a barra de progresso mudou
      if (bar1 === bar2) {
        console.log("Progress bar did not change, breaking loop...");
        const isSubmitButton = page.$(
          ".jobs-easy-apply-content button[aria-label='Submit application']"
        );
        if (!isSubmitButton) {
          break; // Se o valor não mudou, sai do loop
        }
      }
    }
    try {
      const submitButton = await page.$(selectors.submit);
      console.log("Submitting application at", link);
      if (!submitButton) {
        return;
      } else {
        await submitButton.click();
        await wait(2500);
      }
    } catch (error) {
      console.log("Error applying to:", link, error);
    }
  } catch {
    console.log(`Easy apply button not found in posting: ${link}`);
    return;
  }
}
