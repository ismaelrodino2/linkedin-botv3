import { Page } from "puppeteer";
import { knownFields } from "../known-fields";
import { valuesConfig } from "../config";
import { GenerativeModel } from "@google/generative-ai";
import { sleep } from "../../callserver";
import { PageWithCursor } from "puppeteer-real-browser";

export async function fillTextAreas(page: PageWithCursor, model: GenerativeModel) {
  const textAreas = await page.$$(".jobs-easy-apply-content form textarea");

  console.log("textAreas123", textAreas);

  if (textAreas.length) {
    for (const textTextArea of textAreas) {
      console.log("loop textTextArea");
      // Obter o valor do textarea
      const textAreaValue = await page.evaluate(
        (textArea) => textArea.value,
        textTextArea
      );

      // Obter id do textarea
      const textAreaId = await page.evaluate(
        (textArea) => textArea.id,
        textTextArea
      );

      // Encontrar a label associada ao textarea
      const associatedLabel = await page.evaluate((textAreaId) => {
        const label = document.querySelector(`label[for="${textAreaId}"]`);
        return label ? label.textContent : "";
      }, textAreaId);

      console.log("associatedLabel", associatedLabel);

      // Verificar se o valor está vazio
      if (textAreaValue === "") {
        //to-do: caso q n exista
        // Verificar se o texto da label corresponde a algum valor em knownFields
        const foundFieldKey = Object.keys(knownFields).find((key) =>
          knownFields[key as keyof typeof knownFields].some((label) =>
            associatedLabel?.toLowerCase().includes(label.toLowerCase())
          )
        ) as keyof typeof knownFields | undefined;

        if (foundFieldKey) {
          console.log(`A classe do input contém: ${foundFieldKey}`);
          // Verificar se a classe contém alguma das strings de knownFields dinamicamente
          //@ts-ignore
          const fieldValue = valuesConfig[foundFieldKey];

          await textTextArea.type(fieldValue);
        } else {
          console.log("A classe do input não contém nenhum valor conhecido."); //usar AI
          console.log(`O input já contém texto: ${textAreaValue}`);

          const prompt = `${globalPrompt}. The following form item is an textarea with a label: ${associatedLabel}. Write the the correct answer. Be concise. Write complete and specific sentences without using placeholders or generic terms that need to be filled in later. Each sentence should be clear and self-sufficient, with all necessary information already included. Always fill in something, as this message will be sent directly, without editing. When you don't know the names, use something generic.`;

          const result = await model.generateContent(prompt);

          const textResponse = result.response.text();

          await textTextArea.type(textResponse.trim());
        }
      } else {
        console.log(`O textarea já contém texto: ${textAreaValue}`);
      }
    }
  }
}
