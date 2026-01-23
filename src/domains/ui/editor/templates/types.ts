
export interface CardTemplateStyle {
  // Background
  backgroundType: 'color' | 'transparent';
  backgroundColor: string;
  
  // Border
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  
  // Effects
  shadow: 'none' | 'sm' | 'md' | 'lg';
  opacity: number;
  
  // Padding (internal spacing)
  padding: number;
}

export interface CardTemplate {
  id: string;
  name: string;
  description?: string;
  style: CardTemplateStyle;
  // Future extensibility for content/logic
  content?: Record<string, any>;
}

export function createDefaultCardTemplate(): CardTemplate {
  return {
    id: crypto.randomUUID(),
    name: 'New Template',
    style: {
      backgroundType: 'color',
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 12,
      shadow: 'sm',
      opacity: 1,
      padding: 16
    }
  };
}
