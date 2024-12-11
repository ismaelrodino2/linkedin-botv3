import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { launch, executablePath } from "puppeteer";
import { createGlobalPrompt } from "../prompt";
import { ServerContext } from "./types";
import { USER_DATA_DIR } from "../constants";
import { User } from "../../context/auth-context";



export const handleOpen = async (
  req: Request, 
  res: Response, 
  context: ServerContext
) => {
  const profileData: User = req.body.data;
  
  try {
    // Validar se os dados do perfil existem
    if (!profileData) {
      console.error("Profile data is missing");
      return res.status(400).json({ error: "Profile data is required" });
    }

    // Log para debug
    console.log("Received profile data:", profileData);

    // Cria o prompt global com os dados do usuário
    try {
      createGlobalPrompt(profileData);
    } catch (promptError) {
      console.error("Error creating global prompt:", promptError);
      return res.status(500).json({ error: "Failed to create global prompt" });
    }

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

    //res.send("Browser launched successfully");
  } catch (error) {
    console.error("Error during browser launch:", error);
    res.status(500).json({ 
      error: "Failed to launch browser",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}; 