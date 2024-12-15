import { useCallback } from "react";
import { stopService } from "../../services/stop-service";
import { useCookies } from "react-cookie";
import { useAuth } from "../../context/auth-context";
import { useSubscription } from "../../hooks/use-subscription";
import { toast } from "react-toastify";

export function useStopLinkedin({
  setIsRunning,
}: {
  setIsRunning: (value: boolean) => void;
}) {
  const [cookies] = useCookies(["authToken"]);
  const { user } = useAuth();
  
  const {sincronizeAfterStop} = useSubscription()

  const handleStopLinkedin = useCallback(async () => {
    try {
      // Envia o comando de parada
      await stopService();
      await sincronizeAfterStop()
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to stop the process. Please close the app.");
    } finally {
      setIsRunning(false);
    }
  }, [cookies.authToken, user]);

  return {
    handleStopLinkedin,
  };
}
