import { knownFields } from "../known-fields";
import { valuesConfig } from "../config";
import { GenerativeModel } from "@google/generative-ai";
import { sleep } from "../../callserver";
import { trimDots } from "./fill-field-set";
import { Page } from "puppeteer";

export async function fillInputs(page: Page, model: GenerativeModel) {
  const textInputs = await page.$$('main form input[type="text"]');

  console.log("textInputs1234", textInputs);

  if (textInputs.length) {
    for (const textInput of textInputs) {
      console.log("textInputs54321", textInput);

      // Obter o valor do input
      const inputValue = await page.evaluate((input) => input.value, textInput);
      console.log("textInputs543211", inputValue);

      // Obter id do input
      const inputId = await page.evaluate((input) => input.id, textInput);

      // Encontrar a label associada ao input
      const associatedLabel = await page.evaluate((inputId) => {
        const label = document.querySelector(`label[for="${inputId}"]`);
        return label ? label.textContent : "";
      }, inputId);

      console.log("associatedLabel1111", associatedLabel);

      // Verificar se o valor está vazio
      if (inputValue === "" && associatedLabel?.length) {
        // Verificar se o texto da label corresponde a algum valor em knownFields
        const foundFieldKey = Object.keys(knownFields).find((key) =>
          knownFields[key as keyof typeof knownFields].some((label) =>
            associatedLabel.toLowerCase().includes(label.toLowerCase())
          )
        ) as keyof typeof knownFields | undefined;

        if (foundFieldKey) {
          console.log(`A classe do input contém: ${foundFieldKey}`);
          // Verificar se a classe contém alguma das strings de knownFields dinamicamente
          //@ts-ignore
          const fieldValue = valuesConfig[foundFieldKey];
          await sleep(300);

          await textInput.type(fieldValue);
        } else {
          console.log("AI");
          // Caso o texto da label não corresponda a valores conhecidos
     
          const prompt = `${globalPrompt}. The following form item is an input with a label: ${associatedLabel}. If the question is about the city, please respond in the format: "City, Country" (e.g., "Rio de Janeiro, Brazil"). Write the correct answer. Be concise. Please use the format mm/dd/yyyy when entering a date, and give me only the date. Do not exceed 50 to 100 characters.`;
          const result = await model.generateContent(prompt);

          let textResponse = result.response.text().trim();

          // // Verificar se isNumericInput é true e se textResponse contém apenas números
          // if (isNumericInput && !/^\d+$/.test(textResponse)) {
          //   textResponse = "4"; // Resposta padrão como 1 se não contiver apenas números
          // }

          if (textResponse.trim()) {
            await sleep(300);

            await textInput.type(trimDots(textResponse));
          } else {
            console.log("Nenhuma resposta gerada pela IA.");
          }
        }
      } else {
        console.log(`O input já contém texto: ${inputValue}`);
      }
    }
  }
}
