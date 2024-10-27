import { ElementHandle, Page } from "puppeteer";
import { knownFields } from "../known-fields";
import { PageWithCursor } from "puppeteer-real-browser";

interface CommonElementHandle<T> {
  evaluate: (pageFunction: (element: T) => any) => Promise<any>;
  $: (selector: string) => Promise<CommonElementHandle<Element> | null>;
}

export const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

// Função para rolar suavemente até o final de um contêiner

export async function generateLinks(page: PageWithCursor) {
  // Seleciona todos os <li> dentro de um ul com a classe 'scaffold-layout__list-container'
  const allLis = await page.$$(".scaffold-layout__list-container > li");

  await wait(1000);

  const filteredLis: CommonElementHandle<HTMLLIElement>[] = [];

  for (const el of allLis) {
    const text = await el.evaluate(
      (el) => el.innerText || el.textContent || ""
    );
    console.log("o texto eh", text);
    if (knownFields.easyApply.some((field) => text.includes(field))) {
      console.log("deu push", el);
      filteredLis.push(el);
    } else {
      console.log("Elemento LI não possui o texto desejado");
    }
  }
console.log("filtered", filteredLis)
  const links: string[] = [];

  // Obtendo os links de cada LI
  const currentLink = page.url(); // Obtém a URL atual da página
  console.log("filteredLis", filteredLis);
    for (const el of filteredLis) {
      const anchor = await el.$("a.job-card-container__link");

      if (anchor) {
        const href = await anchor.evaluate((a) => a.getAttribute("href"));

        console.log("o href e", href)

        const jobIdMatch = href?.match(/\/view\/(\d+)/);
        const jobId = jobIdMatch ? jobIdMatch[1] : null;
        if (jobId) {
          // Substitui a parte 'currentJobId=numero' da URL atual pelo novo jobId
          const newLink = currentLink.replace(
            /currentJobId=\d+/,
            `currentJobId=${jobId}`
          );
          console.log("newLink eh", newLink)

          links.push(newLink);
        }
      } else {
        console.log("Âncora não encontrada");
      }
    }
  console.log("links", links);
  return links;
}
