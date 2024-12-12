import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./routes/home";
import Login from "./routes/login";
import Profile from "./routes/profile";
import "./styles/App.css";
import PrivateRoutes from "./components/private-routes";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/auth-context";
import { SyncProvider } from "./context/sync-context";

function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoutes />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
        <ToastContainer />
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;
