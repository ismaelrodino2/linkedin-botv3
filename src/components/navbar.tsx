import { Link, NavLink } from "react-router-dom";
import "./navbar.css";
import ModeToggle from "./ui/theme-toggle/theme-toggle";

export const NavBar = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", position: 'fixed', width: '100%',
      top: 0 }}>
      <nav className="navbar">
        <Link to="/" className="logo">
          Wish Apply
        </Link>

        <ul className="nav-links">
          <li>
            <NavLink to="/">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/profile">Perfil</NavLink>
          </li>
          <li>
            <NavLink to="/profile">Minha Conta</NavLink>
          </li>
        </ul>

        <ModeToggle />
      </nav>
    </div>
  );
};
