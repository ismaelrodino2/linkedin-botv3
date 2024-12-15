import path from "path";
import { config } from "dotenv";

config();

export const PORT = 3001;

export const USER_DATA_DIR = process.env.NODE_ENV !== "development"
  ? path.join(process.resourcesPath, "userDataDir")
  : path.resolve(__dirname, "./userDataDir");

export const BASE_DIRECTORY = path.join(__dirname, "../../");
export const UPLOADS_DIR = path.join(BASE_DIRECTORY, "uploads");