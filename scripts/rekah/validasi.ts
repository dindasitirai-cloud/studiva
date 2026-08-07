/**
 * Skrip validasi rakitan Bekal.
 *
 * CARA PAKAI:
 *   pnpm rekah:validasi
 *
 * Output:
 *   laporan/validasi.md  — untuk Raisha (teknis, dengan kode temuan)
 *   laporan/rakitan.md   — untuk Psikolog Fitri (bebas jargon teknis)
 *
 * Kode keluar:
 *   0 = hanya peringatan, tidak ada blokir
 *   1 = ada temuan blokir
 */

import * as path from 'path';
import * as fs from 'fs';
import { rakitBekal } from '../../apps/digital/src/features/beranda-usia/adapter/rakitBekal';
import type { HasilRakitan } from '../../apps/digital/src/features/beranda-usia/adapter/rakitBekal';
import type { Temuan, LaporanValidasi } from '../../apps/digital/src/features/beranda-usia/adapter/laporan';
import type { ItemSikap } from '../../apps/digital/src/features/beranda-usia/adapter/sikapAdapter';
import type { Bekal } from '../../apps/digital/src/features/beranda-usia/bekal';

const OUTPUT_DIR = path.resolve(__dirname, '../../laporan');

function main(): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Merakit Bekal dari tiga sumber konten...');
  const hasil: HasilRakitan = rakitBekal();
  const { bekal, katalogSikap, laporan } = hasil;

  const blokirList = laporan.temuan.filter(t => t.keparahan === 'blokir');
  const peringatanList = laporan.temuan.filter(t => t.keparahan === 'peringatan');

  const md = buildValidasiMd(laporan, bekal, blokirList, peringatanList, katalogSikap);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'validasi.md'), md, 'utf-8');
  console.log(`  → laporan/validasi.md`);

  const mdFitri = buildRakitanMd(bekal, katalogSikap);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'rakitan.md'), mdFitri, 'utf-8');
  console.log(`  → laporan/rakitan.md`);

  console.log('\n── Ringkasan ─────────────────────────────────────────────────');
  console.log(`Sikap                    : ${laporan.ringkas.totalSikap}`);
  console.log(`Kegiatan                 : ${laporan.ringkas.totalKegiatan}`);
  console.log(`Panduan (setelah saring) : ${laporan.ringkas.totalPanduan}`);
  console.log(`Panduan tersaring        : ${laporan.ringkas.panduanTersaringDeteksiDini}`);
  console.log(`Sel fase × nilai terisi  : ${laporan.ringkas.selFaseNilaiTerisi} / 60`);
  console.log(`Sel subTahap × nilai     : ${laporan.ringkas.selSubTahapNilaiTerisi} / 120`);
  console.log(`Item tanpaTemaNilai      : ${laporan.ringkas.itemTanpaTemaNilai}`);
  console.log(`Blokir                   : ${laporan.ringkas.jumlahBlokir}`);
  console.log(`Peringatan               : ${laporan.ringkas.jumlahPeringatan}`);

  if (blokirList.length > 0) {
    console.log('\n⚠  Ada temuan BLOKIR — rakitan belum siap rilis.');
    process.exit(1);
  } else {
    console.log('\n✓ Tidak ada blokir. Rakitan sehat (periksa peringatan bila ada).');
    process.exit(0);
  }
}

// ─── Builder laporan/validasi.md (untuk Raisha) ───────────────────────────────

