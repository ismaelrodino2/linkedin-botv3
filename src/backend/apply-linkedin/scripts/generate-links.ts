import { ElementHandle, Page } from "puppeteer";
import { knownFields } from "../known-fields";

export const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

// Função para rolar suavemente até o final de um contêiner

export async function generateLinks(page: Page) {
  // Seleciona todos os <li> dentro de um ul com a classe 'scaffold-layout__list-container'
  const allLis = await page.$$(".scaffold-layout__list-container > li");

  await wait(1000);

  const filteredLis: ElementHandle<HTMLLIElement>[] = [];

  for (const el of allLis) {
    const text = await el.evaluate(
      (el) => el.innerText || el.textContent || ""
    );

    if (knownFields.easyApply.some((field) => text.includes(field))) {
      filteredLis.push(el);
    } else {
      console.log("Elemento LI não possui o texto desejado");
    }
  }

  // Obtendo os links de cada LI
  return await page.evaluate(() => {
    const allLis = document.querySelectorAll(
      ".scaffold-layout__list-container > li"
    );

    const currentLink = window.location.href; // Obtém a URL atual dinamicamente

    return Array.from(allLis)
      .map((li) => {
        const text = li.textContent || "";
        const anchor = li.querySelector("a.job-card-container__link");
        const viewLink = anchor ? (anchor as HTMLAnchorElement).href : null;

        if (viewLink && knownFields.easyApply.some(field => text.includes(field))) {
          const jobIdMatch = viewLink.match(/\/view\/(\d+)/);
          const jobId = jobIdMatch ? jobIdMatch[1] : null;
          if (jobId) {
            // Substitui a parte 'currentJobId=numero' da URL atual pelo novo jobId
            const newLink = currentLink.replace(
              /currentJobId=\d+/,
              `currentJobId=${jobId}`
            );
            return newLink;
          }
        }
        return null;
      })
      .filter(Boolean); // Filtra os nulos
  });
}
