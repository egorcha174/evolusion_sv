
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
  cardOpacity: 0.85,
  panelOpacity: 0.75,
  cardBorderRadius: 16,
  cardBorderWidth: 0,
  cardBorderColor: '#D1D1D6',
  cardBorderColorOn: '#0A84FF',
  cardBackground: 'rgba(255, 255, 255, 0.8)',
  cardBackgroundOn: 'rgba(255, 255, 255, 0.95)',
  tabTextColor: '#515154',
  activeTabTextColor: '#1D1D1F',
  tabIndicatorColor: '#1D1D1F',
  thermostatHandleColor: '#FFFFFF',
  thermostatDialTextColor: '#1D1D1F',
  thermostatDialLabelColor: '#515154',
  thermostatHeatingColor: '#F97316',
  thermostatCoolingColor: '#3B82F6',
  clockTextColor: '#1D1D1F',
  nameTextColor: '#1D1D1F',
  statusTextColor: '#515154',
  valueTextColor: '#1D1D1F',
  unitTextColor: '#1D1D1F',
  nameTextColorOn: '#1D1D1F',
  statusTextColorOn: '#515154',
  valueTextColorOn: '#1D1D1F',
  unitTextColorOn: '#1D1D1F',
  
  accentPrimary: '#0A84FF',
  accentError: '#FF3B30',
  accentSuccess: '#34C759',
  bgInput: '#FFFFFF',
  textPrimary: '#1D1D1F'
};

export const defaultDarkScheme: SchemeSettings = {
  dashboardBackgroundType: 'color',
  dashboardBackgroundColor: '#1C1C1E',
  cardOpacity: 0.8,
  panelOpacity: 0.75,
  cardBorderRadius: 16,
  cardBorderWidth: 0,
  cardBorderColor: '#48484A',
  cardBorderColorOn: '#0A84FF',
  cardBackground: 'rgba(44, 44, 46, 0.8)',
  cardBackgroundOn: 'rgba(60, 60, 62, 0.85)',
  tabTextColor: '#8E8E93',
  activeTabTextColor: '#F5F5F7',
  tabIndicatorColor: '#F5F5F7',
  thermostatHandleColor: '#1C1C1E',
  thermostatDialTextColor: '#F5F5F7',
  thermostatDialLabelColor: '#8E8E93',
  thermostatHeatingColor: '#F28C18',
  thermostatCoolingColor: '#0A84FF',
  clockTextColor: '#F5F5F7',
  nameTextColor: '#F5F5F7',
  statusTextColor: '#8E8E93',
  valueTextColor: '#F5F5F7',
  unitTextColor: '#F5F5F7',
  nameTextColorOn: '#F5F5F7',
  statusTextColorOn: '#8E8E93',
  valueTextColorOn: '#F5F5F7',
  unitTextColorOn: '#F5F5F7',

  accentPrimary: '#0A84FF',
  accentError: '#FF453A',
  accentSuccess: '#30D158',
  bgInput: '#2C2C2E',
  textPrimary: '#F5F5F7'
};
