import { ElementHandle, Page } from "puppeteer";
import { knownFields } from "./known-fields";

export const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

// Função para rolar suavemente até o final de um contêiner

export async function generateLinks(page: Page) {
  // Seleciona todos os <li> dentro de um ul com a classe 'scaffold-layout__list-container'
  const allLis = await page.$$("#mosaic-provider-jobcards > ul > li");

  await wait(1000);

  const filteredLis: ElementHandle<HTMLLIElement>[] = [];

  // Filtrando os elementos que contêm os textos desejados
  for (const el of allLis) {
    const text = await el.evaluate((el) => el.innerText || el.textContent || "");

    if (knownFields.easyApply.some((field) => text.includes(field))) {
      filteredLis.push(el);
    } else {
      console.log("Elemento LI não possui o texto desejado");
    }
  }


  const links: string[] = [];

  // Processando os <li> filtrados
  for (const li of filteredLis) {
    const link = await li.evaluate(
      (li) => {
        const anchor = li.querySelector("a.jcs-JobTitle") as HTMLAnchorElement;
        const viewLink = anchor ? anchor.href : null;


        return viewLink;
      },
      knownFields // Passa o knownFields para o contexto do navegador
    );

    if (link) {
      links.push(link); // Armazena o link se for válido
    }
  }
  return links; // Retorna o array de links válidos
}
