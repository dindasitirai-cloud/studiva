// Lapisan akses data Rekah — satu-satunya tempat panggilan Supabase.
// Semua fungsi berasumsi pengguna sudah terautentikasi (Supabase session aktif).
// RLS database memastikan pengguna hanya bisa menyentuh datanya sendiri.

import { supabase } from './client';
import type { Database, Json, PendampingJson } from './database.types';

type AnakRow = Database['public']['Tables']['anak']['Row'];
type NilaiDitanamRow = Database['public']['Tables']['nilai_ditanam']['Row'];
type PengamatanKompasRow = Database['public']['Tables']['pengamatan_kompas']['Row'];
type RefleksiKegiatanRow = Database['public']['Tables']['refleksi_kegiatan']['Row'];
type JejakPengamatanRow = Database['public']['Tables']['jejak_pengamatan_kompas']['Row'];
type CatatanPengamatanRow = Database['public']['Tables']['catatan_pengamatan_kompas']['Row'];
type PilihanHarianRow = Database['public']['Tables']['pilihan_harian']['Row'];
type KebunRiwayatRow = Database['public']['Tables']['kebun_riwayat']['Row'];
type PermohonanKoreksiRow = Database['public']['Tables']['permohonan_koreksi_tgl_lahir']['Row'];

// ── Orang Tua ────────────────────────────────────────────────────────────────

export async function upsertOrangTua(email: string, nomorHp?: string, userId?: string): Promise<void> {
  let uid = userId;
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Tidak ada sesi aktif');
    uid = user.id;
  }

  const { error } = await supabase
    .from('orang_tua')
    .upsert({ id: uid, email, nomor_hp: nomorHp ?? null }, { onConflict: 'id' });

  if (error) throw error;
}

export async function hapusAkunOrangTua(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Tidak ada sesi aktif');

  const { error } = await supabase
    .from('orang_tua')
    .delete()
    .eq('id', user.id);

  if (error) throw error;
  // Penghapusan auth.users dilakukan via admin API di backend setelah ini.
}

// ── Anak ─────────────────────────────────────────────────────────────────────

export async function getAnakList(): Promise<AnakRow[]> {
  const { data, error } = await supabase
    .from('anak')
    .select('*')
    .order('dibuat_pada');

  if (error) throw error;
  return data ?? [];
}

