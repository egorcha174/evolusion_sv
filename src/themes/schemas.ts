

import { z } from 'zod';

export const ColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgba?\(.+\)$|^transparent$/, "Invalid color format");

export const ColorSchemeSchema = z.object({
  // Dashboard
  dashboardBackgroundType: z.enum(['color', 'gradient', 'image']),
  dashboardBackgroundColor1: ColorSchema,
  dashboardBackgroundColor2: ColorSchema.optional(),
  dashboardGradientAngle: z.number().min(0).max(360).optional(),
  dashboardBackgroundImageUrl: z.string().optional(),
  dashboardBackgroundImageBlur: z.number().min(0).max(100).optional(),
  dashboardBackgroundImageBrightness: z.number().min(0).max(200).optional(),

  // Card
  cardOpacity: z.number().min(0).max(1),
  cardBorderRadius: z.number().min(0),
  cardBorderWidth: z.number().min(0),
  cardBorderColor: ColorSchema,
  cardBorderColorOn: ColorSchema,
  cardBackground: ColorSchema,
  cardBackgroundOn: ColorSchema,

  // Panel
  panelOpacity: z.number().min(0).max(1),

  // Tabs
  tabTextColor: ColorSchema,
  activeTabTextColor: ColorSchema,
  tabIndicatorColor: ColorSchema,

  // Icon
  iconBackgroundShape: z.enum(['circle', 'rounded-square', 'square']),
  iconBackgroundColorOn: ColorSchema,
  iconBackgroundColorOff: ColorSchema,

  // Thermostat
  thermostatHandleColor: ColorSchema,
  thermostatDialTextColor: ColorSchema,
  thermostatDialLabelColor: ColorSchema,
  thermostatHeatingColor: ColorSchema,
  thermostatCoolingColor: ColorSchema,

  // Clock
  clockTextColor: ColorSchema,

  // Weather (Colors)
  weatherPrimaryColor: ColorSchema.optional().default('#000000'), // Making optional for backward compat in validation, but default ensures it exists
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

  // Weather Sizes
  weatherIconSize: z.number().optional(),
  weatherForecastIconSize: z.number().optional(),
  weatherCurrentTempFontSize: z.number().optional(),
  weatherCurrentDescFontSize: z.number().optional(),
  weatherForecastDayFontSize: z.number().optional(),
  weatherForecastMaxTempFontSize: z.number().optional(),
  weatherForecastMinTempFontSize: z.number().optional(),
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