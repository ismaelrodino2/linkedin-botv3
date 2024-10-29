import { ElementHandle } from "puppeteer";
import { GenerativeModel } from "@google/generative-ai";
import { Page } from "puppeteer";

export function trimDots(text: string) {
  return text.replace(/^\.+|\.+$/g, "").trim();
}

export async function fillFieldSet(page: Page, model: GenerativeModel) {
  const fieldsets = await page.$$("main fieldset");

  console.log("fieldsets", fieldsets);

  if (fieldsets.length > 0) {
    for (const fieldset of fieldsets) {
      // Verifica se existe um <legend> como filho do fieldset (em qualquer nível)
      const legend = await fieldset.$("legend");

      const fieldsetsText = await legend?.evaluate((el) =>
        el.textContent?.trim()
      );
      console.log("Texto da legend123:", fieldsetsText);

      let legendText: string = "";

      if (legend) {
        // Pegar o texto do legend
        legendText =
          (await legend.evaluate((el) => el.textContent?.trim())) || "";
        console.log(`Texto do legend: ${legendText}`);
      }

      const options = await fieldset.$$("label"); //errado é onde ta a div com label e input -> tudo ta dentro da label

      let shouldContinue = false;

      for (const option of options) {
        // Verifica se a div possui a propriedade data-checked="true"
        const isChecked = await option.evaluate((el) => {
          const input = el.querySelector("input"); // Seleciona o input filho direto
          return input ? input.checked : false; // Retorna o estado 'checked' do input
        });
        if (isChecked) {
          // Sinaliza para passar ao próximo fieldset
          shouldContinue = true;
          break;
        }
      }

      if (shouldContinue) {
        continue; // Vai para o próximo fieldset
      }

      console.log("fieldset", fieldset);
      console.log("options", options);

      // Organize os textos dos labels em um array
      const labelsTexts: {
        legendText: string;
        option: ElementHandle<HTMLLabelElement>;
        labelText: string;
        input?: ElementHandle<HTMLInputElement> | null;
        label?: ElementHandle<HTMLLabelElement> | null;
      }[] = [];

      for (const option of options) {
        // Seleciona todos os labels dentro da opção
        const text = await option.evaluate((el) => el.innerText); // Obtém todo o texto do option
        console.log("texto do fieldset:", text); // Exibe o texto no console

        const input = await option.$("input");
        labelsTexts.push({
          legendText,
          option,
          labelText: text,
          input,
          label: option,
        });
      }

      //AI
      const prompt = `${globalPrompt}. The following form item is an fieldset with a label: ${legendText}. Choose the right text to mark between these: ${labelsTexts.map(
        (el) => el.labelText
      )}. Only tell me the chosen text, nothing else.`;

      const result = await model.generateContent(prompt);

      const textResponse = result.response.text();

      console.log("textResponseFieldSet", textResponse);

      const preferredLabel = labelsTexts.find(({ labelText }) =>
        textResponse.trim().includes(labelText.trim())
      );

      await preferredLabel?.option.click();
      await preferredLabel?.input?.click();
      await preferredLabel?.label?.click();
    }
  }
}
