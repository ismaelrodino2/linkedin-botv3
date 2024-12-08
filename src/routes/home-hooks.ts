import { useCallback } from "react";

export const useHome = () => {
  const handleLogin = useCallback(async (link: string) => {
    const url = "http://localhost:3001/navigate";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: link }),
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  const handleOpenBrowser = useCallback(async () => {
    const savedData = localStorage.getItem("userProfile");
    const defaultValues = savedData
      ? { ...JSON.parse(savedData), startDate: new Date() }
      : {};

    const url = "http://localhost:3001/open";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: defaultValues }),
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  const handleSubmitLinkedin = useCallback(async () => {
    const url = "http://localhost:3001/apply-linkedin";
    const options = { method: "POST" };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
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
    }
  }, []);

  return {
    handleLogin,
    handleOpenBrowser,
    handleSubmitLinkedin,
    handleSubmitIndeed,
    handleStopLinkedin,
  };
};
