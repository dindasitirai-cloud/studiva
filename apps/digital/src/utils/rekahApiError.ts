export function dispatchRekahError(pesan: string): void {
  window.dispatchEvent(new CustomEvent('rekah:api-error', { detail: pesan }));
}
