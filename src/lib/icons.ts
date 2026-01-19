export const iconMap: Record<string, string> = {
  light: 'mdi:lightbulb',
  switch: 'mdi:power-plug',
  cover: 'mdi:window-closed',
  climate: 'mdi:thermometer',
  media_player: 'mdi:music',
  sensor: 'mdi:gauge',
  binary_sensor: 'mdi:circle-outline',
  lock: 'mdi:lock',
  weather: 'mdi:weather-partly-cloudy',
  script: 'mdi:script-text-outline',
  input_boolean: 'mdi:toggle-switch'
};

export function getIcon(domain: string): string {
  return iconMap[domain] || 'mdi:help-circle';
}