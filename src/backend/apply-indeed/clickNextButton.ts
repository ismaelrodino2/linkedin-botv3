import { Page } from "puppeteer";
import { wait } from "./generate-links";

async function clickNextButton(page: Page): Promise<void> {
  try {
    wait(2000);
    // Aguarda que o container .ia-BasePage-footer esteja disponível
    // await page.waitForSelector(".ia-BasePage-footer button");

    // Seleciona todos os botões dentro de .ia-BasePage-footer (não importa o quão profundos eles estejam)
    const buttons = await page.$$(".ia-BasePage-footer button");

    console.log("buttons ia-BasePage-footer", buttons);

    for (const button of buttons) {
      const isVisibleAndHasText = await button.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const hasText =
          el.innerText.includes("Continuar") ||
          el.textContent?.includes("Continuar");
        return style && style.display !== "none" && hasText;
      });

      if (isVisibleAndHasText) {
        console.log("clicando....");
        await button.click();
      }
    }
    console.log("applying...");
  } catch (error) {
    console.log("erro em clicknextbutton", error);
  }
}

export default clickNextButton;
