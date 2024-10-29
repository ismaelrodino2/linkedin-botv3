import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { enCL, enCV, ptCL, ptCV } from "../utils/constants";
import { get as httpGet } from "http";
import { get as httpsGet } from "https";
import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: import.meta.env.VITE_API_NAME_CLOUDINARY,
  api_key: import.meta.env.VITE_API_KEY_CLOUDINARY,
  api_secret: import.meta.env.VITE_API_SECRET_CLOUDINARY,
});

const requiredFiles = [
  { name: "cv-en.pdf", url: enCV },
  { name: "cv-pt.pdf", url: ptCV },
  { name: "cl-en.pdf", url: enCL },
  { name: "cl-pt.pdf", url: ptCL },
];

export async function downloadFilesIfDoesntExist() {
  const baseDirectory = join(__dirname, "..");
  const dirPath: string = join(baseDirectory, "uploads");

  // Cria o diretório "uploads" se não existir
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  const files = checkFilesExist(dirPath);

  // Faz o download apenas dos arquivos que estão faltando
  files?.forEach((el) => {
    const filePath = join(dirPath, el.name); // Cria o caminho para cada arquivo dentro da pasta uploads
    const file = createWriteStream(filePath);

    // Verifica se a URL é http ou https e usa o módulo correto
    const get = el.url.startsWith("https") ? httpsGet : httpGet;

    get(el.url, function (response) {
      if (response.statusCode !== 200) {
        console.error(
          `Failed to download ${el.name}: Status code ${response.statusCode}`
        );
        file.close();
        return;
      }

      response.pipe(file);

      // Após o download ser concluído, fecha o stream
      file.on("finish", () => {
        file.close();
        console.log(`Download Completed: ${el.name}`);
      });
    }).on("error", (err) => {
      console.error(`Error downloading ${el.name}:`, err.message);
      file.close();
    });
  });
}

function checkFilesExist(dirPath: string) {
  try {
    // Verifica se todos os arquivos necessários existem
    const missingFiles = requiredFiles.filter(
      (file) => !existsSync(join(dirPath, file.name))
    );

    if (missingFiles.length === 0) {
      console.log("All required files are present.");
      return [];
    } else {
      console.log("Missing files:", missingFiles);
      return missingFiles;
    }
  } catch (err) {
    console.error("Error checking files:", err);
  }
}
