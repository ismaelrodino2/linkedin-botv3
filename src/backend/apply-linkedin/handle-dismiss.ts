import { Page } from "puppeteer";

export async function handleDismiss(page: Page) {
  try {
    // Espera até que o botão "Dismiss" esteja visível e clica nele
    const dismissButton = await page.waitForSelector('button[aria-label="Dismiss"]', { visible: true });
    if (dismissButton) {
      await dismissButton.click();
      console.log('Botão "Dismiss" foi clicado.');
    } else {
      console.log('Botão "Dismiss" não encontrado.');
      return;
    }

    // Espera até que o botão de confirmação esteja visível e clica nele
    const confirmButton = await page.waitForSelector('button[data-control-name="discard_application_confirm_btn"]', { visible: true });
    if (confirmButton) {
      await confirmButton.click();
      console.log('Botão de confirmação foi clicado.');
    } else {
      console.log('Botão de confirmação não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao tentar clicar nos botões:', error);
  }
}
