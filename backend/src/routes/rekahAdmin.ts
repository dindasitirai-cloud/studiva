import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import { db } from '../database';
import { kcUpsert } from '../models/KcManaged';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin'));

// Client khusus admin — menggunakan service_role key, bypass RLS.
// Hanya di-instantiate saat route ini dipanggil; server tidak crash bila env belum diisi.
function adminSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new ApiError(503, 'Konfigurasi Supabase admin belum diisi di environment.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// POST /api/rekah-admin/koreksi-tanggal-lahir
// Body: { idAnak: string, tanggalBaru: string }
router.post(
  '/koreksi-tanggal-lahir',
  asyncHandler(async (req: Request, res: Response) => {
    const { idAnak, tanggalBaru } = req.body as { idAnak?: string; tanggalBaru?: string };
    if (!idAnak || !tanggalBaru) {
      throw new ApiError(400, 'idAnak dan tanggalBaru wajib diisi.');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalBaru)) {
      throw new ApiError(400, 'Format tanggalBaru harus YYYY-MM-DD.');
    }

    const supabase = adminSupabase();
    const { error } = await supabase.rpc('admin_koreksi_tanggal_lahir', {
      p_id_anak: idAnak,
      p_tanggal_lahir: tanggalBaru,
    });

    if (error) throw new ApiError(500, `Gagal koreksi tanggal lahir: ${error.message}`);
    res.json({ ok: true });
  }),
);

// POST /api/rekah-admin/tolak-koreksi
// Body: { idAnak: string }
router.post(
  '/tolak-koreksi',
  asyncHandler(async (req: Request, res: Response) => {
    const { idAnak } = req.body as { idAnak?: string };
    if (!idAnak) throw new ApiError(400, 'idAnak wajib diisi.');

    const supabase = adminSupabase();
    const { error } = await supabase.rpc('admin_tolak_koreksi_tanggal_lahir', {
      p_id_anak: idAnak,
    });

    if (error) throw new ApiError(500, `Gagal menolak permohonan: ${error.message}`);
    res.json({ ok: true });
  }),
);

// POST /api/rekah-admin/hapus-anak
// Body: { idAnak: string }
router.post(
  '/hapus-anak',
  asyncHandler(async (req: Request, res: Response) => {
    const { idAnak } = req.body as { idAnak?: string };
    if (!idAnak) throw new ApiError(400, 'idAnak wajib diisi.');

    const supabase = adminSupabase();
    const { error } = await supabase.rpc('admin_hapus_anak', { p_id_anak: idAnak });
    if (error) throw new ApiError(500, `Gagal hapus anak: ${error.message}`);
    res.json({ ok: true });
  }),
);

// POST /api/rekah-admin/hapus-orang-tua
// Body: { idOrangTua: string }
router.post(
  '/hapus-orang-tua',
  asyncHandler(async (req: Request, res: Response) => {
    const { idOrangTua } = req.body as { idOrangTua?: string };
    if (!idOrangTua) throw new ApiError(400, 'idOrangTua wajib diisi.');

    const supabase = adminSupabase();
    const { error } = await supabase.rpc('admin_hapus_orang_tua', { p_id_orang_tua: idOrangTua });
    if (error) throw new ApiError(500, `Gagal hapus orang tua: ${error.message}`);
    res.json({ ok: true, note: 'Hapus entri auth.users via Supabase Admin Dashboard secara terpisah.' });
  }),
);

