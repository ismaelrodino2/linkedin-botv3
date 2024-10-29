import { Routes, Route } from "react-router-dom";
import Home from "./routes/home";
import Login from "./routes/login";
import Profile from "./routes/profile";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
