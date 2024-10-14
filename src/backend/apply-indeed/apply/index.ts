import { Page } from "puppeteer";

import { fillFields } from "../fill-fields";
import clickNextButton from "../clickNextButton";
import { GenerativeModel } from "@google/generative-ai";
import { wait } from "../generate-links";
import { sleep } from "../../callserver";

const noop = () => {};

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
  await page.goto(link);

  await wait(1245);

  const indeedApplyButton = await page.$("button#indeedApplyButton");

  const html = await indeedApplyButton?.evaluate((el) => el.outerHTML);
  console.log("html button", html);

  console.log("indeedApplyButton:", indeedApplyButton);
  console.log("Applying to1", link);

  await indeedApplyButton?.click();
  console.log("Applying to2", link);

  // Verificar a barra de progresso inicial
  // bar1 = await checkProgressBar(page) ?? 0;

  await sleep(3000);
  try {
    console.log("Applying to", link);
    // [TODO] change this var
    // await clickApplyButton(page);
    // await clickApplyButton(page);

    let maxPages = 7;
    // let maxTries = 2;
    while (maxPages--) {
      const submitted = await checkandSubmit(page);

      // Se a candidatura foi submetida, encerra todos os loops
      if (submitted) {
        console.log("tem o botão de submit")
        maxPages = 0;
        break;
      }

      await sleep(1000);
      await fillFields(page, model).catch(noop);

      await sleep(1000);

      await clickNextButton(page); //to-do: nao esta nem chamando aqui

      await sleep(1000);
    }
  } catch {
    console.log(`Easy apply button not found in posting: ${link}`);
    return;
  }
}

async function checkandSubmit(page: Page) {
  try {
    const buttons = await page.$$("main .ia-BasePage-footer button");

    // Filtra os botões cujo texto inclui "Enviar sua candidatura"
    const submitButton = [];
    for (const button of buttons) {
      const buttonText = await button.evaluate((node) => node.innerText.trim());
      if (buttonText.includes("Enviar sua candidatura")) {
        submitButton.push(button);
      }
    }

    console.log("Submitting application at", submitButton);
    if (submitButton.length > 0) {
      console.log("submitButton exists")
      // Clica nos botões filtrados
      for (const button of submitButton) {
        await button.click()
      }
      await wait(2500); // aguarda antes de prosseguir

      // Retorna true para indicar que a candidatura foi enviada
      return true;
    } else {
      return false; // Retorna false se não encontrou o botão
    }
  } catch (error) {
    console.log("Error applying to:", error);
    return false; // Retorna false em caso de erro
  }
}
