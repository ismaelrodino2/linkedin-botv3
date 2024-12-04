"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "../../../providers/theme-provider"
import "./theme-toggle.css"

export default function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button 
      className="theme-toggle"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
