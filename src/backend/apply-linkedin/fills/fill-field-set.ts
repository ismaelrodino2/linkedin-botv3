import { Page } from "puppeteer";
import { GenerativeModel } from "@google/generative-ai";
import { sleep } from "../../callserver";
import { PageWithCursor } from "puppeteer-real-browser";
import { wait } from "../scripts/generate-links";

export function trimDots(text: string) {
  return text.replace(/^\.+|\.+$/g, "").trim();
}

export async function fillFieldSet(page: PageWithCursor, model: GenerativeModel) {
  const fieldsets = await page.$$(".jobs-easy-apply-content form fieldset");

  console.log("fieldsets", fieldsets);

  if (fieldsets.length > 0) {
    for (const fieldset of fieldsets) {
      // Verifica se existe um <legend> como filho do fieldset (em qualquer nível)
      const legend = await fieldset.$("legend");

      const fieldsetsText = await legend?.evaluate((el) =>
        el.textContent?.trim()
      );
      console.log("Texto da legend123:", fieldsetsText);

      let legendText;

      if (legend) {
        // Pegar o texto do legend
        legendText = await legend.evaluate((el) => el.textContent?.trim());
        console.log(`Texto do legend: ${legendText}`);
      }

      // Encontrar todos os inputs dentro do fieldset
      const inputs = await fieldset.$$("input");

      console.log("fieldset", fieldset);
      console.log("inputs", inputs);

      // Organize os inputs em um array
      const inputLabels = [];

      for (const input of inputs) {
        // Pegar o id do input
        const inputId = await input.evaluate((el) => el.id);

        if (inputId) {
          // Procurar a label que tem o atributo for igual ao id do input
          const label = await fieldset.$(`label[for="${inputId}"]`);

          if (label) {
            // Obter o texto da label
            const labelText = await label.evaluate((el) =>
              el.textContent?.trim()
            );

            const labelElement = label;

            // Adiciona o input e o texto da label no array
            inputLabels.push({ input, labelText, labelElement });
          }
        }
      }

      //check if the checkbox is already checked
      const isAlreadyMarked = await Promise.all(
        inputLabels.map(async (el) => {
          const element = await page.evaluate((labelElement) => {
            if (labelElement) {
              // Acessa o estilo computado do ::before
              const before = window.getComputedStyle(labelElement, "::before");
              return before.getPropertyValue("background-color");
            }
            return null;
          }, el.labelElement);
      
          console.log("element123456", element);
      
          // Verifica se o background-color é o que você espera
          return element === "rgb(1, 117, 79)"; // Substitua pela cor esperada
        })
      );
      
      const alreadyMarked = isAlreadyMarked.some((marked) => marked);

      if (inputLabels.length && !alreadyMarked) {
        // Verifica se algum input tem a label com o texto específico
        const preferredLabel = inputLabels.find(({ labelText }) =>
          labelText?.includes("I prefer not to specify")
        );

        if (preferredLabel) {
          // Se encontrou, clique no input
          await preferredLabel.input.click();
          console.log(
            'Input com a label "I prefer not to specify" foi clicado'
          );
        } else {
          //to-do: considerar qnd ele já ta preenchido
          // Se não encontrou, lidar com a situação conforme necessário
          console.log(
            'Nenhum input encontrado com a label "I prefer not to specify"'
          );
          //AI
          const prompt = `${globalPrompt}. The following form item is an fieldset with a label: ${legendText}. Choose the right text to mark between these: ${inputLabels.map(
            (el) => el.labelText
          )}. Only tell me the chosen text, nothing else.`;

          const result = await model.generateContent(prompt);

          const textResponse = result.response.text();

          console.log("textResponseFieldSet", textResponse);

          console.log("inputLabels", inputLabels);

          const isMultipleChoice = await fieldset.evaluate((el) =>
            el.classList.contains("multipleChoice")
          );

          if (isMultipleChoice) {
            // Encontre todos os preferredLabel cujas labels estão incluídas na resposta da AI
            const preferredLabels = inputLabels.filter(
              ({ labelText }) =>
                labelText?.trim() &&
                textResponse.trim().includes(labelText.trim())
            );
            // Se for multipleChoice, iterar sobre todos os preferredLabels encontrados e clicar em cada um
            for (const preferredLabel of preferredLabels) {
              await preferredLabel?.input.click();
              await preferredLabel?.labelElement.click();
              console.log(
                `Input com a label "${preferredLabel.labelText}" foi clicado.`
              );
            }
          } else {
            // Verifica se o textResponse inclui algum input com a label específica
            const preferredLabel = inputLabels.find(
              ({ labelText }) =>
                labelText?.trim() &&
                textResponse.trim().includes(labelText.trim())
            );
            console.log("preferredLabel", preferredLabel);


            await preferredLabel?.input.click();
            await preferredLabel?.labelElement.click();

            // if (preferredLabel) {
            //   const inputHandle = preferredLabel.input;

            //   const isVisible = await inputHandle.evaluate(
            //     (el) => el.offsetParent !== null
            //   );
            //   const isEnabled = await inputHandle.evaluate(
            //     (el) => !el.disabled
            //   );

            //   if (isVisible && isEnabled) {
            //     await sleep(300);

            //     await preferredLabel.labelElement.click();

            //     await sleep(300);

            //     await inputHandle.click();
            //     console.log("Input clicado com base na resposta da AI");
            //   } else {
            //     console.log("Input não está visível ou está desabilitado");
            //   }
            // } else {
            //   console.log("Nenhum input encontrado com a label específica");
            // }
            await wait(100);
          }
        }
      }
    }
  }
}
