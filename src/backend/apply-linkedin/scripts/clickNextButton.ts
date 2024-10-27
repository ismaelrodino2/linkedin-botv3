import { Page } from "puppeteer";
import { selectors } from "../selectors";
import { PageWithCursor } from "puppeteer-real-browser";

async function clickNextButton(page: PageWithCursor): Promise<void> {
  try {
    await page.waitForSelector(selectors.nextButton, {
      timeout: 3000,
    });
    await page.click(selectors.nextButton); //se ele clicar em submit tem q ja cancelar tudo e ir de next
    console.log('Moving to the next page...')
  } catch (error) {
    console.log(error)
  }
}

export default clickNextButton;
