// import { User } from "../types/user";

import { useCookies } from "react-cookie";
import { useAuth } from "../context/auth-context";
import { useJobContext } from "../context/job-context";
import { updateUser } from "../services/auth-service";
import { userLimit } from "../utils/constants";
import { stopService } from "../services/stop-service";

export function useSubscription() {
  const [cookies] = useCookies(["authToken"]);

  const { appliedJobs, countAppliedJobs } = useJobContext();
  const { user } = useAuth();
  const token = cookies.authToken;

  const newValue = user?.dailyUsage ?? 0 + appliedJobs.length;

  async function sincronizeAfterStop() {
    await updateUser(token, {
      dailyUsage: newValue,
    });
  }

  async function sincronizeAfterLoginOrRefresh(appliedJobsDB: number) {
    const storedValue = localStorage.getItem("appliedJobs");

    if (storedValue) {
      // Faz o parsing do valor armazenado em JSON
      const parsedData = JSON.parse(storedValue);

      // Acessa o valor de appliedJobs armazenado
      const appliedJobsStorage: number = parsedData?.appliedJobs ?? 0; // Define o valor ou 0 caso não exista

      if (appliedJobsStorage > appliedJobsDB) {
        //significa que o usuário fechou o programa
        await updateUser(token, {
          dailyUsage: appliedJobsStorage,
        });
      }
    }
  }



  return {
    sincronizeAfterStop,
    sincronizeAfterLoginOrRefresh,
  };
}
