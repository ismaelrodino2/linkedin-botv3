import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { JobInfo } from "../backend/types";
import { useAuth } from "./auth-context";
import { userLimit } from "../utils/constants";
import { stopService } from "../services/stop-service";
import { updateUser } from "../services/auth-service";
import { useCookies } from "react-cookie";

type JobContextType = {
  appliedJobs: JobInfo[];
  countAppliedJobs: number;
  setWebsocketCount: Dispatch<SetStateAction<number>>;
  setAppliedJobs: Dispatch<SetStateAction<JobInfo[]>>;
};

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cookies] = useCookies(["authToken"]);

  const [appliedJobs, setAppliedJobs] = useState<JobInfo[]>([]);
  const [websocketCount, setWebsocketCount] = useState(0); // Contador apenas para o WebSocket
  const [countAppliedJobs, setCountAppliedJobs] = useState(0); // Contador apenas para o WebSocket
  const { user } = useAuth();
  const token = cookies.authToken;

  async function verifyIfItsInLimit() {
    if (!user) return new Error("User not found");

    if (countAppliedJobs >= userLimit(user, token)) {
      await stopService();

      if (user.planType.toLowerCase() === "free") {
        updateUser(token, { usedDaysFree: user.usedDaysFree + 1 });
      }
    }
  }

  useEffect(() => {
    const updateAppliedJobs = async () => {
      const total = (user?.dailyUsage ?? 0) + websocketCount;
      setCountAppliedJobs(total);

      // Atualiza o localStorage com o valor fixo de dailyUsage + contador do WebSocket
      await verifyIfItsInLimit();
      localStorage.setItem(
        "appliedJobs",
        JSON.stringify({ appliedJobs: total })
      );
    };

    updateAppliedJobs();
  }, [websocketCount, user]); // Atualiza sempre que o contador ou o usuário mudar

  return (
    <JobContext.Provider
      value={{
        appliedJobs,
        countAppliedJobs,
        setWebsocketCount,
        setAppliedJobs,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = (): JobContextType => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobContext must be used within a JobProvider");
  }
  return context;
};
