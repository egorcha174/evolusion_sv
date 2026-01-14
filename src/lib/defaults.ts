// C:/CODE/evolusion/src/lib/defaults.ts

/**
 * @fileoverview
 * This file contains default values for various application settings,
 * including themes, clock settings, and other UI preferences.
 *
 * Source of Truth (inspiration): C:\CODE\fusion\config\defaults.ts
 */

import { nanoid } from 'nanoid';
import type { ColorScheme, ThemeDefinition } from './types';

export const DEFAULT_COLOR_SCHEME: ColorScheme = {
	light: {
		dashboardBackgroundType: 'color',
		dashboardBackgroundColor1: '#f0f2f5',
		cardBackground: '#ffffff',
		cardBackgroundOn: '#e0f2fe',
		nameTextColor: '#333333',
		statusTextColor: '#666666',
		valueTextColor: '#000000',
		unitTextColor: '#999999',
		nameTextColorOn: '#000000',
		statusTextColorOn: '#333333',
		valueTextColorOn: '#000000',
		unitTextColorOn: '#666666',
		tabTextColor: '#999999',
		activeTabTextColor: '#000000',
		tabIndicatorColor: '#3b82f6',
		clockTextColor: '#000000',
		thermostatHandleColor: '#3b82f6',
		thermostatDialTextColor: '#000000',
		thermostatDialLabelColor: '#666666',
		thermostatHeatingColor: '#ef4444',
		thermostatCoolingColor: '#3b82f6',
		// Default values for new properties
		cardOpacity: 1,
		panelOpacity: 1,
		cardBorderRadius: 12,
		cardBorderWidth: 0,
		cardBorderColor: 'transparent',
		cardBorderColorOn: 'transparent',
		iconBackgroundShape: 'circle',
		iconBackgroundColorOn: '#3b82f6',
		iconBackgroundColorOff: '#cccccc',
		weatherIconSize: 24,
		weatherForecastIconSize: 20,
		weatherCurrentTempFontSize: 24,
		weatherCurrentDescFontSize: 16,
		weatherForecastDayFontSize: 14,
		weatherForecastMaxTempFontSize: 14,
		weatherForecastMinTempFontSize: 12
	},
	dark: {
		dashboardBackgroundType: 'color',
		dashboardBackgroundColor1: '#1a1a1a',
		cardBackground: '#2a2a2a',
		cardBackgroundOn: '#0a3a63',
		nameTextColor: '#ffffff',
		statusTextColor: '#bbbbbb',
		valueTextColor: '#ffffff',
		unitTextColor: '#dddddd',
		nameTextColorOn: '#ffffff',
		statusTextColorOn: '#dddddd',
		valueTextColorOn: '#ffffff',
		unitTextColorOn: '#cccccc',
		tabTextColor: '#bbbbbb',
		activeTabTextColor: '#ffffff',
		tabIndicatorColor: '#3b82f6',
		clockTextColor: '#ffffff',
		thermostatHandleColor: '#3b82f6',
		thermostatDialTextColor: '#ffffff',
		thermostatDialLabelColor: '#bbbbbb',
		thermostatHeatingColor: '#ef4444',
		thermostatCoolingColor: '#3b82f6',
		// Default values for new properties
		cardOpacity: 1,
		panelOpacity: 1,
		cardBorderRadius: 12,
		cardBorderWidth: 0,
		cardBorderColor: 'transparent',
		cardBorderColorOn: 'transparent',
		iconBackgroundShape: 'circle',
		iconBackgroundColorOn: '#3b82f6',
		iconBackgroundColorOff: '#4a4a4a',
		weatherIconSize: 24,
		weatherForecastIconSize: 20,
		weatherCurrentTempFontSize: 24,
		weatherCurrentDescFontSize: 16,
		weatherForecastDayFontSize: 14,
		weatherForecastMaxTempFontSize: 14,
		weatherForecastMinTempFontSize: 12
	}
};

export const DEFAULT_THEMES: ThemeDefinition[] = [
	{
		id: 'default-light',
		name: 'Default Light',
		isCustom: false,
		scheme: DEFAULT_COLOR_SCHEME
	},
	{
		id: 'default-dark',
		name: 'Default Dark',
		isCustom: false,
		scheme: {
			light: DEFAULT_COLOR_SCHEME.light, // Light scheme is still default light
			dark: DEFAULT_COLOR_SCHEME.dark
		}
	}
	// Add other default themes here if needed
];

export const DEFAULT_AURORA_SETTINGS = {
	color1: '#00ffc8',
	color2: '#78c8ff',
	color3: '#00b4ff',
	speed: 22,
	intensity: 90,
	blur: 18,
	saturate: 140,
	starsEnabled: true,
	starsSpeed: 6
};

export const DEFAULT_SENSOR_TEMPLATE_ID = 'default-sensor';
export const DEFAULT_LIGHT_TEMPLATE_ID = 'default-light';
export const DEFAULT_SWITCH_TEMPLATE_ID = 'default-switch';
export const DEFAULT_CLIMATE_TEMPLATE_ID = 'default-climate';
export const DEFAULT_HUMIDIFIER_TEMPLATE_ID = 'default-humidifier';


