import { Page } from "puppeteer";
import { PageWithCursor } from "puppeteer-real-browser";

export async function checkProgressBar(page: PageWithCursor) {
    const progressBar = await page.$("div[role='progressbar']");

    if (progressBar) {
      console.log("A progressBar existe:", progressBar); //ta undefined pq n encontrou o botão de aplicar
    
      const progressValue = await progressBar.evaluate((el) => el.getAttribute('aria-valuenow'));
    
      if (progressValue) {
        console.log("Valor do 'aria-valuenow':", progressValue);
        return Number(progressValue) || 0; // Retorna o valor ou 0 se não for encontrado

      } else {
        console.log("O atributo 'aria-valuenow' não foi encontrado ou está vazio.");
      }
    } else {
      console.log("A progressBar não foi encontrada.");
    }
}
