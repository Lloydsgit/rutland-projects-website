import { createContext, useContext, useState, useEffect } from "react";

export const THEMES = {
  cyan: {
    name: "Arc Reactor",
    description: "Classic iron blue-cyan",
    vars: {
      "--background": "218 100% 3%",
      "--foreground": "197 100% 93%",
      "--card": "218 80% 5%",
      "--card-foreground": "197 100% 93%",
      "--primary": "197 100% 50%",
      "--primary-foreground": "218 100% 3%",
      "--secondary": "218 60% 10%",
      "--secondary-foreground": "197 100% 80%",
      "--muted": "218 40% 12%",
      "--muted-foreground": "197 30% 55%",
      "--accent": "197 100% 35%",
      "--border": "197 60% 15%",
      "--ring": "197 100% 50%",
    },
  },
  gold: {
    name: "Stark Gold",
    description: "Warm amber & gold",
    vars: {
      "--background": "25 60% 3%",
      "--foreground": "43 100% 90%",
      "--card": "25 50% 5%",
      "--card-foreground": "43 100% 90%",
      "--primary": "43 100% 55%",
      "--primary-foreground": "25 60% 3%",
      "--secondary": "25 40% 10%",
      "--secondary-foreground": "43 100% 80%",
      "--muted": "25 30% 12%",
      "--muted-foreground": "43 30% 55%",
      "--accent": "43 100% 35%",
      "--border": "43 60% 15%",
      "--ring": "43 100% 55%",
    },
  },
  red: {
    name: "War Machine",
    description: "Danger red & steel",
    vars: {
      "--background": "0 60% 3%",
      "--foreground": "0 20% 93%",
      "--card": "0 50% 5%",
      "--card-foreground": "0 20% 93%",
      "--primary": "0 100% 60%",
      "--primary-foreground": "0 60% 3%",
      "--secondary": "0 30% 10%",
      "--secondary-foreground": "0 20% 80%",
      "--muted": "0 20% 12%",
      "--muted-foreground": "0 15% 55%",
      "--accent": "0 80% 35%",
      "--border": "0 50% 15%",
      "--ring": "0 100% 60%",
    },
  },
  green: {
    name: "Ghost Protocol",
    description: "Matrix green ops",
    vars: {
      "--background": "140 60% 2%",
      "--foreground": "140 80% 90%",
      "--card": "140 50% 4%",
      "--card-foreground": "140 80% 90%",
      "--primary": "140 100% 45%",
      "--primary-foreground": "140 60% 2%",
      "--secondary": "140 40% 8%",
      "--secondary-foreground": "140 80% 75%",
      "--muted": "140 30% 10%",
      "--muted-foreground": "140 25% 50%",
      "--accent": "140 80% 30%",
      "--border": "140 50% 13%",
      "--ring": "140 100% 45%",
    },
  },
  purple: {
    name: "Nexus",
    description: "Violet neural network",
    vars: {
      "--background": "270 60% 3%",
      "--foreground": "270 60% 95%",
      "--card": "270 50% 5%",
      "--card-foreground": "270 60% 95%",
      "--primary": "270 100% 65%",
      "--primary-foreground": "270 60% 3%",
      "--secondary": "270 40% 10%",
      "--secondary-foreground": "270 60% 80%",
      "--muted": "270 30% 12%",
      "--muted-foreground": "270 20% 55%",
      "--accent": "270 80% 40%",
      "--border": "270 50% 16%",
      "--ring": "270 100% 65%",
    },
  },
  white: {
    name: "Stark Light",
    description: "Clean white interface",
    vars: {
      "--background": "0 0% 98%",
      "--foreground": "218 30% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "218 30% 10%",
      "--primary": "197 100% 38%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "218 20% 94%",
      "--secondary-foreground": "218 30% 20%",
      "--muted": "218 20% 92%",
      "--muted-foreground": "218 10% 50%",
      "--accent": "197 80% 45%",
      "--border": "218 20% 85%",
      "--ring": "197 100% 38%",
    },
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem("jarvis-theme") || "cyan");

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  const applyTheme = (id) => {
    const theme = THEMES[id];
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    localStorage.setItem("jarvis-theme", id);
  };

  const changeTheme = (id) => {
    setThemeId(id);
  };

  return (
    <ThemeContext.Provider value={{ themeId, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);