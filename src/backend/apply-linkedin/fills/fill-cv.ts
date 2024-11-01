import { ElementHandle } from "puppeteer";
import { selectors } from "../selectors";
import { Page } from "puppeteer";

export async function fillCv(page: Page, language:string): Promise<void> {
  const docDivs = await page.$$(selectors.documentUpload);

  // Obtenha todos os elementos de rótulo ou span dentro do formulário
  const elements = await page.$$eval('.jobs-easy-apply-content form *', elements =>
    elements.map(element => element.textContent?.trim())
  );

  // Verifique se algum elemento contém o texto "currículo"
  const foundTextCvPt = elements.some(
    (text) => text?.toLocaleLowerCase() === "currículo"
  );
  // Verifique se algum elemento contém o texto "carta de apresentação"
  const foundTextClPt = elements.some(
    (text) => text?.toLocaleLowerCase() === "carta de apresentação"
  );

  console.log("foundTextCvPt", foundTextCvPt);

  for (const docDiv of docDivs) {
    const label = (await docDiv.$(
      selectors.documentUploadLabel
    )) as unknown as ElementHandle<HTMLElement>;
    const input = (await docDiv.$(
      selectors.documentUploadInput
    )) as unknown as ElementHandle<HTMLInputElement>;

    const text = (
      await label.evaluate((el) => el.innerText.trim())
    ).toLocaleLowerCase();
    console.log("o text é...", text);

    if (text.includes("resume")) { //to-do rro ao preencher CV: TypeError: Cannot read properties of null (reading 'uploadFile')
      if (language==="portuguese") {
        // pt resume
        console.log("Uploading Portuguese resume: uploads/cv-pt.pdf");
        await input.uploadFile("uploads/cv-pt.pdf");
      } else {
        // en resume
        console.log("Uploading English resume: uploads/cv-en.pdf");
        await input.uploadFile("uploads/cv-en.pdf");
      }
    } else if (text.includes("cover")) {
      if (language==="portuguese") {
        // pt cover letter
        console.log("Uploading Portuguese cover letter: uploads/cl-pt.pdf");
        await input.uploadFile("uploads/cl-pt.pdf");
      } else {
        // en cover letter
        console.log("Uploading English cover letter: uploads/cl-en.pdf");
        await input.uploadFile("uploads/cl-en.pdf");
      }
    }
  }
}
