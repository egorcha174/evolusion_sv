
import type { SchemeSettings } from './types';

export const defaultLightScheme: SchemeSettings = {
  dashboardBackgroundType: 'gradient',
  dashboardGradient: {
    angle: 135,
    stops: [
      { color: '#EAEAEB', position: 0 },
      { color: '#DCDCDC', position: 100 }
    ]
  },
  
  bgPage: '#f0f2f5',
  
  cardOpacity: 0.85,
  cardBorderRadius: 16,
  cardBorderWidth: 0,
  cardBorderColor: 'transparent',
  cardBorderColorOn: '#2196f3',
  cardBackground: 'rgba(255, 255, 255, 0.8)',
  cardBackgroundOn: 'rgba(255, 255, 255, 0.95)',
  shadowCard: '0 1px 2px rgba(0, 0, 0, 0.05)',
  shadowDropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
  
  panelOpacity: 0.95,
  bgPanel: 'rgba(255, 255, 255, 0.95)',
  
  bgInput: '#ffffff',
  bgHeader: 'rgba(255, 255, 255, 0.8)',

  textPrimary: '#1a1d21',
  textSecondary: '#65676b',
  textMuted: '#b0b3b8',

  nameTextColor: '#1a1d21',
  statusTextColor: '#65676b',
  valueTextColor: '#1a1d21',
  unitTextColor: '#65676b',
  
  nameTextColorOn: '#1a1d21',
  statusTextColorOn: '#2196f3',
  valueTextColorOn: '#1a1d21',
  unitTextColorOn: '#2196f3',

  accentPrimary: '#2196f3',
  accentError: '#f44336',
  accentSuccess: '#4caf50',
  accentWarning: '#ff9800',
  accentInfo: '#03a9f4',
  
  widgetSwitchOn: '#4caf50',
  
  gridCellBg: 'rgba(0, 0, 0, 0.06)',
  gridCellBorder: 'rgba(0, 0, 0, 0.15)'
};

export const defaultDarkScheme: SchemeSettings = {
  dashboardBackgroundType: 'color',
  dashboardBackgroundColor: '#1C1C1E',

  bgPage: '#111315',

  cardOpacity: 0.8,
  cardBorderRadius: 16,
  cardBorderWidth: 0,
  cardBorderColor: 'transparent',
  cardBorderColorOn: '#64b5f6',
  cardBackground: 'rgba(44, 44, 46, 0.8)',
  cardBackgroundOn: 'rgba(60, 60, 62, 0.85)',
  shadowCard: '0 2px 4px rgba(0, 0, 0, 0.2)',
  shadowDropdown: '0 4px 12px rgba(0, 0, 0, 0.4)',

  panelOpacity: 0.95,
  bgPanel: 'rgba(28, 28, 30, 0.95)',

  bgInput: '#2d3035',
  bgHeader: 'rgba(28, 28, 30, 0.8)',

  textPrimary: '#e4e6eb',
  textSecondary: '#b0b3b8',
  textMuted: '#6d7177',

  nameTextColor: '#e4e6eb',
  statusTextColor: '#b0b3b8',
  valueTextColor: '#e4e6eb',
  unitTextColor: '#b0b3b8',

  nameTextColorOn: '#e4e6eb',
  statusTextColorOn: '#64b5f6',
  valueTextColorOn: '#e4e6eb',
  unitTextColorOn: '#64b5f6',

  accentPrimary: '#64b5f6',
  accentError: '#e57373',
  accentSuccess: '#81c784',
  accentWarning: '#ffb74d',
  accentInfo: '#4fc3f7',
  
  widgetSwitchOn: '#81c784',
  
  gridCellBg: 'rgba(255, 255, 255, 0.08)',
  gridCellBorder: 'rgba(255, 255, 255, 0.15)'
};