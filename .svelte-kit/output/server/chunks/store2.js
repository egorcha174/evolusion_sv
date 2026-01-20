import { d as derived, w as writable, g as get } from "./index.js";
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
  bgCard: "rgba(255, 255, 255, 0.7)",
  bgCardHover: "rgba(255, 255, 255, 0.9)",
  bgSidebar: "#fbfbfd",
  bgHeader: "rgba(255, 255, 255, 0.8)",
  bgInput: "rgba(255,255,255,0.8)",
  bgChip: "#e4e6eb",
  bgChipActive: "#e7f3ff",
  textPrimary: "#1d1d1f",
  textSecondary: "#86868b",
  textMuted: "#aeaeb2",
  textName: "#1d1d1f",
  textStatus: "#86868b",
  textOnAccent: "#ffffff",
  borderCard: "transparent",
  borderPrimary: "#d1d1d6",
  borderInput: "#d1d1d6",
  borderFocus: "#0071e3",
  borderDivider: "#d1d1d6",
  stateOn: "#0071e3",
  accentPrimary: "#0071e3",
  accentError: "#ff3b30",
  accentSuccess: "#34c759",
  accentWarning: "#ff9500",
  accentInfo: "#5ac8fa",
  shadowCard: "0 4px 12px rgba(0,0,0,0.06)",
  widgetSwitchOn: "#34c759"
};
const dark$4 = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#000000",
  bgPage: "#000000",
  bgCard: "rgba(28, 28, 30, 0.6)",
  bgCardHover: "rgba(44, 44, 46, 0.8)",
  bgSidebar: "#121212",
  bgHeader: "rgba(28, 28, 30, 0.8)",
  bgInput: "rgba(28,28,30,0.8)",
  bgChip: "#2c2c2e",
  bgChipActive: "#3a3a3c",
  textPrimary: "#f5f5f7",
  textSecondary: "#86868b",
  textMuted: "#636366",
  textName: "#f5f5f7",
  textStatus: "#86868b",
  textOnAccent: "#ffffff",
  borderCard: "rgba(255, 255, 255, 0.1)",
  borderPrimary: "#38383a",
  borderInput: "#38383a",
  borderFocus: "#0a84ff",
  borderDivider: "#38383a",
  stateOn: "#0a84ff",
  accentPrimary: "#0a84ff",
  accentError: "#ff453a",
  accentSuccess: "#30d158",
  accentWarning: "#ff9f0a",
  accentInfo: "#64d2ff",
  shadowCard: "0 2px 8px rgba(0, 0, 0, 0.2)",
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
  cardOpacity: 1,
  cardBorderRadius: 4,
  cardBorderWidth: 1,
  cardBorderColor: "#000000",
  cardBorderColorOn: "#000000",
  cardBackground: "#FFFFFF",
  cardBackgroundOn: "#000000",
  panelOpacity: 1,
  tabTextColor: "#999999",
  activeTabTextColor: "#000000",
  tabIndicatorColor: "#000000",
  thermostatHandleColor: "#000000",
  thermostatDialTextColor: "#000000",
  thermostatDialLabelColor: "#666666",
  thermostatHeatingColor: "#000000",
  thermostatCoolingColor: "#000000",
  clockTextColor: "#000000",
  nameTextColor: "#000000",
  statusTextColor: "#666666",
  valueTextColor: "#000000",
  unitTextColor: "#000000",
  nameTextColorOn: "#FFFFFF",
  statusTextColorOn: "#CCCCCC",
  valueTextColorOn: "#FFFFFF",
  unitTextColorOn: "#FFFFFF",
  accentPrimary: "#000000",
  textPrimary: "#000000",
  bgInput: "#FFFFFF"
};
const dark$3 = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#000000",
  cardOpacity: 1,
  cardBorderRadius: 4,
  cardBorderWidth: 1,
  cardBorderColor: "#333333",
  cardBorderColorOn: "#FFFFFF",
  cardBackground: "#000000",
  cardBackgroundOn: "#FFFFFF",
  panelOpacity: 1,
  tabTextColor: "#666666",
  activeTabTextColor: "#FFFFFF",
  tabIndicatorColor: "#FFFFFF",
  thermostatHandleColor: "#FFFFFF",
  thermostatDialTextColor: "#FFFFFF",
  thermostatDialLabelColor: "#999999",
  thermostatHeatingColor: "#FFFFFF",
  thermostatCoolingColor: "#FFFFFF",
  clockTextColor: "#FFFFFF",
  nameTextColor: "#FFFFFF",
  statusTextColor: "#999999",
  valueTextColor: "#FFFFFF",
  unitTextColor: "#FFFFFF",
  nameTextColorOn: "#000000",
  statusTextColorOn: "#333333",
  valueTextColorOn: "#000000",
  unitTextColorOn: "#000000",
  accentPrimary: "#FFFFFF",
  textPrimary: "#FFFFFF",
  bgInput: "#111111"
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
  cardOpacity: 1,
  cardBorderRadius: 12,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "transparent",
  cardBackground: "#FFFFFF",
  cardBackgroundOn: "#FFFFFF",
  panelOpacity: 1,
  tabTextColor: "#65676B",
  activeTabTextColor: "#1877F2",
  tabIndicatorColor: "#1877F2",
  thermostatHandleColor: "#1877F2",
  thermostatDialTextColor: "#050505",
  thermostatDialLabelColor: "#65676B",
  thermostatHeatingColor: "#FA383E",
  thermostatCoolingColor: "#1877F2",
  clockTextColor: "#050505",
  nameTextColor: "#050505",
  statusTextColor: "#65676B",
  valueTextColor: "#050505",
  unitTextColor: "#65676B",
  nameTextColorOn: "#1877F2",
  statusTextColorOn: "#1877F2",
  valueTextColorOn: "#1877F2",
  unitTextColorOn: "#1877F2",
  accentPrimary: "#1877F2",
  textPrimary: "#050505",
  bgInput: "#F0F2F5"
};
const dark$2 = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#18191A",
  cardOpacity: 1,
  cardBorderRadius: 12,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "transparent",
  cardBackground: "#242526",
  cardBackgroundOn: "#3A3B3C",
  panelOpacity: 1,
  tabTextColor: "#B0B3B8",
  activeTabTextColor: "#2D88FF",
  tabIndicatorColor: "#2D88FF",
  thermostatHandleColor: "#E4E6EB",
  thermostatDialTextColor: "#E4E6EB",
  thermostatDialLabelColor: "#B0B3B8",
  thermostatHeatingColor: "#F02849",
  thermostatCoolingColor: "#2D88FF",
  clockTextColor: "#E4E6EB",
  nameTextColor: "#E4E6EB",
  statusTextColor: "#B0B3B8",
  valueTextColor: "#E4E6EB",
  unitTextColor: "#B0B3B8",
  nameTextColorOn: "#2D88FF",
  statusTextColorOn: "#2D88FF",
  valueTextColorOn: "#2D88FF",
  unitTextColorOn: "#2D88FF",
  accentPrimary: "#2D88FF",
  textPrimary: "#E4E6EB",
  bgInput: "#3A3B3C"
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
  cardOpacity: 0.9,
  cardBorderRadius: 8,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#00ACC1",
  cardBackground: "#FFFFFF",
  cardBackgroundOn: "#E0F2F1",
  panelOpacity: 0.8,
  tabTextColor: "#546E7A",
  activeTabTextColor: "#00838F",
  tabIndicatorColor: "#00838F",
  thermostatHandleColor: "#00BCD4",
  thermostatDialTextColor: "#263238",
  thermostatDialLabelColor: "#546E7A",
  thermostatHeatingColor: "#FF7043",
  thermostatCoolingColor: "#29B6F6",
  clockTextColor: "#006064",
  nameTextColor: "#263238",
  statusTextColor: "#546E7A",
  valueTextColor: "#00838F",
  unitTextColor: "#546E7A",
  nameTextColorOn: "#006064",
  statusTextColorOn: "#00838F",
  valueTextColorOn: "#006064",
  unitTextColorOn: "#00838F",
  accentPrimary: "#00BCD4",
  textPrimary: "#263238",
  bgInput: "#FFFFFF"
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
  cardOpacity: 0.85,
  cardBorderRadius: 8,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#4DD0E1",
  cardBackground: "#0277BD",
  cardBackgroundOn: "#0288D1",
  panelOpacity: 0.8,
  tabTextColor: "#B3E5FC",
  activeTabTextColor: "#FFFFFF",
  tabIndicatorColor: "#4DD0E1",
  thermostatHandleColor: "#4DD0E1",
  thermostatDialTextColor: "#FFFFFF",
  thermostatDialLabelColor: "#B3E5FC",
  thermostatHeatingColor: "#FFAB91",
  thermostatCoolingColor: "#81D4FA",
  clockTextColor: "#E1F5FE",
  nameTextColor: "#FFFFFF",
  statusTextColor: "#B3E5FC",
  valueTextColor: "#4DD0E1",
  unitTextColor: "#B3E5FC",
  nameTextColorOn: "#E0F7FA",
  statusTextColorOn: "#80DEEA",
  valueTextColorOn: "#FFFFFF",
  unitTextColorOn: "#80DEEA",
  accentPrimary: "#4DD0E1",
  textPrimary: "#E1F5FE",
  bgInput: "#01579B"
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
  cardOpacity: 0.9,
  cardBorderRadius: 20,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#FF6D00",
  cardBackground: "#FFFFFF",
  cardBackgroundOn: "#FFF8E1",
  panelOpacity: 0.7,
  tabTextColor: "#8D6E63",
  activeTabTextColor: "#E65100",
  tabIndicatorColor: "#E65100",
  thermostatHandleColor: "#FF6D00",
  thermostatDialTextColor: "#3E2723",
  thermostatDialLabelColor: "#8D6E63",
  thermostatHeatingColor: "#D84315",
  thermostatCoolingColor: "#42A5F5",
  clockTextColor: "#BF360C",
  nameTextColor: "#3E2723",
  statusTextColor: "#8D6E63",
  valueTextColor: "#E65100",
  unitTextColor: "#8D6E63",
  nameTextColorOn: "#BF360C",
  statusTextColorOn: "#E65100",
  valueTextColorOn: "#BF360C",
  unitTextColorOn: "#E65100",
  accentPrimary: "#FF6D00",
  textPrimary: "#3E2723",
  bgInput: "#FFFFFF"
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
  cardOpacity: 0.85,
  cardBorderRadius: 20,
  cardBorderWidth: 0,
  cardBorderColor: "transparent",
  cardBorderColorOn: "#FFAB40",
  cardBackground: "#424242",
  cardBackgroundOn: "#4E342E",
  panelOpacity: 0.8,
  tabTextColor: "#BCAAA4",
  activeTabTextColor: "#FFCC80",
  tabIndicatorColor: "#FFCC80",
  thermostatHandleColor: "#FFAB40",
  thermostatDialTextColor: "#FFF3E0",
  thermostatDialLabelColor: "#BCAAA4",
  thermostatHeatingColor: "#FF7043",
  thermostatCoolingColor: "#4FC3F7",
  clockTextColor: "#FFCC80",
  nameTextColor: "#FFF3E0",
  statusTextColor: "#BCAAA4",
  valueTextColor: "#FFAB40",
  unitTextColor: "#BCAAA4",
  nameTextColorOn: "#FFE0B2",
  statusTextColorOn: "#FFCC80",
  valueTextColorOn: "#FFE0B2",
  unitTextColorOn: "#FFCC80",
  accentPrimary: "#FFAB40",
  textPrimary: "#FFF3E0",
  bgInput: "#212121"
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
  bgCard: "rgba(255, 255, 255, 0.8)",
  bgCardHover: "rgba(255, 255, 255, 0.95)",
  bgSidebar: "#ffffff",
  bgHeader: "rgba(255, 255, 255, 0.8)",
  bgInput: "#ffffff",
  bgChip: "#e4e6eb",
  bgChipActive: "#e7f3ff",
  textPrimary: "#1a1d21",
  textSecondary: "#65676b",
  textMuted: "#b0b3b8",
  textName: "#1a1d21",
  textStatus: "#65676b",
  textOnAccent: "#ffffff",
  borderCard: "#ebeef2",
  borderPrimary: "#dce0e6",
  borderInput: "#ced0d4",
  borderFocus: "#2196f3",
  borderDivider: "#eff1f4",
  stateOn: "#2196f3",
  accentPrimary: "#2196f3",
  accentError: "#f44336",
  accentSuccess: "#4caf50",
  accentWarning: "#ff9800",
  accentInfo: "#03a9f4",
  shadowCard: "0 1px 2px rgba(0, 0, 0, 0.05)",
  widgetSwitchOn: "#4caf50"
};
const defaultDarkScheme = {
  dashboardBackgroundType: "color",
  dashboardBackgroundColor: "#1C1C1E",
  bgPage: "#111315",
  bgCard: "rgba(44, 44, 46, 0.8)",
  bgCardHover: "rgba(60, 60, 62, 0.85)",
  bgSidebar: "#0d0f11",
  bgHeader: "rgba(28, 28, 30, 0.8)",
  bgInput: "#2d3035",
  bgChip: "#2d3035",
  bgChipActive: "#1c2f45",
  textPrimary: "#e4e6eb",
  textSecondary: "#b0b3b8",
  textMuted: "#6d7177",
  textName: "#e4e6eb",
  textStatus: "#b0b3b8",
  textOnAccent: "#000000",
  borderCard: "#2d3035",
  borderPrimary: "#2d3035",
  borderInput: "#3e4147",
  borderFocus: "#64b5f6",
  borderDivider: "#2d3035",
  stateOn: "#64b5f6",
  accentPrimary: "#64b5f6",
  accentError: "#e57373",
  accentSuccess: "#81c784",
  accentWarning: "#ffb74d",
  accentInfo: "#4fc3f7",
  shadowCard: "0 2px 4px rgba(0, 0, 0, 0.2)",
  widgetSwitchOn: "#81c784"
};
const initialState = {
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
    ...initialState,
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
export {
  activeScheme as a,
  themeStore as t
};
