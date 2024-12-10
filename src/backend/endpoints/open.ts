import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { launch, executablePath } from "puppeteer";
import { createGlobalPrompt } from "../prompt";
import { ServerContext } from "./types";
import { USER_DATA_DIR } from "../constants";

// Interface para os dados que virão do frontend
interface ProfileData {
  name: string;
  role: string;
  location: string;
  email: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  experiences: string;
  languages: any;
  availability: any;
  desiredSalary: any;
  address: string;
  softSkills: string;
  hardSkills: string;
  technologies: any;
}

export const handleOpen = async (
  req: Request, 
  res: Response, 
  context: ServerContext
) => {
  const profileData: ProfileData = req.body.data;
  
  try {
    // Cria o prompt global com os dados do usuário
    createGlobalPrompt({ 
      ...profileData,
      startDate: new Date() 
    });

    // Configura variáveis globais se necessário
    (global as any).globalVars = {
      // Adicione aqui outras variáveis globais se precisar
    };

    // Inicializa o modelo AI
    context.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    context.model = context.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Inicia o browser
    const browser = await launch({
      headless: false,
      executablePath: executablePath(),
      args: ['--start-maximized'],
      userDataDir: USER_DATA_DIR,
    });

    context.pageInstance = await browser.newPage();
    const [width, height] = await context.pageInstance.evaluate(() => [
      window.screen.width,
      window.screen.height
    ]);
    await context.pageInstance.setViewport({ width, height });
    await context.pageInstance.goto("https://www.linkedin.com/login");

    res.send("Browser launched successfully");
  } catch (error) {
    console.error("Error during browser launch:", error);
    res.status(500).send("Failed to launch browser");
  }
}; 