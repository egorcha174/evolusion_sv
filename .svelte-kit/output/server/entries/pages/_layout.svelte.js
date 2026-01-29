import { s as store_get, a as attr_style, b as attr, c as attr_class, e as ensure_array_like, u as unsubscribe_stores, d as stringify, f as bind_props, g as store_mutate } from "../../chunks/index2.js";
import "clsx";
import { h as haStore, t as tabs, a as activeTabId, i as isEditMode, d as dashboardStore, b as appState, s as session, c as isSettingsOpen, e as extractDomain, f as isAddDeviceOpen, g as isThemeGeneratorOpen } from "../../chunks/store.js";
import { d as derived, w as writable, r as readable } from "../../chunks/index.js";
import { z } from "zod";
import { e as editorStore } from "../../chunks/store2.js";
import { a as addMessages, r as registerLocaleLoader, i as init, $ as $locale, b as $format, c as $isLoading } from "../../chunks/runtime.js";
import "iconify-icon";
import { e as escape_html } from "../../chunks/context.js";
import "hls.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { g as getIcon } from "../../chunks/icons.js";
const schemaVersion$5 = 1;
const manifest$5 = {
  name: "Apple Pro",
  version: "1.0.1",
  author: "Antigravity",
  description: "Professional minimalist theme inspired by Apple Home and macOS",
  generatedAt: "2026-01-28T23:05:00.000Z"
};
const theme$5 = {
  id: "apple-pro",
  name: "Apple Pro",
  isCustom: false,
  scheme: {
    light: {
      dashboardBackgroundType: "gradient",
      dashboardBackgroundColor1: "#F2F2F7",
      dashboardBackgroundColor2: "#FFFFFF",
      dashboardGradientAngle: 180,
      dashboardBackgroundImageBlur: 0,
      dashboardBackgroundImageBrightness: 100,
      bgSidebar: "rgba(255, 255, 255, 0.5)",
      sidebarOpacity: 0.8,
      bgHeader: "rgba(255, 255, 255, 0.5)",
      headerOpacity: 0.8,
      bgChip: "#E5E5EA",
      bgCardHover: "rgba(0,0,0,0.05)",
      bgInput: "#FFFFFF",
      bgDropdown: "#FFFFFF",
      bgPanel: "#FFFFFF",
      textPrimary: "#000000",
      textSecondary: "#3C3C43",
      textMuted: "#8E8E93",
      borderInput: "#C7C7CC",
      borderFocus: "#007AFF",
      borderDivider: "rgba(60, 60, 67, 0.18)",
      borderPrimary: "rgba(60, 60, 67, 0.18)",
      scrollbarThumb: "#C7C7CC",
      scrollbarTrack: "transparent",
      cardOpacity: 1,
      panelOpacity: 0.95,
      cardBorderRadius: 16,
      cardBorderWidth: 0,
      cardBorderColor: "transparent",
      cardBorderColorOn: "transparent",
      iconBackgroundShape: "circle",
      iconBackgroundColorOn: "#FF9F0A",
      iconBackgroundColorOff: "#E5E5EA",
      iconColorOn: "#FFFFFF",
      cardBackground: "#FFFFFF",
      cardBackgroundOn: "#FFFFFF",
      tabTextColor: "#8E8E93",
      activeTabTextColor: "#000000",
      tabIndicatorColor: "#000000",
      thermostatHandleColor: "#FFFFFF",
      thermostatDialTextColor: "#000000",
      thermostatDialLabelColor: "#8E8E93",
      thermostatHeatingColor: "#FF9500",
      thermostatCoolingColor: "#34C759",
      clockTextColor: "#000000",
      weatherPrimaryColor: "#000000",
      weatherSecondaryColor: "#8E8E93",
      weatherIconSize: 96,
      weatherForecastIconSize: 48,
      weatherCurrentTempFontSize: 36,
      weatherCurrentDescFontSize: 14,
      weatherForecastDayFontSize: 12,
      weatherForecastMaxTempFontSize: 18,
      weatherForecastMinTempFontSize: 14,
      nameTextColor: "#000000",
      statusTextColor: "#8E8E93",
      valueTextColor: "#000000",
      unitTextColor: "#8E8E93",
      nameTextColorOn: "#000000",
      statusTextColorOn: "#FF9F0A",
      valueTextColorOn: "#000000",
      unitTextColorOn: "#8E8E93"
    },
    dark: {
      dashboardBackgroundType: "gradient",
      dashboardBackgroundColor1: "#000000",
      dashboardBackgroundColor2: "#1C1C1E",
      dashboardGradientAngle: 180,
      dashboardBackgroundImageBlur: 0,
      dashboardBackgroundImageBrightness: 100,
      bgSidebar: "rgba(28, 28, 30, 0.6)",
      sidebarOpacity: 0.8,
      bgHeader: "rgba(28, 28, 30, 0.6)",
      headerOpacity: 0.8,
      bgChip: "#3A3A3C",
      bgCardHover: "rgba(255,255,255,0.1)",
      bgInput: "#1C1C1E",
      bgDropdown: "#2C2C2E",
      bgPanel: "#1C1C1E",
      textPrimary: "#FFFFFF",
      textSecondary: "#EBEBF5",
      textMuted: "#8E8E93",
      borderInput: "#3A3A3C",
      borderFocus: "#0A84FF",
      borderDivider: "rgba(84, 84, 88, 0.65)",
      borderPrimary: "rgba(84, 84, 88, 0.65)",
      scrollbarThumb: "#636366",
      scrollbarTrack: "transparent",
      cardOpacity: 0.8,
      panelOpacity: 0.8,
      cardBorderRadius: 16,
      cardBorderWidth: 0,
      cardBorderColor: "transparent",
      cardBorderColorOn: "transparent",
      iconBackgroundShape: "circle",
      iconBackgroundColorOn: "#FFD60A",
      iconBackgroundColorOff: "#3A3A3C",
      iconColorOn: "#000000",
      cardBackground: "#1C1C1E",
      cardBackgroundOn: "#2C2C2E",
      tabTextColor: "#8E8E93",
      activeTabTextColor: "#FFFFFF",
      tabIndicatorColor: "#FFFFFF",
      thermostatHandleColor: "#1C1C1E",
      thermostatDialTextColor: "#FFFFFF",
      thermostatDialLabelColor: "#8E8E93",
      thermostatHeatingColor: "#FF9F0A",
      thermostatCoolingColor: "#30D158",
      clockTextColor: "#FFFFFF",
      weatherPrimaryColor: "#FFFFFF",
      weatherSecondaryColor: "#8E8E93",
      weatherIconSize: 96,
      weatherForecastIconSize: 48,
      weatherCurrentTempFontSize: 36,
      weatherCurrentDescFontSize: 14,
      weatherForecastDayFontSize: 12,
      weatherForecastMaxTempFontSize: 18,
      weatherForecastMinTempFontSize: 14,
      nameTextColor: "#FFFFFF",
      statusTextColor: "#8E8E93",
      valueTextColor: "#FFFFFF",
      unitTextColor: "#8E8E93",
      nameTextColorOn: "#FFFFFF",
      statusTextColorOn: "#FFD60A",
      valueTextColorOn: "#FFFFFF",
      unitTextColorOn: "#8E8E93"
    }
  }
};
const isBuiltIn$5 = true;
const applePro = {
  schemaVersion: schemaVersion$5,
  manifest: manifest$5,
  theme: theme$5,
  isBuiltIn: isBuiltIn$5
};
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: applePro,
  isBuiltIn: isBuiltIn$5,
  manifest: manifest$5,
  schemaVersion: schemaVersion$5,
  theme: theme$5
}, Symbol.toStringTag, { value: "Module" }));
const schemaVersion$4 = 1;
const manifest$4 = {
  name: "Cyberpunk",
  version: "2.3.0",
  author: "Evolusion",
  description: "High contrast yellow and black. Strict monochrome + accent.",
  generatedAt: "2026-01-28T23:22:00.000Z"
};
const theme$4 = {
  id: "cyberpunk",
  name: "Cyberpunk",
  isCustom: false,
  scheme: {
    light: {
      dashboardBackgroundType: "color",
      dashboardBackgroundColor1: "#FFFFFF",
      bgSidebar: "#FFFFFF",
      sidebarOpacity: 1,
      bgHeader: "#FFFFFF",
      headerOpacity: 1,
      bgChip: "#f2f2f2",
      bgCardHover: "rgba(0,0,0,0.03)",
      bgDropdown: "#FFFFFF",
      bgInput: "#F2F2F2",
      bgPanel: "#FFFFFF",
      textPrimary: "#000000",
      textSecondary: "#333333",
      textMuted: "#666666",
      borderInput: "#ddd",
      borderFocus: "#000",
      borderDivider: "#ddd",
      borderPrimary: "#FCEE0A",
      scrollbarThumb: "#999",
      scrollbarTrack: "transparent",
      cardOpacity: 1,
      cardBorderRadius: 0,
      cardBorderWidth: 1,
      cardBorderColor: "#DDDDDD",
      cardBorderColorOn: "#FCEE0A",
      cardBackground: "#FFFFFF",
      cardBackgroundOn: "#FFFFFF",
      shadowCard: "none",
      panelOpacity: 1,
      tabTextColor: "#000000",
      activeTabTextColor: "#000000",
      tabIndicatorColor: "#FCEE0A",
      iconBackgroundShape: "square",
      iconBackgroundColorOn: "#FCEE0A",
      iconBackgroundColorOff: "#DDDDDD",
      iconColorOn: "#000000",
      nameTextColor: "#000000",
      statusTextColor: "#333333",
      valueTextColor: "#000000",
      unitTextColor: "#333333",
      nameTextColorOn: "#000000",
      statusTextColorOn: "#000000",
      valueTextColorOn: "#000000",
      unitTextColorOn: "#000000",
      clockTextColor: "#000000",
      weatherPrimaryColor: "#000000",
      weatherSecondaryColor: "#666666",
      thermostatHandleColor: "#000000",
      thermostatDialTextColor: "#000000",
      thermostatDialLabelColor: "#666666",
      thermostatHeatingColor: "#FCEE0A",
      thermostatCoolingColor: "#00F0FF",
      accentPrimary: "#FCEE0A",
      accentSecondary: "#00F0FF",
      accentError: "#FF3B30",
      accentSuccess: "#34C759",
      accentWarning: "#FF9500",
      accentInfo: "#00F0FF",
      widgetSwitchOn: "#34C759"
    },
    dark: {
      dashboardBackgroundType: "color",
      dashboardBackgroundColor1: "#050505",
      bgSidebar: "#000000",
      sidebarOpacity: 1,
      bgHeader: "#000000",
      headerOpacity: 1,
      bgChip: "#1a1a1a",
      bgCardHover: "rgba(252, 238, 10, 0.05)",
      bgDropdown: "#000000",
      bgInput: "#1a1a1a",
      bgPanel: "#000000",
      textPrimary: "#FCEE0A",
      textSecondary: "#AAAAAA",
      textMuted: "#666666",
      borderInput: "#333",
      borderFocus: "#fcee0a",
      borderDivider: "#333",
      borderPrimary: "#FCEE0A",
      scrollbarThumb: "#333",
      scrollbarTrack: "transparent",
      cardOpacity: 1,
      cardBorderRadius: 0,
      cardBorderWidth: 1,
      cardBorderColor: "#333333",
      cardBorderColorOn: "#FCEE0A",
      cardBackground: "#0A0A0A",
      cardBackgroundOn: "#0A0A0A",
      shadowCard: "0 0 0 1px rgba(252, 238, 10, 0.1)",
      panelOpacity: 1,
      tabTextColor: "#666666",
      activeTabTextColor: "#FCEE0A",
      tabIndicatorColor: "#FCEE0A",
      iconBackgroundShape: "square",
      iconBackgroundColorOn: "#FCEE0A",
      iconBackgroundColorOff: "#1a1a1a",
      iconColorOn: "#000000",
      nameTextColor: "#FCEE0A",
      statusTextColor: "#AAAAAA",
      valueTextColor: "#FCEE0A",
      unitTextColor: "#AAAAAA",
      nameTextColorOn: "#FCEE0A",
      statusTextColorOn: "#FFFFFF",
      valueTextColorOn: "#FCEE0A",
      unitTextColorOn: "#FCEE0A",
      clockTextColor: "#FCEE0A",
      weatherPrimaryColor: "#FCEE0A",
      weatherSecondaryColor: "#FFFFFF",
      thermostatHandleColor: "#FCEE0A",
      thermostatDialTextColor: "#FCEE0A",
      thermostatDialLabelColor: "#FFFFFF",
      thermostatHeatingColor: "#FCEE0A",
      thermostatCoolingColor: "#FCEE0A",
      accentPrimary: "#FCEE0A",
      accentSecondary: "#00F0FF",
      accentError: "#FF453A",
      accentSuccess: "#30D158",
      accentWarning: "#FF9500",
      accentInfo: "#00F0FF",
      widgetSwitchOn: "#30D158"
    }
  }
};
const isBuiltIn$4 = true;
const cyberpunk = {
  schemaVersion: schemaVersion$4,
  manifest: manifest$4,
  theme: theme$4,
  isBuiltIn: isBuiltIn$4
};
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: cyberpunk,
  isBuiltIn: isBuiltIn$4,
  manifest: manifest$4,
  schemaVersion: schemaVersion$4,
  theme: theme$4
}, Symbol.toStringTag, { value: "Module" }));
const schemaVersion$3 = 1;
const manifest$3 = {
  name: "Deep Space",
  version: "1.3.0",
  author: "Evolusion",
  description: "Futuristic HUD style. Dark blue with single Cyan accent.",
  generatedAt: "2026-01-28T23:25:00.000Z"
};
const theme$3 = {
  id: "deep-space",
  name: "Deep Space",
  isCustom: false,
  scheme: {
    dark: {
      dashboardBackgroundType: "gradient",
      dashboardBackgroundColor1: "#020408",
      dashboardBackgroundColor2: "#0A101F",
      dashboardGradientAngle: 160,
      bgSidebar: "#020408",
      sidebarOpacity: 0.8,
      bgHeader: "#0B1120",
      headerOpacity: 0.8,
      bgChip: "rgba(11, 17, 32, 0.8)",
      bgCardHover: "rgba(56, 189, 248, 0.05)",
      bgDropdown: "#020408",
      bgInput: "rgba(11, 17, 32, 0.8)",
      bgPanel: "rgba(11, 17, 32, 0.9)",
      textPrimary: "#E2E8F0",
      textSecondary: "#94A3B8",
      textMuted: "#64748B",
      borderInput: "rgba(56, 189, 248, 0.2)",
      borderFocus: "#00F2FF",
      borderDivider: "rgba(56, 189, 248, 0.1)",
      borderPrimary: "rgba(56, 189, 248, 0.2)",
      scrollbarThumb: "rgba(56, 189, 248, 0.3)",
      scrollbarTrack: "transparent",
      cardOpacity: 0.7,
      cardBorderRadius: 4,
      cardBorderWidth: 1,
      cardBorderColor: "rgba(56, 189, 248, 0.2)",
      cardBorderColorOn: "#00F2FF",
      cardBackground: "rgba(11, 17, 32, 0.8)",
      cardBackgroundOn: "rgba(11, 17, 32, 0.9)",
      shadowCard: "0 0 15px rgba(0, 242, 255, 0.05)",
      panelOpacity: 0.8,
      tabTextColor: "#64748B",
      activeTabTextColor: "#38BDF8",
      tabIndicatorColor: "#38BDF8",
      iconBackgroundShape: "square",
      iconBackgroundColorOn: "#00F2FF",
      iconBackgroundColorOff: "rgba(56, 189, 248, 0.1)",
      iconColorOn: "#000000",
      nameTextColor: "#E2E8F0",
      statusTextColor: "#94A3B8",
      valueTextColor: "#38BDF8",
      unitTextColor: "#38BDF8",
      nameTextColorOn: "#E2E8F0",
      statusTextColorOn: "#00F2FF",
      valueTextColorOn: "#00F2FF",
      unitTextColorOn: "#00F2FF",
      clockTextColor: "#38BDF8",
      weatherPrimaryColor: "#38BDF8",
      weatherSecondaryColor: "#94A3B8",
      thermostatHandleColor: "#0F172A",
      thermostatDialTextColor: "#38BDF8",
      thermostatDialLabelColor: "#64748B",
      thermostatHeatingColor: "#FF9F0A",
      thermostatCoolingColor: "#00F2FF",
      accentPrimary: "#00F2FF",
      accentError: "#FF453A",
      accentSuccess: "#30D158",
      accentWarning: "#FF9F0A",
      accentInfo: "#38BDF8",
      widgetSwitchOn: "#30D158"
    },
    light: {
      dashboardBackgroundType: "color",
      dashboardBackgroundColor1: "#F0F9FF",
      bgSidebar: "#F0F9FF",
      sidebarOpacity: 0.9,
      bgHeader: "#FFFFFF",
      headerOpacity: 0.9,
      bgChip: "#E0F2FE",
      bgCardHover: "rgba(2, 132, 199, 0.05)",
      bgDropdown: "#FFFFFF",
      bgInput: "#F0F9FF",
      bgPanel: "#FFFFFF",
      textPrimary: "#0F172A",
      textSecondary: "#64748B",
      textMuted: "#94A3B8",
      borderInput: "#BAE6FD",
      borderFocus: "#0284C7",
      borderDivider: "#BAE6FD",
      borderPrimary: "#BAE6FD",
      scrollbarThumb: "#7dd3fc",
      scrollbarTrack: "transparent",
      cardOpacity: 0.9,
      cardBorderRadius: 4,
      cardBorderWidth: 1,
      cardBorderColor: "#BAE6FD",
      cardBorderColorOn: "#0284C7",
      cardBackground: "#FFFFFF",
      cardBackgroundOn: "#E0F2FE",
      shadowCard: "0 2px 4px rgba(0,0,0,0.05)",
      panelOpacity: 0.9,
      tabTextColor: "#64748B",
      activeTabTextColor: "#0284C7",
      tabIndicatorColor: "#0284C7",
      iconBackgroundShape: "square",
      iconBackgroundColorOn: "#0284C7",
      iconBackgroundColorOff: "rgba(2, 132, 199, 0.05)",
      iconColorOn: "#FFFFFF",
      nameTextColor: "#0F172A",
      statusTextColor: "#64748B",
      valueTextColor: "#0284C7",
      unitTextColor: "#0284C7",
      nameTextColorOn: "#0C4A6E",
      statusTextColorOn: "#0284C7",
      valueTextColorOn: "#0284C7",
      unitTextColorOn: "#0284C7",
      clockTextColor: "#0284C7",
      weatherPrimaryColor: "#0284C7",
      weatherSecondaryColor: "#64748B",
      thermostatHandleColor: "#FFFFFF",
      thermostatDialTextColor: "#0284C7",
      thermostatDialLabelColor: "#64748B",
      thermostatHeatingColor: "#FF9500",
      thermostatCoolingColor: "#0284C7",
      accentPrimary: "#0284C7",
      accentError: "#FF3B30",
      accentSuccess: "#34C759",
      accentWarning: "#FF9500",
      accentInfo: "#0284C7",
      widgetSwitchOn: "#34C759"
    }
  }
};
const isBuiltIn$3 = true;
const deepSpace = {
  schemaVersion: schemaVersion$3,
  manifest: manifest$3,
  theme: theme$3,
  isBuiltIn: isBuiltIn$3
};
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: deepSpace,
  isBuiltIn: isBuiltIn$3,
  manifest: manifest$3,
  schemaVersion: schemaVersion$3,
  theme: theme$3
}, Symbol.toStringTag, { value: "Module" }));
const schemaVersion$2 = 1;
const manifest$2 = {
  name: "Fusion",
  version: "1.3.0",
  author: "Evolusion",
  description: "Vibrant purple gradient with balanced glassmorphism.",
  generatedAt: "2026-01-28T23:26:00.000Z"
};
const theme$2 = {
  id: "fusion",
  name: "Fusion",
  isCustom: false,
  scheme: {
    dark: {
      dashboardBackgroundType: "gradient",
      dashboardBackgroundColor1: "#4338ca",
      dashboardBackgroundColor2: "#db2777",
      dashboardGradientAngle: 135,
      bgSidebar: "#000000",
      sidebarOpacity: 0.2,
      bgHeader: "#000000",
      headerOpacity: 0.2,
      bgChip: "rgba(255,255,255,0.1)",
      bgCardHover: "rgba(255,255,255,0.05)",
      bgDropdown: "#28283C",
      bgInput: "rgba(255, 255, 255, 0.1)",
      bgPanel: "rgba(0, 0, 0, 0.3)",
      textPrimary: "#FFFFFF",
      textSecondary: "rgba(255, 255, 255, 0.7)",
      textMuted: "rgba(255, 255, 255, 0.5)",
      borderInput: "rgba(255,255,255,0.1)",
      borderFocus: "#ffffff",
      borderDivider: "rgba(255,255,255,0.1)",
      borderPrimary: "rgba(255,255,255,0.1)",
      scrollbarThumb: "rgba(255,255,255,0.2)",
      scrollbarTrack: "transparent",
      cardOpacity: 0.4,
      cardBorderRadius: 24,
      cardBorderWidth: 1,
      cardBorderColor: "rgba(255, 255, 255, 0.1)",
      cardBorderColorOn: "rgba(255, 255, 255, 0.5)",
      cardBackground: "rgba(40, 40, 60, 0.4)",
      cardBackgroundOn: "rgba(50, 50, 70, 0.6)",
      shadowCard: "0 8px 32px rgba(0, 0, 0, 0.2)",
      panelOpacity: 0.3,
      tabTextColor: "rgba(255, 255, 255, 0.6)",
      activeTabTextColor: "#FFFFFF",
      tabIndicatorColor: "#FFFFFF",
      iconBackgroundShape: "circle",
      iconBackgroundColorOn: "#FFFFFF",
      iconBackgroundColorOff: "rgba(0, 0, 0, 0.2)",
      iconColorOn: "#4338ca",
      nameTextColor: "#FFFFFF",
      statusTextColor: "rgba(255, 255, 255, 0.7)",
      valueTextColor: "#FFFFFF",
      unitTextColor: "rgba(255, 255, 255, 0.7)",
      nameTextColorOn: "#FFFFFF",
      statusTextColorOn: "#FFFFFF",
      valueTextColorOn: "#FFFFFF",
      unitTextColorOn: "#FFFFFF",
      clockTextColor: "#FFFFFF",
      weatherPrimaryColor: "#FFFFFF",
      weatherSecondaryColor: "rgba(255, 255, 255, 0.7)",
      thermostatHandleColor: "#FFFFFF",
      thermostatDialTextColor: "#FFFFFF",
      thermostatDialLabelColor: "rgba(255, 255, 255, 0.7)",
      thermostatHeatingColor: "#FFFFFF",
      thermostatCoolingColor: "#FFFFFF",
      accentPrimary: "#FFFFFF",
      accentError: "#FF453A",
      accentSuccess: "#30D158",
      accentWarning: "#FF9F0A",
      accentInfo: "#FFFFFF",
      widgetSwitchOn: "#30D158"
    },
    light: {
      dashboardBackgroundType: "gradient",
      dashboardBackgroundColor1: "#E0E7FF",
      dashboardBackgroundColor2: "#FAE8FF",
      dashboardGradientAngle: 135,
      bgSidebar: "#FFFFFF",
      sidebarOpacity: 0.6,
      bgHeader: "#FFFFFF",
      headerOpacity: 0.6,
      bgChip: "rgba(139, 92, 246, 0.1)",
      bgCardHover: "rgba(0,0,0,0.03)",
      bgDropdown: "#FFFFFF",
      bgInput: "rgba(255, 255, 255, 0.5)",
      bgPanel: "rgba(255, 255, 255, 0.6)",
      textPrimary: "#374151",
      textSecondary: "#6B7280",
      textMuted: "#9CA3AF",
      borderInput: "rgba(0,0,0,0.1)",
      borderFocus: "#8B5CF6",
      borderDivider: "rgba(0,0,0,0.05)",
      borderPrimary: "rgba(139, 92, 246, 0.1)",
      scrollbarThumb: "rgba(0,0,0,0.1)",
      scrollbarTrack: "transparent",
      cardOpacity: 0.5,
      cardBorderRadius: 24,
      cardBorderWidth: 0,
      cardBorderColor: "transparent",
      cardBorderColorOn: "#8B5CF6",
      cardBackground: "#FFFFFF",
      cardBackgroundOn: "#FFFFFF",
      shadowCard: "0 4px 16px rgba(139, 92, 246, 0.1)",
      panelOpacity: 0.6,
      tabTextColor: "#6B7280",
      activeTabTextColor: "#4F46E5",
      tabIndicatorColor: "#4F46E5",
      iconBackgroundShape: "circle",
      iconBackgroundColorOn: "#8B5CF6",
      iconBackgroundColorOff: "rgba(255, 255, 255, 0.5)",
      iconColorOn: "#FFFFFF",
      nameTextColor: "#374151",
      statusTextColor: "#6B7280",
      valueTextColor: "#4F46E5",
      unitTextColor: "#6B7280",
      nameTextColorOn: "#4338CA",
      statusTextColorOn: "#8B5CF6",
      valueTextColorOn: "#4F46E5",
      unitTextColorOn: "#4F46E5",
      clockTextColor: "#4F46E5",
      weatherPrimaryColor: "#4F46E5",
      weatherSecondaryColor: "#6B7280",
      thermostatHandleColor: "#FFFFFF",
      thermostatDialTextColor: "#4F46E5",
      thermostatDialLabelColor: "#6B7280",
      thermostatHeatingColor: "#8B5CF6",
      thermostatCoolingColor: "#3B82F6",
      accentPrimary: "#8B5CF6",
      accentError: "#EF4444",
      accentSuccess: "#34C759",
      accentWarning: "#F59E0B",
      accentInfo: "#3B82F6",
      widgetSwitchOn: "#34C759"
    }
  }
};
const isBuiltIn$2 = true;
const fusion = {
  schemaVersion: schemaVersion$2,
  manifest: manifest$2,
  theme: theme$2,
  isBuiltIn: isBuiltIn$2
};
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: fusion,
  isBuiltIn: isBuiltIn$2,
  manifest: manifest$2,
  schemaVersion: schemaVersion$2,
  theme: theme$2
}, Symbol.toStringTag, { value: "Module" }));
const schemaVersion$1 = 1;
const manifest$1 = {
  name: "Apple Depth",
  version: "2.1.0",
  author: "Antigravity",
  description: "Refined Apple-inspired theme with depth, gradients, and soft light effects",
  generatedAt: "2026-01-28T23:27:00.000Z"
};
const theme$1 = {
  id: "apple-depth",
  name: "Apple Depth",
  isCustom: false,
  scheme: {
    light: {
      dashboardBackgroundType: "gradient",
      dashboardBackgroundColor1: "#E9ECF2",
      dashboardBackgroundColor2: "#FDFDFE",
      dashboardGradientAngle: 135,
      bgSidebar: "rgba(233, 236, 242, 0.9)",
      sidebarOpacity: 0.9,
      bgHeader: "rgba(253, 253, 254, 0.9)",
      headerOpacity: 0.9,
      bgChip: "#FFFFFF",
      bgCardHover: "rgba(0,0,0,0.03)",
      bgDropdown: "#FFFFFF",
      bgInput: "#FFFFFF",
      bgPanel: "rgba(255, 255, 255, 0.9)",
      textPrimary: "#1C1C1E",
      textSecondary: "#7C7C80",
      textMuted: "#AEAEC0",
      borderInput: "#C7C7CC",
      borderFocus: "#0A84FF",
      borderDivider: "rgba(0,0,0,0.05)",
      borderPrimary: "rgba(10, 132, 255, 0.15)",
      scrollbarThumb: "#C7C7CC",
      scrollbarTrack: "transparent",
      cardOpacity: 0.85,
      cardBorderRadius: 20,
      cardBorderWidth: 1,
      cardBorderColor: "rgba(0,0,0,0.05)",
      cardBorderColorOn: "rgba(10,132,255,0.3)",
      cardBackground: "rgba(255,255,255,0.65)",
      cardBackgroundOn: "rgba(255,255,255,0.85)",
      shadowCard: "0 4px 12px rgba(0,0,0,0.05)",
      panelOpacity: 0.9,
      tabTextColor: "#7C7C80",
      activeTabTextColor: "#0A84FF",
      tabIndicatorColor: "#0A84FF",
      iconBackgroundShape: "circle",
      iconBackgroundColorOn: "#0A84FF",
      iconBackgroundColorOff: "rgba(240,240,245,0.8)",
      iconColorOn: "#FFFFFF",
      nameTextColor: "#1C1C1E",
      statusTextColor: "#7C7C80",
      valueTextColor: "#000000",
      unitTextColor: "#8A8A8E",
      nameTextColorOn: "#0A84FF",
      statusTextColorOn: "#0A84FF",
      valueTextColorOn: "#0A84FF",
      unitTextColorOn: "#0A84FF",
      clockTextColor: "#000000",
      weatherPrimaryColor: "#000000",
      weatherSecondaryColor: "#7C7C80",
      thermostatHandleColor: "#FFFFFF",
      thermostatDialTextColor: "#000000",
      thermostatDialLabelColor: "#8A8A8E",
      thermostatHeatingColor: "#FF9500",
      thermostatCoolingColor: "#0A84FF",
      accentPrimary: "#0A84FF",
      accentError: "#FF3B30",
      accentSuccess: "#34C759",
      accentWarning: "#FF9500",
      accentInfo: "#0A84FF",
      widgetSwitchOn: "#34C759"
    },
    dark: {
      dashboardBackgroundType: "gradient",
      dashboardBackgroundColor1: "#1C1C1E",
      dashboardBackgroundColor2: "#2C2C2E",
      dashboardGradientAngle: 145,
      bgSidebar: "#1C1C1E",
      sidebarOpacity: 0.85,
      bgHeader: "#2C2C2E",
      headerOpacity: 0.85,
      bgChip: "#3A3A3C",
      bgCardHover: "rgba(255,255,255,0.05)",
      bgDropdown: "#2C2C2E",
      bgInput: "#2C2C2E",
      bgPanel: "rgba(44, 44, 46, 0.85)",
      textPrimary: "#EBEBF5",
      textSecondary: "#8E8E93",
      textMuted: "#636366",
      borderInput: "#3A3A3C",
      borderFocus: "#0A84FF",
      borderDivider: "rgba(255,255,255,0.05)",
      borderPrimary: "rgba(10, 132, 255, 0.2)",
      scrollbarThumb: "#636366",
      scrollbarTrack: "transparent",
      cardOpacity: 0.8,
      cardBorderRadius: 20,
      cardBorderWidth: 1,
      cardBorderColor: "rgba(235,235,245,0.1)",
      cardBorderColorOn: "rgba(10,132,255,0.4)",
      cardBackground: "rgba(44,44,46,0.6)",
      cardBackgroundOn: "rgba(58,58,60,0.8)",
      shadowCard: "0 6px 20px rgba(0,0,0,0.4)",
      panelOpacity: 0.85,
      tabTextColor: "#8E8E93",
      activeTabTextColor: "#FFFFFF",
      tabIndicatorColor: "#0A84FF",
      iconBackgroundShape: "circle",
      iconBackgroundColorOn: "#0A84FF",
      iconBackgroundColorOff: "rgba(58,58,60,0.8)",
      iconColorOn: "#FFFFFF",
      nameTextColor: "#EBEBF5",
      statusTextColor: "#8E8E93",
      valueTextColor: "#FFFFFF",
      unitTextColor: "#8E8E93",
      nameTextColorOn: "#0A84FF",
      statusTextColorOn: "#0A84FF",
      valueTextColorOn: "#0A84FF",
      unitTextColorOn: "#0A84FF",
      clockTextColor: "#FFFFFF",
      weatherPrimaryColor: "#FFFFFF",
      weatherSecondaryColor: "#8E8E93",
      thermostatHandleColor: "#EBEBF5",
      thermostatDialTextColor: "#EBEBF5",
      thermostatDialLabelColor: "#8E8E93",
      thermostatHeatingColor: "#FF9F0A",
      thermostatCoolingColor: "#0A84FF",
      accentPrimary: "#0A84FF",
      accentError: "#FF453A",
      accentSuccess: "#30D158",
      accentWarning: "#FF9D0A",
      accentInfo: "#0A84FF",
      widgetSwitchOn: "#30D158"
    }
  }
};
const isBuiltIn$1 = true;
const inspiredByApple = {
  schemaVersion: schemaVersion$1,
  manifest: manifest$1,
  theme: theme$1,
  isBuiltIn: isBuiltIn$1
};
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: inspiredByApple,
  isBuiltIn: isBuiltIn$1,
  manifest: manifest$1,
  schemaVersion: schemaVersion$1,
  theme: theme$1
}, Symbol.toStringTag, { value: "Module" }));
const schemaVersion = 1;
const manifest = {
  id: "sunset-warm",
  name: "Sunset Warm",
  version: "1.3.0",
  author: "Evolusion",
  description: "Monochromatic warm tones. Orange accent on cream background.",
  isCustom: false
};
const theme = {
  id: "sunset-warm",
  name: "Sunset Warm",
  isCustom: false,
  scheme: {
    light: {
      dashboardBackgroundType: "gradient",
      dashboardBackgroundColor1: "#FFF3E0",
      dashboardBackgroundColor2: "#FFE0B2",
      dashboardGradientAngle: 45,
      bgSidebar: "#FFF3E0",
      sidebarOpacity: 0.8,
      bgHeader: "#FFFFFF",
      headerOpacity: 0.8,
      bgChip: "#fff8e1",
      bgCardHover: "rgba(0,0,0,0.03)",
      bgDropdown: "#FFFFFF",
      bgInput: "#FFFFFF",
      bgPanel: "rgba(255, 255, 255, 0.9)",
      textPrimary: "#3E2723",
      textSecondary: "#8D6E63",
      textMuted: "#D7CCC8",
      borderInput: "#ffe0b2",
      borderFocus: "#ff6d00",
      borderDivider: "rgba(0,0,0,0.06)",
      borderPrimary: "rgba(255, 109, 0, 0.2)",
      scrollbarThumb: "#ffcc80",
      scrollbarTrack: "transparent",
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
      tabTextColor: "#8D6E63",
      activeTabTextColor: "#E65100",
      tabIndicatorColor: "#FF6D00",
      iconBackgroundShape: "circle",
      iconBackgroundColorOn: "#FF6D00",
      iconBackgroundColorOff: "rgba(255, 109, 0, 0.1)",
      iconColorOn: "#FFFFFF",
      nameTextColor: "#3E2723",
      statusTextColor: "#8D6E63",
      valueTextColor: "#E65100",
      unitTextColor: "#8D6E63",
      nameTextColorOn: "#BF360C",
      statusTextColorOn: "#E65100",
      valueTextColorOn: "#BF360C",
      unitTextColorOn: "#E65100",
      clockTextColor: "#3E2723",
      weatherPrimaryColor: "#E65100",
      weatherSecondaryColor: "#8D6E63",
      thermostatHandleColor: "#FF6D00",
      thermostatDialTextColor: "#BF360C",
      thermostatDialLabelColor: "#8D6E63",
      thermostatHeatingColor: "#BF360C",
      thermostatCoolingColor: "#FF9800",
      accentPrimary: "#FF6D00",
      accentError: "#FF3B30",
      accentSuccess: "#34C759",
      accentWarning: "#FF9500",
      accentInfo: "#FF9800",
      widgetSwitchOn: "#34C759"
    },
    dark: {
      dashboardBackgroundType: "gradient",
      dashboardBackgroundColor1: "#212121",
      dashboardBackgroundColor2: "#3E2723",
      dashboardGradientAngle: 45,
      bgSidebar: "#212121",
      sidebarOpacity: 0.8,
      bgHeader: "#3E2723",
      headerOpacity: 0.8,
      bgChip: "#424242",
      bgCardHover: "rgba(255,255,255,0.05)",
      bgDropdown: "#3E2723",
      bgInput: "#212121",
      bgPanel: "rgba(62, 39, 35, 0.8)",
      textPrimary: "#FFF3E0",
      textSecondary: "#BCAAA4",
      textMuted: "#8D6E63",
      borderInput: "#3e2723",
      borderFocus: "#ffab40",
      borderDivider: "rgba(255,255,255,0.1)",
      borderPrimary: "rgba(255, 171, 64, 0.2)",
      scrollbarThumb: "#4e342e",
      scrollbarTrack: "transparent",
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
      tabTextColor: "#BCAAA4",
      activeTabTextColor: "#FFAB40",
      tabIndicatorColor: "#FFAB40",
      iconBackgroundShape: "circle",
      iconBackgroundColorOn: "#FFAB40",
      iconBackgroundColorOff: "rgba(255, 171, 64, 0.1)",
      iconColorOn: "#FFFFFF",
      nameTextColor: "#FFF3E0",
      statusTextColor: "#BCAAA4",
      valueTextColor: "#FFAB40",
      unitTextColor: "#BCAAA4",
      nameTextColorOn: "#FFAB40",
      statusTextColorOn: "#BCAAA4",
      valueTextColorOn: "#FFAB40",
      unitTextColorOn: "#BCAAA4",
      clockTextColor: "#FFF3E0",
      weatherPrimaryColor: "#FFAB40",
      weatherSecondaryColor: "#BCAAA4",
      thermostatHandleColor: "#FFAB40",
      thermostatDialTextColor: "#FFE0B2",
      thermostatDialLabelColor: "#BCAAA4",
      thermostatHeatingColor: "#FFAB40",
      thermostatCoolingColor: "#FFCC80",
      accentPrimary: "#FFAB40",
      accentError: "#FF453A",
      accentSuccess: "#30D158",
      accentWarning: "#FF9F0A",
      accentInfo: "#FFCC80",
      widgetSwitchOn: "#30D158"
    }
  }
};
const isBuiltIn = true;
const sunsetWarm = {
  schemaVersion,
  manifest,
  theme,
  isBuiltIn
};
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: sunsetWarm,
  isBuiltIn,
  manifest,
  schemaVersion,
  theme
}, Symbol.toStringTag, { value: "Module" }));
const FALLBACK_THEME = {
  schemaVersion: 1,
  manifest: {
    name: "Fallback",
    version: "0.0.0",
    author: "System",
    description: "Emergency fallback theme",
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  theme: {
    id: "default",
    name: "Default",
    isCustom: false,
    scheme: {
      light: {
        dashboardBackgroundType: "color",
        dashboardBackgroundColor1: "#f0f2f5",
        bgSidebar: "#f0f2f5",
        bgChip: "#e4e6eb",
        bgCardHover: "rgba(0,0,0,0.05)",
        borderInput: "#ccc",
        borderFocus: "#2196f3",
        borderDivider: "rgba(0,0,0,0.1)",
        scrollbarThumb: "#ccc",
        scrollbarTrack: "transparent",
        cardOpacity: 1,
        cardBorderRadius: 12,
        cardBorderWidth: 0,
        cardBorderColor: "transparent",
        cardBorderColorOn: "#2196f3",
        cardBackground: "#ffffff",
        cardBackgroundOn: "#ffffff",
        panelOpacity: 1,
        tabTextColor: "#65676b",
        activeTabTextColor: "#2196f3",
        tabIndicatorColor: "#2196f3",
        iconBackgroundShape: "circle",
        iconBackgroundColorOn: "#2196f3",
        iconBackgroundColorOff: "#e4e6eb",
        nameTextColor: "#1a1d21",
        statusTextColor: "#65676b",
        valueTextColor: "#2196f3",
        unitTextColor: "#65676b",
        nameTextColorOn: "#1a1d21",
        statusTextColorOn: "#2196f3",
        valueTextColorOn: "#2196f3",
        unitTextColorOn: "#2196f3",
        thermostatHandleColor: "#ffffff",
        thermostatDialTextColor: "#1a1d21",
        thermostatDialLabelColor: "#65676b",
        thermostatHeatingColor: "#f44336",
        thermostatCoolingColor: "#2196f3",
        clockTextColor: "#1a1d21",
        weatherPrimaryColor: "#1a1d21",
        weatherSecondaryColor: "#65676b",
        accentPrimary: "#2196f3",
        accentError: "#f44336",
        accentSuccess: "#4caf50",
        accentWarning: "#ff9800",
        accentInfo: "#03a9f4",
        widgetSwitchOn: "#4caf50"
      },
      dark: {
        dashboardBackgroundType: "color",
        dashboardBackgroundColor1: "#111315",
        bgSidebar: "#111315",
        bgChip: "#2d3035",
        bgCardHover: "rgba(255,255,255,0.05)",
        borderInput: "#3e4042",
        borderFocus: "#64b5f6",
        borderDivider: "rgba(255,255,255,0.1)",
        scrollbarThumb: "#555",
        scrollbarTrack: "transparent",
        cardOpacity: 1,
        cardBorderRadius: 12,
        cardBorderWidth: 0,
        cardBorderColor: "transparent",
        cardBorderColorOn: "#64b5f6",
        cardBackground: "#1e2023",
        cardBackgroundOn: "#1e2023",
        panelOpacity: 1,
        tabTextColor: "#b0b3b8",
        activeTabTextColor: "#64b5f6",
        tabIndicatorColor: "#64b5f6",
        iconBackgroundShape: "circle",
        iconBackgroundColorOn: "#64b5f6",
        iconBackgroundColorOff: "#2d3035",
        nameTextColor: "#e4e6eb",
        statusTextColor: "#b0b3b8",
        valueTextColor: "#64b5f6",
        unitTextColor: "#b0b3b8",
        nameTextColorOn: "#e4e6eb",
        statusTextColorOn: "#64b5f6",
        valueTextColorOn: "#64b5f6",
        unitTextColorOn: "#64b5f6",
        thermostatHandleColor: "#e4e6eb",
        thermostatDialTextColor: "#e4e6eb",
        thermostatDialLabelColor: "#b0b3b8",
        thermostatHeatingColor: "#e57373",
        thermostatCoolingColor: "#64b5f6",
        clockTextColor: "#e4e6eb",
        weatherPrimaryColor: "#e4e6eb",
        weatherSecondaryColor: "#b0b3b8",
        accentPrimary: "#64b5f6",
        accentError: "#e57373",
        accentSuccess: "#81c784",
        accentWarning: "#ffb74d",
        accentInfo: "#4fc3f7",
        widgetSwitchOn: "#81c784"
      }
    }
  }
};
const presetThemes = /* @__PURE__ */ Object.assign({ "./presets/apple-pro.json": __vite_glob_0_0, "./presets/cyberpunk.json": __vite_glob_0_1, "./presets/deep-space.json": __vite_glob_0_2, "./presets/fusion.json": __vite_glob_0_3, "./presets/inspired-by-apple.json": __vite_glob_0_4, "./presets/sunset-warm.json": __vite_glob_0_5 });
let loadedThemes = Object.values(presetThemes).map((m) => m.default).filter((t) => t && t.theme && t.theme.id && t.theme.scheme);
if (loadedThemes.length === 0) {
  console.warn("No valid theme presets found in src/themes/presets/*.json. Using fallback theme.");
  loadedThemes = [FALLBACK_THEME];
}
const builtInThemes = loadedThemes;
const defaultTheme = builtInThemes.find((t) => t.theme.id === "default") || builtInThemes[0];
const ColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgba?\(.+\)$|^transparent$/, "Invalid color format");
const ColorSchemeSchema = z.object({
  // Dashboard
  dashboardBackgroundType: z.enum(["color", "gradient", "image"]),
  dashboardBackgroundColor1: ColorSchema,
  dashboardBackgroundColor2: ColorSchema.optional(),
  dashboardGradientAngle: z.number().min(0).max(360).optional(),
  dashboardBackgroundImageUrl: z.string().optional(),
  dashboardBackgroundImageBlur: z.number().min(0).max(100).optional(),
  dashboardBackgroundImageBrightness: z.number().min(0).max(200).optional(),
  // Global UI
  bgSidebar: ColorSchema.optional().default("#f0f2f5"),
  sidebarOpacity: z.number().min(0).max(1).optional().default(1),
  bgChip: ColorSchema.optional().default("#e4e6eb"),
  bgCardHover: ColorSchema.optional().default("rgba(0,0,0,0.05)"),
  bgDropdown: ColorSchema.optional(),
  bgInput: ColorSchema.optional(),
  bgHeader: ColorSchema.optional(),
  headerOpacity: z.number().min(0).max(1).optional().default(1),
  borderInput: ColorSchema.optional().default("#ccc"),
  borderFocus: ColorSchema.optional().default("#2196f3"),
  borderDivider: ColorSchema.optional().default("rgba(0,0,0,0.1)"),
  scrollbarThumb: ColorSchema.optional().default("#ccc"),
  scrollbarTrack: ColorSchema.optional().default("transparent"),
  gridCellBg: ColorSchema.optional(),
  gridCellBorder: ColorSchema.optional(),
  // Card
  cardOpacity: z.number().min(0).max(1),
  cardBorderRadius: z.number().min(0),
  cardBorderWidth: z.number().min(0),
  cardBorderColor: ColorSchema,
  cardBorderColorOn: ColorSchema,
  cardBackground: ColorSchema,
  cardBackgroundOn: ColorSchema,
  shadowCard: z.string().optional(),
  // Panel
  panelOpacity: z.number().min(0).max(1),
  bgPanel: ColorSchema.optional(),
  // Tabs
  tabTextColor: ColorSchema,
  activeTabTextColor: ColorSchema,
  tabIndicatorColor: ColorSchema,
  // Icon
  iconBackgroundShape: z.enum(["circle", "rounded-square", "square"]),
  iconBackgroundColorOn: ColorSchema,
  iconBackgroundColorOff: ColorSchema,
  iconColorOn: ColorSchema.optional().default("#ffffff"),
  // Thermostat
  thermostatHandleColor: ColorSchema,
  thermostatDialTextColor: ColorSchema,
  thermostatDialLabelColor: ColorSchema,
  thermostatHeatingColor: ColorSchema,
  thermostatCoolingColor: ColorSchema,
  // Clock
  clockTextColor: ColorSchema,
  // Weather (Colors)
  weatherPrimaryColor: ColorSchema.optional().default("#000000"),
  weatherSecondaryColor: ColorSchema.optional().default("#888888"),
  // Widget Text
  nameTextColor: ColorSchema,
  statusTextColor: ColorSchema,
  valueTextColor: ColorSchema,
  unitTextColor: ColorSchema,
  nameTextColorOn: ColorSchema,
  statusTextColorOn: ColorSchema,
  valueTextColorOn: ColorSchema,
  unitTextColorOn: ColorSchema,
  // Accents
  accentPrimary: ColorSchema.optional(),
  accentSecondary: ColorSchema.optional(),
  accentError: ColorSchema.optional(),
  accentSuccess: ColorSchema.optional(),
  accentWarning: ColorSchema.optional(),
  accentInfo: ColorSchema.optional(),
  // Widgets
  widgetSwitchOn: ColorSchema.optional(),
  // Weather Sizes
  weatherIconSize: z.number().optional(),
  weatherForecastIconSize: z.number().optional(),
  weatherCurrentTempFontSize: z.number().optional(),
  weatherCurrentDescFontSize: z.number().optional(),
  weatherForecastDayFontSize: z.number().optional(),
  weatherForecastMaxTempFontSize: z.number().optional(),
  weatherForecastMinTempFontSize: z.number().optional()
});
const ThemeManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string(),
  author: z.string(),
  description: z.string(),
  generatedAt: z.string(),
  tags: z.array(z.string()).optional(),
  preview: z.string().optional()
});
const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  isCustom: z.boolean(),
  scheme: z.object({
    light: ColorSchemeSchema,
    dark: ColorSchemeSchema
  })
});
z.object({
  schemaVersion: z.number(),
  manifest: ThemeManifestSchema,
  theme: ThemeSchema
});
function loadUserThemes() {
  return [];
}
function upsertUserTheme(preset) {
  const themes = loadUserThemes();
  const index = themes.findIndex((t) => t.theme.id === preset.theme.id);
  if (index >= 0) {
    themes[index] = preset;
  } else {
    themes.push(preset);
  }
  return themes;
}
function deleteUserTheme(themeId) {
  let themes = loadUserThemes();
  themes = themes.filter((t) => t.theme.id !== themeId);
  return themes;
}
const systemPrefersDark = writable(false);
function createThemeStore() {
  const initialState2 = {
    themes: [...builtInThemes],
    activeThemeId: defaultTheme.theme.id,
    mode: "auto"
  };
  const { subscribe, set, update } = writable(initialState2);
  return {
    subscribe,
    init: () => {
      return;
    },
    setActiveTheme: (id) => {
      update((s) => {
        if (!s.themes.find((t) => t.theme.id === id)) return s;
        return { ...s, activeThemeId: id };
      });
    },
    setMode: (mode) => {
      update((s) => {
        return { ...s, mode };
      });
    },
    saveTheme: (themeFile) => {
      upsertUserTheme(themeFile);
      update((s) => {
        const themeMap = new Map(s.themes.map((t) => [t.theme.id, t]));
        themeMap.set(themeFile.theme.id, themeFile);
        return { ...s, themes: Array.from(themeMap.values()) };
      });
    },
    deleteTheme: (id) => {
      deleteUserTheme(id);
      update((s) => {
        const isBuiltIn2 = builtInThemes.some((b) => b.theme.id === id);
        let newThemes;
        if (isBuiltIn2) {
          const original = builtInThemes.find((b) => b.theme.id === id);
          newThemes = s.themes.map((t) => t.theme.id === id ? original : t);
        } else {
          newThemes = s.themes.filter((t) => t.theme.id !== id);
        }
        let newActive = s.activeThemeId;
        if (s.activeThemeId === id && !isBuiltIn2) {
          newActive = defaultTheme.theme.id;
        }
        return { ...s, themes: newThemes, activeThemeId: newActive };
      });
    }
  };
}
const themeStore = createThemeStore();
derived([themeStore, systemPrefersDark], ([$s, $sysDark]) => {
  const themeFile = $s.themes.find((t) => t.theme.id === $s.activeThemeId) || defaultTheme;
  if (!themeFile || !themeFile.theme || !themeFile.theme.scheme) {
    return defaultTheme.theme.scheme.light;
  }
  const isDark = $s.mode === "dark" || $s.mode === "auto" && $sysDark;
  return isDark ? themeFile.theme.scheme.dark : themeFile.theme.scheme.light;
});
const common = {
  ok: "ОК",
  cancel: "Отмена",
  save: "Сохранить",
  "delete": "Удалить",
  loading: "Загрузка...",
  error: "Ошибка",
  off: "Выкл",
  on: "Вкл",
  close: "Закрыть",
  unknown: "Неизвестно"
};
const dashboard = {
  title: "Дашборд",
  edit: "Редактировать",
  done: "Готово",
  noDevices: "Устройства не найдены.",
  noDevicesTab: "Устройства для «{tab}» не найдены.",
  addWidget: "Добавить виджет",
  layoutSaved: "Раскладка сохранена",
  menu: {
    renameTab: "Переименовать вкладку",
    addTab: "Добавить вкладку",
    clearTab: "Очистить вкладку",
    deleteTab: "Удалить вкладку",
    deleteCard: "Удалить карточку",
    duplicateCard: "Дублировать",
    moveCard: "Перенести на...",
    appearance: "Внешний вид",
    refresh: "Обновить страницу"
  },
  grid: {
    columns: "Колонки",
    rows: "Ряды",
    hint: "Тяните для перемещения. Тяните угол для изменения размера."
  }
};
const addDevice = {
  title: "Добавить устройство",
  search: "Поиск устройств...",
  all: "Все",
  added: "Добавлено",
  add: "Добавить"
};
const sidebar = {
  connected: "Подключено",
  connecting: "Подключение...",
  offline: "Оффлайн",
  camera: "Камера",
  cameraPlaceholder: "Видеопоток (TODO)",
  weather: "Погода",
  latency: "Задержка"
};
const cardSettings = {
  title: "Настройки карточки",
  template: "Шаблон",
  noTemplate: "(Без шаблона)",
  manageHint: "Используйте главное меню для создания или редактирования шаблонов."
};
const templates = {
  manager: {
    title: "Менеджер шаблонов",
    empty: "Шаблоны пока не созданы.",
    create: "Создать новый шаблон",
    confirmDelete: "Вы уверены, что хотите удалить этот шаблон?"
  },
  editor: {
    "new": "Новый шаблон",
    edit: "Редактировать шаблон",
    namePlaceholder: "Название шаблона",
    tabStyle: "Стиль",
    tabContent: "Контент",
    contentPlaceholder: "Редактор контента скоро появится...",
    importJson: "Импорт JSON",
    exportJson: "Экспорт JSON",
    alertName: "Пожалуйста, введите название шаблона",
    alertImport: "Ошибка импорта: "
  },
  style: {
    background: "Фон",
    type: "Тип",
    color: "Цвет",
    solid: "Сплошной цвет",
    transparent: "Прозрачный",
    opacity: "Прозрачность",
    effects: "Эффекты и отступы",
    shadow: "Тень",
    padding: "Отступ",
    shadowNone: "Нет",
    shadowSm: "Маленькая",
    shadowMd: "Средняя",
    shadowLg: "Большая",
    themeNote: "Границы и активное состояние управляются глобальной темой."
  }
};
const settings = {
  title: "Настройки",
  widgets: {
    title: "Виджеты",
    description: "Настройки часов и погоды",
    clock: "Часы",
    showDate: "Показывать дату",
    showSeconds: "Показывать секунды",
    weatherStyle: "Стиль погоды",
    iconSizeCurrent: "Размер иконки (Текущая)",
    tempSizeCurrent: "Размер температуры (Текущая)",
    iconSizeForecast: "Размер иконки (Прогноз)",
    tempSizeForecast: "Размер температуры (Прогноз)"
  },
  appearance: "Внешний вид",
  appearanceDesc: "Настройки темы и языка",
  language: "Язык",
  languageSelect: "Выберите язык",
  importLanguage: "Импорт языка (JSON)",
  exportLanguage: "Экспорт языка",
  backup: "Резервное копирование",
  backupDesc: "Сохраните все настройки в файл или восстановите их.",
  backupConfirm: "Это перезапишет ваши текущие настройки. Продолжить?",
  resetConfirm: "ОПАСНО: Это удалит все данные и сбросит приложение. Вы уверены?",
  dangerZone: "Опасная зона",
  importBtn: "Импорт настроек",
  exportBtn: "Экспорт настроек",
  connection: "Подключение",
  connectionDesc: "Управление подключением к серверу Home Assistant",
  notConnected: "Не подключено",
  manageServers: "Управление серверами",
  disconnect: "Отключить",
  confirmDisconnect: "Отключиться?",
  serverUrl: "URL сервера",
  token: "Токен доступа",
  tokenPlaceholder: "Вставьте долгосрочный токен",
  testConnection: "Проверить соединение",
  saveConfig: "Сохранить конфигурацию",
  security: {
    title: "Безопасность",
    description: "Управление безопасностью сеанса",
    newPin: "Новый PIN",
    updatePin: "Обновить PIN",
    pinTooShort: "PIN должен содержать минимум 4 цифры",
    confirmChange: "Вы уверены? Данные будут перезашифрованы.",
    success: "PIN успешно обновлен",
    error: "Ошибка обновления PIN",
    autoLogin: "Авто-вход (Небезопасно)",
    autoLoginDesc: "Сохраняет PIN локально для пропуска экрана блокировки. Не рекомендуется для общих устройств.",
    confirmPin: "Введите PIN для включения авто-входа:"
  },
  weather: "Погода",
  weatherDesc: "Настройка провайдера данных",
  weatherProvider: "Источник данных",
  weatherKey: "API Ключ",
  weatherKeyPlaceholder: "Вставьте API ключ",
  weatherShowForecast: "Показывать прогноз",
  forecast: {
    daysLabel: "Количество дней прогноза"
  },
  weatherLayout: "Ориентация прогноза",
  layoutVertical: "Вертикальная",
  layoutHorizontal: "Горизонтальная",
  weatherIconPack: "Набор иконок",
  useCustomLocation: "Использовать свои координаты",
  latitude: "Широта",
  longitude: "Долгота",
  locationFromHA: "Координаты из Home Assistant (zone.home):",
  updateWeather: "Обновить погоду",
  theme: "Тема оформления",
  themeMode: "Режим переключения",
  themeModeAuto: "Авто (как в системе)",
  themeModeDay: "Светлая",
  themeModeNight: "Тёмная",
  themeModeSchedule: "По расписанию",
  themeScheduleDay: "Начало дня",
  themeScheduleNight: "Начало ночи",
  themeSelect: "Выберите тему",
  themeCustom: "(Польз.)",
  importTheme: "Импорт темы",
  exportTheme: "Экспорт темы",
  reset: "Сбросить все настройки и данные",
  messages: {
    saveSuccess: "Настройки успешно сохранены",
    saveError: "Ошибка при сохранении",
    importSuccess: "Языковой пакет успешно импортирован",
    importError: "Ошибка импорта: неверный формат файла",
    connectionReady: "Готов к подключению",
    fillRequired: "Пожалуйста, заполните URL и Токен",
    confirmDisconnect: "Отключиться?"
  },
  serverManager: {
    savedServers: "Сохраненные серверы",
    title: "Управление серверами",
    description: "Выберите сервер для подключения или добавьте новый.",
    add: "Добавить сервер",
    edit: "Изменить сервер",
    name: "Название",
    url: "URL сервера",
    token: "Долгосрочный токен доступа",
    connect: "Подключить",
    validationError: "URL и Токен обязательны",
    deleteConfirm: "Удалить {name}?"
  },
  themeEditor: {
    title: "Редактор темы",
    namePlaceholder: "Название темы",
    nav: {
      main: "Главная",
      global_ui: "UI",
      cards: "Карточки",
      text: "Текст",
      widgets: "Виджеты"
    },
    labels: {
      bgType: "Тип фона",
      solid: "Сплошной",
      gradient: "Градиент",
      image: "Изображение",
      startColor: "Начальный цвет",
      endColor: "Конечный цвет",
      type: "Тип",
      angle: "Угол",
      blur: "Размытие",
      brightness: "Яркость",
      panelOpacity: "Прозрачность панели",
      panelBg: "Фон панели",
      appearance: "Внешний вид",
      cardBg: "Фон карточки",
      activeBg: "Активный фон",
      opacity: "Прозрачность",
      borders: "Границы",
      radius: "Скругление",
      width: "Толщина",
      color: "Цвет",
      activeBorder: "Активная граница",
      shadow: "Тень",
      shadowCss: "CSS тени",
      brandColors: "Брендовые цвета",
      primary: "Основной",
      secondary: "Вторичный",
      info: "Инфо",
      states: "Состояния",
      on: "Вкл",
      off: "Выкл",
      success: "Успех",
      warning: "Внимание",
      error: "Ошибка",
      typography: "Типографика",
      textPrimary: "Основной текст",
      textSecondary: "Вторичный текст",
      textMuted: "Приглушенный",
      cardTextIdle: "Текст карточки",
      cardTextActive: "Текст карточки (Актив)",
      deviceName: "Имя устройства",
      stateValue: "Значение",
      secondaryInfo: "Доп. инфо",
      sidebar: "Сайдбар",
      header: "Шапка",
      elements: "Элементы",
      chips: "Чипы / Кнопки",
      dropdowns: "Выпадающие меню",
      hover: "Эффект наведения",
      inputs: "Поля и Границы",
      inputBorder: "Граница поля",
      focusBorder: "Граница фокуса",
      dividers: "Разделители",
      scrollbars: "Скроллбары",
      thumb: "Бегунок",
      track: "Трек",
      cardsOpacity: "Прозрачность карточек",
      bgOff: "Фон (Выкл)",
      bgOn: "Фон (Вкл)",
      icons: "Иконки",
      shape: "Форма",
      iconBgOff: "Фон иконки (Выкл)",
      iconBgOn: "Фон иконки (Вкл)",
      iconSymbol: "Символ (Вкл)",
      textOff: "ТЕКСТ (ВЫКЛ)",
      textOn: "ТЕКСТ (ВКЛ)",
      unit: "Единица измерения",
      uiElements: "Элементы UI",
      tabTextInactive: "Текст вкладки (неактив.)",
      tabTextActive: "Текст вкладки (актив.)",
      tabIndicator: "Индикатор вкладки",
      thermostat: "Термостат",
      knob: "Ручка",
      targetText: "Текст цели",
      label: "Метка",
      heating: "Нагрев",
      cooling: "Охлаждение",
      clockText: "Цвет часов",
      weatherPrimary: "Основной (Темп/Иконка)",
      weatherSecondary: "Вторичный (Опис/Мин)"
    }
  }
};
const themeGenerator = {
  title: "Авто-генератор тем",
  btnOpen: "Авто-генерация",
  sectionIdentity: "Идентификация",
  sectionCore: "Ядро стиля",
  sectionSurfaces: "Поверхности",
  lblThemeId: "ID темы",
  lblThemeName: "Название",
  lblPrimaryColor: "Основной цвет",
  lblColorRole: "Использовать цвет как:",
  roleAccent: "Акцент",
  roleBg: "Фон",
  lblHarmony: "Гармония",
  lblRadius: "Скругление",
  lblCardOpacity: "Прозрачность карточек",
  lblPanelOpacity: "Прозрачность панелей",
  btnImport: "Импорт",
  btnExport: "Экспорт",
  btnCopy: "JSON в буфер",
  btnGenerate: "Создать и сохранить",
  previewLight: "Светлая",
  previewDark: "Тёмная",
  harmony: {
    monochromatic: "Монохромная",
    analogous: "Аналоговая",
    complementary: "Комплементарная",
    splitComplementary: "Раздельная",
    triadic: "Триада"
  },
  radius: {
    sharp: "Острые (4px)",
    standard: "Стандарт (12px)",
    soft: "Мягкие (24px)"
  }
};
const entities = {
  title: "Все сущности",
  search: "Поиск сущностей...",
  filterDomain: "Фильтр по домену",
  allDomains: "Все домены",
  showing: "{count, plural, one {Показана # сущность} few {Показано # сущности} many {Показано # сущностей} other {Показано # сущностей}}",
  noEntities: "Сущности не найдены. Проверьте настройки подключения.",
  loading: "Получение списка сущностей...",
  status: {
    unavailable: "Недоступно",
    unknown: "Неизвестно",
    offline: "Оффлайн"
  },
  domains: {
    light: "Свет",
    "switch": "Переключатели",
    sensor: "Сенсоры",
    binary_sensor: "Бинарные сенсоры",
    climate: "Климат",
    cover: "Шторы/Ворота",
    media_player: "Медиа",
    script: "Скрипты",
    automation: "Автоматизации",
    lock: "Замки"
  }
};
const weather = {
  status: {
    clear: "Ясно",
    fewClouds: "Малооблачно",
    partlyCloudy: "Переменная облачность",
    overcast: "Пасмурно",
    fog: "Туман",
    drizzle: "Морось",
    freezingDrizzle: "Ледяная морось",
    rain: "Дождь",
    heavyRain: "Сильный дождь",
    freezingRain: "Ледяной дождь",
    snow: "Снег",
    heavySnow: "Сильный снег",
    showers: "Ливень",
    snowShowers: "Снегопад",
    thunderstorm: "Гроза",
    thunderstormHail: "Гроза с градом",
    unknown: "Неизвестно"
  }
};
const ru = {
  common,
  dashboard,
  addDevice,
  sidebar,
  cardSettings,
  templates,
  settings,
  themeGenerator,
  entities,
  weather
};
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
addMessages("ru", ru);
registerLocaleLoader("en", () => import("../../chunks/en.js"));
registerLocaleLoader("ar", () => import("../../chunks/ar.js"));
["zh", "es", "de", "fr", "pt", "ja", "ko"].forEach((code) => {
  registerLocaleLoader(code, () => import("../../chunks/en.js"));
});
init({
  fallbackLocale: "ru",
  initialLocale: "ru"
});
async function setLocale(code) {
  $locale.set(code);
  currentLang.set(code);
}
const defaultSettings$1 = {
  provider: "openmeteo",
  useCustomLocation: false,
  refreshIntervalMinutes: 15,
  showForecast: true,
  forecastDays: 3,
  iconPack: "default",
  forecastLayout: "vertical",
  // Visual Defaults
  currentIconSize: 48,
  currentTempSize: 32,
  // px
  currentDescSize: 14,
  // px
  forecastIconSize: 24,
  forecastDaySize: 13,
  forecastTempSize: 14
};
const initialState = {
  current: null,
  isLoading: false,
  error: null
};
const weatherStore = writable(initialState);
const weatherSettings = writable(defaultSettings$1);
function BackgroundRenderer($$renderer) {
  $$renderer.push(`<div class="background-renderer svelte-wckzi8"></div>`);
}
const time = readable(/* @__PURE__ */ new Date(), (set) => {
  return;
});
derived(time, ($time) => {
  return $time.getHours() * 60 + $time.getMinutes();
});
derived(time, ($time) => {
  return $time.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  });
});
const defaultSettings = {
  showDate: true,
  showSeconds: false
};
function createClockStore() {
  const { subscribe, set, update } = writable(defaultSettings);
  return {
    subscribe,
    set,
    update,
    init: () => {
      return;
    }
  };
}
const clockSettings = createClockStore();
clockSettings.init();
function createCameraSettingsStore() {
  const initial = {
    selectedEntityId: null
  };
  const { subscribe, set, update } = writable(initial);
  return {
    subscribe,
    set: (settings2) => {
      set(settings2);
    },
    update: (updater) => {
      update((settings2) => {
        const newSettings = updater(settings2);
        return newSettings;
      });
    },
    selectCamera: (entityId) => {
      update((settings2) => ({ ...settings2, selectedEntityId: entityId }));
    }
  };
}
const cameraSettings = createCameraSettingsStore();
function WeatherWidget($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    function formatDay(date) {
      return date.toLocaleDateString(store_get($$store_subs ??= {}, "$locale", $locale) || "en", { weekday: "short" });
    }
    let styleVars = `
    --weather-icon-size: ${store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).currentIconSize}px;
    --weather-current-temp-font-size: ${store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).currentTempSize}px;
    --weather-current-desc-font-size: ${store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).currentDescSize}px;
    --weather-forecast-icon-size: ${store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastIconSize}px;
    --weather-forecast-day-font-size: ${store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastDaySize}px;
    --weather-forecast-max-temp-font-size: ${store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastTempSize}px;
    --weather-forecast-min-temp-font-size: ${Math.max(10, store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastTempSize - 2)}px;
  `;
    $$renderer2.push(`<div class="widget weather-widget svelte-ccpsd6"${attr_style(styleVars)}>`);
    if (store_get($$store_subs ??= {}, "$weatherStore", weatherStore).isLoading && !store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="spinner svelte-ccpsd6"></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$weatherStore", weatherStore).error) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="weather-error svelte-ccpsd6"><iconify-icon icon="mdi:cloud-off-outline" width="24" class="svelte-ccpsd6"></iconify-icon></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="current-weather svelte-ccpsd6"><div class="weather-icon svelte-ccpsd6"><iconify-icon${attr("icon", store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.icon)} class="svelte-ccpsd6"></iconify-icon></div> <div class="weather-info svelte-ccpsd6"><div class="temp svelte-ccpsd6">${escape_html(store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.temperature)}°</div> <div class="condition svelte-ccpsd6">${escape_html(store_get($$store_subs ??= {}, "$t", $format)(store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.condition))}</div></div></div> `);
          if (store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).showForecast && store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.forecast.length > 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div${attr_class("forecast-list svelte-ccpsd6", void 0, {
              "horizontal": store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastLayout === "horizontal"
            })}><!--[-->`);
            const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$weatherStore", weatherStore).current.forecast);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let day = each_array[$$index];
              $$renderer2.push(`<div class="forecast-item svelte-ccpsd6"><div class="forecast-day svelte-ccpsd6">${escape_html(formatDay(day.date))}</div> <div class="forecast-icon svelte-ccpsd6"><iconify-icon${attr("icon", day.icon)} class="svelte-ccpsd6"></iconify-icon></div> <div class="forecast-temp-stack svelte-ccpsd6"><span class="max svelte-ccpsd6">${escape_html(day.maxTemp)}°</span> <span class="min svelte-ccpsd6">${escape_html(day.minTemp)}°</span></div></div>`);
            }
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="current-weather svelte-ccpsd6"><div class="weather-icon svelte-ccpsd6"><iconify-icon icon="mdi:weather-partly-cloudy" class="svelte-ccpsd6"></iconify-icon></div> <div class="weather-info svelte-ccpsd6"><div class="temp svelte-ccpsd6">--°</div> <div class="condition svelte-ccpsd6">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.offline"))}</div></div></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function CameraWidget($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="camera-widget-container svelte-ol94yf">`);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="placeholder svelte-ol94yf"><iconify-icon icon="mdi:camera-off-outline" width="32"></iconify-icon> <span>No Camera Selected</span></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let width = 280;
    let isResizing = false;
    let isCollapsed = false;
    function getLatencyColor(ms) {
      if (ms === void 0) return "var(--text-muted)";
      if (ms < 50) return "var(--accent-success)";
      if (ms < 150) return "var(--accent-warning)";
      return "var(--accent-error)";
    }
    let timeStr = store_get($$store_subs ??= {}, "$time", time).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: store_get($$store_subs ??= {}, "$clockSettings", clockSettings).showSeconds ? "2-digit" : void 0
    });
    let dateStr = store_get($$store_subs ??= {}, "$time", time).toLocaleDateString(store_get($$store_subs ??= {}, "$locale", $locale) || "en", { weekday: "long", month: "short", day: "numeric" });
    store_get($$store_subs ??= {}, "$cameraSettings", cameraSettings).selectedEntityId ? store_get($$store_subs ??= {}, "$haStore", haStore).entities.find((e) => e.entity_id === store_get($$store_subs ??= {}, "$cameraSettings", cameraSettings).selectedEntityId) : void 0;
    $$renderer2.push(`<aside${attr_class("sidebar svelte-5d5q0c", void 0, { "collapsed": isCollapsed })}${attr_style(`width: ${stringify(width)}px`)}><div${attr_class("resize-handle svelte-5d5q0c", void 0, { "active": isResizing })}></div> <div class="sidebar-content svelte-5d5q0c"><div class="widget clock-widget svelte-5d5q0c"><div class="time svelte-5d5q0c">${escape_html(timeStr)}</div> `);
    if (store_get($$store_subs ??= {}, "$clockSettings", clockSettings).showDate) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="date svelte-5d5q0c">${escape_html(dateStr)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    WeatherWidget($$renderer2);
    $$renderer2.push(`<!----> <div class="widget camera-widget svelte-5d5q0c">`);
    CameraWidget($$renderer2);
    $$renderer2.push(`<!----></div> <div class="status-info svelte-5d5q0c"><div class="status-row svelte-5d5q0c">`);
    if (store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="status-dot connected svelte-5d5q0c"></div> <span class="status-text svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.connected"))}</span> `);
      if (store_get($$store_subs ??= {}, "$haStore", haStore).latency !== void 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="latency svelte-5d5q0c"${attr_style(`color: ${stringify(getLatencyColor(store_get($$store_subs ??= {}, "$haStore", haStore).latency))}`)}>(${escape_html(store_get($$store_subs ??= {}, "$haStore", haStore).latency)}ms)</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$haStore", haStore).isLoading) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="status-dot loading svelte-5d5q0c"></div> <span class="status-text svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.connecting"))}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="status-dot disconnected svelte-5d5q0c"></div> <span class="status-text svelte-5d5q0c">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("sidebar.offline"))}</span>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="sidebar-footer svelte-5d5q0c"><button class="footer-btn svelte-5d5q0c"${attr("title", store_get($$store_subs ??= {}, "$t", $format)("settings.title"))}><iconify-icon icon="mdi:cog" class="svelte-5d5q0c"></iconify-icon></button> <div class="divider svelte-5d5q0c"></div> <button class="footer-btn svelte-5d5q0c" title="Evolusion"><iconify-icon icon="mdi:information-outline" class="svelte-5d5q0c"></iconify-icon></button> <button class="footer-btn svelte-5d5q0c" id="collapse-btn" title="Collapse"><iconify-icon icon="mdi:chevron-left" class="svelte-5d5q0c"></iconify-icon></button></div></div></aside>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function DashboardHeader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<header class="dashboard-header svelte-1ra6ezt"><div class="header-left svelte-1ra6ezt"><button class="icon-btn mobile-only svelte-1ra6ezt"><iconify-icon icon="mdi:menu" width="24"></iconify-icon></button> <div class="logo svelte-1ra6ezt"><iconify-icon icon="mdi:home-assistant" width="24" class="logo-icon svelte-1ra6ezt"></iconify-icon></div> <nav class="desktop-tabs svelte-1ra6ezt"><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$tabs", tabs));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button${attr_class("tab-btn svelte-1ra6ezt", void 0, {
        "active": store_get($$store_subs ??= {}, "$activeTabId", activeTabId) === tab.id
      })}>${escape_html(tab.title)} `);
      if (store_get($$store_subs ??= {}, "$isEditMode", isEditMode)) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<iconify-icon icon="mdi:pencil" width="14" class="edit-icon"></iconify-icon>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$isEditMode", isEditMode)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="tab-btn add-btn svelte-1ra6ezt"${attr("title", store_get($$store_subs ??= {}, "$t", $format)("dashboard.menu.addTab"))}><iconify-icon icon="mdi:plus" width="20"></iconify-icon></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></nav></div> <div class="header-right svelte-1ra6ezt"><div class="menu-container svelte-1ra6ezt"><button class="icon-btn svelte-1ra6ezt"><iconify-icon icon="mdi:dots-vertical" width="24"></iconify-icon></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></header> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function createTemplateEditorStore() {
  const { subscribe, set, update } = writable({
    isDirty: false,
    selectedElementId: null,
    draggingId: null,
    dragStartX: 0,
    dragStartY: 0,
    elementStartX: 0,
    elementStartY: 0
  });
  return {
    subscribe,
    reset() {
      set({
        isDirty: false,
        selectedElementId: null,
        draggingId: null,
        dragStartX: 0,
        dragStartY: 0,
        elementStartX: 0,
        elementStartY: 0
      });
    },
    selectElement(id) {
      update((s) => ({ ...s, selectedElementId: id }));
    },
    startDrag(id, clientX, clientY, currentX, currentY) {
      update((s) => ({
        ...s,
        draggingId: id,
        selectedElementId: id,
        // Auto select on drag
        dragStartX: clientX,
        dragStartY: clientY,
        elementStartX: currentX,
        elementStartY: currentY
      }));
    },
    // Returns the new position delta to apply (does not mutate store state itself, UI handles it)
    getDragDelta(clientX, clientY) {
      return { x: clientX, y: clientY };
    },
    stopDrag() {
      update((s) => ({ ...s, draggingId: null }));
    }
  };
}
createTemplateEditorStore();
function TemplateManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let templates2 = Object.values(store_get($$store_subs ??= {}, "$dashboardStore", dashboardStore).templates);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->  <div class="manager-overlay svelte-yyyfhp"><div class="manager-modal svelte-yyyfhp"><header class="svelte-yyyfhp"><h3 class="svelte-yyyfhp">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("templates.manager.title"))}</h3> <button class="close-btn svelte-yyyfhp" type="button"><iconify-icon icon="mdi:close"></iconify-icon></button></header> <div class="content svelte-yyyfhp">`);
    if (templates2.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="empty svelte-yyyfhp">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("templates.manager.empty"))}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="list svelte-yyyfhp"><!--[-->`);
      const each_array = ensure_array_like(templates2);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let tpl = each_array[$$index];
        $$renderer2.push(`<div class="item svelte-yyyfhp"><div class="info svelte-yyyfhp"><span class="name svelte-yyyfhp">${escape_html(tpl.name)}</span> <span class="id svelte-yyyfhp">${escape_html(tpl.id.slice(0, 8))}...</span></div> <div class="actions svelte-yyyfhp"><button class="icon-btn svelte-yyyfhp"${attr("title", store_get($$store_subs ??= {}, "$t", $format)("templates.editor.edit"))} type="button"><iconify-icon icon="mdi:pencil"></iconify-icon></button> <button class="icon-btn danger svelte-yyyfhp"${attr("title", store_get($$store_subs ??= {}, "$t", $format)("common.delete"))} type="button"><iconify-icon icon="mdi:delete"></iconify-icon></button></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <footer class="svelte-yyyfhp"><button class="btn primary full svelte-yyyfhp" type="button"><iconify-icon icon="mdi:plus"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("templates.manager.create"))}</button></footer></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function usePersistedWidth(storageKey, defaultWidth, min = 300, max = 600) {
  let width = defaultWidth;
  let isResizing = false;
  function startResize(e) {
    e.preventDefault();
    isResizing = true;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }
  function handleMouseMove(e) {
    if (!isResizing) return;
    let newWidth;
    if (document.dir === "rtl") {
      newWidth = e.clientX;
    } else {
      newWidth = window.innerWidth - e.clientX;
    }
    if (newWidth < min) newWidth = min;
    if (newWidth > max) newWidth = max;
    if (newWidth > window.innerWidth - 50) newWidth = window.innerWidth - 50;
    width = newWidth;
  }
  function stopResize() {
    if (isResizing) {
      isResizing = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  }
  return {
    get width() {
      return width;
    },
    get isResizing() {
      return isResizing;
    },
    startResize
  };
}
function Section($$renderer, $$props) {
  let { title, description, initiallyOpen = false, children } = $$props;
  let isOpen = initiallyOpen;
  $$renderer.push(`<div${attr_class("settings-section svelte-1dxbddf", void 0, { "open": isOpen })}><button class="section-header svelte-1dxbddf" type="button"${attr("aria-expanded", isOpen)}><div class="header-content svelte-1dxbddf"><h3 class="svelte-1dxbddf">${escape_html(title)}</h3> `);
  if (description) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<p class="description svelte-1dxbddf">${escape_html(description)}</p>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--></div> <div class="chevron-wrapper svelte-1dxbddf"><div${attr_class("chevron svelte-1dxbddf", void 0, { "open": isOpen })}><iconify-icon icon="mdi:chevron-down" width="24"></iconify-icon></div></div></button> `);
  if (isOpen) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="section-body svelte-1dxbddf"><div class="body-inner svelte-1dxbddf">`);
    children?.($$renderer);
    $$renderer.push(`<!----></div></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--></div>`);
}
function ConnectionSettings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    Section($$renderer2, {
      title: store_get($$store_subs ??= {}, "$t", $format)("settings.connection"),
      description: store_get($$store_subs ??= {}, "$t", $format)("settings.connectionDesc"),
      children: ($$renderer3) => {
        if (store_get($$store_subs ??= {}, "$haStore", haStore).isConnected) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="connected-state svelte-719yky"><div class="server-info svelte-719yky"><div class="status-icon success svelte-719yky"><iconify-icon icon="mdi:home-assistant" width="32"></iconify-icon></div> <div class="server-details svelte-719yky"><div class="server-name svelte-719yky">${escape_html(store_get($$store_subs ??= {}, "$appState", appState).activeServer?.name || "Home Assistant")}</div> <div class="server-url svelte-719yky">${escape_html(store_get($$store_subs ??= {}, "$appState", appState).activeServer?.url)}</div></div></div> <div class="connected-actions svelte-719yky"><button class="btn danger outline full svelte-719yky">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.disconnect"))}</button></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="disconnected-state svelte-719yky"><div class="status-icon error svelte-719yky"><iconify-icon icon="mdi:alert-circle" width="24"></iconify-icon></div> <span>${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.notConnected"))}</span></div>`);
        }
        $$renderer3.push(`<!--]--> <div class="connection-actions svelte-719yky"><button class="btn secondary full svelte-719yky"><iconify-icon icon="mdi:server-network"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.manageServers"))}</button></div>`);
      }
    });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function LabeledInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      label,
      value = void 0,
      type = "text",
      placeholder = "",
      hint = "",
      disabled = false
    } = $$props;
    const id = "input-" + Math.random().toString(36).substr(2, 9);
    $$renderer2.push(`<div class="control-group svelte-2qmr6k"><label class="label svelte-2qmr6k"${attr("for", id)}>${escape_html(label)}</label> <input${attr("id", id)}${attr("type", type)}${attr("value", value)}${attr("placeholder", placeholder)}${attr("disabled", disabled, true)} class="input svelte-2qmr6k"/> `);
    if (hint) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="hint svelte-2qmr6k">${escape_html(hint)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value });
  });
}
function Switch($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { label, checked = void 0, disabled = false, onchange } = $$props;
    const id = "switch-" + Math.random().toString(36).substr(2, 9);
    $$renderer2.push(`<div class="control-group svelte-4hjkwz"><label class="label svelte-4hjkwz"${attr("for", id)}>${escape_html(label)}</label> <button${attr_class("switch svelte-4hjkwz", void 0, { "checked": checked })}${attr("disabled", disabled, true)} role="switch"${attr("aria-checked", checked)}${attr("id", id)}><div class="thumb svelte-4hjkwz"></div></button></div>`);
    bind_props($$props, { checked });
  });
}
function SecuritySettings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let newPin = "";
    let isProcessing = false;
    let confirmPin = "";
    let showConfirm = false;
    let confirmError = "";
    function handleAutoLoginChange(newChecked) {
      if (newChecked) {
        session.disableAutoLogin();
        showConfirm = true;
        confirmPin = "";
        confirmError = "";
      } else {
        session.disableAutoLogin();
        showConfirm = false;
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Section($$renderer3, {
        title: store_get($$store_subs ??= {}, "$t", $format)("settings.security.title"),
        description: store_get($$store_subs ??= {}, "$t", $format)("settings.security.description"),
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="security-panel svelte-144bfrw"><div class="auto-login-section">`);
          Switch($$renderer4, {
            label: store_get($$store_subs ??= {}, "$t", $format)("settings.security.autoLogin"),
            checked: store_get($$store_subs ??= {}, "$session", session).isAutoLogin,
            onchange: handleAutoLoginChange,
            disabled: showConfirm
          });
          $$renderer4.push(`<!----> <p class="hint svelte-144bfrw">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.security.autoLoginDesc"))}</p> `);
          if (showConfirm) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="confirm-box svelte-144bfrw"><p class="svelte-144bfrw">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.security.confirmPin"))}</p> <div class="row svelte-144bfrw"><input type="password"${attr("value", confirmPin)} placeholder="PIN" class="pin-input svelte-144bfrw"/> <button class="btn primary svelte-144bfrw"${attr("disabled", confirmPin.length < 4, true)}>${escape_html(store_get($$store_subs ??= {}, "$t", $format)("common.ok"))}</button> <button class="btn text svelte-144bfrw">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("common.cancel"))}</button></div> `);
            if (confirmError) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div class="error-inline svelte-144bfrw">${escape_html(confirmError)}</div>`);
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></div> <div class="divider svelte-144bfrw"></div> <div class="control-row svelte-144bfrw">`);
          LabeledInput($$renderer4, {
            label: store_get($$store_subs ??= {}, "$t", $format)("settings.security.newPin"),
            type: "password",
            placeholder: "****",
            disabled: isProcessing,
            get value() {
              return newPin;
            },
            set value($$value) {
              newPin = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="actions svelte-144bfrw"><button class="btn primary svelte-144bfrw"${attr("disabled", newPin.length < 4, true)}><iconify-icon icon="mdi:key-change"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.security.updatePin"))}</button></div> `);
          {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></div>`);
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function ColorPicker($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { value = void 0, label, onChange } = $$props;
    $$renderer2.push(`<div class="color-row svelte-8fxeaa">`);
    if (label) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="label svelte-8fxeaa">${escape_html(label)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="right-side svelte-8fxeaa"><span class="hex svelte-8fxeaa">${escape_html(value?.toUpperCase() || "#000000")}</span>  <div class="swatch-wrapper svelte-8fxeaa"><div class="swatch svelte-8fxeaa"${attr_style("", { "background-color": value })}></div> <input type="color"${attr("value", value)} class="hidden-input svelte-8fxeaa"/></div></div></div>`);
    bind_props($$props, { value });
  });
}
function hexToRgb(hex) {
  let c = hex.substring(1);
  if (c.length === 3) c = c.split("").map((char) => char + char).join("");
  const bigint = parseInt(c, 16);
  return {
    r: bigint >> 16 & 255,
    g: bigint >> 8 & 255,
    b: bigint & 255
  };
}
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
function toRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}
function hslToRgb({ h, s, l }) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p2, q2, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
      if (t < 1 / 2) return q2;
      if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
      return p2;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
function adjustHsl(hex, hDelta, sSet, lSet) {
  const rgb = hexToRgb(hex);
  let hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + hDelta) % 360;
  if (hsl.h < 0) hsl.h += 360;
  if (sSet !== null) hsl.s = sSet;
  if (lSet !== null) hsl.l = lSet;
  return rgbToHex(hslToRgb(hsl).r, hslToRgb(hsl).g, hslToRgb(hsl).b);
}
function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function getContrastText(bgHex) {
  return getLuminance(bgHex) > 0.5 ? "#000000" : "#FFFFFF";
}
function getRadius(preset) {
  switch (preset) {
    case "soft":
      return 24;
    case "sharp":
      return 4;
    case "standard":
    default:
      return 12;
  }
}
function getSecondaryColor(primary, rule) {
  switch (rule) {
    case "complementary":
      return adjustHsl(primary, 180, null, null);
    case "splitComplementary":
      return adjustHsl(primary, 150, null, null);
    case "triadic":
      return adjustHsl(primary, 120, null, null);
    case "analogous":
      return adjustHsl(primary, 30, null, null);
    case "monochromatic":
      return adjustHsl(primary, 0, null, 80);
    default:
      return primary;
  }
}
const ACCENTS_LIGHT = { error: "#EF4444", success: "#34C759", warning: "#F59E0B" };
const ACCENTS_DARK = { error: "#FF453A", success: "#30D158", warning: "#FF9F0A" };
function generateThemePreset(s) {
  const radius = getRadius(s.radius);
  let accentColor;
  let darkBg;
  let lightBg;
  if (s.colorRole === "background") {
    if (getLuminance(s.primary) < 0.5) {
      darkBg = s.primary;
      lightBg = adjustHsl(s.primary, 0, 10, 95);
    } else {
      lightBg = s.primary;
      darkBg = adjustHsl(s.primary, 0, 20, 10);
    }
    accentColor = getSecondaryColor(s.primary, s.harmony);
  } else {
    accentColor = s.primary;
    const secondary = getSecondaryColor(s.primary, s.harmony);
    darkBg = adjustHsl(secondary, 0, 30, 10);
    lightBg = adjustHsl(secondary, 0, 20, 95);
  }
  const darkBg2 = adjustHsl(darkBg, 10, null, null);
  const lightBg2 = adjustHsl(lightBg, 10, null, null);
  const darkCardBg = adjustHsl(darkBg, 0, null, getLuminance(darkBg) * 100 + 5);
  const lightCardBg = "#FFFFFF";
  const darkText = getContrastText(darkBg);
  const lightText = getContrastText(lightBg);
  const darkScheme = {
    dashboardBackgroundType: "gradient",
    dashboardBackgroundColor1: darkBg,
    dashboardBackgroundColor2: darkBg2,
    dashboardGradientAngle: 135,
    cardOpacity: s.cardOpacity,
    cardBorderRadius: radius,
    cardBorderWidth: 1,
    cardBorderColor: toRgba(darkText, 0.1),
    cardBorderColorOn: toRgba(accentColor, 0.5),
    cardBackground: toRgba(darkCardBg, 0.4),
    cardBackgroundOn: toRgba(darkCardBg, 0.6),
    shadowCard: "0 8px 32px rgba(0, 0, 0, 0.2)",
    panelOpacity: s.panelOpacity,
    bgPanel: toRgba(darkBg, 0.9),
    bgInput: toRgba(darkText, 0.1),
    bgHeader: darkBg,
    headerOpacity: 0.8,
    bgSidebar: darkBg,
    sidebarOpacity: 1,
    bgChip: toRgba(darkText, 0.1),
    bgCardHover: toRgba(darkText, 0.05),
    borderInput: toRgba(darkText, 0.1),
    borderFocus: accentColor,
    borderDivider: toRgba(darkText, 0.1),
    scrollbarThumb: toRgba(darkText, 0.2),
    scrollbarTrack: "transparent",
    tabTextColor: toRgba(darkText, 0.6),
    activeTabTextColor: accentColor,
    tabIndicatorColor: accentColor,
    iconBackgroundShape: "circle",
    iconBackgroundColorOn: accentColor,
    iconBackgroundColorOff: toRgba(darkText, 0.1),
    iconColorOn: getContrastText(accentColor),
    nameTextColor: darkText,
    statusTextColor: toRgba(darkText, 0.7),
    valueTextColor: accentColor,
    unitTextColor: toRgba(darkText, 0.7),
    nameTextColorOn: darkText,
    statusTextColorOn: accentColor,
    valueTextColorOn: accentColor,
    unitTextColorOn: accentColor,
    clockTextColor: darkText,
    weatherPrimaryColor: darkText,
    weatherSecondaryColor: toRgba(darkText, 0.7),
    thermostatHandleColor: darkText,
    thermostatDialTextColor: darkText,
    thermostatDialLabelColor: toRgba(darkText, 0.7),
    thermostatHeatingColor: accentColor,
    thermostatCoolingColor: accentColor,
    accentPrimary: accentColor,
    accentError: ACCENTS_DARK.error,
    accentSuccess: ACCENTS_DARK.success,
    accentWarning: ACCENTS_DARK.warning,
    accentInfo: accentColor,
    widgetSwitchOn: ACCENTS_DARK.success
  };
  const lightScheme = {
    dashboardBackgroundType: "gradient",
    dashboardBackgroundColor1: lightBg,
    dashboardBackgroundColor2: lightBg2,
    dashboardGradientAngle: 135,
    cardOpacity: s.cardOpacity,
    cardBorderRadius: radius,
    cardBorderWidth: 0,
    cardBorderColor: "transparent",
    cardBorderColorOn: accentColor,
    cardBackground: lightCardBg,
    cardBackgroundOn: lightCardBg,
    shadowCard: `0 4px 16px ${toRgba(accentColor, 0.15)}`,
    panelOpacity: s.panelOpacity,
    bgPanel: toRgba(lightBg, 0.9),
    bgInput: toRgba(lightText, 0.05),
    bgHeader: lightBg,
    headerOpacity: 0.8,
    bgSidebar: lightBg,
    sidebarOpacity: 1,
    bgChip: toRgba(accentColor, 0.1),
    bgCardHover: toRgba(lightText, 0.03),
    borderInput: toRgba(lightText, 0.1),
    borderFocus: accentColor,
    borderDivider: toRgba(lightText, 0.06),
    scrollbarThumb: toRgba(lightText, 0.2),
    scrollbarTrack: "transparent",
    tabTextColor: toRgba(lightText, 0.6),
    activeTabTextColor: accentColor,
    tabIndicatorColor: accentColor,
    iconBackgroundShape: "circle",
    iconBackgroundColorOn: accentColor,
    iconBackgroundColorOff: toRgba(lightText, 0.1),
    iconColorOn: getContrastText(accentColor),
    nameTextColor: lightText,
    statusTextColor: toRgba(lightText, 0.6),
    valueTextColor: accentColor,
    unitTextColor: toRgba(lightText, 0.6),
    nameTextColorOn: accentColor,
    statusTextColorOn: accentColor,
    valueTextColorOn: accentColor,
    unitTextColorOn: accentColor,
    clockTextColor: accentColor,
    weatherPrimaryColor: accentColor,
    weatherSecondaryColor: toRgba(lightText, 0.6),
    thermostatHandleColor: lightText,
    thermostatDialTextColor: accentColor,
    thermostatDialLabelColor: toRgba(lightText, 0.6),
    thermostatHeatingColor: accentColor,
    thermostatCoolingColor: accentColor,
    accentPrimary: accentColor,
    accentError: ACCENTS_LIGHT.error,
    accentSuccess: ACCENTS_LIGHT.success,
    accentWarning: ACCENTS_LIGHT.warning,
    accentInfo: accentColor,
    widgetSwitchOn: ACCENTS_LIGHT.success
  };
  return {
    schemaVersion: 1,
    manifest: {
      name: s.themeName,
      version: "1.0.0",
      author: "AutoGenerator",
      description: `Generated (${s.colorRole}) ${s.harmony}`,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    theme: {
      id: s.themeId,
      name: s.themeName,
      isCustom: true,
      scheme: {
        light: lightScheme,
        dark: darkScheme
      }
    }
  };
}
function validateBaseThemeSettings(s) {
  const result = { ok: true, errors: [], warnings: [] };
  if (!s.themeId || !/^[a-z0-9_]+$/.test(s.themeId)) {
    result.errors.push("Theme ID must use only lowercase letters, numbers, and underscores.");
  }
  if (!s.themeName || s.themeName.trim().length === 0) {
    result.errors.push("Theme Name is required.");
  }
  if (!/^#[0-9A-F]{6}$/i.test(s.primary)) {
    result.errors.push("Primary color must be a valid HEX code (e.g., #007AFF).");
  }
  if (s.cardOpacity < 0 || s.cardOpacity > 1) {
    result.warnings.push("Card opacity out of bounds, will be clamped.");
  }
  if (s.panelOpacity < 0 || s.panelOpacity > 1) {
    result.warnings.push("Panel opacity out of bounds, will be clamped.");
  }
  if (result.errors.length > 0) result.ok = false;
  return result;
}
function RangeInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      label,
      value = void 0,
      min = 0,
      max = 100,
      step = 1,
      unit = ""
    } = $$props;
    const id = "range-" + Math.random().toString(36).substr(2, 9);
    $$renderer2.push(`<div class="control-group svelte-1k5cbne"><div class="header svelte-1k5cbne"><label${attr("for", id)}>${escape_html(label)}</label> <span class="value svelte-1k5cbne">${escape_html(value)}${escape_html(unit)}</span></div> <input${attr("id", id)} type="range"${attr("value", value)}${attr("min", min)}${attr("max", max)}${attr("step", step)} class="range svelte-1k5cbne"/></div>`);
    bind_props($$props, { value });
  });
}
function ThemeAutoGenerator($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const presets = [
      {
        name: "Evolusion",
        primary: "#6366f1",
        harmony: "analogous",
        radius: "standard",
        role: "accent",
        themeId: "evolusion_std"
      },
      {
        name: "Cyberpunk",
        primary: "#00ff9d",
        harmony: "splitComplementary",
        radius: "sharp",
        role: "background",
        themeId: "cyber_neon"
      },
      {
        name: "Cozy",
        primary: "#eabe92",
        harmony: "analogous",
        radius: "soft",
        role: "background",
        themeId: "warm_cozy"
      },
      {
        name: "Deep Sea",
        primary: "#0ea5e9",
        harmony: "monochromatic",
        radius: "standard",
        role: "accent",
        themeId: "ocean_depths"
      },
      {
        name: "Forest",
        primary: "#10b981",
        harmony: "analogous",
        radius: "soft",
        role: "accent",
        themeId: "natural_forest"
      }
    ];
    let settings2 = {
      themeId: "my_auto_theme",
      themeName: "My Auto Theme",
      primary: "#6366f1",
      colorRole: "accent",
      // Default
      harmony: "analogous",
      radius: "standard",
      cardOpacity: 0.5,
      panelOpacity: 0.5
    };
    let previewMode = "dark";
    let validation = validateBaseThemeSettings(settings2);
    let previewTheme = generateThemePreset(settings2);
    let previewScheme = previewTheme.theme.scheme.dark;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="auto-gen-overlay svelte-1h7crtf"><div class="gen-window svelte-1h7crtf"><header class="gen-header svelte-1h7crtf"><h2 class="svelte-1h7crtf">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.title"))}</h2> <button class="close-btn svelte-1h7crtf"${attr("aria-label", store_get($$store_subs ??= {}, "$t", $format)("common.close"))}><iconify-icon icon="mdi:close"></iconify-icon></button></header> <div class="gen-body svelte-1h7crtf"><div class="controls-pane svelte-1h7crtf"><div class="inputs-scroll svelte-1h7crtf"><div class="section svelte-1h7crtf"><h3 class="svelte-1h7crtf">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.sectionPresets") || "Quick Vibes")}</h3> <div class="preset-grid svelte-1h7crtf"><!--[-->`);
      const each_array = ensure_array_like(presets);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let p = each_array[$$index];
        $$renderer3.push(`<button class="preset-card svelte-1h7crtf"${attr_style("", { "--p-color": p.primary })}><div class="p-preview svelte-1h7crtf"${attr_style("", { background: p.primary })}></div> <span class="p-name svelte-1h7crtf">${escape_html(p.name)}</span></button>`);
      }
      $$renderer3.push(`<!--]--></div></div> <div class="section svelte-1h7crtf"><h3 class="svelte-1h7crtf">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.sectionIdentity"))}</h3> `);
      LabeledInput($$renderer3, {
        label: store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.lblThemeId"),
        placeholder: "unique_id",
        get value() {
          return settings2.themeId;
        },
        set value($$value) {
          settings2.themeId = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      LabeledInput($$renderer3, {
        label: store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.lblThemeName"),
        placeholder: "Display Name",
        get value() {
          return settings2.themeName;
        },
        set value($$value) {
          settings2.themeName = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div class="section svelte-1h7crtf"><h3 class="svelte-1h7crtf">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.sectionCore"))}</h3> `);
      ColorPicker($$renderer3, {
        label: store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.lblPrimaryColor"),
        get value() {
          return settings2.primary;
        },
        set value($$value) {
          settings2.primary = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="control-group svelte-1h7crtf"><label class="svelte-1h7crtf">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.lblColorRole"))}</label> <div class="segmented-control svelte-1h7crtf"><button${attr_class("segment svelte-1h7crtf", void 0, { "active": settings2.colorRole === "accent" })}>${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.roleAccent"))} (10%)</button> <button${attr_class("segment svelte-1h7crtf", void 0, { "active": settings2.colorRole === "background" })}>${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.roleBg"))} (60%)</button></div></div> <div class="control-group svelte-1h7crtf"><label class="svelte-1h7crtf">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.lblHarmony"))}</label> `);
      $$renderer3.select(
        { value: settings2.harmony, class: "" },
        ($$renderer4) => {
          $$renderer4.option({ value: "monochromatic" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.harmony.monochromatic"))}`);
          });
          $$renderer4.option({ value: "analogous" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.harmony.analogous"))}`);
          });
          $$renderer4.option({ value: "complementary" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.harmony.complementary"))}`);
          });
          $$renderer4.option({ value: "splitComplementary" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.harmony.splitComplementary"))}`);
          });
          $$renderer4.option({ value: "triadic" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.harmony.triadic"))}`);
          });
        },
        "svelte-1h7crtf"
      );
      $$renderer3.push(`</div> <div class="control-group svelte-1h7crtf"><label class="svelte-1h7crtf">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.lblRadius"))}</label> `);
      $$renderer3.select(
        { value: settings2.radius, class: "" },
        ($$renderer4) => {
          $$renderer4.option({ value: "sharp" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.radius.sharp"))}`);
          });
          $$renderer4.option({ value: "standard" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.radius.standard"))}`);
          });
          $$renderer4.option({ value: "soft" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.radius.soft"))}`);
          });
        },
        "svelte-1h7crtf"
      );
      $$renderer3.push(`</div></div> <div class="section svelte-1h7crtf"><h3 class="svelte-1h7crtf">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.sectionSurfaces"))}</h3> `);
      RangeInput($$renderer3, {
        label: store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.lblCardOpacity"),
        min: 0,
        max: 1,
        step: 0.05,
        get value() {
          return settings2.cardOpacity;
        },
        set value($$value) {
          settings2.cardOpacity = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      RangeInput($$renderer3, {
        label: store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.lblPanelOpacity"),
        min: 0,
        max: 1,
        step: 0.05,
        get value() {
          return settings2.panelOpacity;
        },
        set value($$value) {
          settings2.panelOpacity = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div> <div class="actions svelte-1h7crtf"><input type="file" hidden="" id="import-file" accept=".json"/> <div class="row-grid svelte-1h7crtf"><button class="btn secondary svelte-1h7crtf"><iconify-icon icon="mdi:upload"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.btnImport"))}</button> <button class="btn secondary svelte-1h7crtf"><iconify-icon icon="mdi:download"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.btnExport"))}</button> <button class="btn secondary svelte-1h7crtf"><iconify-icon icon="mdi:code-json"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.btnCopy"))}</button></div> <button class="btn primary full svelte-1h7crtf"${attr("disabled", !validation.ok, true)}>${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.btnGenerate"))}</button> `);
      if (validation.errors.length > 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="validation-errors svelte-1h7crtf"><!--[-->`);
        const each_array_1 = ensure_array_like(validation.errors);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let err = each_array_1[$$index_1];
          $$renderer3.push(`<div class="err svelte-1h7crtf">${escape_html(err)}</div>`);
        }
        $$renderer3.push(`<!--]--></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div></div> <div class="preview-pane svelte-1h7crtf"><div class="preview-toolbar svelte-1h7crtf"><div class="segmented-control svelte-1h7crtf"><button${attr_class("segment svelte-1h7crtf", void 0, { "active": previewMode === "light" })}><iconify-icon icon="mdi:white-balance-sunny" width="16"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.previewLight"))}</button> <button${attr_class("segment svelte-1h7crtf", void 0, { "active": previewMode === "dark" })}><iconify-icon icon="mdi:weather-night" width="16"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.previewDark"))}</button></div></div> <div class="preview-canvas svelte-1h7crtf"${attr_style("", {
        background: previewScheme.dashboardBackgroundType === "gradient" ? `linear-gradient(${previewScheme.dashboardGradientAngle}deg, ${previewScheme.dashboardBackgroundColor1}, ${previewScheme.dashboardBackgroundColor2})` : previewScheme.dashboardBackgroundColor1
      })}><div class="preview-card svelte-1h7crtf"${attr_style("", {
        "background-color": previewScheme.cardBackground,
        "border-radius": `${stringify(previewScheme.cardBorderRadius)}px`,
        border: `${stringify(previewScheme.cardBorderWidth)}px solid ${stringify(previewScheme.cardBorderColor)}`,
        "box-shadow": previewScheme.shadowCard
      })}><div class="p-header svelte-1h7crtf"><div class="p-icon svelte-1h7crtf"${attr_style("", {
        color: previewScheme.statusTextColor,
        "background-color": previewScheme.iconBackgroundColorOff
      })}><iconify-icon icon="mdi:sofa" width="24"></iconify-icon></div> <div class="p-name svelte-1h7crtf"${attr_style("", { color: previewScheme.nameTextColor })}>Living Room</div></div> <div class="p-body svelte-1h7crtf"><div class="p-state svelte-1h7crtf"${attr_style("", { color: previewScheme.valueTextColor })}>Off</div></div></div> <div class="preview-card active svelte-1h7crtf"${attr_style("", {
        "background-color": previewScheme.cardBackgroundOn,
        "border-radius": `${stringify(previewScheme.cardBorderRadius)}px`,
        border: `${stringify(previewScheme.cardBorderWidth)}px solid ${stringify(previewScheme.cardBorderColorOn)}`,
        "box-shadow": previewScheme.shadowCard
      })}><div class="p-header svelte-1h7crtf"><div class="p-icon active svelte-1h7crtf"${attr_style("", {
        color: previewScheme.iconColorOn,
        "background-color": previewScheme.iconBackgroundColorOn
      })}><iconify-icon icon="mdi:lightbulb" width="24"></iconify-icon></div> <div class="p-name svelte-1h7crtf"${attr_style("", { color: previewScheme.nameTextColorOn })}>Ceiling Light</div></div> <div class="p-body svelte-1h7crtf"><div class="p-state svelte-1h7crtf"${attr_style("", { color: previewScheme.valueTextColorOn })}>100%</div> <div class="p-sub svelte-1h7crtf"${attr_style("", { color: previewScheme.unitTextColorOn })}>Brightness</div></div></div></div></div></div></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function ThemeSettings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    function isBuiltInID(id) {
      return builtInThemes.some((b) => b.theme.id === id);
    }
    Section($$renderer2, {
      title: store_get($$store_subs ??= {}, "$t", $format)("settings.appearance"),
      description: store_get($$store_subs ??= {}, "$t", $format)("settings.appearanceDesc"),
      initiallyOpen: true,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="control-row svelte-s5txyx"><label class="svelte-s5txyx">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.language"))} `);
        $$renderer3.select(
          {
            value: store_get($$store_subs ??= {}, "$currentLang", currentLang),
            onchange: (e) => setLocale(e.currentTarget.value),
            class: ""
          },
          ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$availableLanguages", availableLanguages));
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let lang = each_array[$$index];
              $$renderer4.option({ value: lang.code }, ($$renderer5) => {
                $$renderer5.push(`${escape_html(lang.name)}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          },
          "svelte-s5txyx"
        );
        $$renderer3.push(`</label></div> <div class="control-row svelte-s5txyx"><label class="svelte-s5txyx">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.themeMode"))} `);
        $$renderer3.select(
          {
            value: store_get($$store_subs ??= {}, "$themeStore", themeStore).mode,
            onchange: (e) => themeStore.setMode(e.currentTarget.value),
            class: ""
          },
          ($$renderer4) => {
            $$renderer4.option({ value: "auto" }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.themeModeAuto"))}`);
            });
            $$renderer4.option({ value: "light" }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.themeModeDay"))}`);
            });
            $$renderer4.option({ value: "dark" }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.themeModeNight"))}`);
            });
          },
          "svelte-s5txyx"
        );
        $$renderer3.push(`</label></div> <div class="theme-gallery-section svelte-s5txyx"><div class="section-header-row svelte-s5txyx"><div class="label svelte-s5txyx">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.theme"))}</div> <input type="file" hidden="" accept=".json"/></div> <div class="theme-grid svelte-s5txyx"><!--[-->`);
        const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$themeStore", themeStore).themes);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let theme2 = each_array_1[$$index_1];
          const isBuiltIn2 = isBuiltInID(theme2.theme.id);
          $$renderer3.push(`<div${attr_class("theme-card svelte-s5txyx", void 0, {
            "active": store_get($$store_subs ??= {}, "$themeStore", themeStore).activeThemeId === theme2.theme.id
          })}><div class="preview svelte-s5txyx"${attr_style("", {
            background: theme2.theme.scheme.light.dashboardBackgroundColor1
          })}><div class="mini-card svelte-s5txyx"${attr_style("", { background: theme2.theme.scheme.light.cardBackground })}></div> <div class="mini-accent svelte-s5txyx"${attr_style("", { background: theme2.theme.scheme.light.accentPrimary })}></div></div> <div class="meta svelte-s5txyx"><span class="name svelte-s5txyx">${escape_html(theme2.theme.name)} `);
          if (isBuiltIn2 && theme2.theme.isCustom) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<span class="edited-badge svelte-s5txyx">*</span>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></span> <div class="actions svelte-s5txyx"><button class="icon-btn small svelte-s5txyx"${attr("title", store_get($$store_subs ??= {}, "$t", $format)("settings.exportTheme"))}><iconify-icon icon="mdi:download"></iconify-icon></button> <button class="icon-btn small svelte-s5txyx" title="Edit"><iconify-icon icon="mdi:pencil"></iconify-icon></button> <button class="icon-btn small svelte-s5txyx" title="Copy"><iconify-icon icon="mdi:content-copy"></iconify-icon></button> `);
          if (theme2.theme.isCustom) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<button class="icon-btn small danger svelte-s5txyx"${attr("title", isBuiltIn2 ? "Reset" : "Delete")}><iconify-icon${attr("icon", isBuiltIn2 ? "mdi:refresh" : "mdi:delete")}></iconify-icon></button>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div></div></div>`);
        }
        $$renderer3.push(`<!--]--> <button class="theme-card create-btn highlight svelte-s5txyx"><iconify-icon icon="mdi:magic-staff" width="32"></iconify-icon> <span class="svelte-s5txyx">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("themeGenerator.btnOpen"))}</span></button> <button class="theme-card create-btn svelte-s5txyx"><iconify-icon icon="mdi:plus" width="32"></iconify-icon> <span class="svelte-s5txyx">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("templates.manager.create"))}</span></button> <button class="theme-card create-btn svelte-s5txyx"><iconify-icon icon="mdi:upload" width="32"></iconify-icon> <span class="svelte-s5txyx">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.importTheme"))}</span></button></div></div> `);
        {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function WidgetSettings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let cameraEntities = Array.from(store_get($$store_subs ??= {}, "$haStore", haStore).entities.values()).filter((e) => e.entity_id.startsWith("camera."));
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Section($$renderer3, {
        title: store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.title"),
        description: store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.description"),
        initiallyOpen: true,
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="subsection-title svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.camera"))}</div> <div class="control-row svelte-vcmda2"><label class="svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.cameraSelect"))} `);
          $$renderer4.select(
            {
              value: store_get($$store_subs ??= {}, "$cameraSettings", cameraSettings).selectedEntityId,
              class: ""
            },
            ($$renderer5) => {
              $$renderer5.option({ value: null }, ($$renderer6) => {
                $$renderer6.push(`-- ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.cameraNone"))} --`);
              });
              $$renderer5.push(`<!--[-->`);
              const each_array = ensure_array_like(cameraEntities);
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let entity = each_array[$$index];
                $$renderer5.option({ value: entity.entity_id }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(entity.attributes.friendly_name || entity.entity_id)}`);
                });
              }
              $$renderer5.push(`<!--]-->`);
            },
            "svelte-vcmda2"
          );
          $$renderer4.push(`</label></div> `);
          if (cameraEntities.length === 0) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<p class="note svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.noCameras"))}</p>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="divider svelte-vcmda2"></div> <div class="subsection-title svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.clock"))}</div> `);
          Switch($$renderer4, {
            label: store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.showDate"),
            get checked() {
              return store_get($$store_subs ??= {}, "$clockSettings", clockSettings).showDate;
            },
            set checked($$value) {
              store_mutate($$store_subs ??= {}, "$clockSettings", clockSettings, store_get($$store_subs ??= {}, "$clockSettings", clockSettings).showDate = $$value);
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          Switch($$renderer4, {
            label: store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.showSeconds"),
            get checked() {
              return store_get($$store_subs ??= {}, "$clockSettings", clockSettings).showSeconds;
            },
            set checked($$value) {
              store_mutate($$store_subs ??= {}, "$clockSettings", clockSettings, store_get($$store_subs ??= {}, "$clockSettings", clockSettings).showSeconds = $$value);
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="divider svelte-vcmda2"></div> <div class="subsection-title svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.weather"))}</div> <div class="control-row svelte-vcmda2"><label class="svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.weatherProvider"))} `);
          $$renderer4.select(
            {
              value: store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).provider,
              class: ""
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "openmeteo" }, ($$renderer6) => {
                $$renderer6.push(`Open-Meteo (Free)`);
              });
              $$renderer5.option({ value: "openweathermap" }, ($$renderer6) => {
                $$renderer6.push(`OpenWeatherMap`);
              });
              $$renderer5.option({ value: "weatherapi" }, ($$renderer6) => {
                $$renderer6.push(`WeatherAPI`);
              });
            },
            "svelte-vcmda2"
          );
          $$renderer4.push(`</label></div> `);
          if (store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).provider !== "openmeteo") {
            $$renderer4.push("<!--[-->");
            LabeledInput($$renderer4, {
              label: store_get($$store_subs ??= {}, "$t", $format)("settings.weatherKey"),
              type: "password",
              get value() {
                return store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).apiKey;
              },
              set value($$value) {
                store_mutate($$store_subs ??= {}, "$weatherSettings", weatherSettings, store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).apiKey = $$value);
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="control-row svelte-vcmda2"><label class="svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.weatherIconPack"))} `);
          $$renderer4.select(
            {
              value: store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).iconPack,
              class: ""
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "default" }, ($$renderer6) => {
                $$renderer6.push(`Default (Material)`);
              });
              $$renderer5.option({ value: "outline" }, ($$renderer6) => {
                $$renderer6.push(`Outline`);
              });
              $$renderer5.option({ value: "filled" }, ($$renderer6) => {
                $$renderer6.push(`Filled`);
              });
            },
            "svelte-vcmda2"
          );
          $$renderer4.push(`</label></div> `);
          Switch($$renderer4, {
            label: store_get($$store_subs ??= {}, "$t", $format)("settings.weatherShowForecast"),
            get checked() {
              return store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).showForecast;
            },
            set checked($$value) {
              store_mutate($$store_subs ??= {}, "$weatherSettings", weatherSettings, store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).showForecast = $$value);
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).showForecast) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div>`);
            RangeInput($$renderer4, {
              label: store_get($$store_subs ??= {}, "$t", $format)("settings.forecast.daysLabel"),
              min: 1,
              max: 7,
              get value() {
                return store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastDays;
              },
              set value($$value) {
                store_mutate($$store_subs ??= {}, "$weatherSettings", weatherSettings, store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastDays = $$value);
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> <div class="control-row svelte-vcmda2"><label class="svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.weatherLayout"))} `);
            $$renderer4.select(
              {
                value: store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastLayout,
                class: ""
              },
              ($$renderer5) => {
                $$renderer5.option({ value: "vertical" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.layoutVertical"))}`);
                });
                $$renderer5.option({ value: "horizontal" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.layoutHorizontal"))}`);
                });
              },
              "svelte-vcmda2"
            );
            $$renderer4.push(`</label></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="divider svelte-vcmda2"></div> <div class="subsection-title svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.weatherStyle"))}</div>  <div>`);
          RangeInput($$renderer4, {
            label: store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.iconSizeCurrent"),
            min: 24,
            max: 128,
            step: 4,
            unit: "px",
            get value() {
              return store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).currentIconSize;
            },
            set value($$value) {
              store_mutate($$store_subs ??= {}, "$weatherSettings", weatherSettings, store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).currentIconSize = $$value);
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RangeInput($$renderer4, {
            label: store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.tempSizeCurrent"),
            min: 16,
            max: 96,
            step: 2,
            unit: "px",
            get value() {
              return store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).currentTempSize;
            },
            set value($$value) {
              store_mutate($$store_subs ??= {}, "$weatherSettings", weatherSettings, store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).currentTempSize = $$value);
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).showForecast) {
            $$renderer4.push("<!--[-->");
            RangeInput($$renderer4, {
              label: store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.iconSizeForecast"),
              min: 12,
              max: 64,
              step: 2,
              unit: "px",
              get value() {
                return store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastIconSize;
              },
              set value($$value) {
                store_mutate($$store_subs ??= {}, "$weatherSettings", weatherSettings, store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastIconSize = $$value);
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            RangeInput($$renderer4, {
              label: store_get($$store_subs ??= {}, "$t", $format)("settings.widgets.tempSizeForecast"),
              min: 10,
              max: 32,
              step: 1,
              unit: "px",
              get value() {
                return store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastTempSize;
              },
              set value($$value) {
                store_mutate($$store_subs ??= {}, "$weatherSettings", weatherSettings, store_get($$store_subs ??= {}, "$weatherSettings", weatherSettings).forecastTempSize = $$value);
                $$settled = false;
              }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></div> <div class="actions svelte-vcmda2"><button class="btn secondary small svelte-vcmda2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.updateWeather"))}</button></div>`);
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function DataManagement($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    Section($$renderer2, {
      title: store_get($$store_subs ??= {}, "$t", $format)("settings.backup"),
      description: store_get($$store_subs ??= {}, "$t", $format)("settings.backupDesc"),
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="backup-actions svelte-xcm0t0"><button class="btn primary flex-grow svelte-xcm0t0"><iconify-icon icon="mdi:download"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.exportBtn"))}</button> <button class="btn secondary flex-grow svelte-xcm0t0"><iconify-icon icon="mdi:upload"></iconify-icon> ${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.importBtn"))}</button> <input type="file" hidden="" accept=".zip"/></div> <div class="danger-zone svelte-xcm0t0"><div class="dz-label svelte-xcm0t0">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.dangerZone"))}</div> <button class="btn danger outline full svelte-xcm0t0">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.reset"))}</button></div>`);
      }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function SettingsDrawer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const STORAGE_KEY_WIDTH = "evolusion_settings_width";
    const resizer = usePersistedWidth(STORAGE_KEY_WIDTH, 500);
    if (store_get($$store_subs ??= {}, "$isSettingsOpen", isSettingsOpen)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="backdrop svelte-1b8y9a2"></div> <aside class="settings-panel glass-panel svelte-1b8y9a2"${attr_style(`width: ${stringify(resizer.width)}px`)}><div${attr_class("resize-handle svelte-1b8y9a2", void 0, { "active": resizer.isResizing })}></div> <header class="panel-header svelte-1b8y9a2"><div class="header-content svelte-1b8y9a2"><h2 class="svelte-1b8y9a2">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("settings.title"))}</h2> <span class="version-badge svelte-1b8y9a2">v0.0.1</span></div> <button class="close-btn svelte-1b8y9a2" aria-label="Close settings"><iconify-icon icon="mdi:close" width="24"></iconify-icon></button></header> <div class="panel-content custom-scrollbar svelte-1b8y9a2"><div class="scroll-inner svelte-1b8y9a2">`);
      ConnectionSettings($$renderer2);
      $$renderer2.push(`<!----> `);
      SecuritySettings($$renderer2);
      $$renderer2.push(`<!----> `);
      ThemeSettings($$renderer2);
      $$renderer2.push(`<!----> `);
      WidgetSettings($$renderer2);
      $$renderer2.push(`<!----> `);
      DataManagement($$renderer2);
      $$renderer2.push(`<!----></div></div></aside>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function DeviceAddItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { device, isAdded } = $$props;
    let domain = extractDomain(device.entity_id);
    let icon = getIcon(domain);
    let name = device.attributes.friendly_name || device.entity_id;
    let stateLabel = (() => {
      if (device.state === "on") return store_get($$store_subs ??= {}, "$t", $format)("common.on");
      if (device.state === "off") return store_get($$store_subs ??= {}, "$t", $format)("common.off");
      return device.state;
    })();
    let isOn = device.state === "on" || device.state === "open" || device.state === "unlocked";
    let isUnavailable = device.state === "unavailable" || device.state === "unknown";
    $$renderer2.push(`<div${attr_class("device-item svelte-swyssn", void 0, { "added": isAdded })}><div${attr_class("icon-wrapper svelte-swyssn", void 0, { "active": isOn, "unavailable": isUnavailable })}><iconify-icon${attr("icon", icon)} width="24"></iconify-icon></div> <div class="info svelte-swyssn"><div class="name svelte-swyssn">${escape_html(name)}</div> <div class="meta svelte-swyssn"><span class="id svelte-swyssn">${escape_html(device.entity_id)}</span> <span class="separator svelte-swyssn">•</span> <span class="state svelte-swyssn">${escape_html(stateLabel)}</span></div></div> <button class="add-btn svelte-swyssn"${attr("disabled", isAdded, true)}${attr("aria-label", isAdded ? store_get($$store_subs ??= {}, "$t", $format)("addDevice.added") : store_get($$store_subs ??= {}, "$t", $format)("addDevice.add"))}>`);
    if (isAdded) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<iconify-icon icon="mdi:check"></iconify-icon>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<iconify-icon icon="mdi:plus"></iconify-icon>`);
    }
    $$renderer2.push(`<!--]--></button></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function DeviceAddDrawer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let searchQuery = "";
    let selectedDomain = null;
    const COMMON_DOMAINS = [
      { id: "light", icon: "mdi:lightbulb" },
      { id: "switch", icon: "mdi:toggle-switch" },
      { id: "sensor", icon: "mdi:eye" },
      { id: "binary_sensor", icon: "mdi:circle-slice-8" },
      { id: "climate", icon: "mdi:thermostat" },
      { id: "cover", icon: "mdi:window-shutter" },
      { id: "media_player", icon: "mdi:cast-connected" },
      { id: "script", icon: "mdi:script-text" }
    ];
    let existingIds = (() => {
      if (store_get($$store_subs ??= {}, "$isEditMode", isEditMode) && store_get($$store_subs ??= {}, "$editorStore", editorStore).enabled) {
        return new Set(store_get($$store_subs ??= {}, "$editorStore", editorStore).cardEntities.values());
      } else {
        const tab = store_get($$store_subs ??= {}, "$dashboardStore", dashboardStore).tabs[store_get($$store_subs ??= {}, "$activeTabId", activeTabId)];
        return new Set(tab?.cards.map((c) => c.entityId) || []);
      }
    })();
    let filteredDevices = (() => {
      const all = Array.from(store_get($$store_subs ??= {}, "$haStore", haStore).entities.values());
      const sorted = all.sort((a, b) => {
        if (a.state === "unavailable" && b.state !== "unavailable") return 1;
        if (a.state !== "unavailable" && b.state === "unavailable") return -1;
        const nameA = a.attributes.friendly_name || a.entity_id;
        const nameB = b.attributes.friendly_name || b.entity_id;
        return nameA.localeCompare(nameB);
      });
      return sorted.filter((e) => {
        const d = extractDomain(e.entity_id);
        {
          if (["zone", "sun", "person", "update"].includes(d)) return false;
        }
        return true;
      });
    })();
    if (store_get($$store_subs ??= {}, "$isAddDeviceOpen", isAddDeviceOpen)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="backdrop svelte-tqp8zd"></div> <aside class="add-drawer svelte-tqp8zd"><header class="drawer-header svelte-tqp8zd"><h2 class="svelte-tqp8zd">${escape_html(store_get($$store_subs ??= {}, "$t", $format)("addDevice.title"))}</h2> <button class="close-btn svelte-tqp8zd"><iconify-icon icon="mdi:close" width="24"></iconify-icon></button></header> <div class="search-section svelte-tqp8zd"><div class="search-box svelte-tqp8zd"><iconify-icon icon="mdi:magnify"></iconify-icon> <input type="text"${attr("value", searchQuery)}${attr("placeholder", store_get($$store_subs ??= {}, "$t", $format)("addDevice.search"))} class="svelte-tqp8zd"/> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="filters svelte-tqp8zd"><button${attr_class("pill svelte-tqp8zd", void 0, { "active": selectedDomain === null })}>${escape_html(store_get($$store_subs ??= {}, "$t", $format)("addDevice.all"))}</button> <!--[-->`);
      const each_array = ensure_array_like(COMMON_DOMAINS);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let d = each_array[$$index];
        $$renderer2.push(`<button${attr_class("pill svelte-tqp8zd", void 0, { "active": selectedDomain === d.id })}${attr("title", d.id)}><iconify-icon${attr("icon", d.icon)} class="svelte-tqp8zd"></iconify-icon> <span>${escape_html(store_get($$store_subs ??= {}, "$t", $format)(`entities.domains.${d.id}`) || d.id)}</span></button>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="device-list svelte-tqp8zd"><!--[-->`);
      const each_array_1 = ensure_array_like(filteredDevices);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let device = each_array_1[$$index_1];
        DeviceAddItem($$renderer2, {
          device,
          isAdded: existingIds.has(device.entity_id)
        });
      }
      $$renderer2.push(`<!--]--> `);
      if (filteredDevices.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty svelte-tqp8zd"><iconify-icon icon="mdi:package-variant-closed" width="48"></iconify-icon> <p>${escape_html(store_get($$store_subs ??= {}, "$t", $format)("entities.noEntities"))}</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></aside>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function PinScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let pin = "";
    let isLoading = false;
    let errorShake = false;
    let mode = store_get($$store_subs ??= {}, "$session", session).state === "setup" ? "create" : "unlock";
    let error = store_get($$store_subs ??= {}, "$session", session).error;
    $$renderer2.push(`<div class="pin-screen svelte-176h1px"><div${attr_class("card svelte-176h1px", void 0, { "shake": errorShake })}><div class="icon-wrapper svelte-176h1px"><iconify-icon icon="mdi:shield-lock" width="48" class="svelte-176h1px"></iconify-icon></div> <h2 class="svelte-176h1px">${escape_html(mode === "create" ? "Create PIN" : "Welcome Back")}</h2> <p class="subtitle svelte-176h1px">${escape_html(mode === "create" ? "Set a secure PIN to encrypt your data." : "Enter your PIN to unlock Evolusion.")}</p> <form class="svelte-176h1px"><div class="input-wrapper svelte-176h1px"><input type="password" inputmode="numeric" pattern="[0-9]*"${attr("value", pin)} placeholder="Enter PIN"${attr("disabled", isLoading, true)} autofocus class="svelte-176h1px"/></div> `);
    if (error) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="error-msg svelte-176h1px">${escape_html(error)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <button type="submit" class="btn-unlock svelte-176h1px"${attr("disabled", pin.length < 4, true)}>${escape_html(mode === "create" ? "Set PIN" : "Unlock")}</button></form></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    let isSessionActive = store_get($$store_subs ??= {}, "$session", session).state === "active";
    let isSessionLoading = store_get($$store_subs ??= {}, "$session", session).state === "loading";
    BackgroundRenderer($$renderer2);
    $$renderer2.push(`<!----> `);
    if (store_get($$store_subs ??= {}, "$isLoading", $isLoading) && true || isSessionLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading-screen svelte-12qhfyh"><div class="spinner svelte-12qhfyh"></div> <p>Loading Evolusion...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (!isSessionActive) {
        $$renderer2.push("<!--[-->");
        PinScreen($$renderer2);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="layout-container svelte-12qhfyh">`);
        Sidebar($$renderer2);
        $$renderer2.push(`<!----> <div class="main-content svelte-12qhfyh">`);
        DashboardHeader($$renderer2);
        $$renderer2.push(`<!----> <main class="svelte-12qhfyh">`);
        children($$renderer2);
        $$renderer2.push(`<!----></main></div></div> `);
        SettingsDrawer($$renderer2);
        $$renderer2.push(`<!----> `);
        DeviceAddDrawer($$renderer2);
        $$renderer2.push(`<!----> `);
        if (store_get($$store_subs ??= {}, "$isThemeGeneratorOpen", isThemeGeneratorOpen)) {
          $$renderer2.push("<!--[-->");
          ThemeAutoGenerator($$renderer2);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$editorStore", editorStore).isTemplateManagerOpen) {
          $$renderer2.push("<!--[-->");
          TemplateManager($$renderer2);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
