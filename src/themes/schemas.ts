

import { z } from 'zod';

// Update ColorSchema to allow var() references
export const ColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgba?\(.+\)$|^transparent$|^var\(--[a-zA-Z0-9-]+\)$/, "Invalid color format");

export const ThemeLayoutSchema = z.object({
  // Card
  cardBorderRadius: z.number().min(0),
  cardBorderWidth: z.number().min(0),

  // Icon
  iconBackgroundShape: z.enum(['circle', 'rounded-square', 'square']),

  // Weather Sizes
  weatherIconSize: z.number().optional(),
  weatherForecastIconSize: z.number().optional(),
  weatherCurrentTempFontSize: z.number().optional(),
  weatherCurrentDescFontSize: z.number().optional(),
  weatherForecastDayFontSize: z.number().optional(),
  weatherForecastMaxTempFontSize: z.number().optional(),
  weatherForecastMinTempFontSize: z.number().optional(),
});

export const ColorSchemeSchema = z.object({
  // Dashboard
  dashboardBackgroundType: z.enum(['color', 'gradient', 'image']),
  dashboardBackgroundColor1: ColorSchema,
  dashboardBackgroundColor2: ColorSchema.optional(),
  dashboardGradientAngle: z.number().min(0).max(360).optional(),
  dashboardBackgroundImageUrl: z.string().optional(),
  dashboardBackgroundImageBlur: z.number().min(0).max(100).optional(),
  dashboardBackgroundImageBrightness: z.number().min(0).max(200).optional(),

  // Global UI
  bgSidebar: ColorSchema.optional().default('#f0f2f5'),
  sidebarOpacity: z.number().min(0).max(1).optional().default(1),

  bgChip: ColorSchema.optional().default('#e4e6eb'),
  bgCardHover: ColorSchema.optional().default('rgba(0,0,0,0.05)'),
  bgDropdown: ColorSchema.optional(),
  bgInput: ColorSchema.optional(),

  bgHeader: ColorSchema.optional(),
  headerOpacity: z.number().min(0).max(1).optional().default(1),

  borderInput: ColorSchema.optional().default('#ccc'),
  borderFocus: ColorSchema.optional().default('#2196f3'),
  borderDivider: ColorSchema.optional().default('rgba(0,0,0,0.1)'),

  borderPrimary: ColorSchema.optional().default('#2196f3'), // Found missing in previous read but seemingly used in utils, added for safety

  scrollbarThumb: ColorSchema.optional().default('#ccc'),
  scrollbarTrack: ColorSchema.optional().default('transparent'),

  gridCellBg: ColorSchema.optional(),
  gridCellBorder: ColorSchema.optional(),

  // Card
  cardOpacity: z.number().min(0).max(1),
  // Moved to Layout: cardBorderRadius, cardBorderWidth
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
  // Moved to Layout: iconBackgroundShape
  iconBackgroundColorOn: ColorSchema,
  iconBackgroundColorOff: ColorSchema,
  iconColorOn: ColorSchema.optional().default('#ffffff'),

  // Thermostat
  thermostatHandleColor: ColorSchema,
  thermostatDialTextColor: ColorSchema,
  thermostatDialLabelColor: ColorSchema,
  thermostatHeatingColor: ColorSchema,
  thermostatCoolingColor: ColorSchema,

  // Clock
  clockTextColor: ColorSchema,

  // Weather (Colors)
  weatherPrimaryColor: ColorSchema.optional().default('#000000'),
  weatherSecondaryColor: ColorSchema.optional().default('#888888'),

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

  // Moved to Layout: Weather sizes
});

export const ThemeManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string(),
  author: z.string(),
  description: z.string(),
  generatedAt: z.string(),
  tags: z.array(z.string()).optional(),
  preview: z.string().optional(),
});

export const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  isCustom: z.boolean(),
  foundation: z.record(z.string()).optional(),
  layout: ThemeLayoutSchema,
  scheme: z.object({
    light: ColorSchemeSchema,
    dark: ColorSchemeSchema,
  }),
});

export const ThemeFileSchema = z.object({
  schemaVersion: z.number(),
  manifest: ThemeManifestSchema,
  theme: ThemeSchema,
});