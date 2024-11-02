import { BoxIcon, LayersIcon, MenuIcon } from "lucide-react";
import React from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link } from "react-router-dom";


export const NavBar = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
    <Sidebar className="app" collapsed={collapsed}>
      <Menu >
        <MenuItem
        onClick={() => {
          setCollapsed(!collapsed);
         }}
          className="menu1"
          icon={<MenuIcon   />}
        >
        </MenuItem>
        <MenuItem
          component={<Link to="/" className="link" />}
          icon={<LayersIcon  />}
        >
          Dashboard
        </MenuItem>
        <MenuItem
          component={<Link to="/profile" className="link" />}
          icon={<BoxIcon  />}
        >
          Perfil
        </MenuItem>
        {/* <MenuItem
          component={<Link to="dashboard" className="link" />}
          icon={<UserRoundIcon />}
        >
          Minha conta
        </MenuItem> */}
   
      </Menu>
    </Sidebar>
    <section>
      {children}
    </section>
  </div>
  );
};
