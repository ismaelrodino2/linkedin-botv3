import { Routes, Route } from "react-router-dom";
import Home from "./routes/home";
import Login from "./routes/login";
import Profile from "./routes/profile";
import { NavBar } from "./components/navbar";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <div>
            <NavBar /> <Home />
          </div>
        }
      />
      <Route
        path="/profile"
        element={
          <div>
            <NavBar /> <Profile />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
