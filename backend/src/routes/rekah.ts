import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { run, get, all } from '../database';

const router = Router();
router.use(authenticate);

// ── Profile ────────────────────────────────────────────────────────────────

router.get(
  '/profile',
  asyncHandler(async (req: Request, res: Response) => {
    const row = await get<{ profile_json: string; current_week: number; musim_ke: number }>(
      'SELECT profile_json, current_week, musim_ke FROM rekah_profiles WHERE user_id = ?',
      [req.user!.id],
    );
    if (!row) {
      res.status(404).json({ error: 'Profil Rekah belum dibuat' });
      return;
    }
    res.json({
      profile: JSON.parse(row.profile_json),
      currentWeek: row.current_week,
      musimKe: row.musim_ke,
    });
  }),
);

router.put(
  '/profile',
  asyncHandler(async (req: Request, res: Response) => {
    const { profile, currentWeek = 1, musimKe = 1 } = req.body;
    if (
      !profile ||
      typeof profile !== 'object' ||
      !profile.anak?.namaPanggilan ||
      !profile.caregiver?.peran ||
      !Array.isArray(profile.akar?.nilaiFokus) ||
      profile.akar.nilaiFokus.length !== 2
    ) {
      throw new ApiError(400, 'Data profil tidak lengkap');
    }

    const existing = await get<{ profile_json: string; musim_ke: number }>(
      'SELECT profile_json, musim_ke FROM rekah_profiles WHERE user_id = ?',
      [req.user!.id],
    );

    // Archive old season if nilaiFokus changed
    if (existing) {
      const oldP = JSON.parse(existing.profile_json);
      const [o0, o1] = oldP.akar?.nilaiFokus ?? [];
      const [n0, n1] = profile.akar.nilaiFokus;
      if (o0 !== n0 || o1 !== n1) {
        const today = new Date().toISOString().split('T')[0];
        await run(
          `INSERT INTO rekah_seasons (user_id, musim_ke, nilai_fokus, mulai, selesai, total_langkah)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [req.user!.id, existing.musim_ke, JSON.stringify([o0, o1]), oldP.akar?.musimMulai ?? today, today, 0],
        );
      }
    }

    const now = new Date().toISOString();
    if (existing) {
      await run(
        `UPDATE rekah_profiles
         SET profile_json = ?, current_week = ?, musim_ke = ?, updated_at = ?
         WHERE user_id = ?`,
        [JSON.stringify(profile), currentWeek, musimKe, now, req.user!.id],
      );
    } else {
      await run(
        `INSERT INTO rekah_profiles (user_id, profile_json, current_week, musim_ke, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user!.id, JSON.stringify(profile), currentWeek, musimKe, now, now],
      );
    }

    res.json({ ok: true });
  }),
);

// PATCH: hanya update current_week dan musim_ke (dipanggil saat ganti pekan / musim baru)
router.patch(
  '/profile/state',
  asyncHandler(async (req: Request, res: Response) => {
    const { currentWeek, musimKe } = req.body;
    if (typeof currentWeek !== 'number' && typeof musimKe !== 'number') {
      throw new ApiError(400, 'currentWeek atau musimKe wajib diisi');
    }
    const now = new Date().toISOString();
    const sets: string[] = ['updated_at = ?'];
    const params: unknown[] = [now];
    if (typeof currentWeek === 'number') { sets.unshift('current_week = ?'); params.unshift(currentWeek); }
    if (typeof musimKe === 'number') { sets.unshift('musim_ke = ?'); params.unshift(musimKe); }
    params.push(req.user!.id);
    await run(`UPDATE rekah_profiles SET ${sets.join(', ')} WHERE user_id = ?`, params);
    res.json({ ok: true });
  }),
);

// ── Completions ────────────────────────────────────────────────────────────

router.post(
  '/completions',
  asyncHandler(async (req: Request, res: Response) => {
    const { moduleId, mingguKe, musimKe = 1 } = req.body;
    if (!moduleId || typeof mingguKe !== 'number') {
      throw new ApiError(400, 'moduleId dan mingguKe wajib diisi');
    }
    try {
      await run(
        `INSERT INTO rekah_completions (user_id, module_id, selesai_pada, minggu_ke, musim_ke)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user!.id, moduleId, new Date().toISOString(), mingguKe, musimKe],
      );
    } catch (err) {
      if ((err as Error).message.includes('UNIQUE')) {
        res.json({ ok: true, duplicate: true });
        return;
      }
      throw err;
    }
    res.json({ ok: true });
  }),
);

router.get(
  '/completions',
  asyncHandler(async (req: Request, res: Response) => {
    const { mingguKe, musimKe } = req.query;
    const parts: string[] = ['user_id = ?'];
    const params: unknown[] = [req.user!.id];
    if (mingguKe !== undefined) { parts.push('minggu_ke = ?'); params.push(Number(mingguKe)); }
    if (musimKe !== undefined) { parts.push('musim_ke = ?'); params.push(Number(musimKe)); }

    const rows = await all<{
      module_id: string; selesai_pada: string; minggu_ke: number; musim_ke: number;
    }>(
      `SELECT module_id, selesai_pada, minggu_ke, musim_ke FROM rekah_completions WHERE ${parts.join(' AND ')}`,
      params,
    );
    res.json({
      completions: rows.map(r => ({
        moduleId: r.module_id,
        completedAt: r.selesai_pada,
        mingguKe: r.minggu_ke,
        musimKe: r.musim_ke,
      })),
    });
  }),
);

// ── Reflections ────────────────────────────────────────────────────────────

router.post(
  '/reflections',
  asyncHandler(async (req: Request, res: Response) => {
    const { entry, musimKe = 1 } = req.body;
    if (!entry?.id || !entry?.moduleId || !entry?.responsAnak || !entry?.tanggal) {
      throw new ApiError(400, 'Data refleksi tidak lengkap');
    }
    await run(
      `INSERT OR IGNORE INTO rekah_reflections
       (id, user_id, module_id, tanggal, respon_anak, mood_caregiver, catatan, nilai_utama, simpan_ke_jurnal, musim_ke)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id, req.user!.id, entry.moduleId, entry.tanggal, entry.responsAnak,
        entry.moodCaregiver ?? null, entry.catatan ?? null, entry.nilaiUtama ?? null,
        entry.simpanKeJurnal ? 1 : 0, musimKe,
      ],
    );
    res.json({ ok: true });
  }),
);

router.get(
  '/reflections',
  asyncHandler(async (req: Request, res: Response) => {
    const { musimKe } = req.query;
    const params: unknown[] = [req.user!.id];
    let sql = `SELECT id, module_id, tanggal, respon_anak, mood_caregiver, catatan, nilai_utama,
               simpan_ke_jurnal, musim_ke FROM rekah_reflections WHERE user_id = ?`;
    if (musimKe !== undefined) { sql += ' AND musim_ke = ?'; params.push(Number(musimKe)); }
    sql += ' ORDER BY created_at ASC';

    const rows = await all<{
      id: string; module_id: string; tanggal: string; respon_anak: string;
      mood_caregiver: string | null; catatan: string | null; nilai_utama: string | null;
      simpan_ke_jurnal: number; musim_ke: number;
    }>(sql, params);

    res.json({
      entries: rows.map(r => ({
        id: r.id,
        moduleId: r.module_id,
        tanggal: r.tanggal,
        responsAnak: r.respon_anak,
        moodCaregiver: r.mood_caregiver ?? undefined,
        catatan: r.catatan ?? undefined,
        nilaiUtama: r.nilai_utama ?? undefined,
        simpanKeJurnal: r.simpan_ke_jurnal === 1,
        musimKe: r.musim_ke,
      })),
    });
  }),
);

// ── Seasons ────────────────────────────────────────────────────────────────

router.post(
  '/seasons/close',
  asyncHandler(async (req: Request, res: Response) => {
    const { totalLangkah = 0, refleksiMusim, nilaiFokus, mulai, musimKe } = req.body;
    if (!Array.isArray(nilaiFokus) || nilaiFokus.length !== 2 || !mulai || typeof musimKe !== 'number') {
      throw new ApiError(400, 'Data musim tidak lengkap');
    }
    const today = new Date().toISOString().split('T')[0];
    await run(
      `INSERT INTO rekah_seasons (user_id, musim_ke, nilai_fokus, mulai, selesai, total_langkah, refleksi_musim)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user!.id, musimKe, JSON.stringify(nilaiFokus), mulai, today,
        totalLangkah, refleksiMusim ? JSON.stringify(refleksiMusim) : null,
      ],
    );
    const newMusimKe = musimKe + 1;
    await run(
      `UPDATE rekah_profiles SET musim_ke = ?, current_week = 1, updated_at = ? WHERE user_id = ?`,
      [newMusimKe, new Date().toISOString(), req.user!.id],
    );
    res.json({ ok: true, newMusimKe });
  }),
);

// ── Journal ────────────────────────────────────────────────────────────────

router.get(
  '/journal',
  asyncHandler(async (req: Request, res: Response) => {
    const rows = await all<{
      id: string; judul: string; catatan: string; tanggal: string;
      nilai_id: string | null; tag: string | null;
    }>(
      `SELECT id, judul, catatan, tanggal, nilai_id, tag
       FROM rekah_journal_entries WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user!.id],
    );
    res.json({
      entri: rows.map(r => ({
        id: r.id, judul: r.judul, catatan: r.catatan, tanggal: r.tanggal,
        nilaiId: r.nilai_id ?? undefined, tag: r.tag ?? undefined,
      })),
    });
  }),
);

