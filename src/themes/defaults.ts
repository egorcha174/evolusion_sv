
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
  bgCard: 'rgba(255, 255, 255, 0.8)',
  bgCardHover: 'rgba(255, 255, 255, 0.95)',
  bgSidebar: '#ffffff',
  bgHeader: 'rgba(255, 255, 255, 0.8)',
  bgInput: '#ffffff',
  bgChip: '#e4e6eb',
  bgChipActive: '#e7f3ff',

  textPrimary: '#1a1d21',
  textSecondary: '#65676b',
  textMuted: '#b0b3b8',
  textName: '#1a1d21',
  textStatus: '#65676b',
  textOnAccent: '#ffffff',

  borderCard: '#ebeef2',
  borderPrimary: '#dce0e6',
  borderInput: '#ced0d4',
  borderFocus: '#2196f3',
  borderDivider: '#eff1f4',

  stateOn: '#2196f3',
  accentPrimary: '#2196f3',
  accentError: '#f44336',
  accentSuccess: '#4caf50',
  accentWarning: '#ff9800',
  accentInfo: '#03a9f4',

  shadowCard: '0 1px 2px rgba(0, 0, 0, 0.05)',
  widgetSwitchOn: '#4caf50'
};

export const defaultDarkScheme: SchemeSettings = {
  dashboardBackgroundType: 'color',
  dashboardBackgroundColor: '#1C1C1E',

  bgPage: '#111315',
  bgCard: 'rgba(44, 44, 46, 0.8)',
  bgCardHover: 'rgba(60, 60, 62, 0.85)',
  bgSidebar: '#0d0f11',
  bgHeader: 'rgba(28, 28, 30, 0.8)',
  bgInput: '#2d3035',
  bgChip: '#2d3035',
  bgChipActive: '#1c2f45',

  textPrimary: '#e4e6eb',
  textSecondary: '#b0b3b8',
  textMuted: '#6d7177',
  textName: '#e4e6eb',
  textStatus: '#b0b3b8',
  textOnAccent: '#000000',

  borderCard: '#2d3035',
  borderPrimary: '#2d3035',
  borderInput: '#3e4147',
  borderFocus: '#64b5f6',
  borderDivider: '#2d3035',

  stateOn: '#64b5f6',
  accentPrimary: '#64b5f6',
  accentError: '#e57373',
  accentSuccess: '#81c784',
  accentWarning: '#ffb74d',
  accentInfo: '#4fc3f7',

  shadowCard: '0 2px 4px rgba(0, 0, 0, 0.2)',
  widgetSwitchOn: '#81c784'
};