export async function getAnak(idAnak: string): Promise<AnakRow | null> {
  const { data, error } = await supabase
    .from('anak')
    .select('*')
    .eq('id', idAnak)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export type JenisKelaminDb = AnakRow['jenis_kelamin'];
export type PendampingDb = PendampingJson;

/**
 * Membuat baris anak baru. Dipakai wizard.
 * tanggal_lahir hanya bisa ditulis di sini — sesudahnya imutabel.
 */
export async function buatAnak(params: {
  namaAnak: string;
  tanggalLahir: string;
  jenisKelamin?: JenisKelaminDb;
  fotoUrl?: string | null;
  pendamping?: PendampingDb[];
}): Promise<AnakRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Tidak ada sesi aktif');

  const { data, error } = await supabase
    .from('anak')
    .insert({
      id_orang_tua: user.id,
      nama_anak: params.namaAnak,
      tanggal_lahir: params.tanggalLahir,
      jenis_kelamin: params.jenisKelamin ?? null,
      foto_url: params.fotoUrl ?? null,
      pendamping: params.pendamping ?? [],
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Pembuatan anak tidak mengembalikan data');
  return data;
}

/**
 * Memperbarui profil anak. tanggal_lahir sengaja tidak ada di sini —
 * koreksi hanya lewat ajukanKoreksiTanggalLahir().
 */
export async function perbaruiAnak(
  idAnak: string,
  patch: {
    namaAnak?: string;
    jenisKelamin?: JenisKelaminDb;
    fotoUrl?: string | null;
    pendamping?: PendampingDb[];
  },
): Promise<AnakRow> {
  const row: Database['public']['Tables']['anak']['Update'] = {};
  if (patch.namaAnak !== undefined) row.nama_anak = patch.namaAnak;
  if (patch.jenisKelamin !== undefined) row.jenis_kelamin = patch.jenisKelamin;
  if (patch.fotoUrl !== undefined) row.foto_url = patch.fotoUrl;
  if (patch.pendamping !== undefined) row.pendamping = patch.pendamping;

  const { data, error } = await supabase
    .from('anak')
    .update(row)
    .eq('id', idAnak)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Pembaruan anak tidak mengembalikan data');
  return data;
}

export async function hapusAnak(idAnak: string): Promise<void> {
  const { error } = await supabase
    .from('anak')
    .delete()
    .eq('id', idAnak);

  if (error) throw error;
}

// ── Foto anak (bucket privat "foto-anak") ────────────────────────────────────
// Konvensi path: <id_orang_tua>/<id_anak>.<ext> — folder pertama harus
// auth.uid() agar lolos RLS storage (lihat 009_storage_foto_anak.sql).

const BUCKET_FOTO = 'foto-anak';
const MAKS_UKURAN_FOTO = 5 * 1024 * 1024; // 5 MB

export async function unggahFotoAnak(idAnak: string, file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Tidak ada sesi aktif');

  if (!file.type.startsWith('image/')) {
    throw new Error('Berkas harus berupa gambar.');
  }
  if (file.size > MAKS_UKURAN_FOTO) {
    throw new Error('Ukuran foto maksimal 5 MB.');
  }

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${user.id}/${idAnak}.${ext || 'jpg'}`;

  const { error } = await supabase.storage
    .from(BUCKET_FOTO)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;
  return path;
}

/**
 * Bucket foto anak privat, jadi URL tampilan harus ditandatangani.
 * Mengembalikan null bila path kosong atau penandatanganan gagal —
 * pemanggil lalu menampilkan inisial nama sebagai gantinya.
 */
export async function urlFotoAnak(path: string | null, detikBerlaku = 3600): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET_FOTO)
    .createSignedUrl(path, detikBerlaku);

  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function hapusFotoAnak(path: string | null): Promise<void> {
  if (!path) return;
  await supabase.storage.from(BUCKET_FOTO).remove([path]);
}

// ── Consent ──────────────────────────────────────────────────────────────────

export const VERSI_KEBIJAKAN_AKTIF = 'v1.0';

export async function catatConsent(versiKebijakan: string, userId?: string): Promise<void> {
  let uid = userId;
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Tidak ada sesi aktif');
    uid = user.id;
  }

  const { error } = await supabase
    .from('consent')
    .insert({ id_orang_tua: uid, versi_kebijakan: versiKebijakan });

  if (error) throw error;
}

// ── Nilai Ditanam (Taman Akar Keluarga) ──────────────────────────────────────

export async function getNilaiDitanam(idAnak: string): Promise<NilaiDitanamRow[]> {
  const { data, error } = await supabase
    .from('nilai_ditanam')
    .select('*')
    .eq('id_anak', idAnak)
    .order('ditanam_pada');

  if (error) throw error;
  return data ?? [];
}

export async function tanamNilai(idAnak: string, idNilai: string): Promise<void> {
  const { error } = await supabase
    .from('nilai_ditanam')
    .upsert({ id_anak: idAnak, id_nilai: idNilai }, { onConflict: 'id_anak,id_nilai', ignoreDuplicates: true });

  if (error) throw error;
}

export async function cabutNilai(idAnak: string, idNilai: string): Promise<void> {
  const { error } = await supabase
    .from('nilai_ditanam')
    .delete()
    .eq('id_anak', idAnak)
    .eq('id_nilai', idNilai);

  if (error) throw error;
}

// ── Catatan Pengamatan (observasi teks bebas) ────────────────────────────────

export async function catatObservasiTeks(idAnak: string, teks: string): Promise<void> {
  const { error } = await supabase
    .from('catatan_pengamatan_kompas')
    .insert({ id_anak: idAnak, teks });

  if (error) throw error;
}

export async function getObservasiTeks(idAnak: string): Promise<CatatanPengamatanRow[]> {
  const { data, error } = await supabase
    .from('catatan_pengamatan_kompas')
    .select('*')
    .eq('id_anak', idAnak)
    .order('pada', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Jejak Pengamatan Kompas (Kontinuitas) ────────────────────────────────────
// Log append-only tandai/lepas untuk membangun lini masa perkembangan.

export async function catatJejakPengamatan(idAnak: string, idPrompt: string, aksi: 'tandai' | 'lepas'): Promise<void> {
  const { error } = await supabase
    .from('jejak_pengamatan_kompas')
    .insert({ id_anak: idAnak, id_prompt: idPrompt, aksi });

  if (error) throw error;
}

export async function getJejakPengamatan(idAnak: string): Promise<JejakPengamatanRow[]> {
  const { data, error } = await supabase
    .from('jejak_pengamatan_kompas')
    .select('*')
    .eq('id_anak', idAnak)
    .order('pada');

  if (error) throw error;
  return data ?? [];
}

// ── Refleksi Kegiatan (Reflect) ──────────────────────────────────────────────
// Refleksi satu-ketuk per anak per tanggal per kegiatan. hasil = string enum app.

export async function getRefleksiKegiatan(idAnak: string, tanggal: string): Promise<RefleksiKegiatanRow[]> {
  const { data, error } = await supabase
    .from('refleksi_kegiatan')
    .select('*')
    .eq('id_anak', idAnak)
    .eq('tanggal', tanggal);

  if (error) throw error;
  return data ?? [];
}

export async function simpanRefleksi(idAnak: string, tanggal: string, idKegiatan: string, hasil: string): Promise<void> {
  const { error } = await supabase
    .from('refleksi_kegiatan')
    .upsert(
      { id_anak: idAnak, tanggal, id_kegiatan: idKegiatan, hasil },
      { onConflict: 'id_anak,tanggal,id_kegiatan' },
    );

  if (error) throw error;
}

export async function hapusRefleksi(idAnak: string, tanggal: string, idKegiatan: string): Promise<void> {
  const { error } = await supabase
    .from('refleksi_kegiatan')
    .delete()
    .eq('id_anak', idAnak)
    .eq('tanggal', tanggal)
    .eq('id_kegiatan', idKegiatan);

  if (error) throw error;
}

export async function getRefleksiRentang(idAnak: string, tglAwal: string, tglAkhir: string): Promise<RefleksiKegiatanRow[]> {
  const { data, error } = await supabase
    .from('refleksi_kegiatan')
    .select('*')
    .eq('id_anak', idAnak)
    .gte('tanggal', tglAwal)
    .lte('tanggal', tglAkhir);

  if (error) throw error;
  return data ?? [];
}

// ── Pengamatan Kompas (Development Compass) ──────────────────────────────────
// Prompt observasi tahap perkembangan yang ditandai caregiver. id_prompt = ObservationPrompt.id.

export async function getPengamatanKompas(idAnak: string): Promise<PengamatanKompasRow[]> {
  const { data, error } = await supabase
    .from('pengamatan_kompas')
    .select('*')
    .eq('id_anak', idAnak)
    .order('diamati_pada');

  if (error) throw error;
  return data ?? [];
}

export async function tandaiPengamatan(idAnak: string, idPrompt: string): Promise<void> {
  const { error } = await supabase
    .from('pengamatan_kompas')
    .upsert({ id_anak: idAnak, id_prompt: idPrompt }, { onConflict: 'id_anak,id_prompt', ignoreDuplicates: true });

  if (error) throw error;
}

export async function hapusPengamatan(idAnak: string, idPrompt: string): Promise<void> {
  const { error } = await supabase
    .from('pengamatan_kompas')
    .delete()
    .eq('id_anak', idAnak)
    .eq('id_prompt', idPrompt);

  if (error) throw error;
}

// ── Pilihan Harian (Irama Hari) ───────────────────────────────────────────────

export async function getPilihanHarian(idAnak: string, tanggal: string): Promise<PilihanHarianRow | null> {
  const { data, error } = await supabase
    .from('pilihan_harian')
    .select('*')
    .eq('id_anak', idAnak)
    .eq('tanggal', tanggal)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function simpanPilihanHarian(
  idAnak: string,
  tanggal: string,
  diff: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from('pilihan_harian')
    .upsert(
      { id_anak: idAnak, tanggal, diff: diff as Json, diperbarui_pada: new Date().toISOString() },
      { onConflict: 'id_anak,tanggal' },
    );

  if (error) throw error;
}

/**
 * Memuat pilihan harian untuk beberapa tanggal sekaligus.
 *
 * Dipakai tampilan "Minggu Ini", yang sebelumnya hanya menampilkan hari ini
 * karena pemuatan enam hari lainnya masih berupa komentar TODO. Satu query
 * `.in()` untuk tujuh hari, bukan tujuh query terpisah.
 */
export async function getPilihanHarianRentang(
  idAnak: string,
  daftarTanggal: readonly string[],
): Promise<Record<string, PilihanHarianRow>> {
  if (daftarTanggal.length === 0) return {};

  const { data, error } = await supabase
    .from('pilihan_harian')
    .select('*')
    .eq('id_anak', idAnak)
    .in('tanggal', daftarTanggal as string[]);

  if (error) throw error;

  const hasil: Record<string, PilihanHarianRow> = {};
  for (const baris of data ?? []) hasil[baris.tanggal] = baris;
  return hasil;
}

/** Satu item yang dijadwalkan dari Bekal ke tanggal tertentu. */
export interface ItemDijadwalkan {
  id: string;
  tipe: 'kegiatan' | 'buku';
}

/**
 * Menambahkan satu item ke rencana tanggal tertentu.
 *
 * Baca-ubah-tulis, bukan upsert: `diff` menyimpan banyak hal sekaligus
 * (dihapus, ditambah, penempatan, selesai, catatan, wawasan), jadi menulis
 * ulang seluruh objek dari klien akan menghapus apa pun yang tidak ikut
 * disertakan. Sama seperti alasan `centang` dipisah ke kolomnya sendiri.
 *
 * Judul dan domain TIDAK ikut disimpan — `pilihanKeHari` me-resolve-nya dari
 * kolam anak lewat `kolamMap`. Menyimpan judul di sini berarti dua sumber
 * kebenaran yang bisa berbeda isi setelah konten diperbarui.
 */
export async function jadwalkanKeTanggal(
  idAnak: string,
  tanggal: string,
  item: ItemDijadwalkan,
): Promise<void> {
  const baris = await getPilihanHarian(idAnak, tanggal);
  const diffLama = (baris?.diff ?? {}) as Record<string, unknown>;

  const ditambah = Array.isArray(diffLama.ditambah) ? [...(diffLama.ditambah as string[])] : [];
  const wawasanIds = Array.isArray(diffLama.wawasanIds) ? [...(diffLama.wawasanIds as string[])] : [];

  if (item.tipe === 'buku') {
    if (wawasanIds.includes(item.id)) return;  // sudah dijadwalkan
    wawasanIds.push(item.id);
  } else {
    if (ditambah.includes(item.id)) return;
    ditambah.push(item.id);
  }

  // Nilai bawaan hanya untuk baris yang belum ada; isi lama menang atasnya,
  // lalu ditambah/wawasanIds hasil penggabungan menang atas keduanya.
  const bawaan: Record<string, unknown> = {
    dihapus: [], penempatan: {}, selesai: [], catatan: '', wawasanBloks: {},
  };

  const diffBaru: Record<string, unknown> = {
    ...bawaan,
    ...diffLama,
    tanggal,
    idAnak,
    ditambah,
    wawasanIds,
  };

  await simpanPilihanHarian(idAnak, tanggal, diffBaru);
}

// ── Centang Kebiasaan Baik ────────────────────────────────────────────────────
// Kolom pilihan_harian.centang, BUKAN di dalam diff: simpanPilihanHarian di atas
// menimpa diff seutuhnya, jadi centang di dalamnya akan tersapu tiap interaksi
// lain di Irama Hari. Lihat migrasi 012.

/** Bentuk klien: Record<tanggal, Record<idNilai, idButir[]>>. */
export type CentangPerTanggal = Record<string, Record<string, string[]>>;

/**
 * Memuat centang beberapa hari terakhir sekaligus.
 *
 * Rentang dibutuhkan karena tampilan "Minggu Ini" menurunkan riwayat siram dari
 * data yang sama — memuat hari ini saja membuat kartu mingguan selalu kosong.
 */
export async function getCentangKebiasaan(
  idAnak: string,
  sejakTanggal: string,
): Promise<CentangPerTanggal> {
  const { data, error } = await supabase
    .from('pilihan_harian')
    .select('tanggal, centang')
    .eq('id_anak', idAnak)
    .gte('tanggal', sejakTanggal)
    .order('tanggal');

  if (error) throw error;

  const hasil: CentangPerTanggal = {};
  for (const baris of data ?? []) {
    // Baris yang dibuat sebelum migrasi 012 bisa mengembalikan null.
    const isi = baris.centang ?? {};
    if (Object.keys(isi).length > 0) hasil[baris.tanggal] = isi;
  }
  return hasil;
}

/**
 * Menyimpan centang satu hari tanpa menyentuh kolom diff.
 *
 * SENGAJA TIDAK memakai .upsert(). Upsert Supabase menjalankan
 * `ON CONFLICT DO UPDATE SET` untuk SEMUA kolom di payload, jadi menyertakan
 * `diff` (yang wajib ada saat INSERT karena NOT NULL) akan menyapu diff milik
 * baris yang sudah ada — persis kehilangan data yang membuat kolom ini
 * dipisahkan dari diff sejak awal.
 *
 * Pola: UPDATE dulu; kalau tidak ada baris tersentuh, baru INSERT.
 */
export async function simpanCentangKebiasaan(
  idAnak: string,
  tanggal: string,
  centangHariItu: Record<string, string[]>,
): Promise<void> {
  const { data, error } = await supabase
    .from('pilihan_harian')
    .update({ centang: centangHariItu, diperbarui_pada: new Date().toISOString() })
    .eq('id_anak', idAnak)
    .eq('tanggal', tanggal)
    .select('id');

  if (error) throw error;
  if (data && data.length > 0) return;

  // Belum ada baris untuk hari ini. diff diisi objek kosong sesuai NOT NULL.
  const { error: errSisip } = await supabase
    .from('pilihan_harian')
    .insert({ id_anak: idAnak, tanggal, diff: {} as Json, centang: centangHariItu });

  if (!errSisip) return;

  // 23505 = unique_violation: tab lain menyisipkan baris di antara UPDATE dan
  // INSERT kita. Barisnya kini ada, jadi cukup ulangi UPDATE-nya.
  if (errSisip.code === '23505') {
    const { error: errUlang } = await supabase
      .from('pilihan_harian')
      .update({ centang: centangHariItu, diperbarui_pada: new Date().toISOString() })
      .eq('id_anak', idAnak)
      .eq('tanggal', tanggal);
    if (errUlang) throw errUlang;
    return;
  }

  throw errSisip;
}

// ── Kebun Riwayat ─────────────────────────────────────────────────────────────

export async function getRiwayatKebun(idAnak: string): Promise<KebunRiwayatRow[]> {
  const { data, error } = await supabase
    .from('kebun_riwayat')
    .select('*')
    .eq('id_anak', idAnak)
    .order('tanggal_dirawat');

  if (error) throw error;
  return data ?? [];
}

export async function catatPerawatanKebun(
  idAnak: string,
  idDomain: string,
  tanggal: string,
): Promise<void> {
  const { error } = await supabase
    .from('kebun_riwayat')
    .insert({ id_anak: idAnak, id_domain: idDomain, tanggal_dirawat: tanggal });

  if (error) throw error;
}

// ── Koreksi Tanggal Lahir ────────────────────────────────────────────────────

export async function ajukanKoreksiTanggalLahir(
  idAnak: string,
  tanggalBaru: string,
  alasan: string,
): Promise<void> {
  const { error } = await supabase
    .from('permohonan_koreksi_tgl_lahir')
    .insert({ id_anak: idAnak, tanggal_diminta: tanggalBaru, alasan });

  if (error) throw error;
}

export async function getPermohonanKoreksi(idAnak: string): Promise<PermohonanKoreksiRow[]> {
  const { data, error } = await supabase
    .from('permohonan_koreksi_tgl_lahir')
    .select('*')
    .eq('id_anak', idAnak)
    .order('dibuat_pada', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Tambah item KUSTOM ke rencana (Phase 14: dipakai Temani & Bantu) ──────────
// Read-modify-write pada diff.kustom + diff.ditambah (pola sama seperti
// jadwalkanKeTanggal). Membuat langkah Temani / strategi Bantu muncul di Kelola
// (SusunanHari) tanpa perlu ada di kolam anak. Additive; tidak mengubah fungsi lain.
export async function tambahKustomKeTanggal(
  idAnak: string,
  tanggal: string,
  item: Record<string, unknown> & { id: string },
): Promise<void> {
  const baris = await getPilihanHarian(idAnak, tanggal);
  const diffLama = (baris?.diff ?? {}) as Record<string, unknown>;

  const kustom = Array.isArray(diffLama.kustom) ? [...(diffLama.kustom as unknown[])] : [];
  const ditambah = Array.isArray(diffLama.ditambah) ? [...(diffLama.ditambah as string[])] : [];

  if (kustom.some(k => (k as { id?: string }).id === item.id)) return; // sudah ada
  kustom.push(item);
  if (!ditambah.includes(item.id)) ditambah.push(item.id);

  const bawaan: Record<string, unknown> = {
    dihapus: [], penempatan: {}, selesai: [], catatan: '', wawasanIds: [], wawasanBloks: {},
  };
  const diffBaru: Record<string, unknown> = {
    ...bawaan, ...diffLama, tanggal, idAnak, kustom, ditambah,
  };

  await simpanPilihanHarian(idAnak, tanggal, diffBaru);
}

// ── Tandai/lepas item KUSTOM sebagai selesai (Phase 14: dipakai Temani) ────────
// Baca-ubah-tulis pada diff.selesai (pola sama tambahKustomKeTanggal). Sumber
// tunggal status "selesai" ada di Kelola, jadi Temani menulis ke sini agar dua
// arah. Additive; kolom centang & isi diff lain dipertahankan lewat ...diffLama.
export async function setSelesaiKustom(
  idAnak: string,
  tanggal: string,
  id: string,
  selesai: boolean,
): Promise<void> {
  const baris = await getPilihanHarian(idAnak, tanggal);
  const diffLama = (baris?.diff ?? {}) as Record<string, unknown>;
  const daftar = Array.isArray(diffLama.selesai) ? [...(diffLama.selesai as string[])] : [];
  const ada = daftar.includes(id);
  if (selesai && !ada) daftar.push(id);
  else if (!selesai && ada) daftar.splice(daftar.indexOf(id), 1);
  else return; // tak ada perubahan

  const bawaan: Record<string, unknown> = {
    dihapus: [], penempatan: {}, selesai: [], catatan: '', wawasanIds: [], wawasanBloks: {},
  };
  const diffBaru: Record<string, unknown> = { ...bawaan, ...diffLama, tanggal, idAnak, selesai: daftar };
  await simpanPilihanHarian(idAnak, tanggal, diffBaru);
}

// ── Jurnal perjalanan (Phase 14Q) ─────────────────────────────────────────────
// Foto di bucket PRIVAT "jurnal-foto" (lihat 020_jurnal.sql). Tulisan + daftar
// path foto di tabel "jurnal_hari". Tabel belum ada di database.types.ts (dibuat
// migration 020), jadi pemanggilannya dicasting — additive, tak menyentuh lain.
const BUCKET_JURNAL = 'jurnal-foto';
const MAKS_UKURAN_FOTO_JURNAL = 5 * 1024 * 1024;

export async function unggahFotoJurnal(idAnak: string, tanggal: string, file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Tidak ada sesi aktif');
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const EKST_GAMBAR = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'avif'];
  const berupaGambar = file.type.startsWith('image/') || EKST_GAMBAR.includes(ext);
  if (!berupaGambar) throw new Error('Berkas harus berupa gambar (jpg, png, webp, heic).');
  if (file.size > MAKS_UKURAN_FOTO_JURNAL) throw new Error('Ukuran foto maksimal 5 MB.');
  const acak = Math.random().toString(36).slice(2, 10);
  const path = `${user.id}/${idAnak}/${tanggal}/${acak}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET_JURNAL).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function urlFotoJurnal(path: string, detikBerlaku = 3600): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET_JURNAL).createSignedUrl(path, detikBerlaku);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function hapusFotoJurnal(path: string | null): Promise<void> {
  if (!path) return;
  await supabase.storage.from(BUCKET_JURNAL).remove([path]);
}

export interface JurnalHari { cerita: string; foto: string[] }

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getJurnalHariRentang(idAnak: string, daftarTanggal: readonly string[]): Promise<Record<string, JurnalHari>> {
  if (daftarTanggal.length === 0) return {};
  const { data, error } = await (supabase as any)
    .from('jurnal_hari').select('tanggal, cerita, foto')
    .eq('id_anak', idAnak).in('tanggal', daftarTanggal as string[]);
  if (error) throw error;
  const hasil: Record<string, JurnalHari> = {};
  for (const b of (data ?? []) as any[]) {
    hasil[b.tanggal] = { cerita: b.cerita ?? '', foto: Array.isArray(b.foto) ? b.foto : [] };
  }
  return hasil;
}

export async function simpanJurnalHari(idAnak: string, tanggal: string, isi: JurnalHari): Promise<void> {
  const { error } = await (supabase as any)
    .from('jurnal_hari')
    .upsert({ id_anak: idAnak, tanggal, cerita: isi.cerita, foto: isi.foto, diperbarui_pada: new Date().toISOString() }, { onConflict: 'id_anak,tanggal' });
  if (error) throw error;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
