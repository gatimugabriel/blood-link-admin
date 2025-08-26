"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggleCompact() {
  const { setTheme, theme, resolvedTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-4 w-4" />
    }
    if (resolvedTheme === "dark") {
      return <Moon className="h-4 w-4" />
    }
    return <Sun className="h-4 w-4" />
  }

  const getTooltip = () => {
    if (theme === "system") {
      return "System theme (click to switch to light)"
    }
    if (theme === "light") {
      return "Light theme (click to switch to dark)"
    }
    return "Dark theme (click to switch to system)"
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="h-9 w-9 p-0"
      title={getTooltip()}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 