const colors = [
  '#7FB5B5',
  '#646B63',
  '#317F43',
  '#E7EBDA',
  '#A5A5A5',
  '#82898F',
  '#E4A010',
  '#E1CC4F',
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

export function chargeCodeToColor(code: string, opacity = 0.4) {
  const value = code.charCodeAt(0) * 10000 + parseInt(code.substring(1));
  const hexColor = colors[value % colors.length];
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return colors[0];
  }

  return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`;
}
