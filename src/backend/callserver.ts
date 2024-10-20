import express from "express";
import { json } from "body-parser";
import cors from "cors"; // Importa o pacote cors
import { config } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { applyScript } from "./apply-linkedin/scripts/applyScript";
import { executablePath, Page } from "puppeteer";
import { wait } from "./apply-linkedin/scripts/generate-links";
import { Request, Response } from "express";
import { applyScriptIndeed } from "./apply-indeed/apply-script-indeed";
import { navigateToNextPage } from "./apply-linkedin/scripts/generate-pagination-links";

export type JobInfo = {
  position?: string;
  company?: string;
  location?: string;
  currentDateTime?: Date;
  platform?: string;
  language?: string | null;
};

config();

export const sleep = (baseMs: number) => {
  const randomDelay = Math.random() * 296 - 148;
  const delay = Math.max(0, baseMs + randomDelay); // Garante que o atraso não seja negativo

  return new Promise((res) => setTimeout(res, delay));
};

async function scrollToBottomAndBackSmoothly(
  page: Page,
  containerSelector: string
) {
  const scrollStep = 100; // Quantidade de pixels para rolar a cada passo
  const scrollDelay = 50; // Delay entre os passos de rolagem para suavizar o movimento

  // Função para rolar o container em uma direção específica
  async function scroll(direction: "down" | "up") {
    let previousScrollTop = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentScrollTop = await page.evaluate(
        (containerSelector, scrollStep, direction) => {
          const container = document.querySelector(containerSelector);
          if (container) {
            if (direction === "down") {
              container.scrollTop += scrollStep;
            } else {
              container.scrollTop -= scrollStep;
            }
            return container.scrollTop;
          }
          return 0; // Retorna 0 se o contêiner não for encontrado
        },
        containerSelector,
        scrollStep,
        direction
      );

      await wait(scrollDelay); // Delay para criar o efeito de rolagem suave

      const containerMaxScrollTop = await page.evaluate((containerSelector) => {
        const container = document.querySelector(containerSelector);
        if (container) {
          return container.scrollHeight - container.clientHeight;
        }
        return 0;
      }, containerSelector);

      if (
        (direction === "down" && currentScrollTop >= containerMaxScrollTop) ||
        (direction === "up" && currentScrollTop <= 0)
      ) {
        break; // Se chegou ao final ou topo, interrompe o loop
      }

      // Se o scroll não mudou, interrompe a execução
      if (currentScrollTop === previousScrollTop) break;

      previousScrollTop = currentScrollTop;
    }
  }

  // Primeiro, rolar para baixo
  await scroll("down");
  // Depois, rolar de volta para cima
  await scroll("up");
}

export function callServer() {
  const appliedJobsIndeed: JobInfo[] = []; //will come from api
  const appliedJobsLinkedin: JobInfo[] = []; //will come from api

  const app = express();
  const port = 3000;

  let browserInstance;
  let pageInstance: Page;

  app.use(cors());
  app.use(json());

  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  app.get("/", (req: Request, res: Response) => {
    res.send("Servidor Express está funcionando!");
  });

  app.post("/navigate", async (req: Request, res: Response) => {
    try {
      const puppeteer = require("puppeteer-extra");
      var userAgent = require("user-agents");

      // add stealth plugin and use defaults (all evasion techniques)
      const StealthPlugin = require("puppeteer-extra-plugin-stealth");
      puppeteer.use(StealthPlugin());

      browserInstance = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        pipe: true,
        executablePath: executablePath(),
        userDataDir: "./userDataDir",
        args: ["--disable-features=site-per-process"],
        targetFilter: (target: any) => target.type() !== "other",
      });
      pageInstance = await browserInstance.newPage();
      //await pageInstance.setViewport({ width: 1920, height: 1080 });

      await pageInstance.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      );
      await pageInstance.goto("https://www.linkedin.com/", {
        waitUntil: ["domcontentloaded", "networkidle2"],
      });

      res.send("Puppeteer test completed successfully.");
    } catch (error) {
      console.error("An error occurred during the Puppeteer test:", error);
      res.status(500).send("An error occurred during the Puppeteer test.");
    }
  });

  //linkedin
  app.post("/apply-linkedin", async (req: Request, res: Response) => {
    const maxIterations = 4; //decided for us, number around 150 iterations for paid

    console.log("browserInstance", pageInstance);

    function addJobToArrayLinkedin(el: JobInfo) {
      appliedJobsLinkedin.push(el);
    }

    while (appliedJobsIndeed.length < maxIterations) {
      try {
        await sleep(1000);
        await scrollToBottomAndBackSmoothly(
          pageInstance,
          ".jobs-search-results-list"
        );
        await sleep(600);
        await applyScript(pageInstance, model, addJobToArrayLinkedin);
        await sleep(600);
        await navigateToNextPage(pageInstance, 25);
        await sleep(600);
      } catch (error) {
        console.error(`Error Linkedin`, error);
      }
    }
  });

  //indeed
  app.post("/apply-indeed", async (req: Request, res: Response) => {
    const maxIterations = 4; //decided for us, number around 150 iterations for paid

    console.log("browserInstance", pageInstance);

    function addJobToArrayIndeed(el: JobInfo) {
      appliedJobsIndeed.push(el);
    }

    while (appliedJobsIndeed.length < maxIterations) {
      try {
        // console.log(`Loop iteration: ${i}`);
        await sleep(1000);
        // await scrollToBottomAndBackSmoothly(pageInstance, ".js-focus-visible");
        await sleep(600);
        await applyScriptIndeed(pageInstance, model, addJobToArrayIndeed);
        await sleep(1000);
        // await navigateToNextPageIndeed(pageInstance);
        await sleep(600);
      } catch (error) {
        // console.error(`Error in loop iteration ${i}:`, error);
      }
    }
    console.log("jobs aplicados:", appliedJobsIndeed)
  });

  const server = app.listen(port, () => {
    console.log(`Servidor Express rodando na porta ${port}`);
  });

  server.on("listening", () => {
    console.log(`Express server started on port ${port}`);
  });

  server.on("error", (error) => {
    console.error(`Express server error: ${error}`);
  });

  return server;
}
