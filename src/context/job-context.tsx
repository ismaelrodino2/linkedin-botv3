import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { JobInfo } from "../backend/types";
import { useAuth } from "./auth-context";

type JobContextType = {
  appliedJobs: JobInfo[];
  countAppliedJobs: number
};

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [appliedJobs, setAppliedJobs] = useState<JobInfo[]>([]);
  const [websocketCount, setWebsocketCount] = useState(0); // Contador apenas para o WebSocket
  const [countAppliedJobs, setCountAppliedJobs] = useState(0); // Contador apenas para o WebSocket
  const { user } = useAuth();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received WebSocket message:", message);

      if (message.type === "newJob") {
        console.log("New job applied:", message.data);

        // Incrementar o contador do WebSocket
        setWebsocketCount((prevCount) => prevCount + 1);

        // Atualizar a lista de appliedJobs
        setAppliedJobs((prev) => [...prev, message.data]);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Fechar a conexão do WebSocket quando o componente for desmontado
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const total = (user?.dailyUsage ?? 0) + websocketCount;

    setCountAppliedJobs(total)

    // Atualiza o localStorage com o valor fixo de dailyUsage + contador do WebSocket
    localStorage.setItem("appliedJobs", JSON.stringify({ appliedJobs: total }));
  }, [websocketCount, user]); // Atualiza sempre que o contador ou o usuário mudar

  return (
    <JobContext.Provider value={{ appliedJobs, countAppliedJobs }}>
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
