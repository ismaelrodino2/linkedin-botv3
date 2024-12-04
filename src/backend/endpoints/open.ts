import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { launch, executablePath } from "puppeteer";
import { createGlobalPrompt } from "../prompt";
import { ServerContext } from "./types";
import { USER_DATA_DIR } from "../constants";
import { FormInputs } from "../../routes/profile";

export const handleOpen = async (
  req: Request, 
  res: Response, 
  context: ServerContext
) => {
  const data: FormInputs = req.body.data;
  
  try {
    createGlobalPrompt({ ...data, startDate: new Date() });

    (global as any).globalVars = {
      cvNameIndeed: data.cvNameIndeed,
      maxApplications: data.maxApplications,
    };

    context.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    context.model = context.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    await context.pageInstance.goto("https://www.linkedin.com/");

    res.send("Browser launched successfully");
  } catch (error) {
    console.error("Error during browser launch:", error);
    res.status(500).send("Failed to launch browser");
  }
}; 