import { Link, NavLink, useLocation } from "react-router-dom";
import "./navbar.css";
import { CircleUser } from "lucide-react";

export const NavBar = () => {
  const location = useLocation();

  if (location.pathname === "/login") return;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        top: 0,
      }}
    >
      <nav className="navbar">
        <Link to="/" className="logo">
          Wish Apply
        </Link>

        <ul className="nav-links">
          <li>
            <NavLink to="/">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/profile">Minha Conta</NavLink>
          </li>
        </ul>

        <NavLink
          to="/profile"
          style={{ width: 128, display: "flex", flexDirection: "row-reverse" }}
        >
          <CircleUser size={38} strokeWidth={1} color="white" />
        </NavLink>
      </nav>
    </div>
  );
};
