import { Square } from "lucide-react";
import { useHome } from "./home-hooks/home-hooks";
import styles from "./home.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import { useStopLinkedin } from "./home-hooks/use-stop-linkedin";
import { useJobContext } from "../context/job-context";

function Home() {
  const [isRunning, setIsRunning] = useState(false);

  const { handleSubmitLinkedin, handleOpenBrowser } = useHome({ setIsRunning });
  const { handleStopLinkedin } = useStopLinkedin({ setIsRunning });

  const { user } = useAuth();
  const { appliedJobs, countAppliedJobs,setAppliedJobs,setWebsocketCount } = useJobContext();

  const handleStartApplying = async () => {
    if (!user) return;

    // Se pode aplicar, continua com o processo
    handleSubmitLinkedin();
  };

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
          <p>Product Designer • UX/UI • AI Enthusiast</p>
          <p>Based in Rio de Janeiro • Brasil</p>
        </div>

        <div className={styles.statsCard}>
          <div>
            <h4>Applications sent</h4>
            <p>{countAppliedJobs}</p>
          </div>
          <div>
            <h4>Remaining applications</h4>
            <p>{countAppliedJobs - (user?.dailyUsage || 0)}</p>
          </div>
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

            <span className={styles.remainingCount}>
              Remaining
              <strong>{countAppliedJobs - (user?.dailyUsage || 0)}</strong>
            </span>
          </div>

          <div className={styles.statsOverview}>
            <div className={styles.planInfo}>
              <div className={styles.applicationStats}>
                <div>
                  <span>Applications sent</span>
                  <strong>{user?.dailyUsage || 0}</strong>
                </div>
                <div>
                  <span>Remaining applications</span>
                  <strong>{countAppliedJobs - (user?.dailyUsage || 0)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.reportSection}>
          <h2>Report</h2>

          {/* <div className={styles.periodSelector}>
            <label>Period</label>
            <select>
              <option>Select</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div> */}

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