router.post(
  '/journal',
  asyncHandler(async (req: Request, res: Response) => {
    const { entri } = req.body;
    if (!entri?.id || !entri?.judul || !entri?.catatan) {
      throw new ApiError(400, 'Data entri tidak lengkap');
    }
    await run(
      `INSERT OR IGNORE INTO rekah_journal_entries (id, user_id, judul, catatan, tanggal, nilai_id, tag)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entri.id, req.user!.id, entri.judul, entri.catatan,
        entri.tanggal ?? new Date().toISOString().split('T')[0],
        entri.nilaiId ?? null, entri.tag ?? 'manual',
      ],
    );
    res.json({ ok: true });
  }),
);

router.delete(
  '/journal/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await run(
      'DELETE FROM rekah_journal_entries WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id],
    );
    res.json({ ok: true });
  }),
);

// ── Week Plan (rencana pekan yang dimodifikasi user) ──────────────────────────

router.get(
  '/week-plan',
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.id;
    const musimKe = Number(req.query.musimKe) || 1;
    const mingguKe = Number(req.query.mingguKe) || 1;

    const row = await get<{ module_ids: string }>(
      'SELECT module_ids FROM rekah_week_plans WHERE user_id = ? AND musim_ke = ? AND minggu_ke = ?',
      [uid, musimKe, mingguKe],
    );

    if (!row) {
      res.status(404).json({ weekPlan: null });
      return;
    }

    res.json({ weekPlan: { moduleIds: JSON.parse(row.module_ids) } });
  }),
);

router.put(
  '/week-plan',
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.id;
    const { musimKe = 1, mingguKe = 1, moduleIds } = req.body;

    if (!Array.isArray(moduleIds)) {
      throw new ApiError(400, 'moduleIds harus array');
    }
    if (moduleIds.length > 7) {
      throw new ApiError(400, 'Maksimum 7 langkah dalam satu pekan');
    }

    const id = `${uid}-${musimKe}-${mingguKe}`;
    await run(
      `INSERT INTO rekah_week_plans (id, user_id, musim_ke, minggu_ke, module_ids, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, musim_ke, minggu_ke)
       DO UPDATE SET module_ids = excluded.module_ids, updated_at = CURRENT_TIMESTAMP`,
      [id, uid, musimKe, mingguKe, JSON.stringify(moduleIds)],
    );

    res.json({ ok: true });
  }),
);

// ── Account Data (hapus semua data Rekah user ini) ─────────────────────────

router.delete(
  '/account-data',
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.id;
    const tables = [
      'rekah_profiles',
      'rekah_completions',
      'rekah_reflections',
      'rekah_seasons',
      'rekah_journal_entries',
      'rekah_week_plans',
    ] as const;
    let deleted = 0;
    for (const table of tables) {
      const result = await run(`DELETE FROM ${table} WHERE user_id = ?`, [uid]);
      deleted += result.changes;
    }
    res.json({ ok: true, deleted });
  }),
);

export default router;
