import { d as derived, w as writable } from "./index.js";
const defaultLight = {
  bgPage: "#f0f2f5",
  bgPrimary: "#ffffff",
  bgSecondary: "#f7f8fa",
  bgCard: "#ffffff",
  bgCardHover: "#fbfbfb",
  bgHeader: "#ffffff",
  bgSidebar: "#1e2430",
  bgSidebarActiveItem: "#2c3545",
  bgInput: "#ffffff",
  bgChip: "#e4e6eb",
  bgChipActive: "#e7f3ff",
  textPrimary: "#1a1d21",
  textSecondary: "#65676b",
  textMuted: "#b0b3b8",
  textName: "#1a1d21",
  textStatus: "#65676b",
  textOnPrimary: "#ffffff",
  textOnAccent: "#ffffff",
  textOnDanger: "#ffffff",
  borderPrimary: "#dce0e6",
  borderSecondary: "#f0f2f5",
  borderCard: "#ebeef2",
  borderInput: "#ced0d4",
  borderFocus: "#2196f3",
  borderDivider: "#eff1f4",
  stateOn: "#2196f3",
  stateOff: "#b0b3b8",
  stateUnavailable: "#e4e6eb",
  stateUnknown: "#f0f2f5",
  accentPrimary: "#2196f3",
  accentSecondary: "#607d8b",
  accentSuccess: "#4caf50",
  accentWarning: "#ff9800",
  accentError: "#f44336",
  accentInfo: "#03a9f4",
  tabActive: "#2196f3",
  tabInactive: "#65676b",
  tabHover: "#1a1d21",
  tabBorderActive: "#2196f3",
  widgetThermostatCold: "#2196f3",
  widgetThermostatWarm: "#ff9800",
  widgetThermostatHot: "#f44336",
  widgetSliderTrack: "#e4e6eb",
  widgetSliderThumb: "#ffffff",
  widgetSliderFill: "#2196f3",
  widgetSwitchOn: "#4caf50",
  widgetSwitchOff: "#b0b3b8",
  chartPrimary: "#2196f3",
  chartSecondary: "#4caf50",
  chartTertiary: "#ff9800",
  chartGrid: "#f0f2f5",
  chartAxis: "#b0b3b8",
  shadowCard: "0 1px 2px rgba(0, 0, 0, 0.05)",
  shadowModal: "0 8px 24px rgba(0, 0, 0, 0.15)",
  shadowDropdown: "0 4px 12px rgba(0, 0, 0, 0.1)",
  overlayBg: "rgba(0, 0, 0, 0.4)",
  modalBg: "#ffffff",
  scrollbarThumb: "#bcc0c4",
  scrollbarTrack: "transparent",
  tooltipBg: "#1a1d21",
  tooltipText: "#ffffff"
};
const defaultDark = {
  bgPage: "#111315",
  bgPrimary: "#1e2023",
  bgSecondary: "#25282c",
  bgCard: "#1e2023",
  bgCardHover: "#25282c",
  bgHeader: "#16181b",
  bgSidebar: "#0d0f11",
  bgSidebarActiveItem: "#25282c",
  bgInput: "#2d3035",
  bgChip: "#2d3035",
  bgChipActive: "#1c2f45",
  textPrimary: "#e4e6eb",
  textSecondary: "#b0b3b8",
  textMuted: "#6d7177",
  textName: "#e4e6eb",
  textStatus: "#b0b3b8",
  textOnPrimary: "#000000",
  textOnAccent: "#000000",
  textOnDanger: "#ffffff",
  borderPrimary: "#2d3035",
  borderSecondary: "#16181b",
  borderCard: "#2d3035",
  borderInput: "#3e4147",
  borderFocus: "#64b5f6",
  borderDivider: "#2d3035",
  stateOn: "#64b5f6",
  stateOff: "#6d7177",
  stateUnavailable: "#2d3035",
  stateUnknown: "#16181b",
  accentPrimary: "#64b5f6",
  accentSecondary: "#90a4ae",
  accentSuccess: "#81c784",
  accentWarning: "#ffb74d",
  accentError: "#e57373",
  accentInfo: "#4fc3f7",
  tabActive: "#64b5f6",
  tabInactive: "#b0b3b8",
  tabHover: "#e4e6eb",
  tabBorderActive: "#64b5f6",
  widgetThermostatCold: "#64b5f6",
  widgetThermostatWarm: "#ffb74d",
  widgetThermostatHot: "#e57373",
  widgetSliderTrack: "#2d3035",
  widgetSliderThumb: "#e4e6eb",
  widgetSliderFill: "#64b5f6",
  widgetSwitchOn: "#81c784",
  widgetSwitchOff: "#6d7177",
  chartPrimary: "#64b5f6",
  chartSecondary: "#81c784",
  chartTertiary: "#ffb74d",
  chartGrid: "#2d3035",
  chartAxis: "#6d7177",
  shadowCard: "0 2px 4px rgba(0, 0, 0, 0.2)",
  shadowModal: "0 8px 24px rgba(0, 0, 0, 0.5)",
  shadowDropdown: "0 4px 12px rgba(0, 0, 0, 0.4)",
  overlayBg: "rgba(0, 0, 0, 0.6)",
  modalBg: "#1e2023",
  scrollbarThumb: "#3e4147",
  scrollbarTrack: "transparent",
  tooltipBg: "#e4e6eb",
  tooltipText: "#1a1d21"
};
const appleLight = {
  ...defaultLight,
  bgPage: "#f5f5f7",
  bgCard: "#ffffff",
  bgCardHover: "#ffffff",
  bgSidebar: "#fbfbfd",
  bgSidebarActiveItem: "#e5e5e5",
  textPrimary: "#1d1d1f",
  accentPrimary: "#0071e3",
  stateOn: "#0071e3",
  shadowCard: "0 4px 12px rgba(0,0,0,0.06)",
  borderCard: "transparent",
  widgetSwitchOn: "#34c759",
  widgetSliderFill: "#0071e3"
};
const appleDark = {
  ...defaultDark,
  bgPage: "#000000",
  bgCard: "#1c1c1e",
  bgCardHover: "#2c2c2e",
  bgSidebar: "#121212",
  textPrimary: "#f5f5f7",
  accentPrimary: "#0a84ff",
  stateOn: "#0a84ff",
  borderCard: "rgba(255,255,255,0.1)",
  widgetSwitchOn: "#30d158",
  widgetSliderFill: "#0a84ff"
};
const materialLight = {
  ...defaultLight,
  bgPage: "#fff",
  bgCard: "#f5f5f5",
  accentPrimary: "#6200ee",
  accentSecondary: "#03dac6",
  stateOn: "#6200ee",
  shadowCard: "0 1px 3px rgba(0,0,0,0.2), 0 2px 2px rgba(0,0,0,0.14), 0 0 2px rgba(0,0,0,0.12)",
  borderCard: "transparent",
  widgetSwitchOn: "#6200ee"
};
const materialDark = {
  ...defaultDark,
  bgPage: "#121212",
  bgCard: "#1e1e1e",
  accentPrimary: "#bb86fc",
  accentSecondary: "#03dac6",
  stateOn: "#bb86fc",
  shadowCard: "0 1px 3px rgba(0,0,0,0.3)",
  borderCard: "rgba(255,255,255,0.08)",
  widgetSwitchOn: "#bb86fc"
};
const BUILTIN_THEMES = [
  {
    id: "default",
    name: "Default",
    description: "Standard Evolusion theme",
    isBuiltIn: true,
    light: defaultLight,
    dark: defaultDark
  },
  {
    id: "apple",
    name: "Apple Inspired",
    description: "Clean, high contrast, translucent feel",
    isBuiltIn: true,
    light: appleLight,
    dark: appleDark
  },
  {
    id: "material",
    name: "Material Design",
    description: "High saturation, deep shadows",
    isBuiltIn: true,
    light: materialLight,
    dark: materialDark
  }
];
const DEFAULT_THEME = BUILTIN_THEMES[0];
function camelToKebab(str) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}
function generateThemeCss(palette) {
  const lines = [];
  Object.entries(palette).forEach(([key, value]) => {
    const varName = `--${camelToKebab(key)}`;
    lines.push(`  ${varName}: ${value};`);
  });
  return `:root {
${lines.join("\n")}
}`;
}
const DEFAULT_SETTINGS = {
  mode: "auto",
  activeThemeId: "default",
  schedule: {
    darkStart: "22:00",
    darkEnd: "07:00"
  },
  customThemes: []
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
const timeOfDayMinutes = writable(0);
const themeState = derived(
  [themeSettings, systemPrefersDark, timeOfDayMinutes],
  ([$settings, $systemDark, $minutes]) => {
    let scheme = "light";
    if ($settings.mode === "day") {
      scheme = "light";
    } else if ($settings.mode === "night") {
      scheme = "dark";
    } else if ($settings.mode === "auto") {
      scheme = $systemDark ? "dark" : "light";
    } else if ($settings.mode === "schedule") {
      const [sH, sM] = $settings.schedule.darkStart.split(":").map(Number);
      const [eH, eM] = $settings.schedule.darkEnd.split(":").map(Number);
      const start = sH * 60 + sM;
      const end = eH * 60 + eM;
      let isDarkTime = false;
      if (start < end) {
        isDarkTime = $minutes >= start && $minutes < end;
      } else {
        isDarkTime = $minutes >= start || $minutes < end;
      }
      scheme = isDarkTime ? "dark" : "light";
    }
    const allThemes = [...BUILTIN_THEMES, ...$settings.customThemes];
    const activeTheme = allThemes.find((t) => t.id === $settings.activeThemeId) || DEFAULT_THEME;
    const palette = scheme === "dark" ? activeTheme.dark : activeTheme.light;
    const css = generateThemeCss(palette);
    return {
      scheme,
      activeTheme,
      palette,
      css
    };
  }
);
export {
  BUILTIN_THEMES as B,
  themeSettings as a,
  themeState as t
};
