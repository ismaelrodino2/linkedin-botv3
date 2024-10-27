import { Page } from "puppeteer";

// Função para gerar a próxima URL de paginação e navegar para ela no Indeed
export async function navigateToNextPageIndeed(page: PageWithCursor): Promise<void> {
  // Pega a URL atual do navegador
  const currentUrl = await page.evaluate(() => window.location.href);

  // Cria um objeto URL a partir da URL atual
  const url = new URL(currentUrl);

  // Obtém o valor atual do parâmetro "start"
  const startParam = url.searchParams.get("start");
  const currentStart = startParam ? parseInt(startParam, 10) : 0;

  // Incrementa o valor do parâmetro "start" para a próxima página (incremento fixo de 10)
  const nextStart = currentStart + 10;

  // Define o novo valor do parâmetro "start"
  url.searchParams.set("start", nextStart.toString());

  // Obtém a nova URL de paginação
  const nextPageUrl = url.toString();

  // Navega para a nova URL da página de paginação
  await page.goto(nextPageUrl, { waitUntil: "networkidle2", timeout: 30000 });

  console.log(`Navegou para a próxima página: ${nextPageUrl}`);
}
