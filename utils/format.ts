export function formatDateTime(input: string) {
  if (!input) {
    return '--';
  }
  return input.replace('T', ' ').slice(0, 16);
}
