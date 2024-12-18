import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import "./styles/index.css";
import { AuthProvider } from "./context/auth-context.tsx";
import "./styles/theme.css";
import "./styles/globals.css";
import "./styles/animations.css";
import { NavBar } from "./components/navbar.tsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { JobProvider } from "./context/job-context.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
        <AuthProvider>
          <JobProvider>
            <NavBar />
            <div
              style={{
                minHeight: "calc(100vh - 70px)",
              }}
            >
              <App />
            </div>
            <ToastContainer />
          </JobProvider>
        </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
