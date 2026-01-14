<script lang="ts">
  import { Icon } from 'iconify-svelte';
  import type { ColorScheme } from '$lib/types';
  import Section from './Section.svelte';
  import LabeledInput from './LabeledInput.svelte';
  import ColorInput from './ColorInput.svelte';
  import RangeInput from './RangeInput.svelte';

  let { themeType, colorScheme, onUpdate }: { themeType: 'light' | 'dark'; colorScheme: ColorScheme; onUpdate: (path: string, value: any) => void } = $props();

  let scheme = $derived(colorScheme[themeType]);
  let pathPrefix = $derived(themeType);

  function handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !file.type.startsWith('image')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onUpdate(`${themeType}.dashboardBackgroundImage`, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }
</script>

<Section title="Фон дашборда" defaultOpen={true}>
  <LabeledInput label="Тип фона" id="dashboardBackgroundTypeSelect">
    <select id="dashboardBackgroundTypeSelect" value={scheme.dashboardBackgroundType} onchange={(e) => onUpdate(`${pathPrefix}.dashboardBackgroundType`, e.currentTarget.value)} class="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
      <option value="color">Сплошной цвет</option>
      <option value="gradient">Градиент</option>
      <option value="image">Изображение</option>
    </select>
  </LabeledInput>
  {#if scheme.dashboardBackgroundType === 'image'}
    <LabeledInput label="Загрузить фон" id="dashboardBackgroundImageUpload"><input id="dashboardBackgroundImageUpload" type="file" accept="image/*" onchange={handleImageUpload} class="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-gray-500 dark:text-gray-400"/></LabeledInput>
    <RangeInput onUpdate={onUpdate} label="Размытие" path={`${pathPrefix}.dashboardBackgroundImageBlur`} value={scheme.dashboardBackgroundImageBlur || 0} min={0} max={50} step={1} unit="px" />
    <RangeInput onUpdate={onUpdate} label="Яркость" path={`${pathPrefix}.dashboardBackgroundImageBrightness`} value={scheme.dashboardBackgroundImageBrightness || 100} min={0} max={200} step={5} unit="%" />
  {:else}
    <ColorInput onUpdate={onUpdate} label="Цвет 1" path={`${pathPrefix}.dashboardBackgroundColor1`} value={scheme.dashboardBackgroundColor1} />
    {#if scheme.dashboardBackgroundType === 'gradient'}
      <ColorInput onUpdate={onUpdate} label="Цвет 2" path={`${pathPrefix}.dashboardBackgroundColor2`} value={scheme.dashboardBackgroundColor2 || '#ffffff'} />
    {/if}
  {/if}
</Section>
<Section title="Прозрачность">
  <RangeInput onUpdate={onUpdate} label="Карточки" path={`${pathPrefix}.cardOpacity`} value={scheme.cardOpacity || 1} min={0} max={1} step={0.05} />
  <RangeInput onUpdate={onUpdate} label="Панели" path={`${pathPrefix}.panelOpacity`} value={scheme.panelOpacity || 1} min={0} max={1} step={0.05} />
</Section>
<Section title="Карточки">
  <RangeInput onUpdate={onUpdate} label="Скругление углов" path={`${pathPrefix}.cardBorderRadius`} value={scheme.cardBorderRadius ?? 16} min={0} max={24} step={1} unit="px" />
  <ColorInput onUpdate={onUpdate} label="Фон (Выкл)" path={`${pathPrefix}.cardBackground`} value={scheme.cardBackground} />
  <ColorInput onUpdate={onUpdate} label="Фон (Вкл)" path={`${pathPrefix}.cardBackgroundOn`} value={scheme.cardBackgroundOn} />
  <hr class="my-4 border-gray-200 dark:border-gray-700"/>
  <RangeInput onUpdate={onUpdate} label="Ширина рамки" path={`${pathPrefix}.cardBorderWidth`} value={scheme.cardBorderWidth ?? 0} min={0} max={5} step={1} unit="px" />
  <ColorInput onUpdate={onUpdate} label="Цвет рамки (Выкл)" path={`${pathPrefix}.cardBorderColor`} value={scheme.cardBorderColor || '#000000'} />
  <ColorInput onUpdate={onUpdate} label="Цвет рамки (Вкл)" path={`${pathPrefix}.cardBorderColorOn`} value={scheme.cardBorderColorOn || '#ffffff'} />
   <div class="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
    <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Иконки</h4>
    <LabeledInput label="Форма фона" id="iconBackgroundShapeSelect">
      <select id="iconBackgroundShapeSelect" value={scheme.iconBackgroundShape || 'circle'} onchange={e => onUpdate(`${pathPrefix}.iconBackgroundShape`, e.currentTarget.value)} class="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
        <option value="circle">Круг</option>
        <option value="rounded-square">Скругленный квадрат</option>
      </select>
    </LabeledInput>
    <ColorInput onUpdate={onUpdate} label="Фон иконки (Вкл)" path={`${pathPrefix}.iconBackgroundColorOn`} value={scheme.iconBackgroundColorOn || ''} />
    <ColorInput onUpdate={onUpdate} label="Фон иконки (Выкл)" path={`${pathPrefix}.iconBackgroundColorOff`} value={scheme.iconBackgroundColorOff || ''} />
  </div>
  <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700 pb-1 mb-2 mt-4">Текст (Выкл)</h4>
  <ColorInput onUpdate={onUpdate} label="Название" path={`${pathPrefix}.nameTextColor`} value={scheme.nameTextColor} />
  <ColorInput onUpdate={onUpdate} label="Статус" path={`${pathPrefix}.statusTextColor`} value={scheme.statusTextColor} />
  <ColorInput onUpdate={onUpdate} label="Значение" path={`${pathPrefix}.valueTextColor`} value={scheme.valueTextColor} />
  <ColorInput onUpdate={onUpdate} label="Ед. изм." path={`${pathPrefix}.unitTextColor`} value={scheme.unitTextColor} />
   <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 pt-2 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">Текст (Вкл)</h4>
  <ColorInput onUpdate={onUpdate} label="Название" path={`${pathPrefix}.nameTextColorOn`} value={scheme.nameTextColorOn} />
  <ColorInput onUpdate={onUpdate} label="Статус" path={`${pathPrefix}.statusTextColorOn`} value={scheme.statusTextColorOn} />
  <ColorInput onUpdate={onUpdate} label="Значение" path={`${pathPrefix}.valueTextColorOn`} value={scheme.valueTextColorOn} />
  <ColorInput onUpdate={onUpdate} label="Ед. изм." path={`${pathPrefix}.unitTextColorOn`} value={scheme.unitTextColorOn} />
</Section>
<Section title="Элементы интерфейса">
  <ColorInput onUpdate={onUpdate} label="Текст вкладок" path={`${pathPrefix}.tabTextColor`} value={scheme.tabTextColor} />
  <ColorInput onUpdate={onUpdate} label="Активная вкладка" path={`${pathPrefix}.activeTabTextColor`} value={scheme.activeTabTextColor} />
  <ColorInput onUpdate={onUpdate} label="Индикатор вкладки" path={`${pathPrefix}.tabIndicatorColor`} value={scheme.tabIndicatorColor} />
  <ColorInput onUpdate={onUpdate} label="Цвет часов" path={`${pathPrefix}.clockTextColor`} value={scheme.clockTextColor} />
</Section>
<Section title="Термостат">
  <ColorInput onUpdate={onUpdate} label="Ручка" path={`${pathPrefix}.thermostatHandleColor`} value={scheme.thermostatHandleColor} />
  <ColorInput onUpdate={onUpdate} label="Текст цели" path={`${pathPrefix}.thermostatDialTextColor`} value={scheme.thermostatDialTextColor} />
  <ColorInput onUpdate={onUpdate} label="Подпись цели" path={`${pathPrefix}.thermostatDialLabelColor`} value={scheme.thermostatDialLabelColor} />
  <ColorInput onUpdate={onUpdate} label="Цвет нагрева" path={`${pathPrefix}.thermostatHeatingColor`} value={scheme.thermostatHeatingColor} />
  <ColorInput onUpdate={onUpdate} label="Цвет охлаждения" path={`${pathPrefix}.thermostatCoolingColor`} value={scheme.thermostatCoolingColor} />
</Section>
<Section title="Виджет Погоды">
  <RangeInput onUpdate={onUpdate} label="Размер иконки (сейчас)" path={`${pathPrefix}.weatherIconSize`} value={scheme.weatherIconSize || 96} min={32} max={128} step={1} unit="px" />
  <RangeInput onUpdate={onUpdate} label="Размер иконок (прогноз)" path={`${pathPrefix}.weatherForecastIconSize`} value={scheme.weatherForecastIconSize || 48} min={24} max={96} step={1} unit="px" />
  <RangeInput onUpdate={onUpdate} label="Шрифт (темп. сейчас)" path={`${pathPrefix}.weatherCurrentTempFontSize`} value={scheme.weatherCurrentTempFontSize || 36} min={16} max={72} step={1} unit="px" />
  <RangeInput onUpdate={onUpdate} label="Шрифт (описание)" path={`${pathPrefix}.weatherCurrentDescFontSize`} value={scheme.weatherCurrentDescFontSize || 14} min={10} max={24} step={1} unit="px" />
  <RangeInput onUpdate={onUpdate} label="Шрифт (день)" path={`${pathPrefix}.weatherForecastDayFontSize`} value={scheme.weatherForecastDayFontSize || 12} min={8} max={20} step={1} unit="px" />
  <RangeInput onUpdate={onUpdate} label="Шрифт (макс. темп.)" path={`${pathPrefix}.weatherForecastMaxTempFontSize`} value={scheme.weatherForecastMaxTempFontSize || 18} min={12} max={32} step={1} unit="px" />
  <RangeInput onUpdate={onUpdate} label="Шрифт (мин. темп.)" path={`${pathPrefix}.weatherForecastMinTempFontSize`} value={scheme.weatherForecastMinTempFontSize || 14} min={10} max={24} step={1} unit="px" />
</Section>