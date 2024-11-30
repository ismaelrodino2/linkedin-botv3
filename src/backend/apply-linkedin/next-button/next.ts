import { sleep } from "../../callserver";
import { Page } from "puppeteer";

// Função principal para clicar nos botões e verificar progresso
export async function clickNext(page: Page) {
  try {
    await sleep(400); // Aumente o tempo se necessário

    // Verifica se o botão "Next" está presente antes de continuar
    const nextButton = await page.$(
      ".jobs-easy-apply-modal button[aria-label='Continue to next step']"
    );
    console.log("nextButton", nextButton);
    if (nextButton) {
      await nextButton.click();
      console.log("Botão 'Next' foi clicado.");
      await sleep(300);
    } else {
      // Se o botão "Continue to next step" não existir, tenta "Review your application"
      const reviewButton = await page.$(
        ".jobs-easy-apply-modal button[aria-label='Review your application']"
      );
      if (reviewButton) {
        await reviewButton.click();
      } else {
        // Verifica se o botão "Submit application" está presente
        const submitButton = await page.$(
          ".jobs-easy-apply-modal button[aria-label='Submit application']"
        );

        console.log("submitButton", submitButton);

        await sleep(300);

        if (submitButton) {
          await submitButton.click();
          await sleep(2000);

          let dismissButton;
          try {
            dismissButton = await page.waitForSelector(
              ".jobs-easy-apply-modal form button[aria-label='Dismiss']",
              { visible: true, timeout: 3000 }
            );
          } catch (error) {
            console.error(
              "Botão de aplicar não encontrado no tempo esperado:",
              error
            );
            // Trate a situação aqui: pular essa etapa, tentar novamente ou logar o erro
          }

          console.log("dismissButton", dismissButton);

          await sleep(2000);
          if (dismissButton) {
            await dismissButton.click();
            console.log("dismiss clicado");
            await sleep(700);
            // increment(); //we already to in checkButtonsExit
          }
        }
      }
    }
  } catch (error) {
    console.error("Erro ao clicar nos botões ou verificar progresso:", error);
    // Verifica se o erro é de contexto destruído
  }
}
