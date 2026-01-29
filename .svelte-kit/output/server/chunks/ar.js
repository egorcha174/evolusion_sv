const common = {
  ok: "حسنا",
  cancel: "إلغاء",
  save: "حفظ",
  loading: "جار التحميل...",
  error: "خطأ",
  off: "إيقاف",
  on: "تشغيل"
};
const dashboard = {
  title: "لوحة التحكم",
  edit: "تعديل اللوحة",
  done: "تم",
  noDevices: "لم يتم العثور على أجهزة.",
  noDevicesTab: 'لم يتم العثور على أجهزة لـ "{tab}".'
};
const sidebar = {
  connected: "متصل",
  connecting: "جار الاتصال...",
  offline: "غير متصل",
  camera: "كاميرا",
  weather: "الطقس"
};
const settings = {
  title: "الإعدادات",
  appearance: "المظهر",
  language: "اللغة",
  languageSelect: "اختر اللغة",
  importLanguage: "استيراد لغة (JSON)",
  importBtn: "استيراد",
  connection: "الاتصال",
  serverUrl: "رابط الخادم",
  token: "رمز الوصول",
  testConnection: "اختبار الاتصال",
  saveConfig: "حفظ الإعدادات",
  weather: "أداة الطقس",
  theme: "السمة",
  themeMode: "الوضع",
  themeModeAuto: "تلقائي (النظام)",
  themeModeDay: "نهار (دائما فاتح)",
  themeModeNight: "ليل (دائما داكن)",
  themeModeSchedule: "جدول زمني",
  importTheme: "استيراد السمة",
  exportTheme: "تصدير السمة"
};
const entities = {
  title: "كل الكيانات",
  search: "بحث...",
  allDomains: "كل النطاقات",
  showing: "إظهار {count} كيان",
  noEntities: "لا توجد كيانات. تحقق من الإعدادات.",
  loading: "تحميل الكيانات..."
};
const ar = {
  common,
  dashboard,
  sidebar,
  settings,
  entities
};
export {
  common,
  dashboard,
  ar as default,
  entities,
  settings,
  sidebar
};
