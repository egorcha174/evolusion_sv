import { d as derived, w as writable } from "./index.js";
const defaultLight = {
  bgPage: "#f5f7fa",
  bgCard: "#ffffff",
  bgHeader: "#ffffff",
  bgSidebar: "#1e1e1e",
  // Dark sidebar by default in light mode (classic HA feel) or maybe matches design
  bgInput: "#ffffff",
  bgDropdown: "#ffffff",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textInverted: "#ffffff",
  primary: "#2196f3",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#d32f2f",
  border: "#e0e0e0",
  divider: "#eeeeee",
  shadowCard: "0 2px 8px rgba(0, 0, 0, 0.04)"
};
const defaultDark = {
  bgPage: "#121212",
  bgCard: "#1e1e1e",
  bgHeader: "#1e1e1e",
  bgSidebar: "#121212",
  bgInput: "#2d2d2d",
  bgDropdown: "#2d2d2d",
  textPrimary: "#e0e0e0",
  textSecondary: "#a0a0a0",
  textInverted: "#000000",
  primary: "#64b5f6",
  success: "#81c784",
  warning: "#ffb74d",
  error: "#e57373",
  border: "#333333",
  divider: "#2d2d2d",
  shadowCard: "0 4px 12px rgba(0, 0, 0, 0.3)"
};
const DEFAULT_THEME = {
  id: "default",
  name: "Default",
  isBuiltIn: true,
  description: "Standard Evolusion theme",
  light: defaultLight,
  dark: defaultDark
};
const BUILTIN_THEMES = [DEFAULT_THEME];
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
function generateCssVariables(palette) {
  const vars = Object.entries(palette).map(([key, value]) => {
    const varName = `--${camelToKebab(key)}`;
    return `  ${varName}: ${value};`;
  }).join("\n");
  return `:root {
${vars}
}`;
}
const DEFAULT_SETTINGS = {
  mode: "auto",
  activeThemeId: "default",
  schedule: {
    darkStart: "22:00",
    darkEnd: "07:00"
  }
};
function createSettingsStore() {
  const { subscribe, set, update } = writable(DEFAULT_SETTINGS);
  return {
    subscribe,
    set,
    update,
    init: () => {
      return;
    },
    save: (settings) => {
      return;
    }
  };
}
const themeSettings = createSettingsStore();
const systemPrefersDark = writable(false);
const isScheduleDark = writable(false);
const isDarkMode = derived(
  [themeSettings, systemPrefersDark, isScheduleDark],
  ([$settings, $systemDark, $scheduleDark]) => {
    switch ($settings.mode) {
      case "day":
        return false;
      case "night":
        return true;
      case "auto":
        return $systemDark;
      case "schedule":
        return $scheduleDark;
      default:
        return false;
    }
  }
);
const cssVariables = derived(
  [themeSettings, isDarkMode],
  ([$settings, $isDark]) => {
    const theme = BUILTIN_THEMES.find((t) => t.id === $settings.activeThemeId) || DEFAULT_THEME;
    const palette = $isDark ? theme.dark : theme.light;
    return generateCssVariables(palette);
  }
);
export {
  cssVariables as c,
  themeSettings as t
};
