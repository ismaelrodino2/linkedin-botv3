import { GenerativeModel } from "@google/generative-ai";
import { fillCv } from "./fills/fill-cv";
import { fillFieldSet } from "./fills/fill-field-set";
import { fillTextAreas } from "./fills/fill-text-areas";
import { fillSelects } from "./fills/fill-selects";
import { fillInputs } from "./fills/fill-inputs";
import { sleep } from "../callserver";
import { Page } from "puppeteer";
import { fillInputNumber } from "./fills/fill-input-number";


export async function fillFields(page: Page, model: GenerativeModel) {

  await sleep(1000)
  try {
    await fillFieldSet(page, model);
  } catch (error) {
    console.error("Erro ao preencher fieldset:", error);
  }
  await sleep(1000)

  try {
    await fillInputs(page, model);
  } catch (error) {
    console.error("Erro ao preencher inputs:", error);
  }
  await sleep(1000)

  try {
    await fillSelects(page, model);
  } catch (error) {
    console.error("Erro ao preencher selects:", error);
  }
  await sleep(1000)

  try {
    await fillTextAreas(page, model);
  } catch (error) {
    console.error("Erro ao preencher text areas:", error);
  }
  await sleep(1000)

  try {
    await fillCv(page)
  } catch (error) {
    console.error("Erro ao preencher text areas:", error);
  }

  try {
    await fillInputNumber(page, model)
  } catch (error) {
    console.error("Erro ao preencher text areas:", error);
  }

}
