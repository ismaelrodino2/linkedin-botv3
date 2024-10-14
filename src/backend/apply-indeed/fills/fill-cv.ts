import { Page } from "puppeteer";

export async function fillCv(page: Page): Promise<void> {
  const docDivs = await page.$$("main fieldset > div");

  for (const docDiv of docDivs) {
    // Obtém todo o texto do elemento, incluindo elementos filhos
    const textContent = await docDiv.evaluate((el) => el.innerText || "");

    // Verifica se o texto não contém "mycvux_en.pdf"
    if (textContent && textContent.includes("restauração_cv.pdf")) {
      console.log("Texto encontrado:", textContent);
      await docDiv.click()
    }
  }
}
