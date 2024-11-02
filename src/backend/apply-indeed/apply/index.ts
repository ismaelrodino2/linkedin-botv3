import { fillFields } from "../fill-fields";
import clickNextButton from "../clickNextButton";
import { GenerativeModel } from "@google/generative-ai";
import { wait } from "../generate-links";
import { JobInfo, sleep } from "../../callserver";
import { Page } from "puppeteer";
import { setPromptLanguage } from "../../prompt";
import LanguageDetect from "languagedetect";

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
  addJobToArrayIndeed: (el: JobInfo) => void;
}

export async function applyJobs({
  page,
  model,
  link,
  addJobToArrayIndeed,
}: Params) {
  let language: string = "en"; // Inicializa a variável com uma string vazia
  await page.goto(link);
  console.log("chegou na pagina123"); //erro por aqui

  await wait(1245);

  const lngDetector = new LanguageDetect();

  // OR
  // const lngDetector = new (require('languagedetect'));
  const jobDescriptionElements = await page.$$("#jobDescriptionText p");

  const jobDescriptionText = await Promise.all(
    jobDescriptionElements.map((element) =>
      element.evaluate((el) => el.innerText)
    )
  ).then((textArray) => textArray.join(" "));

  console.log("jobsearch-JobInfoHeader-title-container :", jobDescriptionText);

  if (jobDescriptionText) {
    const lang = lngDetector.detect(jobDescriptionText, 1);

    console.log("lang", lang);

    setPromptLanguage(lang[0][0]);
    language = lang[0][0];
  }

  const fields = await getJobInfo(page, language); //erro por aqui -> acho q essa função ta trancando tudo pq ele n ta precionando o botão p aplicar na vaga

  console.log("qqqqqqqqq3", fields);

  console.log("chegou na pagina"); //erro por aqui

  const indeedApplyButton = await page.$("button#indeedApplyButton");

  console.log("vendo se indeedApplyButton existe", indeedApplyButton);

  const html = await indeedApplyButton?.evaluate((el) => el.outerHTML);
  console.log("html button", html);

  console.log("indeedApplyButton:", indeedApplyButton);

  await indeedApplyButton?.click();

  // Verificar a barra de progresso inicial
  // bar1 = await checkProgressBar(page) ?? 0;

  await sleep(3000);

  try {
    console.log("Applying to", link);
    // [TODO] change this var

    let maxPages = 7;
    // let maxTries = 2;
    while (maxPages--) {
      await checkandSubmit(page, "Verificar sua candidatura");
      const submitButton = await checkandSubmit(page, "Enviar sua candidatura");

      // Se a candidatura foi submetida, encerra todos os loops
      if (submitButton) {
        console.log("tem o botão de submit");
        maxPages = 0;
        break;
      }

      await sleep(1000); //to-do: chega no currículo e trava
      await fillFields(page, model).catch(noop);

      await sleep(1000);

      await clickNextButton(page);

      await sleep(1000);
    }

    addJobToArrayIndeed({
      company: fields.company,
      currentDateTime: new Date(),
      language: language,
      location: fields.location, //to-do
      platform: fields.platform,
      position: fields.position,
    });
  } catch {
    console.log(`Easy apply button not found in posting: ${link}`);
    return;
  }
}

async function checkandSubmit(page: Page, text: string) {
  try {
    const buttons = await page.$$("main .ia-BasePage-footer button");

    // Filtra os botões cujo texto inclui "Enviar sua candidatura"
    const submitVerifyButton = [];
    for (const button of buttons) {
      const buttonText = await button.evaluate((node) => node.innerText.trim());
      if (buttonText.includes(text)) {
        submitVerifyButton.push(button);
      }
    }

    console.log("Submitting application at", submitVerifyButton);
    if (submitVerifyButton.length > 0) {
      console.log("submitVerifyButton exists");
      // Clica nos botões filtrados
      for (const button of submitVerifyButton) {
        await button.click();
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

async function getJobInfo(page: Page, language: string) {
  // Espera o primeiro elemento estar visível
  const h1 = await page.waitForSelector(
    '[data-testid="jobsearch-JobInfoHeader-title"] > span',
    { visible: true, timeout: 5000 }
  );

  const companyNameElement = await page.waitForSelector(
    '[data-testid="inlineHeader-companyName"] > span > a',
    { visible: true, timeout: 5000 }
  );

  const locationElement = await page.waitForSelector(
    '[data-testid="inlineHeader-companyLocation"] > div',
    { visible: true, timeout: 5000 }
  );

  console.log("qqqqqqqqq", h1, companyNameElement, locationElement);

  const position = await h1?.evaluate((el) => el.innerText);

  const company = await companyNameElement?.evaluate((el) => el.innerText);

  const location = await locationElement?.evaluate((el) => el.innerText); //foi

  const currentDateTime = new Date();
  console.log("qqqqqqqqq2", position, company, location);

  return {
    position,
    company,
    location,
    currentDateTime,
    platform: "Indeed",
    language,
  };
}
