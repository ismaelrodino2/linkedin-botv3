import { useCallback, useState } from "react";
import { useCookies } from "react-cookie";
import { UserResponse } from "./home-types";
import { useAuth } from "../context/auth-context";

export const useHome = () => {
  const [cookies] = useCookies(["authToken"]);
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);

  const handleOpenBrowser = useCallback(async () => {
    if (!user || !user.account) {
      console.error("Dados do usuário não disponíveis");
      return;
    }

    const url = "http://localhost:3001/open";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: user }),
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }, [user]);

  const handleSubmitLinkedin = useCallback(async () => {
    const url = "http://localhost:3001/apply-linkedin";
    const options = { method: "POST" };

    try {
      setIsRunning(true);
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
      setIsRunning(false);
    }
  }, []);

  const handleSubmitIndeed = useCallback(async () => {
    const url = "http://localhost:3001/apply-indeed";
    const options = { method: "POST" };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  const handleStopLinkedin = useCallback(async () => {
    const url = "http://localhost:3001/stop-apply-linkedin";
    const options = { method: "POST" };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsRunning(false);
    }
  }, []);

  // Nova função para buscar a conta do usuário usando o JWT do localStorage
  const handleFetchAccount = useCallback(async () => {
    const token = cookies.authToken;

    if (!token) {
      console.error("Token não encontrado");
      return;
    }

    const url1 = `${import.meta.env.VITE_SERVER_URL}/get-user-account`;
    const options = {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(url1, options);
      if (!response.ok) {
        throw new Error(`Erro ao buscar a conta: ${response.status}`);
      }

      const data: UserResponse = await response.json();
      console.log("Conta do usuário:", data);

      // Nova chamada para processar os arquivos localmente
      const localUrl = 'http://localhost:3001/fetch-account';
      const uploadOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv1: data.user.account.cv1,
          cv2: data.user.account.cv2,
          cl1: data.user.account.coverLetter1,
          cl2: data.user.account.coverLetter2
        })
      };

      const uploadResponse = await fetch(localUrl, uploadOptions);
      if (!uploadResponse.ok) {
        throw new Error('Falha ao processar os arquivos');
      }

      return data;

    } catch (error) {
      console.error("Erro:", error);
    }
  }, [cookies.authToken]);

  return {
    handleOpenBrowser,
    handleSubmitLinkedin,
    handleSubmitIndeed,
    handleStopLinkedin,
    handleFetchAccount,
    isRunning,
  };
};
