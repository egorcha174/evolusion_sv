
import type { ThemeFile } from './types';

// 1. Default (Apple Home Style)
export const defaultTheme: ThemeFile = {
  schemaVersion: 1,
  manifest: {
    name: "Default",
    version: "2.0.0",
    author: "Evolusion",
    description: "Clean style inspired by Apple Home.",
    generatedAt: new Date().toISOString()
  },
  theme: {
    id: "default",
    name: "Default",
    isCustom: false,
    scheme: {
      light: {
        dashboardBackgroundType: "color",
        dashboardBackgroundColor1: "#F2F2F7", // System Gray 6
        dashboardGradientAngle: 135,
        
        cardOpacity: 1,
        cardBorderRadius: 16,
        cardBorderWidth: 0,
        cardBorderColor: "transparent",
        cardBorderColorOn: "#FF9F0A",
        cardBackground: "#FFFFFF",
        cardBackgroundOn: "#FFFFFF",
        shadowCard: "0 2px 8px rgba(0,0,0,0.04)",
        
        panelOpacity: 0.9,
        
        tabTextColor: "#8E8E93",
        activeTabTextColor: "#1C1C1E",
        tabIndicatorColor: "#FF9F0A", // Orange
        
        iconBackgroundShape: "circle",
        iconBackgroundColorOn: "#FF9F0A",
        iconBackgroundColorOff: "rgba(0, 0, 0, 0.05)",
        
        nameTextColor: "#1C1C1E",
        statusTextColor: "#8E8E93",
        valueTextColor: "#1C1C1E",
        unitTextColor: "#8E8E93",
        nameTextColorOn: "#1C1C1E",
        statusTextColorOn: "#FF9F0A",
        valueTextColorOn: "#1C1C1E",
        unitTextColorOn: "#1C1C1E",
        
        thermostatHandleColor: "#FFFFFF",
        thermostatDialTextColor: "#1C1C1E",
        thermostatDialLabelColor: "#8E8E93",
        thermostatHeatingColor: "#FF9F0A",
        thermostatCoolingColor: "#0A84FF",
        
        clockTextColor: "#1C1C1E",
        weatherPrimaryColor: "#1C1C1E",
        weatherSecondaryColor: "#8E8E93",
        
        accentPrimary: "#FF9F0A",
        accentSecondary: "#8E8E93",
        accentError: "#FF3B30",
        accentSuccess: "#34C759",
        accentWarning: "#FF9F0A",
        accentInfo: "#0A84FF",
        widgetSwitchOn: "#34C759"
      },
      dark: {
        dashboardBackgroundType: "color",
        dashboardBackgroundColor1: "#000000",
        dashboardGradientAngle: 135,
        
        cardOpacity: 1,
        cardBorderRadius: 16,
        cardBorderWidth: 0,
        cardBorderColor: "transparent",
        cardBorderColorOn: "#FF9F0A",
        cardBackground: "#1C1C1E",
        cardBackgroundOn: "#1C1C1E",
        shadowCard: "0 2px 8px rgba(0,0,0,0.2)",
        
        panelOpacity: 0.9,
        
        tabTextColor: "#8E8E93",
        activeTabTextColor: "#FFFFFF",
        tabIndicatorColor: "#FF9F0A",
        
        iconBackgroundShape: "circle",
        iconBackgroundColorOn: "#FF9F0A",
        iconBackgroundColorOff: "rgba(255, 255, 255, 0.1)",
        
        nameTextColor: "#FFFFFF",
        statusTextColor: "#8E8E93",
        valueTextColor: "#FFFFFF",
        unitTextColor: "#8E8E93",
        nameTextColorOn: "#FFFFFF",
        statusTextColorOn: "#FF9F0A",
        valueTextColorOn: "#FFFFFF",
        unitTextColorOn: "#FFFFFF",
        
        thermostatHandleColor: "#FFFFFF",
        thermostatDialTextColor: "#FFFFFF",
        thermostatDialLabelColor: "#8E8E93",
        thermostatHeatingColor: "#FF9F0A",
        thermostatCoolingColor: "#0A84FF",
        
        clockTextColor: "#FFFFFF",
        weatherPrimaryColor: "#FFFFFF",
        weatherSecondaryColor: "#8E8E93",
        
        accentPrimary: "#FF9F0A",
        accentSecondary: "#8E8E93",
        accentError: "#FF453A",
        accentSuccess: "#30D158",
        accentWarning: "#FFD60A",
        accentInfo: "#0A84FF",
        widgetSwitchOn: "#30D158"
      }
    }
  }
};

