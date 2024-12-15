// import { User } from "../types/user";

import { useCookies } from "react-cookie";
import { useAuth } from "../context/auth-context";
import { useJobContext } from "../context/job-context";
import { updateUser } from "../services/auth-service";

export function useSubscription() {
  const [cookies] = useCookies(["authToken"]);

  const { appliedJobs } = useJobContext();
  const { user } = useAuth();
  const token = cookies.authToken;

  const newValue = user?.dailyUsage ?? 0 + appliedJobs.length;

  async function sincronizeAfterStop() {
    await updateUser(token, {
      dailyUsage: newValue,
      lastUsage: new Date()
    });
  }





  return {
    sincronizeAfterStop,
  };
}
