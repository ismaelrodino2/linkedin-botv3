import { Page } from "puppeteer";
import { fillFieldSet } from "../fills/fill-field-set";
import { GenerativeModel } from "@google/generative-ai";
import { fillInputs } from "../fills/fill-inputs";
import { fillSelects } from "../fills/fill-selects";
import { fillTextAreas } from "../fills/fill-text-areas";
import { fillCv } from "../fills/fill-cv";

export async function fillFields(page: Page, model: GenerativeModel) {
  try {
    await fillFieldSet(page, model);
  } catch (error) {
    console.error("Erro ao preencher fieldset:", error);
  }

  try {
    await fillInputs(page, model);
  } catch (error) {
    console.error("Erro ao preencher inputs:", error);
  }

  try {
    await fillSelects(page, model);
  } catch (error) {
    console.error("Erro ao preencher selects:", error);
  }

  try {
    await fillTextAreas(page, model);
  } catch (error) {
    console.error("Erro ao preencher text areas:", error);
  }
  try {
    await fillCv(page)
  } catch (error) {
    console.error("Erro ao preencher text areas:", error);
  }

  // // Se precisar chamar fillFieldSet novamente
  // try {
  //   await fillFieldSet(page, model);
  // } catch (error) {
  //   console.error("Erro ao preencher fieldset (segunda vez):", error);
  // }
}
