import { BoxIcon, LayersIcon, MenuIcon, UserRoundIcon } from "lucide-react";
import React from "react";
import { Sidebar, Menu, MenuItem, MenuItemStyles } from "react-pro-sidebar";
import { Link } from "react-router-dom";


export const NavBar = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [toggled, setToggled] = React.useState(false);


  const menuItemStyles: MenuItemStyles = {
    root: {
      fontSize: "14px",
      fontWeight: 400,
      color: "#4A4A4A",
      "&:hover": {
        backgroundColor: "#f0f0f0",
      },
    },
    icon: {
      color: "#4A4A4A",
    },
    SubMenuExpandIcon: {
      color: "#b6b7b9",
    },
    label: ({ open }) => ({
      fontWeight: open ? 600 : 400,
      color: open ? "#333" : "#4A4A4A",
    }),
  };

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
