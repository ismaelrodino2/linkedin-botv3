import { useCallback } from 'react';
import { useCookies } from 'react-cookie';
import { toast } from 'sonner';

export function useHomeHooks() {
  const [cookies] = useCookies(['authToken']);

  const handleFetchAccount = useCallback(async () => {
    const token = cookies.authToken;

    if (!token) {
      console.error("Token não encontrado");
      return;
    }

    try {
      // Fetch da conta do backend externo
      const externalUrl = `${import.meta.env.VITE_SERVER_URL}/get-user-account`;
      const options = {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      };

      const response = await fetch(externalUrl, options);
      const data = await response.json();

      // Fetch para o backend local (electron) para processar os PDFs
      const localUrl = 'http://localhost:3000/fetch-account';
      const uploadOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv1: data.cv1Url,
          cv2: data.cv2Url,
          cl1: data.cl1Url,
          cl2: data.cl2Url
        })
      };

      const uploadResponse = await fetch(localUrl, uploadOptions);
      
      if (!uploadResponse.ok) {
        throw new Error('Falha ao processar os arquivos');
      }

      toast.success('Arquivos processados com sucesso');
      return data;

    } catch (error) {
      console.error('Erro ao processar conta:', error);
      toast.error('Erro ao processar os arquivos');
    }
  }, [cookies.authToken]);

  return {
    handleFetchAccount
  };
} 