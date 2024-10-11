import { Page } from "puppeteer";
import { knownFields } from "../known-fields";
import { globalPrompt } from "../../prompt";
import { GenerativeModel } from "@google/generative-ai";
import { sleep } from "../../callserver";
import { trimDots } from "./fill-field-set";

export async function fillSelects(page: Page, model: GenerativeModel) {
  const selects = await page.$$(".jobs-easy-apply-content form select");

  if (selects.length > 0) {
    for (const select of selects) {
      const options = await select.evaluate((selectElement) => {
        // Retornamos um array de objetos contendo o texto e o value de cada opção
        return Array.from(selectElement.options).map((option) => ({
          text: option.text.trim(),
          value: option.value,
        }));
      });

      const selectedOptionText = await select.evaluate((selectElement) => {
        const selectedIndex = selectElement.selectedIndex;
        if (selectedIndex >= 0) {
          return selectElement.options[selectedIndex].text.trim();
        }
        return "Nenhuma opção selecionada";
      });

      const selectId = await page.evaluate((select) => select.id, select);
      const associatedLabelText = await page.evaluate((selectId) => {
        const labelElement = document.querySelector(`label[for="${selectId}"]`);
        if (labelElement && labelElement instanceof HTMLLabelElement) {
          return labelElement.textContent?.trim() || "";
        }
        return "";
      }, selectId);

      console.log("Label do select:", associatedLabelText);
      console.log("Texto da opção selecionada:", selectedOptionText);
      console.log("Options:", options);

      // Verifica se já está preenchido (se não estiver na primeira opção)
      if (selectedOptionText === options[0].text) {
        // Tenta encontrar uma correspondência nas opções com `knownFields`
        const matchedOption = options.find((option) => {
          return Object.keys(knownFields).some((key) => {
            const fieldValues = knownFields[key as keyof typeof knownFields]; // Usando o tipo específico aqui
            return fieldValues.some((fieldValue) => 
              option.text.includes(fieldValue)
            );
          });
        });
        if (
          matchedOption &&
          matchedOption.text.trim().toLocaleLowerCase() !== "email" &&
          matchedOption.text.trim().toLocaleLowerCase() !== "e-mail"
        ) {
          // Se encontrar, seleciona a opção correspondente pelo value
          await select.select(matchedOption.value);
          await sleep(300);

          console.log(`Selecionado: ${matchedOption.text}`);
        } else {
          // Se não encontrar correspondência, usa a AI para selecionar
          console.log(
            "Nenhuma correspondência encontrada em knownFields, usando AI..."
          );

          const isDateRange = associatedLabelText.includes("From");

          const prompt =
            `${globalPrompt}. The following form item is a select with a label: ${associatedLabelText}. The text of each <option>: ${options
              .slice(1)
              .map(
                (opt) => opt.text
              )}. Choose the index associated with the correct option. (note: the index starts from 1 and not from 0).` +
            (isDateRange
              ? ' Make sure that "From" is not greater than "To" when selecting dates.'
              : "") +
            "Your answer will be just the index and nothing else, be concise.";

          const result = await model.generateContent(prompt);
          const textResponse = result.response.text().trim();

          // O índice sugerido pela AI deve ser decrementado em 1 para corresponder à nova lista
          const aiOptionIndex = parseInt(trimDots(textResponse)) - 1;

          if (aiOptionIndex >= 0 && aiOptionIndex < options.length - 1) {
            // Verifique se está dentro do intervalo ajustado
            await sleep(300);

            await select.select(options[aiOptionIndex + 1].value); // Usamos o `value` da opção ajustando o índice
            console.log(
              `Selecionado pela AI: ${options[aiOptionIndex + 1].text}`
            ); // Mostra o texto da opção selecionada
          } else {
            console.log(`Índice "${textResponse}" é inválido.`);
          }
        }
      } else {
        console.log("Campo já preenchido.");
      }
    }

    console.log("Campos preenchidos");
  }
}