function buildValidasiMd(
  laporan: LaporanValidasi,
  bekal: Bekal[],
  blokirList: Temuan[],
  peringatanList: Temuan[],
  katalogSikap: ItemSikap[],
): string {
  const baris: string[] = [];
  const r = laporan.ringkas;
  const tanggal = new Date(laporan.waktu).toLocaleString('id-ID');

  baris.push(`# Laporan Validasi Rakitan Bekal`);
  baris.push(`\n_Dibuat: ${tanggal}_`);

  baris.push(`\n## Ringkasan`);
  baris.push(`| | |`);
  baris.push(`|---|---|`);
  baris.push(`| Sikap | ${r.totalSikap} |`);
  baris.push(`| Kegiatan | ${r.totalKegiatan} |`);
  baris.push(`| Panduan (setelah saring) | ${r.totalPanduan} |`);
  baris.push(`| Panduan tersaring (Deteksi Dini) | ${r.panduanTersaringDeteksiDini} |`);
  baris.push(`| Sel fase × nilai terisi | ${r.selFaseNilaiTerisi} / 60 |`);
  baris.push(`| Sel fase × nilai kosong | ${r.selFaseNilaiKosong} |`);
  baris.push(`| Sel subTahap × nilai terisi | ${r.selSubTahapNilaiTerisi} / 120 |`);
  baris.push(`| Sel subTahap × nilai kosong | ${r.selSubTahapNilaiKosong} |`);
  baris.push(`| Item tanpaTemaNilai | ${r.itemTanpaTemaNilai} |`);
  baris.push(`| Blokir | **${r.jumlahBlokir}** |`);
  baris.push(`| Peringatan | ${r.jumlahPeringatan} |`);

  if (blokirList.length > 0) {
    baris.push(`\n## Temuan BLOKIR (${blokirList.length})`);
    for (const [kode, list] of Object.entries(kelompokkan(blokirList))) {
      baris.push(`\n### ${kode} (${list.length})`);
      for (const t of list) {
        baris.push(`- ${t.pesan}${t.lokasi ? ` *(lokasi: ${t.lokasi})*` : ''}${t.saran ? `\n  → ${t.saran}` : ''}`);
      }
    }
  }

  if (peringatanList.length > 0) {
    baris.push(`\n## Temuan Peringatan (${peringatanList.length})`);
    for (const [kode, list] of Object.entries(kelompokkan(peringatanList))) {
      baris.push(`\n### ${kode} (${list.length})`);
      for (const t of list) {
        baris.push(`- ${t.pesan}${t.lokasi ? ` *(${t.lokasi})*` : ''}`);
      }
    }
  }

  // Matriks fase × nilai
  const NILAI_LIST = [
    'Kasih Sayang','Sabar','Empati','Syukur','Kejujuran','Kemandirian',
    'Tanggung Jawab','Berbagi','Hormat pada Sesama','Kesederhanaan','Keberanian','Cinta Ilmu',
  ];
  baris.push(`\n## Matriks Fase × Nilai Sikap`);
  baris.push(`\n> Sel kosong (—) = belum ada sikap untuk kombinasi ini.`);
  baris.push(`\n| Fase | ${NILAI_LIST.join(' | ')} |`);
  baris.push(`| --- | ${NILAI_LIST.map(() => '---').join(' | ')} |`);
  for (const fase of [1, 2, 3, 4, 5]) {
    const sel = NILAI_LIST.map(n => {
      const ada = katalogSikap.some(
        s => fase >= s.faseMulai && fase <= s.faseSelesai && (s.nilai as string[]).includes(n),
      );
      return ada ? '✓' : '—';
    });
    baris.push(`| ${fase} | ${sel.join(' | ')} |`);
  }

  // Matriks sub-tahap × nilai kegiatan
  const SUB_TAHAP_LIST = bekal.flatMap(b => b.subTahap);
  baris.push(`\n## Matriks Sub-Tahap × Nilai Kegiatan`);
  baris.push(`\n> ✓ = ada kegiatan bertag nilai ini · — = belum ada · ~ = nilai tidak ada di mana pun (lihat NILAI_TANPA_KEGIATAN)`);

  // Kumpulkan nilai yang ada kegiatan-nya di sistem (untuk membedakan — vs ~)
  const nilaiYangAda = new Set<string>();
  for (const st of SUB_TAHAP_LIST) {
    for (const item of st.kegiatan) {
      for (const n of item.nilai) nilaiYangAda.add(n);
    }
  }

  baris.push(`\n| Sub-tahap | ${NILAI_LIST.join(' | ')} |`);
  baris.push(`| --- | ${NILAI_LIST.map(() => '---').join(' | ')} |`);
  for (const st of SUB_TAHAP_LIST) {
    const nilaiDiSini = new Set(st.kegiatan.flatMap(k => k.nilai));
    const sel = NILAI_LIST.map(n => {
      if (nilaiDiSini.has(n)) return '✓';
      if (!nilaiYangAda.has(n)) return '~';
      return '—';
    });
    baris.push(`| ${st.label} | ${sel.join(' | ')} |`);
  }

  // Ringkasan nilai prioritas (nilai yang punya ≥1 sel kosong, diurutkan dari terbanyak kosong)
  const kekosong: { nilai: string; kosong: number }[] = [];
  for (const nilai of NILAI_LIST) {
    if (!nilaiYangAda.has(nilai)) continue;
    const kosong = SUB_TAHAP_LIST.filter(st => !st.kegiatan.some(k => (k.nilai as string[]).includes(nilai))).length;
    if (kosong > 0) kekosong.push({ nilai, kosong });
  }
  kekosong.sort((a, b) => b.kosong - a.kosong);
  if (kekosong.length > 0) {
    baris.push(`\n**Nilai dengan sel kosong terbanyak:**`);
    for (const { nilai, kosong } of kekosong) {
      baris.push(`- ${nilai}: ${kosong} sub-tahap tanpa kegiatan`);
    }
  }

  // Tabel konten per sub-tahap
  baris.push(`\n## Jumlah Konten per Sub-Tahap`);
  baris.push(`\n| Sub-tahap | Kegiatan | Plafon | Panduan |`);
  baris.push(`|---|---|---|---|`);
  for (const b of bekal) {
    for (const st of b.subTahap) {
      const tanda = st.kegiatan.length >= st.maksItemPerHari ? '' : ' ⚠';
      baris.push(`| ${st.label} | ${st.kegiatan.length}${tanda} | ${st.maksItemPerHari} | ${st.panduan.length} |`);
    }
  }

  return baris.join('\n') + '\n';
}

