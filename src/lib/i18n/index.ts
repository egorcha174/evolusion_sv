import { browser } from '$app/environment';
import { register, init, getLocaleFromNavigator, locale, addMessages, dictionary } from 'svelte-i18n';
import { writable, get } from 'svelte/store';
import ru from './locales/ru.json';

// --- Types ---
export interface CustomLanguage {
  locale: string;
  name: string;
  direction: 'ltr' | 'rtl';
  translations: Record<string, any>;
}

export interface LanguageMeta {
  code: string;
  name: string;
  dir: 'ltr' | 'rtl';
}

// --- Supported Languages ---
const BUILT_IN_LANGUAGES: LanguageMeta[] = [
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
];

// --- Stores ---
export const currentLang = writable<string>('ru');
export const currentDir = writable<'ltr' | 'rtl'>('ltr');
export const availableLanguages = writable<LanguageMeta[]>([...BUILT_IN_LANGUAGES]);

const STORAGE_KEY_LOCALE = 'evolusion_locale';
const STORAGE_KEY_CUSTOM_LANGS = 'evolusion_custom_langs';

// --- Registration ---

// 1. Synchronous registration for default locale (Critical for SSR)
addMessages('ru', ru);

// 2. Async registration for others
register('en', () => import('./locales/en.json'));
register('ar', () => import('./locales/ar.json'));

// Fallbacks for others
['zh', 'es', 'de', 'fr', 'pt', 'ja', 'ko'].forEach(code => {
    register(code, () => import('./locales/en.json')); 
});

// 3. Initialize immediately with default locale
// This ensures $t() works during Server-Side Rendering without crashing
init({
  fallbackLocale: 'ru',
  initialLocale: 'ru',
});

// --- Client Initialization ---

export async function initClientI18n() {
  if (!browser) return;

  // 1. Load Custom Languages from Storage
  loadCustomLanguages();

  // 2. Determine preferred locale
  let preferredLocale = 'ru';
  
  // Try storage
  const stored = localStorage.getItem(STORAGE_KEY_LOCALE);
  if (stored) {
    preferredLocale = stored;
  } else {
    // Try browser navigator
    const navLocale = getLocaleFromNavigator(); // e.g., "en-US"
    if (navLocale) {
      // Find exact match or language code match
      const found = get(availableLanguages).find(l => 
        l.code === navLocale || l.code === navLocale.split('-')[0]
      );
      if (found) preferredLocale = found.code;
    }
  }

  // 3. Apply Locale
  await setLocale(preferredLocale);
}

export async function setLocale(code: string) {
  // Set internal svelte-i18n store
  locale.set(code);
  currentLang.set(code);
  
  if (browser) {
    localStorage.setItem(STORAGE_KEY_LOCALE, code);

    // Handle Direction
    const meta = get(availableLanguages).find(l => l.code === code);
    const dir = meta?.dir || 'ltr';
    currentDir.set(dir);
    
    // Apply to document
    document.documentElement.dir = dir;
    document.documentElement.lang = code;
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }
}

// --- Custom Languages Logic ---

export function importCustomLanguage(jsonContent: string): boolean {
  try {
    const data = JSON.parse(jsonContent) as CustomLanguage;
    
    // Basic Validation
    if (!data.locale || !data.name || !data.translations) {
      throw new Error('Invalid JSON format');
    }

    // Add to svelte-i18n
    addMessages(data.locale, data.translations);
    
    // Update available languages
    availableLanguages.update(list => {
      // Remove existing if update
      const filtered = list.filter(l => l.code !== data.locale);
      return [...filtered, { 
        code: data.locale, 
        name: data.name, 
        dir: data.direction || 'ltr' 
      }];
    });

    // Save to Storage
    saveCustomLanguage(data);
    
    return true;
  } catch (e) {
    console.error('Failed to import language', e);
    return false;
  }
}

export function getLanguageExportData(code: string): string | null {
  const dict = get(dictionary);
  const messages = dict[code];
  if (!messages) return null;

  const meta = get(availableLanguages).find(l => l.code === code);
  
  const exportData: CustomLanguage = {
    locale: code,
    name: meta?.name || code,
    direction: meta?.dir || 'ltr',
    translations: messages as Record<string, any>
  };
  
  return JSON.stringify(exportData, null, 2);
}

function saveCustomLanguage(data: CustomLanguage) {
  if (!browser) return;
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_LANGS) || '{}');
  existing[data.locale] = data;
  localStorage.setItem(STORAGE_KEY_CUSTOM_LANGS, JSON.stringify(existing));
}

function loadCustomLanguages() {
  if (!browser) return;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_LANGS) || '{}');
    Object.values(stored).forEach((data: any) => {
        // Register translation
        addMessages(data.locale, data.translations);
        
        // Add to list
        availableLanguages.update(list => {
          if (list.some(l => l.code === data.locale)) return list;
          return [...list, { 
            code: data.locale, 
            name: data.name, 
            dir: data.direction || 'ltr' 
          }];
        });
    });
  } catch (e) {
    console.error('Failed to load custom languages', e);
  }
}