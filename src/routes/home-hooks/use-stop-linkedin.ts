import { useCallback } from "react";
import { stopService } from "../../services/stop-service";
import { useCookies } from "react-cookie";
import { useAuth } from "../../context/auth-context";
import { toast } from "react-toastify";
import { updateUser } from "../../services/auth-service";
import { useJobContext } from "../../context/job-context";
import { returnStartService } from "../../services/return-start-service";

const timeout = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function useStopLinkedin({
  setIsRunning,
}: {
  setIsRunning: (value: boolean) => void;
}) {
  const [cookies] = useCookies(["authToken"]);
  const { user } = useAuth();

  const { countAppliedJobs } = useJobContext();
  console.log("appliedJobs, countAppliedJobs", countAppliedJobs);
  console.log("countAppliedJobscountAppliedJobs", countAppliedJobs)

  const token = cookies.authToken;

  const handleStopLinkedin = useCallback(async () => {
    console.log("countAppliedJobscountAppliedJobs123", countAppliedJobs)

    try {
      // Envia o comando de parada
      await stopService();
      await updateUser(token, {
        dailyUsage: countAppliedJobs,
        lastUsage: new Date(),
      });

      await timeout(2000); // 3000ms = 3s

      await returnStartService()
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to stop the process. Please close the app.");
    } finally {
      setIsRunning(false);
    }
  }, [cookies.authToken, user, countAppliedJobs]);

  return {
    handleStopLinkedin,
  };
}
