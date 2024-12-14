import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { ServerContext } from './types';

interface AccountUrls {
  cv1?: string;
  cv2?: string;
  cl1?: string;
  cl2?: string;
}

async function downloadPdf(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download from ${url}. Status: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Error downloading PDF from ${url}:`, error);
    return null;
  }
}

export async function handleFetchAccount(req: Request, res: Response, _serverContext: ServerContext) {
  try {
    const { cv1, cv2, cl1, cl2 } = req.body as AccountUrls;
    
    // Usando caminho absoluto para a pasta uploads
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    console.log('Upload directory path:', uploadsDir);

    try {
      // Criar diretório com permissões explícitas
      await fs.mkdir(uploadsDir, { recursive: true, mode: 0o755 });
      console.log('Directory created or already exists');
    } catch (mkdirError) {
      console.error('Error creating directory:', mkdirError);
    }

    // Map of files to download and save
    const filesToProcess = {
      'cv-pt.pdf': cv1,
      'cv-en.pdf': cv2,
      'cl-pt.pdf': cl1,
      'cl-en.pdf': cl2,
    };

    // Download and save each file if URL exists
    for (const [filename, url] of Object.entries(filesToProcess)) {
      if (url) {
        const filePath = path.join(uploadsDir, filename);
        
        // Verificar se o arquivo já existe
        try {
          const fileExists = await fs.access(filePath)
            .then(() => true)
            .catch(() => false);
          
          if (fileExists) {
            console.log(`File ${filename} already exists. Will be replaced.`);
          }
          
          console.log(`Downloading ${filename} from ${url}`);
          const pdfBuffer = await downloadPdf(url);
          
          if (pdfBuffer) {
            await fs.writeFile(filePath, pdfBuffer, { mode: 0o644 });
            console.log(`Successfully ${fileExists ? 'replaced' : 'saved'} ${filename} to ${filePath}`);
          } else {
            console.error(`Failed to download ${filename} from ${url}`);
          }
        } catch (writeError) {
          console.error(`Error processing file ${filename}:`, writeError);
        }
      }
    }

    res.status(200).json({ message: 'Files updated successfully' });
  } catch (error) {
    console.error('Error handling account files:', error);
    res.status(500).json({ error: 'Failed to process account files' });
  }
} 