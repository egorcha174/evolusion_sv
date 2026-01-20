import { d as derived, w as writable, g as get } from "./index.js";
import { r as registerLocaleLoader } from "./runtime.js";
const schemaVersion$4 = 1;
const manifest$4 = {
  id: "apple-graphite",
  name: "Apple Graphite",
  version: "1.0.0",
  author: "Evolusion",
  description: "Clean, high contrast, translucent feel inspired by iOS.",
  isCustom: false
};
const light$4 = {
  dashboardBackgroundType: "gradient",
  dashboardGradient: {
    angle: 135,
    stops: [
      {
        color: "#F5F5F7",
        position: 0
      },
      {
        color: "#E5E5EA",
        position: 100
      }
    ]
  },
  bgPage: "#f5f5f7",
  cardOpacity: 0.8,
  cardBorderRadius: 18,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#0071E3",
  cardBackground: "rgba(255, 255, 255, 0.7)",
  cardBackgroundOn: "rgba(255, 255, 255, 0.9)",
  shadowCard: "0 4px 12px rgba(0,0,0,0.06)",
  shadowDropdown: "0 8px 24px rgba(0, 0, 0, 0.15)",
  panelOpacity: 0.9,
  bgPanel: "rgba(255, 255, 255, 0.9)",
  bgInput: "rgba(255,255,255,0.8)",
  bgHeader: "rgba(255, 255, 255, 0.8)",
  textPrimary: "#1d1d1f",
  textSecondary: "#86868b",
  textMuted: "#aeaeb2",
  nameTextColor: "#1d1d1f",
  statusTextColor: "#86868b",
  valueTextColor: "#1d1d1f",
  unitTextColor: "#86868b",
  nameTextColorOn: "#1d1d1f",
  statusTextColorOn: "#0071e3",
  valueTextColorOn: "#1d1d1f",
  unitTextColorOn: "#0071e3",
  accentPrimary: "#0071e3",
  accentError: "#ff3b30",
  accentSuccess: "#34c759",
  accentWarning: "#ff9500",
  accentInfo: "#5ac8fa",
  widgetSwitchOn: "#34c759"
};
const dark$4 = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#000000",
  bgPage: "#000000",
  cardOpacity: 0.75,
  cardBorderRadius: 18,
  cardBorderWidth: 1,
  cardBorderColor: "rgba(255, 255, 255, 0.1)",
  cardBorderColorOn: "#0A84FF",
  cardBackground: "rgba(28, 28, 30, 0.6)",
  cardBackgroundOn: "rgba(44, 44, 46, 0.8)",
  shadowCard: "0 2px 8px rgba(0, 0, 0, 0.2)",
  shadowDropdown: "0 8px 24px rgba(0, 0, 0, 0.5)",
  panelOpacity: 0.9,
  bgPanel: "rgba(28, 28, 30, 0.9)",
  bgInput: "rgba(28,28,30,0.8)",
  bgHeader: "rgba(28, 28, 30, 0.8)",
  textPrimary: "#f5f5f7",
  textSecondary: "#86868b",
  textMuted: "#636366",
  nameTextColor: "#f5f5f7",
  statusTextColor: "#86868b",
  valueTextColor: "#f5f5f7",
  unitTextColor: "#86868b",
  nameTextColorOn: "#f5f5f7",
  statusTextColorOn: "#0a84ff",
  valueTextColorOn: "#f5f5f7",
  unitTextColorOn: "#0a84ff",
  accentPrimary: "#0a84ff",
  accentError: "#ff453a",
  accentSuccess: "#30d158",
  accentWarning: "#ff9f0a",
  accentInfo: "#64d2ff",
  widgetSwitchOn: "#30d158"
};
const appleGraphite = {
  schemaVersion: schemaVersion$4,
  manifest: manifest$4,
  light: light$4,
  dark: dark$4
};
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dark: dark$4,
  default: appleGraphite,
  light: light$4,
  manifest: manifest$4,
  schemaVersion: schemaVersion$4
}, Symbol.toStringTag, { value: "Module" }));
const schemaVersion$3 = 1;
const manifest$3 = {
  id: "dark-minimal",
  name: "Dark Minimal",
  version: "1.0.0",
  author: "Evolusion",
  description: "Pure black and high contrast for OLED screens.",
  isCustom: false
};
const light$3 = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#FFFFFF",
  bgPage: "#FFFFFF",
  cardOpacity: 1,
  cardBorderRadius: 4,
  cardBorderWidth: 1,
  cardBorderColor: "#000000",
  cardBorderColorOn: "#000000",
  cardBackground: "#FFFFFF",
  cardBackgroundOn: "#000000",
  shadowCard: "none",
  shadowDropdown: "0 4px 8px rgba(0, 0, 0, 0.1)",
  panelOpacity: 1,
  bgPanel: "#FFFFFF",
  bgInput: "#FFFFFF",
  bgHeader: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#333333",
  textMuted: "#666666",
  nameTextColor: "#000000",
  statusTextColor: "#666666",
  valueTextColor: "#000000",
  unitTextColor: "#000000",
  nameTextColorOn: "#FFFFFF",
  statusTextColorOn: "#CCCCCC",
  valueTextColorOn: "#FFFFFF",
  unitTextColorOn: "#FFFFFF",
  accentPrimary: "#000000",
  accentError: "#000000",
  accentSuccess: "#000000",
  accentWarning: "#000000",
  accentInfo: "#000000",
  widgetSwitchOn: "#000000"
};
const dark$3 = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#000000",
  bgPage: "#000000",
  cardOpacity: 1,
  cardBorderRadius: 4,
  cardBorderWidth: 1,
  cardBorderColor: "#333333",
  cardBorderColorOn: "#FFFFFF",
  cardBackground: "#000000",
  cardBackgroundOn: "#FFFFFF",
  shadowCard: "none",
  shadowDropdown: "0 4px 8px rgba(255, 255, 255, 0.1)",
  panelOpacity: 1,
  bgPanel: "#000000",
  bgInput: "#111111",
  bgHeader: "#000000",
  textPrimary: "#FFFFFF",
  textSecondary: "#CCCCCC",
  textMuted: "#999999",
  nameTextColor: "#FFFFFF",
  statusTextColor: "#999999",
  valueTextColor: "#FFFFFF",
  unitTextColor: "#FFFFFF",
  nameTextColorOn: "#000000",
  statusTextColorOn: "#333333",
  valueTextColorOn: "#000000",
  unitTextColorOn: "#000000",
  accentPrimary: "#FFFFFF",
  accentError: "#FFFFFF",
  accentSuccess: "#FFFFFF",
  accentWarning: "#FFFFFF",
  accentInfo: "#FFFFFF",
  widgetSwitchOn: "#FFFFFF"
};
const darkMinimal = {
  schemaVersion: schemaVersion$3,
  manifest: manifest$3,
  light: light$3,
  dark: dark$3
};
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dark: dark$3,
  default: darkMinimal,
  light: light$3,
  manifest: manifest$3,
  schemaVersion: schemaVersion$3
}, Symbol.toStringTag, { value: "Module" }));
const schemaVersion$2 = 1;
const manifest$2 = {
  id: "light-modern",
  name: "Light Modern",
  version: "1.0.0",
  author: "Evolusion",
  description: "Soft shadows and rounded corners.",
  isCustom: false
};
const light$2 = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#F0F2F5",
  bgPage: "#F0F2F5",
  cardOpacity: 1,
  cardBorderRadius: 12,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "transparent",
  cardBackground: "#FFFFFF",
  cardBackgroundOn: "#FFFFFF",
  shadowCard: "0 1px 2px rgba(0, 0, 0, 0.1)",
  shadowDropdown: "0 4px 12px rgba(0, 0, 0, 0.1)",
  panelOpacity: 1,
  bgPanel: "#FFFFFF",
  bgInput: "#F0F2F5",
  bgHeader: "#FFFFFF",
  textPrimary: "#050505",
  textSecondary: "#65676B",
  textMuted: "#B0B3B8",
  nameTextColor: "#050505",
  statusTextColor: "#65676B",
  valueTextColor: "#050505",
  unitTextColor: "#65676B",
  nameTextColorOn: "#1877F2",
  statusTextColorOn: "#1877F2",
  valueTextColorOn: "#1877F2",
  unitTextColorOn: "#1877F2",
  accentPrimary: "#1877F2",
  accentError: "#FA383E",
  accentSuccess: "#42B72A",
  accentWarning: "#F7B928",
  accentInfo: "#1877F2",
  widgetSwitchOn: "#1877F2"
};
const dark$2 = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#18191A",
  bgPage: "#18191A",
  cardOpacity: 1,
  cardBorderRadius: 12,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "transparent",
  cardBackground: "#242526",
  cardBackgroundOn: "#3A3B3C",
  shadowCard: "0 1px 2px rgba(0, 0, 0, 0.2)",
  shadowDropdown: "0 4px 12px rgba(0, 0, 0, 0.3)",
  panelOpacity: 1,
  bgPanel: "#242526",
  bgInput: "#3A3B3C",
  bgHeader: "#242526",
  textPrimary: "#E4E6EB",
  textSecondary: "#B0B3B8",
  textMuted: "#606770",
  nameTextColor: "#E4E6EB",
  statusTextColor: "#B0B3B8",
  valueTextColor: "#E4E6EB",
  unitTextColor: "#B0B3B8",
  nameTextColorOn: "#2D88FF",
  statusTextColorOn: "#2D88FF",
  valueTextColorOn: "#2D88FF",
  unitTextColorOn: "#2D88FF",
  accentPrimary: "#2D88FF",
  accentError: "#F02849",
  accentSuccess: "#42B72A",
  accentWarning: "#F7B928",
  accentInfo: "#2D88FF",
  widgetSwitchOn: "#2D88FF"
};
const lightModern = {
  schemaVersion: schemaVersion$2,
  manifest: manifest$2,
  light: light$2,
  dark: dark$2
};
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dark: dark$2,
  default: lightModern,
  light: light$2,
  manifest: manifest$2,
  schemaVersion: schemaVersion$2
}, Symbol.toStringTag, { value: "Module" }));
const schemaVersion$1 = 1;
const manifest$1 = {
  id: "ocean-blue",
  name: "Ocean Blue",
  version: "1.0.0",
  author: "Evolusion",
  description: "Deep blue gradients and teal accents.",
  isCustom: false
};
const light$1 = {
  dashboardBackgroundType: "gradient",
  dashboardGradient: {
    angle: 180,
    stops: [
      {
        color: "#E0F7FA",
        position: 0
      },
      {
        color: "#B2EBF2",
        position: 100
      }
    ]
  },
  bgPage: "#E0F7FA",
  cardOpacity: 0.9,
  cardBorderRadius: 8,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#00ACC1",
  cardBackground: "#FFFFFF",
  cardBackgroundOn: "#E0F2F1",
  shadowCard: "0 2px 5px rgba(0,0,0,0.1)",
  shadowDropdown: "0 4px 12px rgba(0,0,0,0.15)",
  panelOpacity: 0.8,
  bgPanel: "rgba(255, 255, 255, 0.8)",
  bgInput: "#FFFFFF",
  bgHeader: "rgba(255, 255, 255, 0.8)",
  textPrimary: "#263238",
  textSecondary: "#546E7A",
  textMuted: "#90A4AE",
  nameTextColor: "#263238",
  statusTextColor: "#546E7A",
  valueTextColor: "#00838F",
  unitTextColor: "#546E7A",
  nameTextColorOn: "#006064",
  statusTextColorOn: "#00838F",
  valueTextColorOn: "#006064",
  unitTextColorOn: "#00838F",
  accentPrimary: "#00BCD4",
  accentError: "#FF7043",
  accentSuccess: "#26A69A",
  accentWarning: "#FFA726",
  accentInfo: "#29B6F6",
  widgetSwitchOn: "#26A69A"
};
const dark$1 = {
  dashboardBackgroundType: "gradient",
  dashboardGradient: {
    angle: 180,
    stops: [
      {
        color: "#01579B",
        position: 0
      },
      {
        color: "#002F6C",
        position: 100
      }
    ]
  },
  bgPage: "#01579B",
  cardOpacity: 0.85,
  cardBorderRadius: 8,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#4DD0E1",
  cardBackground: "#0277BD",
  cardBackgroundOn: "#0288D1",
  shadowCard: "0 2px 5px rgba(0,0,0,0.2)",
  shadowDropdown: "0 4px 12px rgba(0,0,0,0.3)",
  panelOpacity: 0.8,
  bgPanel: "rgba(2, 119, 189, 0.8)",
  bgInput: "#01579B",
  bgHeader: "rgba(2, 119, 189, 0.8)",
  textPrimary: "#E1F5FE",
  textSecondary: "#B3E5FC",
  textMuted: "#81D4FA",
  nameTextColor: "#FFFFFF",
  statusTextColor: "#B3E5FC",
  valueTextColor: "#4DD0E1",
  unitTextColor: "#B3E5FC",
  nameTextColorOn: "#E0F7FA",
  statusTextColorOn: "#80DEEA",
  valueTextColorOn: "#FFFFFF",
  unitTextColorOn: "#80DEEA",
  accentPrimary: "#4DD0E1",
  accentError: "#FFAB91",
  accentSuccess: "#80CBC4",
  accentWarning: "#FFCC80",
  accentInfo: "#81D4FA",
  widgetSwitchOn: "#80CBC4"
};
const oceanBlue = {
  schemaVersion: schemaVersion$1,
  manifest: manifest$1,
  light: light$1,
  dark: dark$1
};
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dark: dark$1,
  default: oceanBlue,
  light: light$1,
  manifest: manifest$1,
  schemaVersion: schemaVersion$1
}, Symbol.toStringTag, { value: "Module" }));
const schemaVersion = 1;
const manifest = {
  id: "sunset-warm",
  name: "Sunset Warm",
  version: "1.0.0",
  author: "Evolusion",
  description: "Warm orange and red gradients.",
  isCustom: false
};
const light = {
  dashboardBackgroundType: "gradient",
  dashboardGradient: {
    angle: 45,
    stops: [
      {
        color: "#FFF3E0",
        position: 0
      },
      {
        color: "#FFE0B2",
        position: 100
      }
    ]
  },
  bgPage: "#FFF3E0",
  cardOpacity: 0.9,
  cardBorderRadius: 20,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#FF6D00",
  cardBackground: "#FFFFFF",
  cardBackgroundOn: "#FFF8E1",
  shadowCard: "0 2px 6px rgba(0,0,0,0.1)",
  shadowDropdown: "0 4px 12px rgba(0,0,0,0.15)",
  panelOpacity: 0.7,
  bgPanel: "rgba(255, 255, 255, 0.9)",
  bgInput: "#FFFFFF",
  bgHeader: "rgba(255, 255, 255, 0.8)",
  textPrimary: "#3E2723",
  textSecondary: "#8D6E63",
  textMuted: "#D7CCC8",
  nameTextColor: "#3E2723",
  statusTextColor: "#8D6E63",
  valueTextColor: "#E65100",
  unitTextColor: "#8D6E63",
  nameTextColorOn: "#BF360C",
  statusTextColorOn: "#E65100",
  valueTextColorOn: "#BF360C",
  unitTextColorOn: "#E65100",
  accentPrimary: "#FF6D00",
  accentError: "#D84315",
  accentSuccess: "#558B2F",
  accentWarning: "#F9A825",
  accentInfo: "#42A5F5",
  widgetSwitchOn: "#558B2F"
};
const dark = {
  dashboardBackgroundType: "gradient",
  dashboardGradient: {
    angle: 45,
    stops: [
      {
        color: "#212121",
        position: 0
      },
      {
        color: "#3E2723",
        position: 100
      }
    ]
  },
  bgPage: "#212121",
  cardOpacity: 0.85,
  cardBorderRadius: 20,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#FFAB40",
  cardBackground: "#424242",
  cardBackgroundOn: "#4E342E",
  shadowCard: "0 2px 6px rgba(0,0,0,0.2)",
  shadowDropdown: "0 4px 12px rgba(0,0,0,0.3)",
  panelOpacity: 0.8,
  bgPanel: "rgba(62, 39, 35, 0.8)",
  bgInput: "#212121",
  bgHeader: "rgba(62, 39, 35, 0.8)",
  textPrimary: "#FFF3E0",
  textSecondary: "#BCAAA4",
  textMuted: "#8D6E63",
  nameTextColor: "#FFF3E0",
  statusTextColor: "#BCAAA4",
  valueTextColor: "#FFAB40",
  unitTextColor: "#BCAAA4",
  nameTextColorOn: "#FFE0B2",
  statusTextColorOn: "#FFCC80",
  valueTextColorOn: "#FFE0B2",
  unitTextColorOn: "#FFCC80",
  accentPrimary: "#FFAB40",
  accentError: "#FF7043",
  accentSuccess: "#9CCC65",
  accentWarning: "#FFEE58",
  accentInfo: "#4FC3F7",
  widgetSwitchOn: "#9CCC65"
};
const sunsetWarm = {
  schemaVersion,
  manifest,
  light,
  dark
};
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dark,
  default: sunsetWarm,
  light,
  manifest,
  schemaVersion
}, Symbol.toStringTag, { value: "Module" }));
const presetThemes = /* @__PURE__ */ Object.assign({ "./presets/apple-graphite.json": __vite_glob_0_0, "./presets/dark-minimal.json": __vite_glob_0_1, "./presets/light-modern.json": __vite_glob_0_2, "./presets/ocean-blue.json": __vite_glob_0_3, "./presets/sunset-warm.json": __vite_glob_0_4 });
const customThemes = /* @__PURE__ */ Object.assign({});
async function loadTheme(themeId) {
  for (const path in presetThemes) {
    const theme = presetThemes[path].default;
    if (theme.manifest.id === themeId) {
      return theme;
    }
  }
  for (const path in customThemes) {
    const theme = customThemes[path].default;
    if (theme.manifest.id === themeId) {
      return theme;
    }
  }
  if (typeof localStorage !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem("evolusion-custom-themes") || "{}");
      if (stored[themeId]) return stored[themeId];
    } catch (e) {
    }
  }
  return null;
}
function determineScheme(mode, schedule, _currentTime) {
  if (mode === "day") return "light";
  if (mode === "night") return "dark";
  if (mode === "schedule" && schedule?.mode === "time" && schedule.dayStart && schedule.nightStart) {
    const now = /* @__PURE__ */ new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [dH, dM] = schedule.dayStart.split(":").map(Number);
    const dayMinutes = dH * 60 + dM;
    const [nH, nM] = schedule.nightStart.split(":").map(Number);
    const nightMinutes = nH * 60 + nM;
    if (dayMinutes < nightMinutes) {
      return currentMinutes >= dayMinutes && currentMinutes < nightMinutes ? "light" : "dark";
    } else {
      return currentMinutes >= dayMinutes || currentMinutes < nightMinutes ? "light" : "dark";
    }
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}
const defaultLightScheme = {
  dashboardBackgroundType: "gradient",
  dashboardGradient: {
    angle: 135,
    stops: [
      { color: "#EAEAEB", position: 0 },
      { color: "#DCDCDC", position: 100 }
    ]
  },
  bgPage: "#f0f2f5",
  cardOpacity: 0.85,
  cardBorderRadius: 16,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#2196f3",
  cardBackground: "rgba(255, 255, 255, 0.8)",
  cardBackgroundOn: "rgba(255, 255, 255, 0.95)",
  shadowCard: "0 1px 2px rgba(0, 0, 0, 0.05)",
  shadowDropdown: "0 4px 12px rgba(0, 0, 0, 0.15)",
  panelOpacity: 0.95,
  bgPanel: "rgba(255, 255, 255, 0.95)",
  bgInput: "#ffffff",
  bgHeader: "rgba(255, 255, 255, 0.8)",
  textPrimary: "#1a1d21",
  textSecondary: "#65676b",
  textMuted: "#b0b3b8",
  nameTextColor: "#1a1d21",
  statusTextColor: "#65676b",
  valueTextColor: "#1a1d21",
  unitTextColor: "#65676b",
  nameTextColorOn: "#1a1d21",
  statusTextColorOn: "#2196f3",
  valueTextColorOn: "#1a1d21",
  unitTextColorOn: "#2196f3",
  accentPrimary: "#2196f3",
  accentError: "#f44336",
  accentSuccess: "#4caf50",
  accentWarning: "#ff9800",
  accentInfo: "#03a9f4",
  widgetSwitchOn: "#4caf50"
};
const defaultDarkScheme = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#1C1C1E",
  bgPage: "#111315",
  cardOpacity: 0.8,
  cardBorderRadius: 16,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#64b5f6",
  cardBackground: "rgba(44, 44, 46, 0.8)",
  cardBackgroundOn: "rgba(60, 60, 62, 0.85)",
  shadowCard: "0 2px 4px rgba(0, 0, 0, 0.2)",
  shadowDropdown: "0 4px 12px rgba(0, 0, 0, 0.4)",
  panelOpacity: 0.95,
  bgPanel: "rgba(28, 28, 30, 0.95)",
  bgInput: "#2d3035",
  bgHeader: "rgba(28, 28, 30, 0.8)",
  textPrimary: "#e4e6eb",
  textSecondary: "#b0b3b8",
  textMuted: "#6d7177",
  nameTextColor: "#e4e6eb",
  statusTextColor: "#b0b3b8",
  valueTextColor: "#e4e6eb",
  unitTextColor: "#b0b3b8",
  nameTextColorOn: "#e4e6eb",
  statusTextColorOn: "#64b5f6",
  valueTextColorOn: "#e4e6eb",
  unitTextColorOn: "#64b5f6",
  accentPrimary: "#64b5f6",
  accentError: "#e57373",
  accentSuccess: "#81c784",
  accentWarning: "#ffb74d",
  accentInfo: "#4fc3f7",
  widgetSwitchOn: "#81c784"
};
const initialState$1 = {
  currentThemeId: "apple-graphite",
  currentScheme: "light",
  mode: "auto",
  schedule: void 0,
  availableThemes: [],
  loadedTheme: null
};
function loadStateFromStorage() {
  return {};
}
function createThemeStore() {
  const stored = loadStateFromStorage();
  const { subscribe, set, update } = writable({
    ...initialState$1,
    ...stored
  });
  return {
    subscribe,
    async init() {
      return;
    },
    async setTheme(themeId) {
      const theme = await loadTheme(themeId);
      if (!theme) return;
      update((s) => {
        const newState = { ...s, currentThemeId: themeId, loadedTheme: theme };
        return newState;
      });
      this.applyCSSVariables();
    },
    setMode(mode) {
      update((s) => {
        const currentScheme = determineScheme(mode, s.schedule);
        const newState = { ...s, mode, currentScheme };
        return newState;
      });
      this.applyCSSVariables();
    },
    setSchedule(schedule) {
      update((s) => {
        const newState = { ...s, schedule };
        return newState;
      });
      const state = get({ subscribe });
      this.setMode(state.mode);
    },
    toggleScheme() {
      update((s) => {
        const currentScheme = s.currentScheme === "light" ? "dark" : "light";
        const mode = currentScheme === "light" ? "day" : "night";
        const newState = { ...s, currentScheme, mode };
        return newState;
      });
      this.applyCSSVariables();
    },
    applyCSSVariables() {
      return;
    },
    startScheduler() {
      return;
    }
  };
}
const themeStore = createThemeStore();
const activeScheme = derived(
  themeStore,
  ($theme) => $theme.loadedTheme?.[$theme.currentScheme] || ($theme.currentScheme === "light" ? defaultLightScheme : defaultDarkScheme)
);
const BUILT_IN_LANGUAGES = [
  { code: "ru", name: "Русский", dir: "ltr" },
  { code: "en", name: "English", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "zh", name: "中文", dir: "ltr" },
  { code: "es", name: "Español", dir: "ltr" },
  { code: "de", name: "Deutsch", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" },
  { code: "pt", name: "Português", dir: "ltr" },
  { code: "ja", name: "日本語", dir: "ltr" },
  { code: "ko", name: "한국어", dir: "ltr" }
];
const currentLang = writable("ru");
const availableLanguages = writable([...BUILT_IN_LANGUAGES]);
registerLocaleLoader("ru", () => import("./ru.js"));
registerLocaleLoader("en", () => import("./en.js"));
registerLocaleLoader("ar", () => import("./ar.js"));
["zh", "es", "de", "fr", "pt", "ja", "ko"].forEach((code) => {
  registerLocaleLoader(code, () => import("./en.js"));
});
async function setLocale(code) {
  return;
}
const defaultSettings = {
  provider: "openmeteo",
  useCustomLocation: false,
  refreshIntervalMinutes: 15,
  showForecast: true,
  forecastDays: 3,
  iconPack: "default",
  forecastLayout: "vertical"
};
const initialState = {
  current: null,
  isLoading: false,
  error: null
};
const weatherStore = writable(initialState);
const weatherSettings = writable(defaultSettings);
export {
  activeScheme as a,
  weatherSettings as b,
  currentLang as c,
  availableLanguages as d,
  setLocale as s,
  themeStore as t,
  weatherStore as w
};
