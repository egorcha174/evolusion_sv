
import type { BaseThemeSettings } from './types';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function validateBaseThemeSettings(s: BaseThemeSettings): ValidationResult {
  const result: ValidationResult = { ok: true, errors: [], warnings: [] };

  // ID Validation
  if (!s.themeId || !/^[a-z0-9_]+$/.test(s.themeId)) {
    result.errors.push("Theme ID must use only lowercase letters, numbers, and underscores.");
  }

  // Name Validation
  if (!s.themeName || s.themeName.trim().length === 0) {
    result.errors.push("Theme Name is required.");
  }

  // Primary Color
  if (!/^#[0-9A-F]{6}$/i.test(s.primary)) {
    result.errors.push("Primary color must be a valid HEX code (e.g., #007AFF).");
  }

  // Opacity Clamp Check
  if (s.cardOpacity < 0 || s.cardOpacity > 1) {
    result.warnings.push("Card opacity out of bounds, will be clamped.");
  }
  if (s.panelOpacity < 0 || s.panelOpacity > 1) {
    result.warnings.push("Panel opacity out of bounds, will be clamped.");
  }

  if (result.errors.length > 0) result.ok = false;

  return result;
}
