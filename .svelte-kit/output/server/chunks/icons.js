const iconMap = {
  light: "mdi:lightbulb",
  switch: "mdi:power-plug",
  cover: "mdi:window-closed",
  climate: "mdi:thermometer",
  media_player: "mdi:music",
  sensor: "mdi:gauge",
  binary_sensor: "mdi:circle-outline",
  lock: "mdi:lock",
  weather: "mdi:weather-partly-cloudy",
  script: "mdi:script-text-outline",
  input_boolean: "mdi:toggle-switch"
};
function getIcon(domain) {
  return iconMap[domain] || "mdi:help-circle";
}
export {
  getIcon as g
};
