import { Square } from "lucide-react";
import { useHome } from "./home-hooks/home-hooks";
import styles from "./home.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import { useStopLinkedin } from "./home-hooks/use-stop-linkedin";
import { useJobContext } from "../context/job-context";
import { userLimitOnly } from "../utils/common";
import { useNavigate } from "react-router-dom";
import { useStopProcessing } from "./home-hooks/use-get-stop-processing";

function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  const { handlePlayLinkedin, handleOpenBrowser } = useHome({ setIsRunning });
  const { handleStopLinkedin } = useStopLinkedin({ setIsRunning });

  const { user } = useAuth();
  if (!user) {
    navigate("/login");
    return;
  }

  const { appliedJobs, countAppliedJobs, setAppliedJobs, setWebsocketCount } =
    useJobContext();

  const handleStartApplying = async () => {
    if (!user) return;

    // Se pode aplicar, continua com o processo
    handlePlayLinkedin();
  };

  const { isBrowserOpen } = useStopProcessing();

  // Efeito para reagir a mudanças em `isBrowserOpen`
  useEffect(() => {
    if (!isBrowserOpen) {
      console.log("Browser is closed:", isBrowserOpen);
      setIsRunning(false);
    }
  }, [isBrowserOpen]);

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

  return (
    <div className={styles.container}>
      {/* Coluna da esquerda (sidebar) */}
      <div className={styles.sidebar}>
        <div className={styles.profileCard}>
          <h3>{user?.name}</h3>
          <p>
            {user.account &&
              user.account.softwares.map((el) => el.name).join(" • ")}
          </p>
          {user.account && <p>Based in {user.account.address}</p>}
        </div>

        <div className={styles.statsCard}>
          <div>
            <h4>Applications sent</h4>
            <p>{countAppliedJobs}</p>
          </div>
          {user.usedDaysFree <= 4 && (
            <div>
              <h4>Remaining applications</h4>
              <p>{userLimitOnly(user) - countAppliedJobs}</p> {/* erro */}
            </div>
          )}
        </div>
      </div>

      {/* Coluna principal (conteúdo) */}
      <div className={styles.mainContent}>
        <div className={styles.headerSection}>
          <div className={styles.loginArea}>
            <button
              className={styles.linkedinButton}
              onClick={handleOpenBrowser}
            >
              Login LinkedIn
            </button>

            {isRunning ? (
              <button onClick={handleStopLinkedin}>
                <span className={styles.stopIcon}>
                  <Square color="#9113CC" size={22} />
                </span>
              </button>
            ) : (
              <button onClick={handleStartApplying}>
                <span className={styles.playIcon}>▶</span>
              </button>
            )}

            {user.usedDaysFree <= 4 && (
              <span className={styles.remainingCount}>
                Remaining
                <strong>{userLimitOnly(user) - countAppliedJobs}</strong>
              </span>
            )}
          </div>

          <div className={styles.statsOverview}>
            <div className={styles.planInfo}>
              <div className={styles.applicationStats}>
                <div>
                  <span>Applications sent</span>
                  <strong>{countAppliedJobs}</strong>
                </div>
                {user.usedDaysFree <= 4 && (
                  <div>
                    <span>Remaining applications</span>
                    <strong>{userLimitOnly(user) - countAppliedJobs}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.reportSection}>
          <h2>Report</h2>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Position</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Platform</th>
                  <th>Language</th>
                </tr>
              </thead>
              <tbody>
                {appliedJobs.map((el) => {
                  return (
                    <tr key={el.company}>
                      <td>
                        {el.currentDateTime &&
                          new Date(el.currentDateTime).toLocaleString()}
                      </td>
                      <td>{el.position}</td>
                      <td>{el.company}</td>
                      <td>{el.location}</td>
                      <td>{el.platform}</td>
                      <td>{el.language}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
