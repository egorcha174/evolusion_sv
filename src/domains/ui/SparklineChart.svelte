<script lang="ts">
  export let data: number[]; // Массив числовых значений для построения графика
  export let width: number = 100; // Ширина SVG-холста (внутренняя)
  export let height: number = 30; // Высота SVG-холста (внутренняя)
  export let strokeWidth: number = 1.5; // Толщина линии
  export let strokeColor: string = '#6B7280'; // text-gray-500
  export let styleType: 'line' | 'gradient' = 'gradient'; // Тип графика
  
  let linePathData: string = '';
  let areaPathData: string = '';
  
  $: computePaths();
  
  function computePaths() {
    // Не рендерим ничего, если данных недостаточно для построения линии.
    if (!data || data.length < 2) {
      linePathData = '';
      areaPathData = '';
      return;
    }
    
    // Находим минимальное и максимальное значения для масштабирования графика по оси Y.
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // Добавляем небольшой отступ сверху и снизу, чтобы линия не касалась краев.
    const yPadding = height * 0.1;
    const effectiveHeight = height - (yPadding * 2);
    
    // Преобразуем массив данных в строку SVG-координат.
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = range === 0 
        ? height / 2 // Если все значения одинаковы, рисуем прямую линию посередине.
        : yPadding + (effectiveHeight - ((point - min) / range) * effectiveHeight);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    
    // Создаем SVG-путь для линии.
    linePathData = `M ${points.join(' L ')}`;
    
    // Создаем SVG-путь для области под линией (для градиента).
    areaPathData = `${linePathData} V ${height} H 0 Z`;
  }
</script>

{#if data && data.length >= 2}
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 {width} {height}"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Определяем градиент для заливки области под графиком. -->
      <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:{strokeColor};stop-opacity:0.4"/>
        <stop offset="100%" style="stop-color:{strokeColor};stop-opacity:0"/>
      </linearGradient>
    </defs>
    
    {#if styleType === 'gradient'}
      <path
        d={areaPathData}
        fill="url(#sparkline-gradient)"
        stroke="none"
      />
    {/if}

    <path
      d={linePathData}
      fill="none"
      stroke={strokeColor}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/if}
