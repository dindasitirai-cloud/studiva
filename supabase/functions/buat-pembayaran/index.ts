// Edge Function: buat-pembayaran
// Dipanggil orang tua yang sudah login dari halaman paket Rekah.
// Body: { plan: 'monthly' | 'quarterly' | 'yearly', penyedia?: 'midtrans' | 'xendit' }
// Balasan: { url, kode_order } → klien diarahkan ke halaman bayar penyedia.
import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  CORS, HARGA, json, env, penyediaAktif, basicAuth, midtransProduksi,
  type Paket, type Penyedia,
} from '../_shared/bayar.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Metode tidak didukung.' }, 405);

  // ── 1. Siapa yang meminta ────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  const urlSupabase = env('SUPABASE_URL');
  const klienPengguna = createClient(urlSupabase, env('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await klienPengguna.auth.getUser();
  if (!user || !user.email) return json({ error: 'Silakan masuk dulu untuk melanjutkan pembayaran.' }, 401);

  // ── 2. Paket & penyedia ──────────────────────────────────────────────────
  let body: { plan?: string; penyedia?: string } = {};
  try { body = await req.json(); } catch { /* body kosong */ }
  const paket = body.plan as Paket;
  if (!HARGA[paket]) return json({ error: 'Paket tidak dikenal.' }, 400);

  const tersedia = penyediaAktif();
  if (tersedia.length === 0) return json({ error: 'Pembayaran belum dikonfigurasi. Hubungi tim Rekah.' }, 503);
  const diminta = body.penyedia as Penyedia | undefined;
  const bawaan = (env('PENYEDIA_BAWAAN') as Penyedia) || tersedia[0];
  const penyedia: Penyedia = diminta && tersedia.includes(diminta) ? diminta : (tersedia.includes(bawaan) ? bawaan : tersedia[0]);

  const { jumlah, label } = HARGA[paket];
  const kodeOrder = `RKH-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;
  const situs = env('SITUS_URL') || 'https://rekah.app';
  const urlSelesai = `${situs}/pembayaran/selesai?order=${encodeURIComponent(kodeOrder)}`;
  const nama = (user.user_metadata?.name as string | undefined) || user.email.split('@')[0];
  const deskripsi = `Langganan Rekah ${label}`;

  // ── 3. Catat pembayaran (service_role) ───────────────────────────────────
  const admin = createClient(urlSupabase, env('SUPABASE_SERVICE_ROLE_KEY'));
  // Pastikan baris orang_tua ada (FK) — bisa belum ada bila konfirmasi email aktif saat daftar.
  await admin.from('orang_tua').upsert({ id: user.id, email: user.email }, { onConflict: 'id', ignoreDuplicates: true });
  const { error: errSimpan } = await admin.from('pembayaran').insert({
    kode_order: kodeOrder, id_orang_tua: user.id, penyedia, paket, jumlah, status: 'menunggu',
  });
  if (errSimpan) {
    console.error('[buat-pembayaran] gagal simpan', errSimpan);
    return json({ error: 'Gagal mencatat pembayaran. Coba lagi sebentar.' }, 500);
  }

  // ── 4. Minta tautan bayar ke penyedia ────────────────────────────────────
  let urlBayar = '';
  let referensi: string | null = null;
  try {
    if (penyedia === 'midtrans') {
      const host = midtransProduksi() ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
      const r = await fetch(`${host}/snap/v1/transactions`, {
        method: 'POST',
        headers: { Authorization: basicAuth(env('MIDTRANS_SERVER_KEY')), 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          transaction_details: { order_id: kodeOrder, gross_amount: jumlah },
          item_details: [{ id: paket, price: jumlah, quantity: 1, name: deskripsi }],
          customer_details: { first_name: nama, email: user.email },
          callbacks: { finish: urlSelesai },
          expiry: { unit: 'hours', duration: 24 },
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.redirect_url) throw new Error(`Midtrans ${r.status}: ${JSON.stringify(d.error_messages ?? d)}`);
      urlBayar = d.redirect_url;
      referensi = d.token ?? null;
    } else {
      const r = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: { Authorization: basicAuth(env('XENDIT_SECRET_KEY')), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          external_id: kodeOrder,
          amount: jumlah,
          currency: 'IDR',
          payer_email: user.email,
          description: deskripsi,
          invoice_duration: 86400,
          customer: { given_names: nama, email: user.email },
          items: [{ name: deskripsi, quantity: 1, price: jumlah }],
          success_redirect_url: urlSelesai,
          failure_redirect_url: urlSelesai,
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.invoice_url) throw new Error(`Xendit ${r.status}: ${d.message ?? JSON.stringify(d)}`);
      urlBayar = d.invoice_url;
      referensi = d.id ?? null;
    }
  } catch (e) {
    console.error('[buat-pembayaran]', e);
    await admin.from('pembayaran').update({ status: 'gagal', diperbarui_pada: new Date().toISOString() }).eq('kode_order', kodeOrder);
    return json({ error: 'Halaman pembayaran belum bisa dibuka. Coba lagi sebentar lagi.' }, 502);
  }

  await admin.from('pembayaran')
    .update({ url_bayar: urlBayar, referensi_penyedia: referensi, diperbarui_pada: new Date().toISOString() })
    .eq('kode_order', kodeOrder);

  return json({ url: urlBayar, kode_order: kodeOrder, penyedia });
});
