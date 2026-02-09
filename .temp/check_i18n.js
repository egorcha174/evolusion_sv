const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'lib', 'i18n', 'locales');

// Читаем все JSON файлы
const enContent = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'));
const ruContent = JSON.parse(fs.readFileSync(path.join(localesDir, 'ru.json'), 'utf-8'));
const arContent = JSON.parse(fs.readFileSync(path.join(localesDir, 'ar.json'), 'utf-8'));

// Рекурсивная функция для получения всех ключей
function getAllKeys(obj, prefix = '') {
    const keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys.push(...getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

// Получаем все ключи из английской версии (эталон)
const enKeys = new Set(getAllKeys(enContent));
const ruKeys = new Set(getAllKeys(ruContent));
const arKeys = new Set(getAllKeys(arContent));

console.log('=== Translation Keys Statistics ===');
console.log(`English (en.json): ${enKeys.size} keys`);
console.log(`Russian (ru.json): ${ruKeys.size} keys`);
console.log(`Arabic (ar.json): ${arKeys.size} keys`);
console.log();

// Проверяем недостающие ключи в русском
const missingInRu = [...enKeys].filter(key => !ruKeys.has(key));
if (missingInRu.length > 0) {
    console.log(`=== Missing in Russian (${missingInRu.length} keys) ===`);
    missingInRu.forEach(key => console.log(`  - ${key}`));
    console.log();
}

// Проверяем недостающие ключи в арабском
const missingInAr = [...enKeys].filter(key => !arKeys.has(key));
if (missingInAr.length > 0) {
    console.log(`=== Missing in Arabic (${missingInAr.length} keys) ===`);
    missingInAr.forEach(key => console.log(`  - ${key}`));
    console.log();
}

// Проверяем лишние ключи
const extraInRu = [...ruKeys].filter(key => !enKeys.has(key));
if (extraInRu.length > 0) {
    console.log(`=== Extra in Russian (${extraInRu.length} keys) ===`);
    extraInRu.forEach(key => console.log(`  + ${key}`));
    console.log();
}

const extraInAr = [...arKeys].filter(key => !enKeys.has(key));
if (extraInAr.length > 0) {
    console.log(`=== Extra in Arabic (${extraInAr.length} keys) ===`);
    extraInAr.forEach(key => console.log(`  + ${key}`));
    console.log();
}

console.log('=== Summary ===');
console.log(`Russian completeness: ${((ruKeys.size / enKeys.size) * 100).toFixed(1)}%`);
console.log(`Arabic completeness: ${((arKeys.size / enKeys.size) * 100).toFixed(1)}%`);
