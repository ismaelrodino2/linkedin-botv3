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
import { connect } from "puppeteer-real-browser";
import path from "path";
import fs from "fs";
import { createGlobalPrompt } from "./prompt";
import multer from "multer";
import { FormInputs } from "../routes/profile";
import { Page } from "puppeteer";

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
// Variáveis globais para armazenar genAI e o modelo
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

  const app = express();
  const port = 3000;

  let pageInstance: Page;

  app.use(cors());
  app.use(json());



  app.get("/", (_, res: Response) => {
    res.send("Servidor Express está funcionando!");
  });

  // Definindo o diretório base como a raiz do projeto
  const baseDirectory = path.join(__dirname, "../../"); // Ajuste conforme necessário
  const dirPath = path.join(baseDirectory, "uploads");

  // Cria o diretório "uploads" se não existir
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Configuração do multer
  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, dirPath); // Salva os arquivos no diretório uploads na raiz do projeto
    },
    filename: function (_req, file, cb) {
      cb(null, file.originalname); // Mantém o nome original do arquivo
    },
  });

  const upload = multer({ storage });

  // Endpoint para upload de arquivos
  app.post("/upload", upload.single("file"), (req, res) => {
    if (req.file) {
      console.log("Arquivo recebido:", req.file.originalname);
      res.json({ message: "File uploaded successfully" });
    } else {
      console.error("Nenhum arquivo foi recebido");
      res.status(400).json({ message: "No file uploaded" });
    }
  });

  app.post("/open", async (req: Request, res: Response) => {
    const data: FormInputs = req.body.data;
    const {
      address,
      availability,
      cvNameIndeed,
      desiredSalary,
      email,
      experiences,
      languages,
      linkedin,
      location,
      maxApplications,
      name,
      role,
      summary,
      portfolio,
    } = data;
    try {
      createGlobalPrompt({
        address,
        availability,
        desiredSalary,
        email,
        experiences,
        languages,
        linkedin,
        location,
        name,
        portfolio,
        role,
        startDate: new Date(),
        summary,
      });

      (global as any).globalVars = {
        cvNameIndeed,
        maxApplications,
      }; // Armazenando o valor globalmente

       genAI = new GoogleGenerativeAI("AIzaSyBO_Xs_g7230U0FEZw0VNapadJzUIgUvC0");
       model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


      // Agora a variável globalPrompt está disponível globalmente
      console.log("global.globalPrompt", global.globalPrompt);

      const { page } = await connect({
        headless: false,

        args: [],

        customConfig: {
          userDataDir: userDataDir,
        },

        turnstile: true,

        connectOption: {},

        disableXvfb: false,
        ignoreAllFlags: false,
      });
//@ts-ignore
      pageInstance = page;

      await pageInstance.goto("https://www.google.com/", {
        waitUntil: ["domcontentloaded", "networkidle2"],
      });

      res.send("Puppeteer test completed successfully.");
    } catch (error) {
      console.error("An error occurred during the Puppeteer test:", error);
      res.status(500).send("An error occurred during the Puppeteer test.");
    }
  });

  app.post("/navigate", async (req: Request, res: Response) => {
    const url: string = req.body.url;

    try {
      await pageInstance.goto(url, {
        waitUntil: ["domcontentloaded", "networkidle2"],
      });

      res.send("Puppeteer test completed successfully.");
    } catch (error) {
      console.error("An error occurred during the Puppeteer test:", error);
      res.status(500).send("An error occurred during the Puppeteer test.");
    }
  });

  //linkedin
  app.post("/apply-linkedin", async (_req: Request, res: Response) => {
    const maxIterations = (global as any).globalVars.maxApplications; // Acessando a variável global //decided for us, number around 150 iterations for paid
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
    await pageInstance.close()
  });

  //indeed
  app.post("/apply-indeed", async (_req: Request, res: Response) => {
    const maxIterations = (global as any).globalVars.maxApplications; //decided for us, number around 150 iterations for paid
    //to-do: ele ta carregando a mesma pagina sem aplicar td hr num loop
    console.log("browserInstance", pageInstance);

    function addJobToArrayIndeed(el: JobInfo) {
      appliedJobsIndeed.push(el);
      console.log("appliedJobsIndeed", appliedJobsIndeed);
    }

    const somePopUpThatCanDisplay = await pageInstance.$(
      "#mosaic-desktopserpjapopup button[aria-label='fechar']"
    );

    await somePopUpThatCanDisplay?.click();

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
    await pageInstance.close()
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