// 2. Deep Space (Sci-Fi / Universe)
export const deepSpaceTheme: ThemeFile = {
  schemaVersion: 1,
  manifest: {
    name: "Deep Space",
    version: "1.0.0",
    author: "Evolusion",
    description: "Futuristic HUD style inspired by the cosmos.",
    generatedAt: new Date().toISOString()
  },
  theme: {
    id: "deep-space",
    name: "Deep Space",
    isCustom: false,
    scheme: {
      dark: {
        dashboardBackgroundType: "gradient",
        dashboardBackgroundColor1: "#020408",
        dashboardBackgroundColor2: "#0A101F",
        dashboardGradientAngle: 160,
        
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
        thermostatHeatingColor: "#F43F5E",
        thermostatCoolingColor: "#00F2FF",
        
        accentPrimary: "#00F2FF",
        accentError: "#F43F5E",
        accentSuccess: "#10B981",
        accentWarning: "#F59E0B",
        accentInfo: "#38BDF8",
        widgetSwitchOn: "#00F2FF"
      },
      light: {
        // Fallback light mode (High Tech White)
        dashboardBackgroundType: "color",
        dashboardBackgroundColor1: "#F0F9FF",
        
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
        thermostatHeatingColor: "#E11D48",
        thermostatCoolingColor: "#0284C7",
        
        accentPrimary: "#0284C7",
        accentError: "#E11D48",
        accentSuccess: "#059669",
        accentWarning: "#D97706",
        accentInfo: "#0284C7",
        widgetSwitchOn: "#0284C7"
      }
    }
  }
};

// 3. Fusion (Vibrant Gradients)
export const fusionTheme: ThemeFile = {
  schemaVersion: 1,
  manifest: {
    name: "Fusion",
    version: "1.0.0",
    author: "Evolusion",
    description: "Vibrant gradients and glassmorphism.",
    generatedAt: new Date().toISOString()
  },
  theme: {
    id: "fusion",
    name: "Fusion",
    isCustom: false,
    scheme: {
      dark: {
        dashboardBackgroundType: "gradient",
        dashboardBackgroundColor1: "#4338ca", // Indigo
        dashboardBackgroundColor2: "#db2777", // Pink
        dashboardGradientAngle: 135,
        
        cardOpacity: 0.2, // Glass
        cardBorderRadius: 24,
        cardBorderWidth: 1,
        cardBorderColor: "rgba(255, 255, 255, 0.1)",
        cardBorderColorOn: "rgba(255, 255, 255, 0.5)",
        cardBackground: "rgba(255, 255, 255, 0.1)",
        cardBackgroundOn: "rgba(255, 255, 255, 0.2)",
        shadowCard: "0 8px 32px rgba(0, 0, 0, 0.2)",
        
        panelOpacity: 0.3,
        
        tabTextColor: "rgba(255, 255, 255, 0.6)",
        activeTabTextColor: "#FFFFFF",
        tabIndicatorColor: "#FFFFFF",
        
        iconBackgroundShape: "circle",
        iconBackgroundColorOn: "#FFFFFF",
        iconBackgroundColorOff: "rgba(0, 0, 0, 0.2)",
        
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
        thermostatHeatingColor: "#FCD34D",
        thermostatCoolingColor: "#67E8F9",
        
        accentPrimary: "#FFFFFF",
        accentError: "#FDA4AF",
        accentSuccess: "#6EE7B7",
        accentWarning: "#FCD34D",
        accentInfo: "#67E8F9",
        widgetSwitchOn: "#FFFFFF"
      },
      light: {
        dashboardBackgroundType: "gradient",
        dashboardBackgroundColor1: "#E0E7FF",
        dashboardBackgroundColor2: "#FAE8FF",
        dashboardGradientAngle: 135,
        
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
        thermostatHeatingColor: "#F59E0B",
        thermostatCoolingColor: "#3B82F6",
        
        accentPrimary: "#8B5CF6",
        accentError: "#EF4444",
        accentSuccess: "#10B981",
        accentWarning: "#F59E0B",
        accentInfo: "#3B82F6",
        widgetSwitchOn: "#8B5CF6"
      }
    }
  }
};