// POST /api/rekah-admin/terapkan-konten/:id
// Membaca konten_draf yang sudah 'disetujui' Fitri dan menerapkan ke Express DB / Supabase.
// Hanya admin yang boleh memicu — Fitri (peninjau_klinis) menyetujui, admin menerapkan.
router.post(
  '/terapkan-konten/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, 'id pipeline wajib diisi.');

    const supabase = adminSupabase();

    // Ambil draf yang sudah disetujui
    const { data: draf, error: fetchErr } = await supabase
      .from('konten_draf')
      .select('*')
      .eq('id', id)
      .eq('status', 'disetujui')
      .maybeSingle();

    if (fetchErr) throw new ApiError(500, fetchErr.message);
    if (!draf) throw new ApiError(404, 'Draf tidak ditemukan atau belum disetujui Fitri.');

    const jenis = draf.jenis as string;
    const isi = draf.isi as Record<string, unknown>;

    if (jenis === 'sikap') {
      // Terapkan via SECURITY DEFINER function — menulis ke tabel sikap Supabase
      const { error: rpcErr } = await supabase.rpc('terapkan_sikap', { p_id_draf: id });
      if (rpcErr) throw new ApiError(500, `Gagal terapkan sikap: ${rpcErr.message}`);
      res.json({ ok: true, jenis, pesan: 'Sikap berhasil tayang di Supabase.' });
      return;
    }

    if (jenis === 'panduan_tumbuh') {
      // Terapkan ke Express knowledge_cards table.
      // idSumber bisa berupa numeric knowledge_cards.id (dari form lama) atau slug string (form pipelineOnly).
      // Jika bukan angka, cari berdasarkan slug agar tetap UPDATE bukan INSERT duplikat.
      const rawSumber = draf.id_konten_sumber;
      const numericSumber = rawSumber ? Number(rawSumber) : null;
      const slugExisting = (!numericSumber && isi.slug)
        ? (db.prepare('SELECT id FROM knowledge_cards WHERE slug = ?').get(String(isi.slug)) as unknown as { id: number } | undefined)
        : undefined;
      const idSumber = numericSumber || slugExisting?.id || null;

      // Pipeline menyimpan konten ilmiah di isi.scientific.*
      // Fallback ke isi.sci_* untuk draf lama yang memakai format datar
      const sci = (isi.scientific as Record<string, unknown> | null) ?? {};
      const sciTitle = (sci.title as string | null) ?? (isi.sci_title as string | null) ?? null;
      const sciReadMinutes = (sci.readMinutes as number | null) ?? (isi.sci_read_minutes as number | null) ?? null;
      const sciSections = Array.isArray(sci.sections)
        ? (sci.sections as Array<{ judul?: string; isi: string }>)
        : [];
      const sciParagraphs: string[] = sciSections.length > 0
        ? sciSections.map(s => s.judul ? `${s.judul}: ${s.isi}` : s.isi)
        : (Array.isArray(isi.sci_paragraphs) ? isi.sci_paragraphs as string[] : []);
      // Normalized sections with guaranteed judul field for structured rendering
      const sciSectionsNorm = sciSections.map(s => ({ judul: s.judul ?? '', isi: s.isi }));

      if (idSumber) {
        db.prepare(`
          UPDATE knowledge_cards
          SET slug=?, age_key=?, domain=?, title=?, photo_src=?, photo_alt=?, photo_credit=?,
              read_minutes=?, is_medical=?, terjadi=?, penting=?, lakukan=?, perhatian=?,
              sci_title=?, sci_read_minutes=?, sci_paragraphs=?, sci_sections=?, sources=?,
              updated_at=datetime('now')
          WHERE id=?
        `).run(
          isi.slug, isi.age_key, isi.domain, isi.title,
          isi.photo_src ?? null, isi.photo_alt ?? null, isi.photo_credit ?? null,
          isi.read_minutes, isi.is_medical ? 1 : 0,
          isi.terjadi, isi.penting, JSON.stringify(isi.lakukan ?? []),
          isi.perhatian, sciTitle, sciReadMinutes,
          JSON.stringify(sciParagraphs), JSON.stringify(sciSectionsNorm),
          JSON.stringify(isi.sources ?? []),
          idSumber,
        );
      } else {
        db.prepare(`
          INSERT INTO knowledge_cards
          (slug, age_key, domain, title, photo_src, photo_alt, photo_credit,
           read_minutes, is_medical, terjadi, penting, lakukan, perhatian,
           sci_title, sci_read_minutes, sci_paragraphs, sci_sections, sources, status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'PUBLISHED')
        `).run(
          isi.slug, isi.age_key, isi.domain, isi.title,
          isi.photo_src ?? null, isi.photo_alt ?? null, isi.photo_credit ?? null,
          isi.read_minutes, isi.is_medical ? 1 : 0,
          isi.terjadi, isi.penting, JSON.stringify(isi.lakukan ?? []),
          isi.perhatian, sciTitle, sciReadMinutes,
          JSON.stringify(sciParagraphs), JSON.stringify(sciSectionsNorm),
          JSON.stringify(isi.sources ?? []),
        );
      }
      // Sinkronisasi ke kc_managed agar kartu tayang muncul di Wawasan Tumbuh admin
      await kcUpsert(String(isi.slug), {
        id: String(isi.slug),
        ageKey: String(isi.age_key),
        domain: String(isi.domain),
        title: String(isi.title),
        photo: {
          src: String(isi.photo_src ?? `/images/rl/${isi.slug}.jpg`),
          alt: String(isi.photo_alt ?? isi.title),
          credit: isi.photo_credit ? String(isi.photo_credit) : undefined,
        },
        readMinutes: Number(isi.read_minutes ?? 2),
        isMedical: Boolean(isi.is_medical),
        summary: {
          terjadi: String(isi.terjadi ?? ''),
          penting: String(isi.penting ?? ''),
          lakukan: Array.isArray(isi.lakukan) ? (isi.lakukan as unknown[]).map(String) : [],
          perhatian: String(isi.perhatian ?? ''),
        },
        scientific: {
          title: sciTitle ?? '',
          readMinutes: sciReadMinutes ?? undefined,
          sections: sciSectionsNorm.length > 0 ? sciSectionsNorm : undefined,
        },
        sources: Array.isArray(isi.sources) ? (isi.sources as unknown[]).map(String) : [],
      }, 'published');

      // Tandai pipeline sebagai tayang
      await supabase.from('konten_draf').update({ status: 'tayang' }).eq('id', id);
      await supabase.from('riwayat_tinjauan').insert({
        id_draf: id, id_pelaku: req.user!.id as unknown as string, tindakan: 'tayang',
      });
      res.json({ ok: true, jenis, pesan: 'Panduan tumbuh berhasil diterapkan ke database.' });
      return;
    }

    if (jenis === 'kegiatan_ajak_main') {
      // Terapkan ke Express learning_strategies tables
      // Untuk sekarang: update status ke 'published' jika ada id sumber, atau insert baru
      const idSumber = draf.id_konten_sumber ? Number(draf.id_konten_sumber) : null;
      if (idSumber) {
        db.prepare(
          `UPDATE learning_strategy_activities SET status='published', updated_at=datetime('now') WHERE id=?`
        ).run(idSumber);
      }
      await supabase.from('konten_draf').update({ status: 'tayang' }).eq('id', id);
      await supabase.from('riwayat_tinjauan').insert({
        id_draf: id, id_pelaku: req.user!.id as unknown as string, tindakan: 'tayang',
      });
      res.json({ ok: true, jenis, pesan: 'Kegiatan berhasil diterapkan.' });
      return;
    }

    throw new ApiError(400, `Jenis konten tidak didukung: ${jenis}`);
  }),
);

export default router;
