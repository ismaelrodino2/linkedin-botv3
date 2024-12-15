import { useCookies } from "react-cookie";
import { updateUser } from "../services/auth-service";

export function useSubscriptionAuth() {
  const [cookies] = useCookies(["authToken"]);
  const token = cookies.authToken;

  async function sincronizeAfterLoginOrRefresh(appliedJobsDB: number) {
    const storedValue = localStorage.getItem("appliedJobs");

    if (storedValue) {
      const parsedData = JSON.parse(storedValue);

      const appliedJobsStorage: number = parsedData?.appliedJobs ?? 0; // Define o valor ou 0 caso não exista

      if (appliedJobsStorage > appliedJobsDB) {
        //significa que o usuário fechou o programa e ao invés de apertar no stop
        await updateUser(token, {
          dailyUsage: appliedJobsStorage,
        });
        return appliedJobsStorage;
      }
      return appliedJobsDB;
    }
  }
  return {
    sincronizeAfterLoginOrRefresh,
  };
}
