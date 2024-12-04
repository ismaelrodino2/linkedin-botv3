import { Request, Response } from "express";
import multer from "multer";
import { UPLOADS_DIR } from "../constants";

export const configureUpload = () => {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => cb(null, file.originalname),
  });

  return multer({ storage });
};

export const handleUpload = (req: Request, res: Response) => {
  if (req.file) {
    console.log("Arquivo recebido:", req.file.originalname);
    res.json({ message: "File uploaded successfully" });
  } else {
    console.error("Nenhum arquivo foi recebido");
    res.status(400).json({ message: "No file uploaded" });
  }
}; 