// ─── Builder laporan/rakitan.md (untuk Psikolog Fitri) ────────────────────────

function buildRakitanMd(bekal: Bekal[], katalogSikap: ItemSikap[]): string {
  const baris: string[] = [];
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  baris.push(`# Tinjauan Rakitan Konten Rekah`);
  baris.push(`\n_${tanggal}_`);
  baris.push(`\nDokumen ini menyajikan gabungan seluruh konten yang telah disetujui sebelumnya,`);
  baris.push(`disusun berdasarkan usia anak. Yang perlu ditinjau adalah apakah **gabungannya**`);
  baris.push(`masih terasa tepat — bukan setiap potongannya satu per satu.`);

  const NAMA_FASE: Record<number, string> = {
    1: 'Tahun Pertama (0–12 bulan)',
    2: 'Usia 1–2 Tahun',
    3: 'Usia 2–3 Tahun',
    4: 'Usia 3–4 Tahun',
    5: 'Usia 4–6 Tahun',
  };

  baris.push(`\n---\n## Rutinitas Harian per Fase Usia`);
  baris.push(`\nRutinitas ini muncul sebagai pengingat harian bagi orang tua — bukan jadwal, bukan kewajiban.`);

  for (const fase of [1, 2, 3, 4, 5]) {
    const items = katalogSikap.filter(s => fase >= s.faseMulai && fase <= s.faseSelesai);
    baris.push(`\n### ${NAMA_FASE[fase]}`);
    if (items.length === 0) {
      baris.push(`\n_(Belum ada rutinitas untuk fase ini.)_`);
      continue;
    }
    for (const s of items) {
      const nilaiStr = (s.nilai as string[]).join(', ') || '_(nilai belum ditandai)_';
      baris.push(`\n**${s.judul}**`);
      baris.push(`Nilai: ${nilaiStr}`);
    }
  }

  baris.push(`\n---\n## Kegiatan dan Bacaan per Rentang Usia`);

  for (const b of bekal) {
    baris.push(`\n---\n### ${b.label}`);
    for (const st of b.subTahap) {
      baris.push(`\n#### ${st.label}`);
      if (st.kegiatan.length === 0) {
        baris.push(`\n_Belum ada kegiatan untuk usia ini._`);
      } else {
        baris.push(`\n**Kegiatan anak** (${st.kegiatan.length} item)`);
        for (const k of st.kegiatan) {
          const nilaiStr = k.nilai.join(', ') || '_(nilai belum ditandai)_';
          const durasi = k.perkiraanDurasiMenit > 0 ? `${k.perkiraanDurasiMenit} mnt` : '—';
          baris.push(`- **${k.judul}** · ${k.domain} · ${nilaiStr} · ${durasi}`);
        }
      }
      if (st.panduan.length > 0) {
        baris.push(`\n**Bacaan orang tua** (${st.panduan.length} item)`);
        for (const p of st.panduan) {
          baris.push(`- **${p.judul}** · ${p.domain}`);
        }
      }
    }
  }

  return baris.join('\n') + '\n';
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function kelompokkan(temuan: Temuan[]): Record<string, Temuan[]> {
  const hasil: Record<string, Temuan[]> = {};
  for (const t of temuan) {
    if (!hasil[t.kode]) hasil[t.kode] = [];
    hasil[t.kode].push(t);
  }
  return hasil;
}

main();
