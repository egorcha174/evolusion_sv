export function extractDomain(entityId: string): string {
  return entityId.split('.')[0];
}

export function extractEntity(entityId: string): string {
  return entityId.split('.')[1] || '';
}

export function isToggleable(domain: string): boolean {
  return ['light', 'switch', 'cover', 'lock', 'input_boolean', 'automation', 'script'].includes(
    domain
  );
}

export function getDomainColor(domain: string): string {
  const colors: Record<string, string> = {
    light: '#ffc107',
    switch: '#2196f3',
    sensor: '#4caf50',
    binary_sensor: '#8bc34a',
    climate: '#ff9800',
    cover: '#9c27b0',
    media_player: '#3f51b5',
    lock: '#e91e63',
  };
  return colors[domain] || '#757575';
}
