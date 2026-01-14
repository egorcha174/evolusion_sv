<script lang="ts">
  import type { ColorScheme } from '$lib/types';

  const {
    min,
    max,
    value, // Target temperature
    current, // Current temperature
    onChange,
    hvacAction,
    idleLabelColor,
    heatingLabelColor,
    coolingLabelColor,
    colorScheme,
    gradientColors
  } = $props<{
    min: number;
    max: number;
    value: number; // Target temperature
    current: number; // Current temperature
    onChange: (value: number) => void;
    hvacAction: string;
    idleLabelColor?: string;
    heatingLabelColor?: string;
    coolingLabelColor?: string;
    colorScheme: ColorScheme['light'];
    gradientColors?: string[];
  }>();

  const SIZE = 200;
  const STROKE_WIDTH = 20;
  const RADIUS = SIZE / 2 - STROKE_WIDTH / 2;
  const CENTER = SIZE / 2;
  const START_ANGLE = 135;
  const END_ANGLE = 405;

  let isEditing = $state(false);
  let inputValue = $state('');
  let svgElement: SVGSVGElement | undefined;

  $effect(() => {
    if (!isEditing) {
      inputValue = value.toFixed(1).replace('.', ',');
    }
  });

  // Helper functions
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const valueToAngle = (value: number, min: number, max: number, startAngle: number, endAngle: number) => {
    const range = max - min;
    if (range === 0) return startAngle;
    const valueRatio = (value - min) / range;
    return valueRatio * (endAngle - startAngle) + startAngle;
  };

  const valueAngle = $derived(valueToAngle(value, min, max, START_ANGLE, END_ANGLE));
  const handlePosition = $derived(polarToCartesian(CENTER, CENTER, RADIUS, valueAngle));

  const getLabelAndStyle = () => {
    const customActionLabels: Record<string, string> = {
      'humidifying': 'УВЛАЖНЕНИЕ',
      'drying': 'ОСУШЕНИЕ',
    };
    
    const customActionLabel = customActionLabels[hvacAction];
    
    if (customActionLabel) {
      return {
        label: customActionLabel,
        style: `color: ${heatingLabelColor || 'var(--thermo-heat)'}`,
      };
    }

    switch (hvacAction) {
      case 'cooling': return {
          label: 'ОХЛАЖДЕНИЕ',
          style: `color: ${coolingLabelColor || 'var(--thermo-cool)'}`,
      };
      case 'heating': return {
          label: 'НАГРЕВ',
          style: `color: ${heatingLabelColor || 'var(--thermo-heat)'}`,
      };
      default: return {
          label: 'ЦЕЛЬ',
          style: `color: ${idleLabelColor || 'var(--thermo-label)'}`,
      };
    }
  };

  const { label: centerLabel, style: activeStyle } = $derived(getLabelAndStyle());

  function handlePointerDown(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as Element;
    if (target) {
      target.setPointerCapture(e.pointerId);
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!svgElement) return;
      const rect = svgElement.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;

      const angleRad = Math.atan2(y - CENTER, x - CENTER);
      let angleDeg = (angleRad * 180) / Math.PI + 90;
      if (angleDeg < 0) angleDeg += 360;

      const isWithinArc = (angleDeg >= START_ANGLE && angleDeg <= END_ANGLE) || (angleDeg + 360 >= START_ANGLE && angleDeg + 360 <= END_ANGLE);
      
      if (!isWithinArc) {
        const startDist = Math.min(Math.abs(angleDeg - START_ANGLE), Math.abs(angleDeg - (START_ANGLE + 360)));
        const endDist = Math.min(Math.abs(angleDeg - END_ANGLE), Math.abs(angleDeg - (END_ANGLE - 360)));
        angleDeg = startDist < endDist ? START_ANGLE : END_ANGLE;
      }
      
      const range = max - min;
      const angleRange = END_ANGLE - START_ANGLE;
      const valueRatio = (angleDeg - START_ANGLE) / angleRange;
      const rawNewValue = valueRatio * range + min;
      const newValue = Math.round(rawNewValue * 10) / 10; 
      
      if (newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    const handlePointerUp = () => {
      if (target) {
        target.releasePointerCapture(e.pointerId);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    
    handlePointerMove(e);
  }

  function submitNewValue() {
    const newTemp = parseFloat(inputValue.replace(',', '.'));
    if (!isNaN(newTemp) && newTemp >= min && newTemp <= max) {
      onChange(newTemp);
    }
    isEditing = false;
  }

  function handleManualTempSubmit(e: Event) {
    e.preventDefault();
    submitNewValue();
  }

  function adjustTemp(delta: number) {
    const currentTemp = parseFloat(inputValue.replace(',', '.')) || value;
    let newTemp = currentTemp + delta;
    newTemp = Math.max(min, Math.min(max, newTemp));
    inputValue = newTemp.toFixed(1).replace('.', ',');
  }

  $effect(() => {
    if (isEditing) {
      inputValue = value.toFixed(1).replace('.', ',');
    }
  });
</script>

<div class="relative w-full h-full flex items-center justify-center">
  <svg
    bind:this={svgElement}
    viewBox="0 0 {SIZE} {SIZE}"
    class="w-full h-full"
    style="touch-action: none"
  >
    <defs>
      <mask id="thermoValueMask">
        <path
          d={describeArc(CENTER, CENTER, RADIUS, START_ANGLE, END_ANGLE)}
          fill="none"
          stroke="white"
          stroke-width={STROKE_WIDTH}
          stroke-linecap="round"
        />
      </mask>
    </defs>

    <path
      d={describeArc(CENTER, CENTER, RADIUS, START_ANGLE, END_ANGLE)}
      fill="none"
      class="stroke-gray-300 dark:stroke-gray-600"
      stroke-width={STROKE_WIDTH}
      stroke-linecap="round"
    />
    
    <!-- Simplified arc for now - we can add gradient later -->
    <g mask="url(#thermoValueMask)">
      <path
        d={describeArc(CENTER, CENTER, RADIUS, START_ANGLE, valueAngle)}
        fill="none"
        stroke="var(--thermo-heat)"
        stroke-width={STROKE_WIDTH}
        stroke-linecap="round"
      />
    </g>
    
    <path
      d={describeArc(CENTER, CENTER, RADIUS, START_ANGLE, END_ANGLE)}
      fill="none"
      stroke="transparent"
      stroke-width={STROKE_WIDTH + 8}
      stroke-linecap="round"
      class="cursor-pointer"
      onpointerdown={handlePointerDown}
    />

    <circle
      cx={handlePosition.x}
      cy={handlePosition.y}
      r={STROKE_WIDTH / 2 + 2}
      style="fill: var(--thermo-handle)"
      class="cursor-pointer"
      onpointerdown={handlePointerDown}
    />
  </svg>
  
  <div
    class="absolute top-1/2 left-1/2 w-[78%] h-[78%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full"
    onclick={() => (isEditing = true)}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && (isEditing = true)}
  >
    <div class="absolute top-[15%] left-0 right-0 h-[20%] flex items-center justify-center">
      <p 
        class="font-bold text-center truncate" 
        style={activeStyle}
      >
        {centerLabel}
      </p>
    </div>
    <div class="w-full h-full flex items-center justify-center">
      <div class="w-full h-[60%] flex items-center justify-center">
        <p 
          class="font-light text-center" 
          style="color: var(--thermo-text)"
        >
          {value.toFixed(1).replace('.', ',')}
        </p>
      </div>
    </div>
  </div>
  
  {#if isEditing}
    <div
      class="absolute inset-0 bg-gray-200/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-full flex items-center justify-center z-20"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div class="flex items-center justify-center">
        <form onsubmit={handleManualTempSubmit}>
          <input
            type="text"
            inputmode="decimal"
            bind:value={inputValue}
            onblur={submitNewValue}
            class="bg-transparent text-gray-900 dark:text-white text-6xl font-light w-44 text-center outline-none p-0 m-0"
            onchange={(e) => {
              const sanitizedValue = e.currentTarget.value.replace('.', ',');
              if (sanitizedValue === '' || /^\d{1,2}(,\d{0,1})?$/.test(sanitizedValue)) {
                inputValue = sanitizedValue;
              }
            }}
          />
          <button type="submit" class="hidden">Установить</button>
        </form>
        <div class="flex flex-col -ml-2">
          <button
            type="button"
            aria-label="Increase Temperature"
            onmousedown={(e) => e.preventDefault()}
            onclick={() => adjustTemp(0.1)}
            class="text-gray-500 hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={3}>
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Decrease Temperature"
            onmousedown={(e) => e.preventDefault()}
            onclick={() => adjustTemp(-0.1)}
            class="text-gray-500 hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={3}>
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