// 4. Beach (Light & Summer)
export const beachTheme: ThemeFile = {
  schemaVersion: 1,
  manifest: {
    name: "Beach",
    version: "1.0.0",
    author: "Evolusion",
    description: "Relaxing sandy tones and aqua accents.",
    generatedAt: new Date().toISOString()
  },
  theme: {
    id: "beach",
    name: "Beach",
    isCustom: false,
    scheme: {
      light: {
        dashboardBackgroundType: "gradient",
        dashboardBackgroundColor1: "#FFFDF5", // Sand
        dashboardBackgroundColor2: "#E0F7FA", // Aqua hint
        dashboardGradientAngle: 180,
        
        cardOpacity: 0.9,
        cardBorderRadius: 20,
        cardBorderWidth: 0,
        cardBorderColor: "transparent",
        cardBorderColorOn: "#00BCD4",
        cardBackground: "#FFFFFF",
        cardBackgroundOn: "#E0F7FA",
        shadowCard: "0 2px 10px rgba(0,0,0,0.05)",
        
        panelOpacity: 0.8,
        
        tabTextColor: "#8D6E63",
        activeTabTextColor: "#00838F",
        tabIndicatorColor: "#00BCD4",
        
        iconBackgroundShape: "rounded-square",
        iconBackgroundColorOn: "#00BCD4",
        iconBackgroundColorOff: "rgba(0, 188, 212, 0.1)",
        
        nameTextColor: "#4E342E", // Dark brown
        statusTextColor: "#8D6E63",
        valueTextColor: "#00838F",
        unitTextColor: "#8D6E63",
        nameTextColorOn: "#006064",
        statusTextColorOn: "#00ACC1",
        valueTextColorOn: "#006064",
        unitTextColorOn: "#006064",
        
        clockTextColor: "#4E342E",
        weatherPrimaryColor: "#FFB74D", // Sunny Orange
        weatherSecondaryColor: "#8D6E63",
        
        thermostatHandleColor: "#FFFFFF",
        thermostatDialTextColor: "#4E342E",
        thermostatDialLabelColor: "#8D6E63",
        thermostatHeatingColor: "#FF7043",
        thermostatCoolingColor: "#26C6DA",
        
        accentPrimary: "#00BCD4",
        accentSecondary: "#FFB74D",
        accentError: "#FF7043",
        accentSuccess: "#66BB6A",
        accentWarning: "#FFCA28",
        accentInfo: "#29B6F6",
        widgetSwitchOn: "#26A69A"
      },
      dark: {
        dashboardBackgroundType: "gradient",
        dashboardBackgroundColor1: "#1A237E", // Deep Ocean
        dashboardBackgroundColor2: "#0D47A1",
        dashboardGradientAngle: 180,
        
        cardOpacity: 0.8,
        cardBorderRadius: 20,
        cardBorderWidth: 0,
        cardBorderColor: "transparent",
        cardBorderColorOn: "#4DD0E1",
        cardBackground: "rgba(255, 255, 255, 0.1)",
        cardBackgroundOn: "rgba(77, 208, 225, 0.2)",
        shadowCard: "0 4px 12px rgba(0,0,0,0.3)",
        
        panelOpacity: 0.6,
        
        tabTextColor: "#B39DDB",
        activeTabTextColor: "#E0F7FA",
        tabIndicatorColor: "#4DD0E1",
        
        iconBackgroundShape: "rounded-square",
        iconBackgroundColorOn: "#4DD0E1",
        iconBackgroundColorOff: "rgba(255, 255, 255, 0.1)",
        
        nameTextColor: "#E0F7FA",
        statusTextColor: "#B39DDB",
        valueTextColor: "#80DEEA",
        unitTextColor: "#B39DDB",
        nameTextColorOn: "#FFFFFF",
        statusTextColorOn: "#4DD0E1",
        valueTextColorOn: "#E0F7FA",
        unitTextColorOn: "#E0F7FA",
        
        clockTextColor: "#E0F7FA",
        weatherPrimaryColor: "#FFCC80",
        weatherSecondaryColor: "#B39DDB",
        
        thermostatHandleColor: "#E0F7FA",
        thermostatDialTextColor: "#E0F7FA",
        thermostatDialLabelColor: "#B39DDB",
        thermostatHeatingColor: "#FFAB91",
        thermostatCoolingColor: "#4DD0E1",
        
        accentPrimary: "#4DD0E1",
        accentSecondary: "#FFCC80",
        accentError: "#EF9A9A",
        accentSuccess: "#A5D6A7",
        accentWarning: "#FFE082",
        accentInfo: "#81D4FA",
        widgetSwitchOn: "#80CBC4"
      }
    }
  }
};

