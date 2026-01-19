import type { ThemeDefinition, ThemePalette } from '$lib/types';

const defaultLight: ThemePalette = {
  bgPage: '#f5f7fa',
  bgCard: '#ffffff',
  bgHeader: '#ffffff',
  bgSidebar: '#1e1e1e', // Dark sidebar by default in light mode (classic HA feel) or maybe matches design
  bgInput: '#ffffff',
  bgDropdown: '#ffffff',
  
  textPrimary: '#333333',
  textSecondary: '#666666',
  textInverted: '#ffffff',
  
  primary: '#2196f3',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#d32f2f',
  
  border: '#e0e0e0',
  divider: '#eeeeee',
  shadowCard: '0 2px 8px rgba(0, 0, 0, 0.04)'
};

const defaultDark: ThemePalette = {
  bgPage: '#121212',
  bgCard: '#1e1e1e',
  bgHeader: '#1e1e1e',
  bgSidebar: '#121212',
  bgInput: '#2d2d2d',
  bgDropdown: '#2d2d2d',
  
  textPrimary: '#e0e0e0',
  textSecondary: '#a0a0a0',
  textInverted: '#000000',
  
  primary: '#64b5f6',
  success: '#81c784',
  warning: '#ffb74d',
  error: '#e57373',
  
  border: '#333333',
  divider: '#2d2d2d',
  shadowCard: '0 4px 12px rgba(0, 0, 0, 0.3)'
};

export const DEFAULT_THEME: ThemeDefinition = {
  id: 'default',
  name: 'Default',
  isBuiltIn: true,
  description: 'Standard Evolusion theme',
  light: defaultLight,
  dark: defaultDark
};

export const BUILTIN_THEMES: ThemeDefinition[] = [DEFAULT_THEME];
