export function roundToNextQuarter(value: number | string) {
  return Math.ceil(Number(value) * 4) / 4;
}
