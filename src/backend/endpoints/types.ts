import { Browser, Page } from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JobInfo } from "../types";
import { WebSocket } from 'ws';

export interface ServerContext {
  pageInstance: Page | null;
  genAI: GoogleGenerativeAI | null;
  model: any | null;
  pauseApplyingLinkedin: boolean;
  appliedJobsLinkedin: JobInfo[];
  websocket: WebSocket | null;
  browser: Browser | null;
} 