// Color utilities for badge contrast and alpha conversion
export const hexToRgb = (hex: string) => {
  if (!hex) return null;
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

export const rgbToLuminance = (r: number, g: number, b: number) => {
  const srgb = [r, g, b].map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

export const isLightColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const lum = rgbToLuminance(rgb.r, rgb.g, rgb.b);
  return lum > 0.5;
};

export const readableTextColor = (hex: string) => {
  return isLightColor(hex) ? '#0b0f14' : '#ffffff';
};

export const rgbaFromHex = (hex: string, alpha = 0.18) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return undefined;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

export default { hexToRgb, rgbToLuminance, isLightColor, readableTextColor, rgbaFromHex };
