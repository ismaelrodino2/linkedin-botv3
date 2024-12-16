import { fillFields } from "../fill-fields";
import clickNextButton from "../clickNextButton";
import { GenerativeModel } from "@google/generative-ai";
import { wait } from "../generate-links";
import { checkProgressBar } from "../../check-progress-bar";
import { selectors } from "../../selectors";
import { Browser, Page } from "puppeteer";
import LanguageDetect from "languagedetect";
import { JobInfo } from "../../../types";
import { sleep } from "../../../utils";
import { getStopProcessing } from "../stop";
import { Response } from "express";

const noop = () => {};

async function clickApplyButton(page: Page): Promise<void> {
  try {
    const buttonText = await page.evaluate((applyButtonSelector) => {
      const button = document.querySelector(applyButtonSelector);
      return button ? button.textContent?.trim() : null;
    }, selectors.applyButton);

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
  res: Response;
  page: Page;
  model: GenerativeModel;
  link: string;
  addJobToArrayLinkedin: (job: JobInfo) => void;
  browser: Browser | null;
  appliedJobsLinkedin: number;
  remainingApplications: number;
}

export async function applyJobs({
  res,
  page,
  model,
  link,
  addJobToArrayLinkedin,
  browser,
  appliedJobsLinkedin,
  remainingApplications,
}: Params) {
  let bar1 = 0;
  let bar2 = 0;

  if (appliedJobsLinkedin >= remainingApplications) {
    console.log("Daily application limit reached");
    res.status(200).send("Processamento interrompido.");
    await browser?.close();
    return;
  }

  await page.goto(link, { waitUntil: "load", timeout: 30000 });

  // Verifica se devemos parar após navegar para a página
  if (getStopProcessing()) {
    res.status(200).send("Processamento interrompido.");
    await browser?.close();
    return;
  }

  const lngDetector = new LanguageDetect();
  const jobDescriptionElements = await page.$$(
    ".jobs-box__html-content .mt4 > p[dir='ltr'] span"
  );
  const jobDescriptionText = await Promise.all(
    jobDescriptionElements.map((element) =>
      element.evaluate((el) => el.innerText)
    )
  ).then((textArray) => textArray.join(" "));

  let language: string = "en"; // Default to 'en' or another default language of your choice

  if (jobDescriptionText) {
    const lang = lngDetector.detect(jobDescriptionText, 1);
    language = lang[0][0] as string;
  }

  const fields = await getJobInfo(page, language);

  // Verificar a barra de progresso inicial
  bar1 = await checkProgressBar(page);

  await sleep(600);
  try {
    console.log("Applying to", link);
    await clickApplyButton(page);
    await clickApplyButton(page);

    await clickNextButton(page).catch(noop);

    let maxPages = 7;

    // Verificar a barra de progresso após clicar no botão "Next"
    bar2 = await checkProgressBar(page);

    // Aguarda o seletor estar disponível na página
    const selector = '.pl3.t-14.t-black--light[role="note"]';
    await page.waitForSelector(selector);

    // Obtém o valor do elemento e extrai apenas o número
    const valueProgressAfterOne = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim(); // Exemplo: "50%"
        if (text) {
          // Verifica se text não é undefined
          const numberOnly = text.replace("%", ""); // Remove o símbolo "%"
          return parseFloat(numberOnly); // Converte para número
        }
      }
      return null; // Retorna null se não houver texto
    }, selector);

    // Verifica se valueProgressAfterOne é um número antes de usá-lo
    if (valueProgressAfterOne === null) {
      console.error("Failed to retrieve progress value.");
      return; // Retorna se não conseguir obter o valor
    }

    maxPages = Math.round(100 / valueProgressAfterOne);

    // Verifica se devemos parar após navegar para a página
    if (getStopProcessing()) {
      res.status(200).send("Processamento interrompido.");
      await browser?.close();
      return;
    }

    while (maxPages-- && (await browser?.pages())?.length) {
      await applyProcess(page, model, language, res, browser, bar1);
    }

    const jobInfo = {
      company: fields.company,
      currentDateTime: new Date(),
      language: language,
      location: fields.location,
      platform: fields.platform,
      position: fields.position,
    };

    console.log("teste de apito1", jobInfo);
    addJobToArrayLinkedin(jobInfo);
    console.log("teste de apito2");
  } catch {
    console.log(`Easy apply button not found in posting: ${link}`);
    return;
  }
}

async function getJobInfo(page: Page, language: string) {
  const h1 = await page.waitForSelector(".t-24.t-bold.inline > a", {
    visible: true,
    timeout: 5000,
  });

  const companyNameElement = await page.waitForSelector(
    ".job-details-jobs-unified-top-card__company-name > a",
    { visible: true, timeout: 5000 }
  );

  const firstSpanElement = await page.waitForSelector(
    ".job-details-jobs-unified-top-card__primary-description-container > div span:first-child",
    { visible: true, timeout: 5000 }
  );

  const position = await h1?.evaluate((el) => el.innerText);
  const company = await companyNameElement?.evaluate((el) => el.innerText);
  const location = await firstSpanElement?.evaluate((el) => el.innerText);

  return {
    position,
    company,
    location,
    currentDateTime: new Date(),
    platform: "Linkedin",
    language,
  };
}

async function applyProcess(
  page: Page,
  model: GenerativeModel,
  language: string,
  res: Response,
  browser: Browser | null,
  bar1: number
) {
  // Verifica se devemos parar durante o preenchimento
  if (getStopProcessing()) {
    res.status(200).send("Processamento interrompido.");
    await browser?.close();
    return;
  }

  await wait(200);
  await fillFields(page, model, language).catch(noop);

  // Verificar a barra de progresso após clicar no botão "Next"
  const bar2 = await checkProgressBar(page);
  await clickNextButton(page).catch(noop);

  // Comparar se a barra de progresso mudou
  if (bar1 === bar2) {
    console.log("Progress bar did not change, breaking loop...");
    const isSubmitButtonEn = await page.$(
      ".jobs-easy-apply-modal button[aria-label='Submit application']"
    );
    const isSubmitButtonPt = await page.$(
      ".jobs-easy-apply-modal button[aria-label='Enviar candidatura']"
    );
    if (!isSubmitButtonEn && !isSubmitButtonPt) {
      console.log("No submit button found, breaking loop");
      return; // Se o valor não mudou, sai do loop
    }
  }

  // Verifica se devemos parar após navegar para a página
  if (getStopProcessing()) {
    res.status(200).send("Processamento interrompido.");
    await browser?.close();
    return;
  }
}
