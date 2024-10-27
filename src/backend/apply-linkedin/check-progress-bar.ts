import { Page } from "puppeteer";
import { PageWithCursor } from "puppeteer-real-browser";

export async function checkProgressBar(page: PageWithCursor): Promise<number> {
    const progressBar = await page.$(".jobs-easy-apply-content progress");
    const progressValue = await progressBar?.evaluate(el => el.value); // Pega o valor diretamente
    console.log("Valor da progress bar:", progressValue);
    return progressValue || 0; // Retorna o valor ou 0 se não for encontrado
}
