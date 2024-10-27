import { Page } from "puppeteer";
import { fillFieldSet } from "../fills/fill-field-set";
import { GenerativeModel } from "@google/generative-ai";
import { fillInputs } from "../fills/fill-inputs";
import { fillSelects } from "../fills/fill-selects";
import { fillTextAreas } from "../fills/fill-text-areas";
import { fillCv } from "../fills/fill-cv";
import { PageWithCursor } from "puppeteer-real-browser";
import { wait } from "../generate-links";

// Função para simular movimentos aleatórios do mouse
async function moveMouseRandomly(page: PageWithCursor) {
  const x = Math.floor(Math.random() * 1920); // Largura da tela (exemplo de largura comum)
  const y = Math.floor(Math.random() * 1080); // Altura da tela (exemplo de altura comum)

  // Movimenta o mouse para uma posição aleatória
  await page.mouse.move(x, y);

  // Adiciona um pequeno atraso para simular mais naturalidade
  await wait(Math.random() * 500 + 200); // Entre 200ms e 700ms
}

export async function fillFields(page: Page, model: GenerativeModel) {
  try {
    await fillFieldSet(page, model);
    await moveMouseRandomly(page); // Movimento aleatório do mouse
  } catch (error) {
    console.error("Erro ao preencher fieldset:", error);
  }

  try {
    await fillInputs(page, model);
    await moveMouseRandomly(page); // Movimento aleatório do mouse
  } catch (error) {
    console.error("Erro ao preencher inputs:", error);
  }

  try {
    await fillSelects(page, model);
    await moveMouseRandomly(page); // Movimento aleatório do mouse
  } catch (error) {
    console.error("Erro ao preencher selects:", error);
  }

  try {
    await fillTextAreas(page, model);
    await moveMouseRandomly(page); // Movimento aleatório do mouse
  } catch (error) {
    console.error("Erro ao preencher text areas:", error);
  }

  try {
    await fillCv(page);
    await moveMouseRandomly(page); // Movimento aleatório do mouse
  } catch (error) {
    console.error("Erro ao preencher CV:", error);
  }

  // Se precisar chamar fillFieldSet novamente
  // try {
  //   await fillFieldSet(page, model);
  //   await moveMouseRandomly(page); // Movimento aleatório do mouse
  // } catch (error) {
  //   console.error("Erro ao preencher fieldset (segunda vez):", error);
  // }
}