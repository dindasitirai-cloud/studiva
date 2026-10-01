// Bagian bersama untuk fungsi pembayaran Rekah (Midtrans & Xendit).
// Harga ditentukan DI SERVER — klien hanya mengirim nama paket, bukan jumlah.

export type Paket = 'monthly' | 'quarterly' | 'yearly';
export type Penyedia = 'midtrans' | 'xendit';

export const HARGA: Record<Paket, { jumlah: number; label: string }> = {
  monthly:   { jumlah: 79_000,  label: 'Bulanan' },
  quarterly: { jumlah: 200_000, label: '3 Bulan' },
  yearly:    { jumlah: 650_000, label: 'Tahunan' },
};

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

export function env(nama: string): string {
  return Deno.env.get(nama) ?? '';
}

/** Penyedia yang kuncinya sudah diisi di Secrets Supabase. */
export function penyediaAktif(): Penyedia[] {
  const out: Penyedia[] = [];
  if (env('MIDTRANS_SERVER_KEY')) out.push('midtrans');
  if (env('XENDIT_SECRET_KEY')) out.push('xendit');
  return out;
}

export function basicAuth(kunci: string): string {
  return 'Basic ' + btoa(kunci + ':');
}

export async function sha512Hex(teks: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(teks));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Bandingkan dua string tanpa membocorkan waktu (untuk token/tanda tangan). */
export function samaAman(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let beda = 0;
  for (let i = 0; i < a.length; i++) beda |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return beda === 0;
}

export function midtransProduksi(): boolean {
  return env('MIDTRANS_IS_PRODUCTION') === 'true';
}
