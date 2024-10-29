import React, { useState, ChangeEvent } from "react";

type FileKeys = "enCV" | "ptCV" | "enCL" | "ptCL";

interface FileState {
  enCV: File | null;
  ptCV: File | null;
  enCL: File | null;
  ptCL: File | null;
}

export const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<FileState>({
    enCV: null,
    ptCV: null,
    enCL: null,
    ptCL: null,
  });

  // Cloudinary upload URL e nome da pasta original
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_API_NAME_CLOUDINARY}/upload`;
  const uploadPreset = import.meta.env.VITE_PRESET_CLOUDINARY; // Insira o upload preset aqui

  // Nomes públicos originais para substituir
  const publicIds: Record<FileKeys, string> = {
    enCV: "cv-en_vpjjhs",
    ptCV: "designer-pt.cv_ytlf90",
    enCL: "cl-en_hdarxo",
    ptCL: "cl-pt_ndqbox",
  };

  // Função para manipular upload
  const handleUpload = async (key: FileKeys) => {
    const file = files[key];
    if (!file) {
      alert("Por favor, selecione um arquivo primeiro.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("public_id", publicIds[key]); // Usando o mesmo nome público para substituir o arquivo existente
    formData.append("overwrite", "true");

    try {
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro no upload");
      }

      const data = await response.json();
      console.log(`${key} atualizado com sucesso:`, data);
      alert(`${key} atualizado com sucesso!`);
    } catch (error) {
      console.error("Erro ao fazer o upload:", error);
      alert("Erro ao substituir o arquivo.");
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, key: FileKeys) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFiles({
      ...files,
      [key]: selectedFile,
    });
  };

  return (
    <div>
      <div>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "enCV")}
          accept=".pdf"
        />
        <button onClick={() => handleUpload("enCV")}>Substituir enCV</button>
      </div>
      <div>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "ptCV")}
          accept=".pdf"
        />
        <button onClick={() => handleUpload("ptCV")}>Substituir ptCV</button>
      </div>
      <div>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "enCL")}
          accept=".pdf"
        />
        <button onClick={() => handleUpload("enCL")}>Substituir enCL</button>
      </div>
      <div>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "ptCL")}
          accept=".pdf"
        />
        <button onClick={() => handleUpload("ptCL")}>Substituir ptCL</button>
      </div>
    </div>
  );
};

