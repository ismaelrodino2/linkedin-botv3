import { fillFields } from "../fill-fields";
import clickNextButton from "../clickNextButton";
import { GenerativeModel } from "@google/generative-ai";
import { JobInfo, sleep } from "../../../callserver";
import { wait } from "../generate-links";
import { checkProgressBar } from "../../check-progress-bar";
import { selectors } from "../../selectors";
import { Page } from "puppeteer";
import LanguageDetect from "languagedetect";

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
  addJobToArrayLinkedin: (el: JobInfo) => void;
}

export async function applyJobs({
  page,
  model,
  link,
  addJobToArrayLinkedin,
}: Params) {
  let bar1 = 0;
  let bar2 = 0;

  await page.goto(link, { waitUntil: "load", timeout: 30000 });

  const lngDetector = new LanguageDetect();

  // OR
  // const lngDetector = new (require('languagedetect'));

  const jobDescriptionElements = await page.$$(
    ".jobs-box__html-content .mt4 > p[dir='ltr'] span"
  );
  const jobDescriptionText = await Promise.all(
    jobDescriptionElements.map((element) =>
      element.evaluate((el) => el.innerText)
    )
  ).then((textArray) => textArray.join(" "));

  console.log("jobDescriptionElements", jobDescriptionElements);
  let language: string = "en"; // Default to 'en' or another default language of your choice

  console.log("todas strings linkedin lang", jobDescriptionText);
  if (jobDescriptionText) {
    const lang = lngDetector.detect(jobDescriptionText, 1);

    console.log("lang", lang);

    language = lang[0][0] as string;
  }

  const fields = await getJobInfo(page, language);

  console.log("todos valores de linkedin", fields);

  // Verificar a barra de progresso inicial
  bar1 = await checkProgressBar(page);

  await sleep(600);
  try {
    console.log("Applying to", link);
    // [TODO] change this var
    await clickApplyButton(page);
    await clickApplyButton(page);

    let maxPages = 7;
    // let maxTries = 2;
    while (maxPages--) {
      await wait(200);
      await fillFields(page, model, language).catch(noop);

      // Verificar a barra de progresso após clicar no botão "Next"
      bar2 = await checkProgressBar(page);

      await clickNextButton(page).catch(noop);

      // Comparar se a barra de progresso mudou
      if (bar1 === bar2) {
        console.log("Progress bar did not change, breaking loop...");
        const isSubmitButtonEn = page.$(
          ".jobs-easy-apply-modal button[aria-label='Submit application']"
        );
        const isSubmitButtonPt = page.$(
          ".jobs-easy-apply-modal button[aria-label='Enviar candidatura']"
        );
        if (!isSubmitButtonEn || !isSubmitButtonPt) {
          console.log("teste aqui 123321");
          break; // Se o valor não mudou, sai do loop
        }
      }
    }

    addJobToArrayLinkedin({
      company: fields.company,
      currentDateTime: new Date(),
      language: language,
      location: fields.location,
      platform: fields.platform,
      position: fields.position,
    });
  } catch {
    console.log(`Easy apply button not found in posting: ${link}`);
    return;
  }
}

async function getJobInfo(page: Page, language: string) {
  // Espera o primeiro elemento estar visível
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

  console.log("qqqqqqqqq", h1, companyNameElement, firstSpanElement);

  const position = await h1?.evaluate((el) => el.innerText);

  const company = await companyNameElement?.evaluate((el) => el.innerText);

  const location = await firstSpanElement?.evaluate((el) => el.innerText); //foi

  const currentDateTime = new Date();

  return {
    position,
    company,
    location,
    currentDateTime,
    platform: "Linkedin",
    language,
  };
}
