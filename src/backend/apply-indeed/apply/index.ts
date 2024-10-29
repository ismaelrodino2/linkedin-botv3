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

  // Extrai o texto do primeiro filho do elemento #jobDescriptionText
  const jobDescriptionText = await page.evaluate(() => {
    const element = document.querySelector("#jobDescriptionText");
    if (element && element.firstElementChild) {
      return element.firstElementChild.textContent?.trim();
    }
    return null; // Retorna null se o elemento ou o primeiro filho não existir
  });

  console.log("Texto extraído:", jobDescriptionText);

  const lngDetector = new LanguageDetect();

  // OR
  // const lngDetector = new (require('languagedetect'));

  if (jobDescriptionText) {
    const lang = lngDetector.detect(jobDescriptionText, 1);

    console.log("lang", lang);

    setPromptLanguage(lang[0][0]);
    language = lang[0][0]
  }

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

  //const fields = await getJobInfo(page); //erro por aqui -> acho q essa função ta trancando tudo pq ele n ta precionando o botão p aplicar na vaga

  try {
    console.log("Applying to", link);
    // [TODO] change this var
    // await clickApplyButton(page);
    // await clickApplyButton(page);

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
    
      // if (fields) {
      //   addJobToArrayIndeed(fields);
      // }
    }

    addJobToArrayIndeed({
      company: "test",
      currentDateTime: new Date(),
      language: language,
      location: "test",
      platform: "test",
      position: "test"
    })
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

// async function getJobInfo(page: Page) {
//   const asideElements = await page.$$(
//     'aside[aria-labelledby="ia-JobInfoCard-header-title"] span'
//   ); //erro: retornando [] vazio
//   console.log("encontrou o botao1", asideElements);

//   const position = await page.evaluate(
//     (span) => span.innerText,
//     asideElements[0]
//   );
//   const companyAndLocation = await page.evaluate(
//     (span) => span.innerText,
//     asideElements[1]
//   );

//   const parts = companyAndLocation.split(" - ");

//   // Accessing the separated parts
//   const company = parts[0]; // "Grupo Mec"
//   const location = parts[1]; // "Rio de Janeiro, RJ"

//   const currentDateTime = new Date();

//   const buttonElement = await page.$(
//     'button[data-testid="ExitLinkWithModalComponent-exitButton"] span'
//   );

//   console.log("encontrou o botao2", buttonElement);

//   let language: string | null = null;

//   if (buttonElement) {
//     const spanText = await page.evaluate(
//       (span) => span.innerText,
//       buttonElement
//     );
//     console.log("Span text:", spanText);

//     const languageMap: { [key: string]: string } = {
//       Sair: "Portuguese",
//       Exit: "English",
//     };

//     // Use a type assertion to indicate spanText is one of the keys in the languageMap
//     language = languageMap[spanText as keyof typeof languageMap] || null; // Default to null if not found
//   } else {
//     console.log("Button with specified data-testid not found");
//   }

//   return {
//     position,
//     company,
//     location,
//     currentDateTime,
//     platform: "Indeed",
//     language,
//   };
// }
