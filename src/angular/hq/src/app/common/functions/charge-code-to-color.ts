const colors = [
  '#EDFF21',
  '#287233',
  '#4C514A',
  '#EDFF21',
  '#252850',
  '#F4F4F4',
  '#B8B799',
  '#763C28',
  '#5E2129',
  '#8E402A',
  '#E55137',
  '#5E2129',
  '#4C514A',
  '#686C5E',
  '#606E8C',
  '#D84B20',
  '#705335',
  '#9D9101',
  '#F44611',
  '#1E213D',
  '#E55137',
  '#382C1E',
  '#1D334A',
  '#403A3A',
  '#008F39',
  '#5D9B9B',
  '#2F4538',
  '#1E2460',
  '#F4F4F4',
  '#4E3B31',
  '#C6A664',
  '#8A6642',
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function chargeCodeToColor(code?: string, opacity = 0.5) {
  code ??= '';

  const value = code
    .split('')
    .map((t) => t.charCodeAt(0))
    .reduce((acc, curr) => acc + curr, 0);

  const hexColor = colors[value % colors.length];
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return colors[0];
  }

  return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`;
}
