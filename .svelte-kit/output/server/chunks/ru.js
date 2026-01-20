const common = {
  ok: "ОК",
  cancel: "Отмена",
  save: "Сохранить",
  loading: "Загрузка...",
  error: "Ошибка",
  off: "Выкл",
  on: "Вкл"
};
const dashboard = {
  title: "Дашборд",
  edit: "Редактировать",
  done: "Готово",
  noDevices: "Устройства не найдены.",
  noDevicesTab: "Устройства для «{tab}» не найдены."
};
const sidebar = {
  connected: "Подключено",
  connecting: "Подключение...",
  offline: "Оффлайн",
  camera: "Камера",
  weather: "Погода"
};
const settings = {
  title: "Настройки",
  appearance: "Внешний вид",
  language: "Язык",
  languageSelect: "Выберите язык",
  importLanguage: "Импорт языка (JSON)",
  importBtn: "Импортировать",
  connection: "Подключение",
  serverUrl: "URL сервера",
  token: "Токен доступа",
  testConnection: "Проверить",
  saveConfig: "Сохранить настройки",
  weather: "Виджет погоды",
  theme: "Тема",
  themeMode: "Режим",
  themeModeAuto: "Авто (Системный)",
  themeModeDay: "День (Всегда светлая)",
  themeModeNight: "Ночь (Всегда темная)",
  themeModeSchedule: "По расписанию"
};
const entities = {
  title: "Все сущности",
  search: "Поиск сущностей...",
  allDomains: "Все домены",
  showing: "Показано {count} сущностей",
  noEntities: "Сущности не найдены. Проверьте настройки подключения.",
  loading: "Загрузка сущностей..."
};
const ru = {
  common,
  dashboard,
  sidebar,
  settings,
  entities
};
export {
  common,
  dashboard,
  ru as default,
  entities,
  settings,
  sidebar
};
