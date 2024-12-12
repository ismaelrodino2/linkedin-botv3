import { useCallback } from "react";
import { stopService } from "../../services/stop-service";
import { useCookies } from "react-cookie";
import { useAuth } from "../../context/auth-context";

export function useStopLinkedin({
  setIsRunning,
}: {
  setIsRunning: (value: boolean) => void;
}) {
  const [cookies] = useCookies(["authToken"]);
  const { user } = useAuth();

  const handleStopLinkedin = useCallback(async () => {
    try {
      // Envia o comando de parada
      await stopService();
    } catch (error) {
      console.error("Error:", error);
      // toast.error("Failed to stop the process. Please try again.");
    } finally {
      setIsRunning(false);
    }
  }, [cookies.authToken, user]);

  return {
    handleStopLinkedin,
  };
}
