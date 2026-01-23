
import type { CardTemplateStyle } from './types';

export function buildCardStyle(style: CardTemplateStyle): string {
  const parts: string[] = [];

  // Background
  if (style.backgroundType === 'transparent') {
    parts.push('background: transparent');
  } else {
    parts.push(`background-color: ${style.backgroundColor}`);
  }

  // Border
  parts.push(`border: ${style.borderWidth}px solid ${style.borderColor}`);
  parts.push(`border-radius: ${style.borderRadius}px`);

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
