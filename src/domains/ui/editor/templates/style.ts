
import type { CardTemplateStyle } from '$lib/types';

// For Preview Component (Inline Styles)
export function buildCardStyle(style: CardTemplateStyle): string {
  const parts: string[] = [];

  // Background
  if (style.backgroundType === 'transparent') {
    parts.push('background: transparent');
  } else {
    parts.push(`background-color: ${style.backgroundColor}`);
  }

  // Border Settings Removed from Template
  // We rely on the context (CSS classes) to provide border styles 
  // or the Preview component to mock them using var().

  // Opacity
  parts.push(`opacity: ${style.opacity}`);

  // Padding
  parts.push(`padding: ${style.padding}px`);

  // Shadow
  switch (style.shadow) {
    case 'sm':
      parts.push('box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)');
      break;
    case 'md':
      parts.push('box-shadow: 0 4px 6px rgba(0,0,0,0.1)');
      break;
    case 'lg':
      parts.push('box-shadow: 0 10px 15px rgba(0,0,0,0.1)');
      break;
    case 'none':
    default:
      parts.push('box-shadow: none');
      break;
  }

  return parts.join('; ');
}

// Generates CSS variables for DeviceCard integration
export function getTemplateCssVariables(style: CardTemplateStyle): string {
  const parts: string[] = [];

  // Map Template properties to DeviceCard CSS variables.
  // We apply the same background to both default and 'on' states 
  // to ensure the template's look persists.
  
  if (style.backgroundType === 'transparent') {
    parts.push('--card-background: transparent');
    parts.push('--card-background-on: transparent');
  } else {
    parts.push(`--card-background: ${style.backgroundColor}`);
    parts.push(`--card-background-on: ${style.backgroundColor}`);
  }

  // REMOVED: Border overrides. 
  // Now DeviceCard will use the Global Theme's --card-border-* variables.
  // This ensures that when a device is Active, the theme's active border color applies.

  parts.push(`--card-opacity: ${style.opacity}`);
  parts.push(`--card-padding: ${style.padding}px`);

  switch (style.shadow) {
    case 'sm':
      parts.push('--shadow-card: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)');
      break;
    case 'md':
      parts.push('--shadow-card: 0 4px 6px rgba(0,0,0,0.1)');
      break;
    case 'lg':
      parts.push('--shadow-card: 0 10px 15px rgba(0,0,0,0.1)');
      break;
    case 'none':
      parts.push('--shadow-card: none');
      break;
  }

  return parts.join('; ');
}
