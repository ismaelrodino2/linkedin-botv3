import express from "express";
import { json } from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { applyScript } from "./apply-linkedin/scripts/applyScript";
import { wait } from "./apply-linkedin/scripts/generate-links";
import { Request, Response } from "express";
import { applyScriptIndeed } from "./apply-indeed/apply-script-indeed";
import { navigateToNextPage } from "./apply-linkedin/scripts/generate-pagination-links";
import { connect, PageWithCursor } from "puppeteer-real-browser";
import path from "path";
import fs from "fs";
import { createGlobalPrompt } from "./prompt";

config();

const userDataDir =
  process.env.NODE_ENV !== "dev"
    ? path.join(process.resourcesPath, "userDataDir") // Em produção, salva na pasta do executável (process.resourcesPath)
    : path.resolve(__dirname, "./userDataDir"); // Em desenvolvimento, salva na raiz do projeto

// Verificar se o diretório existe, e se não, criá-lo
if (!fs.existsSync(userDataDir) && process.env.NODE_ENV !== "dev") {
  fs.mkdirSync(userDataDir, { recursive: true });
}

export type JobInfo = {
  position?: string;
  company?: string;
  location?: string;
  currentDateTime?: Date;
  platform?: string;
  language?: string | null;
};

export const sleep = (baseMs: number) => {
  const randomDelay = Math.random() * 296 - 148;
  const delay = Math.max(0, baseMs + randomDelay); // Garante que o atraso não seja negativo

  return new Promise((res) => setTimeout(res, delay));
};

async function scrollToBottomAndBackSmoothly(
  page: PageWithCursor,
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

  let pageInstance: PageWithCursor;

  app.use(cors());
  app.use(json());

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  app.get("/", (req: Request, res: Response) => {
    res.send("Servidor Express está funcionando!");
  });

  app.post("/navigate", async (req: Request, res: Response) => {
    try {
      createGlobalPrompt({
        name: "Gabriel Cunha",
        role: "UI/UX & Mobile Designer",
        location: "Rio de Janeiro, Brazil",
        email: "designbycunha@gmail.com",
        linkedin: "www.linkedin.com/in/cunha2c",
        portfolio: "www.behance.net/gabrielcunha5",
        summary:
          "Dedicated UI/UX designer with a passion for learning and overcoming challenges. Experienced with Figma, and committed to working in leading teams.",
        experiences:
          "UI Designer, i2 Capital (May–Aug 2024): Led design projects, UX research, prototypes. | Social Media Manager, Torie Propaganda (Jan 2024–Present): Managed content creation and social media strategy. | UI/UX Designer, Curiba (Jan 2023–Mar 2024): Specialized in design systems, color theory, typography. | Freelance (Nov 2023–Jan 2024): E-commerce project development. | Social Media Manager, beofficesbrasil (May–Dec 2021): Digital marketing and social media strategies.",
        languages: "English, Spanish, Portuguese",
        availability: "Immediately",
        desiredSalary: "40,000 USD",
        startDate: new Date(),
        address: "Rua Álvaro Proença, Parque São Nicolau",
      });
      // Agora a variável globalPrompt está disponível globalmente
      console.log("global.globalPrompt", global.globalPrompt);

      const { browser, page } = await connect({
        headless: false,

        args: [],

        customConfig: {
          userDataDir: userDataDir,
        },

        turnstile: true,

        connectOption: {},

        disableXvfb: false,
        ignoreAllFlags: false,
        // proxy:{
        //     host:'<proxy-host>',
        //     port:'<proxy-port>',
        //     username:'<proxy-username>',
        //     password:'<proxy-password>'
        // }
      });

      pageInstance = page;

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
    const maxIterations = 2; //decided for us, number around 150 iterations for paid

    console.log("browserInstance", pageInstance);

    function addJobToArrayLinkedin(el: JobInfo) {
      appliedJobsLinkedin.push(el); //to-do: aqui n funfa: ele msm com 4 itens não para, talvez n esteja passando por aqqui td hora
    }

    while (appliedJobsLinkedin.length < maxIterations) {
      try {
        await scrollToBottomAndBackSmoothly(
          pageInstance,
          ".jobs-search-results-list"
        );
        await sleep(600);
        await applyScript(
          pageInstance,
          model,
          addJobToArrayLinkedin,
          appliedJobsLinkedin,
          maxIterations
        );
        await sleep(350);
        await navigateToNextPage(pageInstance, 25);
        await sleep(350);
      } catch (error) {
        console.error(`Error Linkedin`, error);
      }
    }
    console.log("jobs aplicados:", appliedJobsLinkedin);

    res.send("Puppeteer test completed successfully.");

  });

  //indeed
  app.post("/apply-indeed", async (req: Request, res: Response) => {
    const maxIterations = 2; //decided for us, number around 150 iterations for paid
    //to-do: ele ta carregando a mesma pagina sem aplicar td hr num loop
    console.log("browserInstance", pageInstance);

    function addJobToArrayIndeed(el: JobInfo) {
      appliedJobsIndeed.push(el);
      console.log("appliedJobsIndeed", appliedJobsIndeed)
    }

    const somePopUpThatCanDisplay = await pageInstance.$("#mosaic-desktopserpjapopup button[aria-label='fechar']")

    await somePopUpThatCanDisplay?.click()

    while (appliedJobsIndeed.length < maxIterations) {
      try {
        // console.log(`Loop iteration: ${i}`);
        // await scrollToBottomAndBackSmoothly(pageInstance, ".js-focus-visible");
        await sleep(600);
        await applyScriptIndeed(
          pageInstance,
          model,
          addJobToArrayIndeed,
          appliedJobsIndeed,
          maxIterations
        );
        //await navigateToNextPageIndeed(pageInstance);
        await sleep(600);
      } catch (error) {
        console.error(`Error in loop iteration indeed`, error);
      }
    }
    console.log("jobs aplicados:", appliedJobsIndeed);
    res.send("Puppeteer test completed successfully.");

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
