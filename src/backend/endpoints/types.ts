import { Page } from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JobInfo } from "../types";

export interface ServerContext {
  pageInstance: Page | null;
  genAI: GoogleGenerativeAI | null;
  model: any | null;
  stopApplyingLinkedin: boolean;
  pauseApplyingLinkedin: boolean;
  appliedJobsLinkedin: JobInfo[];
} 