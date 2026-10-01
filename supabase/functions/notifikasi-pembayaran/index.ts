// Edge Function: notifikasi-pembayaran (webhook — dipasang TANPA verifikasi JWT)
// URL yang didaftarkan di dashboard penyedia:
//   Midtrans → https://<project>.supabase.co/functions/v1/notifikasi-pembayaran?penyedia=midtrans
//   Xendit   → https://<project>.supabase.co/functions/v1/notifikasi-pembayaran?penyedia=xendit
// Keaslian dicek: Midtrans lewat signature_key (SHA-512), Xendit lewat header x-callback-token.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { json, env, sha512Hex, samaAman } from '../_shared/bayar.ts';

type Hasil = { kode: string; status: 'lunas' | 'gagal' | 'kedaluwarsa' | 'menunggu'; jumlah: number; referensi: string | null; metode: string | null };

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ ok: true });
  const penyedia = new URL(req.url).searchParams.get('penyedia');
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'Body tidak valid' }, 400); }

  let hasil: Hasil;

  if (penyedia === 'midtrans') {
    const kunci = env('MIDTRANS_SERVER_KEY');
    const kode = String(body.order_id ?? '');
    const harusnya = await sha512Hex(`${kode}${body.status_code ?? ''}${body.gross_amount ?? ''}${kunci}`);
    if (!kunci || !samaAman(harusnya, String(body.signature_key ?? ''))) {
      console.warn('[notifikasi] tanda tangan Midtrans tidak cocok', kode);
      return json({ error: 'Tanda tangan tidak valid' }, 401);
    }
    const ts = String(body.transaction_status ?? '');
    const fraud = String(body.fraud_status ?? 'accept');
    const status: Hasil['status'] =
      ts === 'settlement' || (ts === 'capture' && fraud === 'accept') ? 'lunas'
      : ts === 'expire' ? 'kedaluwarsa'
      : ts === 'cancel' || ts === 'deny' || ts === 'failure' ? 'gagal'
      : 'menunggu';
    hasil = {
      kode, status,
      jumlah: Math.round(Number(body.gross_amount ?? 0)),
      referensi: body.transaction_id ? String(body.transaction_id) : null,
      metode: body.payment_type ? String(body.payment_type) : null,
    };
  } else if (penyedia === 'xendit') {
    const token = env('XENDIT_CALLBACK_TOKEN');
    if (!token || !samaAman(token, req.headers.get('x-callback-token') ?? '')) {
      console.warn('[notifikasi] token Xendit tidak cocok');
      return json({ error: 'Token tidak valid' }, 401);
    }
    const st = String(body.status ?? '').toUpperCase();
    hasil = {
      kode: String(body.external_id ?? ''),
      status: st === 'PAID' || st === 'SETTLED' ? 'lunas' : st === 'EXPIRED' ? 'kedaluwarsa' : 'menunggu',
      jumlah: Math.round(Number(body.paid_amount ?? body.amount ?? 0)),
      referensi: body.id ? String(body.id) : null,
      metode: body.payment_method ? String(body.payment_method).toLowerCase() : (body.payment_channel ? String(body.payment_channel).toLowerCase() : null),
    };
  } else {
    return json({ error: 'Parameter penyedia wajib (?penyedia=midtrans|xendit)' }, 400);
  }

  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
  const { data: bayar } = await admin.from('pembayaran').select('id, jumlah, penyedia, status').eq('kode_order', hasil.kode).maybeSingle();
  if (!bayar) {
    // Notifikasi uji dari dashboard penyedia (order fiktif) — jawab 200 agar tidak dikirim ulang.
    console.warn('[notifikasi] kode order tidak dikenal', hasil.kode);
    return json({ ok: true, catatan: 'order tidak dikenal' });
  }
  if (bayar.penyedia !== penyedia) return json({ error: 'Penyedia tidak cocok' }, 400);

  // Simpan isi notifikasi tanpa data sensitif.
  const catatan = { ...body };
  delete (catatan as Record<string, unknown>).signature_key;

  if (hasil.status === 'lunas') {
    if (hasil.jumlah !== bayar.jumlah) {
      console.error('[notifikasi] jumlah tidak cocok', hasil.kode, hasil.jumlah, bayar.jumlah);
      return json({ error: 'Jumlah tidak cocok' }, 400);
    }
    const { data, error } = await admin.rpc('lunasi_pembayaran', {
      p_kode_order: hasil.kode, p_referensi: hasil.referensi, p_metode: hasil.metode, p_catatan: catatan,
    });
    if (error) { console.error('[notifikasi] gagal melunasi', error); return json({ error: 'Gagal memproses' }, 500); }
    return json({ ok: true, hasil: data });
  }

  if ((hasil.status === 'gagal' || hasil.status === 'kedaluwarsa') && bayar.status === 'menunggu') {
    await admin.from('pembayaran').update({
      status: hasil.status, catatan_penyedia: catatan, metode: hasil.metode, diperbarui_pada: new Date().toISOString(),
    }).eq('id', bayar.id);
  }
  return json({ ok: true });
});
