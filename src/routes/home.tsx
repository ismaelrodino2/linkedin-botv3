import { Square } from "lucide-react";
import { useHome } from "./home-hooks";
import styles from "./home.module.css";
import { useState, useEffect } from "react";
import { JobInfo } from "../backend/types";

function Home() {
  const {
    handleStopLinkedin,
    handleFetchAccount,
    handleSubmitLinkedin,
    handleOpenBrowser
  } = useHome();

  const [isRunning, setIsRunning] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<JobInfo[]>([]);

  console.log("appliedJobs", appliedJobs);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "newJob") {
        console.log("New job applied:", message.data);
        setAppliedJobs((prev) => [...prev, message.data]);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => {
      ws.close();
    };
  }, []);



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
              onClick={async () => {
                //await handleFetchAccount();
                await handleOpenBrowser();
                setIsRunning(true);
              }}
            >
              Login LinkedIn
            </button>

            {isRunning ? (
              <button
                onClick={handleStopLinkedin}
                style={{
                  background: "transparent",
                }}
              >
                <span className={styles.stopIcon}>
                  <Square color="#9113CC" size={22} />
                </span>
              </button>
            ) : (
              <button
                onClick={handleSubmitLinkedin}
                style={{
                  background: "transparent",
                }}
              >
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

          <div className={styles.periodSelector}>
            <label>Period</label>
            <select>
              <option>Select</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Hour</th>
                <th>Position</th>
                <th>Company</th>
                <th>Platform</th>
                <th>Language</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>05/10/2024</td>
                <td>11:50</td>
                <td>UX Master Sênior</td>
                <td>Autofacts by Raven</td>
                <td>LinkedIn</td>
                <td>English</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Home;
