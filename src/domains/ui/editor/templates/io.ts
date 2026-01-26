import type { CardTemplate } from '$lib/types';

export function exportTemplate(template: CardTemplate): void {
  const dataStr =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute(
    'download',
    `${template.name.replace(/\s+/g, '_')}_template.json`
  );
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export async function importTemplate(file: File): Promise<CardTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result?.toString();
        if (!text) throw new Error('Empty file');

        const json = JSON.parse(text);

        // Basic validation
        if (!json.style || typeof json.name !== 'string') {
          throw new Error('Invalid template format');
        }

        // Ensure ID exists (if missing in file, generate new)
        if (!json.id) json.id = crypto.randomUUID();

        resolve(json as CardTemplate);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
