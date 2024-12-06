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
import { ThemeProvider } from "./providers/theme-provider.tsx";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <NavBar />
          <div style={{marginTop: 70}}>
            <App />
          </div>
          <ToastContainer />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);
