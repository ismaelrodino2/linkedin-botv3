import { MenuIcon } from "lucide-react";
import React from "react";
import { Sidebar, Menu, MenuItem, MenuItemStyles } from "react-pro-sidebar";
import { Link } from "react-router-dom";

export const NavBar = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [toggled, setToggled] = React.useState(false);


  const menuItemStyles: MenuItemStyles = {
    root: {
      fontSize: "13px",
      fontWeight: 400,
    },
    SubMenuExpandIcon: {
      color: "#b6b7b9",
    },
    label: ({ open }) => ({
      fontWeight: open ? 600 : undefined,
    }),
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        breakPoint="md"
      >
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div style={{ flex: 1, marginBottom: "32px" }}>
            <button
              style={{ padding: "0 24px", marginBottom: "8px" }}
              onClick={() => setCollapsed(!collapsed)}
            >
              <MenuIcon size={48} />
            </button>
            <Menu menuItemStyles={menuItemStyles}>
                <MenuItem>
                  <Link to="/profile">Profile</Link>
                </MenuItem>
                <MenuItem>
                  <Link to="/">Home</Link>
                </MenuItem>
            </Menu>
  
          </div>
        </div>
      </Sidebar>

      <main>{children}</main>
    </div>
  );
};
