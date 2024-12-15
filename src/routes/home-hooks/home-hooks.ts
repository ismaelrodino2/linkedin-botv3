import { useCallback } from "react";
import { useCookies } from "react-cookie";
import { useAuth } from "../../context/auth-context";
import { useJobContext } from "../../context/job-context";
import { resetIfNextDay, userLimit } from "../../utils/common";

export const useHome = ({
  setIsRunning,
}: {
  setIsRunning: (value: boolean) => void;
}) => {
  const [cookies] = useCookies(["authToken"]);
  const { user } = useAuth();
  const { countAppliedJobs, setAppliedJobs, setWebsocketCount } =
    useJobContext();
  const token = cookies.authToken;

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

  const handlePlayLinkedin = useCallback(async () => {
    if (!user) return new Error("Not authenticated");

    resetIfNextDay(user, token, setAppliedJobs, setWebsocketCount);

    if (countAppliedJobs >= userLimit(user, token)) {
      return new Error("Sorry, you reached your limit");
    }

    const url = "http://localhost:3001/apply-linkedin";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user }),
    };

    try {
      setIsRunning(true);
      const response = await fetch(url, options);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start LinkedIn application");
      }
      const result = await response.text();
      console.log(result);
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message);
      setIsRunning(false);
    }
  }, [user]);

  return {
    handleOpenBrowser,
    handlePlayLinkedin,
  };
};
