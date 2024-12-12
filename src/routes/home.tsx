import { Square } from "lucide-react";
import { useHome } from "./home-hooks";
import styles from "./home.module.css";
import { useState, useEffect } from "react";
import { JobInfo } from "../backend/types";
import { useAuth } from "../context/auth-context";
import { SubscriptionService } from '../services/subscription-service';

function Home() {
  const {
    handleStopLinkedin,
    handleSubmitLinkedin,
    handleOpenBrowser,
    isRunning,
  } = useHome();

  const { user } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState<JobInfo[]>([]);

  // Efeito para atualizar o localStorage quando appliedJobs mudar
  useEffect(() => {
    if (user && appliedJobs.length > 0) {
      const newDailyUsage = user.dailyUsage + 1;
      localStorage.setItem('dailyUsage', newDailyUsage.toString());
    }
  }, [appliedJobs.length, user]);

  useEffect(() => {
    // Recupera o dailyUsage do localStorage ao montar o componente
    const savedDailyUsage = localStorage.getItem('dailyUsage');
    if (savedDailyUsage && user) {
      user.dailyUsage = parseInt(savedDailyUsage);
    }

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

    return () => {
      ws.close();
    };
  }, []);

  const handleStartApplying = async () => {
    if (!user) return;

    const subscriptionStatus = SubscriptionService.checkSubscriptionStatus(user);
    
    if (!subscriptionStatus.canApply) {
      alert(subscriptionStatus.reason || 'You cannot apply at this moment');
      return;
    }

    // Se pode aplicar, continua com o processo
    handleSubmitLinkedin();
  };

  return (
    <div className={styles.container}>
      {/* Coluna da esquerda (sidebar) */}
      <div className={styles.sidebar}>
        <div className={styles.profileCard}>
          <h3>Diana Rodini</h3>
          <p>Product Designer • UX/UI • AI Enthusiast</p>
          <p>Based in Rio de Janeiro • Brasil</p>
        </div>

        <div className={styles.statsCard}>
          <div>
            <h4>Application sent</h4>
            <p>580</p>
          </div>
          <div>
            <h4>Remaining applications</h4>
            <p>20</p>
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
              <strong>540</strong>
            </span>
          </div>

          <div className={styles.statsOverview}>
            <div className={styles.planInfo}>
              <div className={styles.applicationStats}>
                <div>
                  <span>Application sent</span>
                  <strong>580</strong>
                </div>
                <div>
                  <span>Remaining applications</span>
                  <strong>20</strong>
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
                    <tr>
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
