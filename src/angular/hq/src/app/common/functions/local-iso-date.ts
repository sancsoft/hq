export function localISODate() {
  return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
}