// 5. Cyberpunk (High Contrast / Neon / HUD)
export const cyberpunkTheme: ThemeFile = {
  schemaVersion: 1,
  manifest: {
    name: "Cyberpunk",
    version: "2.0.0",
    author: "Evolusion",
    description: "High contrast yellow and black with tactical HUD aesthetic.",
    generatedAt: new Date().toISOString()
  },
  theme: {
    id: "cyberpunk",
    name: "Cyberpunk",
    isCustom: false,
    scheme: {
      dark: {
        dashboardBackgroundType: "color",
        dashboardBackgroundColor1: "#050505", // Deepest black
        
        cardOpacity: 1,
        cardBorderRadius: 0, // Sharp edges
        cardBorderWidth: 1,
        cardBorderColor: "#333333", // Dim grid lines
        cardBorderColorOn: "#FCEE0A", // Neon Yellow Active
        cardBackground: "#0A0A0A",
        cardBackgroundOn: "#0A0A0A", // Keep background dark, highlight border
        shadowCard: "0 0 0 1px rgba(252, 238, 10, 0.1)", // Subtle yellow glow
        
        panelOpacity: 1,
        
        tabTextColor: "#666666",
        activeTabTextColor: "#FCEE0A",
        tabIndicatorColor: "#FCEE0A",
        
        iconBackgroundShape: "square",
        iconBackgroundColorOn: "#FCEE0A",
        iconBackgroundColorOff: "#1a1a1a",
        
        nameTextColor: "#FCEE0A", // Yellow headers
        statusTextColor: "#FFFFFF",
        valueTextColor: "#FCEE0A",
        unitTextColor: "#FFFFFF",
        
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
        thermostatHeatingColor: "#FF003C", // Red alert
        thermostatCoolingColor: "#00F0FF", // Cyan
        
        accentPrimary: "#FCEE0A", // Yellow
        accentSecondary: "#00F0FF", // Cyan
        accentError: "#FF003C", // Red
        accentSuccess: "#FCEE0A",
        accentWarning: "#FCEE0A",
        accentInfo: "#00F0FF",
        widgetSwitchOn: "#FCEE0A"
      },
      light: {
        // High-vis Light Mode (White/Black/Yellow)
        dashboardBackgroundType: "color",
        dashboardBackgroundColor1: "#FFFFFF",
        
        cardOpacity: 1,
        cardBorderRadius: 0,
        cardBorderWidth: 2,
        cardBorderColor: "#000000",
        cardBorderColorOn: "#FCEE0A",
        cardBackground: "#F2F2F2",
        cardBackgroundOn: "#FFFFFF",
        shadowCard: "4px 4px 0px #000000", // Hard drop shadow
        
        panelOpacity: 1,
        
        tabTextColor: "#000000",
        activeTabTextColor: "#000000",
        tabIndicatorColor: "#FCEE0A",
        
        iconBackgroundShape: "square",
        iconBackgroundColorOn: "#FCEE0A",
        iconBackgroundColorOff: "#DDDDDD",
        
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
        thermostatHeatingColor: "#FF003C",
        thermostatCoolingColor: "#00F0FF",
        
        accentPrimary: "#FCEE0A",
        accentSecondary: "#00F0FF",
        accentError: "#FF003C",
        accentSuccess: "#000000",
        accentWarning: "#FCEE0A",
        accentInfo: "#00F0FF",
        widgetSwitchOn: "#FCEE0A"
      }
    }
  }
};

export const BUILTIN_THEMES: ThemeFile[] = [
  defaultTheme, 
  deepSpaceTheme, 
  fusionTheme, 
  beachTheme, 
  cyberpunkTheme
];
