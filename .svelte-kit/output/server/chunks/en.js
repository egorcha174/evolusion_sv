const common = {
  ok: "OK",
  cancel: "Cancel",
  save: "Save",
  loading: "Loading...",
  error: "Error",
  off: "Off",
  on: "On"
};
const dashboard = {
  title: "Dashboard",
  edit: "Edit Dashboard",
  done: "Done",
  noDevices: "No dashboard devices found.",
  noDevicesTab: 'No devices found for "{tab}".'
};
const sidebar = {
  connected: "Connected",
  connecting: "Connecting...",
  offline: "Offline",
  camera: "Camera",
  weather: "Weather"
};
const settings = {
  title: "Settings",
  appearance: "Appearance",
  language: "Language",
  languageSelect: "Select Language",
  importLanguage: "Import Language (JSON)",
  importBtn: "Import",
  connection: "Connection",
  serverUrl: "Server URL",
  token: "Access Token",
  testConnection: "Test Connection",
  saveConfig: "Save Configuration",
  weather: "Weather Widget",
  theme: "Theme",
  themeMode: "Mode",
  themeModeAuto: "Auto (System)",
  themeModeDay: "Day (Always Light)",
  themeModeNight: "Night (Always Dark)",
  themeModeSchedule: "Schedule"
};
const entities = {
  title: "All Entities",
  search: "Search entities...",
  allDomains: "All domains",
  showing: "Showing {count} entities",
  noEntities: "No entities connected. Check your Home Assistant settings.",
  loading: "Loading entities..."
};
const en = {
  common,
  dashboard,
  sidebar,
  settings,
  entities
};
export {
  common,
  dashboard,
  en as default,
  entities,
  settings,
  sidebar
};
