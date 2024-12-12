import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { JobInfo } from "../backend/types";

type JobContextType = {
  appliedJobs: JobInfo[];
};

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [appliedJobs, setAppliedJobs] = useState<JobInfo[]>([]);

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

  return (
    <JobContext.Provider value={{ appliedJobs }}>
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
