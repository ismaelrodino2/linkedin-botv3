import { PageWithCursor } from "puppeteer-real-browser";

export async function fillCv(page: PageWithCursor): Promise<void> {
  const docDivs = await page.$$("main fieldset > div");

  for (const docDiv of docDivs) {
    // Obtém todo o texto do elemento, incluindo elementos filhos
    const textContent = await docDiv.evaluate((el) => el.innerText || "");

    // Verifica se o texto não contém "mycvux_en.pdf"
    if (textContent && textContent.includes((global as any).globalVars.cvNameIndeed)) {
      console.log("Texto encontrado:", textContent);
      await docDiv.click()
    }
  }
}
