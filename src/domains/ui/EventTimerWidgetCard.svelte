<script lang="ts">
  import type { Device, ThemeColors } from '$lib/types';

  const { device, colorScheme } = $props<{
    device: Device;
    colorScheme: ThemeColors;
  }>();

  const fillPercentage = $derived(device.fillPercentage ?? 0);
  const daysRemaining = $derived(device.daysRemaining ?? 0);
  const fillColors = $derived(device.fillColors);
  const animation = $derived(device.animation);
  const fillDirection = $derived(device.fillDirection);
  const showName = $derived(device.showName);
  const name = $derived(device.name);
  const nameFontSize = $derived(device.nameFontSize);
  const namePosition = $derived(device.namePosition);
  const daysRemainingFontSize = $derived(device.daysRemainingFontSize);
  const daysRemainingPosition = $derived(device.daysRemainingPosition);

  const effectiveAnimation = $derived(animation || 'smooth');
  const effectiveFillDirection = $derived(fillDirection || 'bottom-to-top');

  const finalNamePosition = $derived(namePosition || { x: 50, y: 15 });
  const finalDaysPosition = $derived(daysRemainingPosition || { x: 50, y: 50 });

  // Вспомогательные функции для работы с цветом
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    if (!c1 || !c2) return color1; // Fallback

    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    return rgbToHex(r, g, b);
  };

  // Функция для определения цвета заливки в зависимости от процента и настроек
  const getFillColor = (percentage: number): string => {
    const [start = '#22c55e', mid = '#f59e0b', end = '#ef4444'] = fillColors || [];
    
    if (percentage < 50) {
      // Интерполяция между начальным и средним цветом
      return interpolateColor(start, mid, percentage / 50);
    } else {
      // Интерполяция между средним и конечным цветом
      return interpolateColor(mid, end, (percentage - 50) / 50);
    }
  };

  const fillColor = $derived(getFillColor(fillPercentage));
  
  const isTopDown = $derived(effectiveFillDirection === 'top-to-bottom');
  // Если "сверху вниз", то визуальный процент заполнения - это инверсия прошедшего времени (эффект опустошения)
  const visualFillPercentage = $derived(isTopDown ? 100 - fillPercentage : fillPercentage);

  // Generate bubbles data
  const bubbles = $derived(Array.from({ length: 20 }).map((_, i) => {
    const willRise = Math.random() > 0.4; // 60% пузырьков будут всплывать доверху
    return {
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 12 + 4}px`, // Размер от 4px до 16px
      duration: willRise ? `${Math.random() * 8 + 6}s` : `${Math.random() * 3 + 2}s`, // Всплывающие медленнее, лопающиеся быстрее
      delay: `${Math.random() * 10}s`, // Задержка до 10s
      wobble: `${(Math.random() - 0.5) * 20}px`,
      animationName: willRise ? 'bubble-rise' : 'bubble-pop',
      positionClass: 'bottom-0' // Все пузырьки появляются снизу
    };
  }));
</script>

<style>
  @keyframes bubble-rise {
    0% {
      transform: translateY(0) translateX(var(--bubble-wobble));
      opacity: 0.7;
    }
    70% {
      opacity: 0.4;
    }
    100% {
      transform: translateY(-100%) translateX(var(--bubble-wobble));
      opacity: 0;
    }
  }

  @keyframes bubble-pop {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-20%) scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: translateY(-40%) scale(0);
      opacity: 0;
    }
  }

  @keyframes wave {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .animate-wave {
    animation: wave 4s linear infinite;
  }
</style>

<div 
  class="w-full h-full relative overflow-hidden text-white select-none"
  style="
    border-radius: var(--radius-card);
    border-width: var(--border-width-card);
    border-style: solid;
    border-color: var(--border-color-card);
    background-color: var(--bg-card-raw);
  "
>
  <!-- Слой с "жидкой" заливкой, всегда спозиционированный снизу -->
  <div
    class="absolute bottom-0 left-0 right-0"
    style="
      height: {visualFillPercentage}%;
      background-color: {fillColor};
      transition: {effectiveAnimation === 'smooth' 
        ? 'height 0.7s ease-in-out, background-color 0.5s linear' 
        : 'background-color 0.5s linear'};
    "
  >
    <!-- Пузырьки всегда поднимаются снизу -->
    {#if effectiveAnimation === 'bubbles'}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        {#each bubbles as bubble (bubble.id)}
          <div
            class="absolute rounded-full bg-white/20 {bubble.positionClass}"
            style="
              left: {bubble.left};
              width: {bubble.size};
              height: {bubble.size};
              animation: {bubble.animationName} {bubble.duration} {bubble.delay} infinite ease-in-out;
              --bubble-wobble: {bubble.wobble};
            "
          ></div>
        {/each}
      </div>
    {/if}

    <!-- Волна всегда располагается наверху жидкой части -->
    {#if effectiveAnimation === 'wave'}
      <svg
        class="absolute left-0 w-[200%] animate-wave"
        viewBox="0 0 2000 50"
        preserveAspectRatio="none"
        style="
          height: 50px;
          top: -49px;
        "
      >
        <path
          d="M0,25 C300,50 700,0 1000,25 C1300,50 1700,0 2000,25 L2000,51 L0,51 Z"
          style="
            stroke: none;
            fill: {fillColor};
            transition: fill 0.5s linear;
          "
        />
      </svg>
    {/if}
  </div>

  <!-- Слой с контентом -->
  <div class="relative w-full h-full p-4">
    {#if showName}
      <div 
        class="absolute -translate-x-1/2 -translate-y-1/2 text-center"
        style="
          top: {finalNamePosition.y}%;
          left: {finalNamePosition.x}%;
          color: var(--text-name-on);
          text-shadow: 0 1px 5px rgba(0,0,0,0.4);
        "
      >
        <p 
          class="font-semibold" 
          style="font-size: {nameFontSize ? `${nameFontSize}px` : '1.125rem'}"
        >
          {name}
        </p>
      </div>
    {/if}

    <div 
      class="absolute -translate-x-1/2 -translate-y-1/2"
      style="
        top: {finalDaysPosition.y}%;
        left: {finalDaysPosition.x}%;
        color: var(--text-name-on);
        text-shadow: 0 2px 10px rgba(0,0,0,0.5);
      "
    >
      <p 
        class="font-bold tracking-tighter"
        style="font-size: {daysRemainingFontSize ? `${daysRemainingFontSize}px` : '5.5rem'}"
      >
        {daysRemaining}
      </p>
    </div>
  </div>
</div>