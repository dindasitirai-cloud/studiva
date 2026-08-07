/**
 * Skrip konversi xlsx → TypeScript untuk konten Bekal.
 *
 * CARA PAKAI:
 *   pnpm rekah:konversi path/ke/file-review.xlsx
 *
 * Sheet yang dibaca:
 *   - "Sikap"       → src/features/beranda-usia/data/sikap.generated.ts
 *   - "Kegiatan"    → src/features/beranda-usia/data/kegiatanTambahan.generated.ts
 *   - "Usulan Tag"  → src/data/tagNilaiLS.generated.ts
 *
 * Sheet "Sikap" dan "Usulan Tag" adalah opsional masing-masing — tidak ada akan dilewati dengan peringatan.
 * Jalankan setiap kali file xlsx diperbarui. File .generated.ts adalah satu-satunya
 * sumber data yang dibaca runtime — xlsx tidak pernah dibaca di produksi.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { ACTIVITIES, EDU_TOOLS, DOWNLOADABLES } from '../../apps/digital/src/data/learningStrategies';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const NILAI_KANONIK = new Set([
  'Kasih Sayang','Sabar','Empati','Syukur','Kejujuran','Kemandirian',
  'Tanggung Jawab','Berbagi','Hormat pada Sesama','Kesederhanaan','Keberanian','Cinta Ilmu',
]);

const OUTPUT_BASE = path.resolve(
  __dirname, '../../apps/digital/src/features/beranda-usia/data',
);

const DATA_BASE = path.resolve(
  __dirname, '../../apps/digital/src/data',
);

// ─── Tipe internal ────────────────────────────────────────────────────────────

interface RowSikap {
  'ID Baru': string;
  'Judul Sikap': string;
  'Nilai (Akar)': string;
  'Fase Mulai (1-5)': number | string;
  'Fase Selesai (1-5)': number | string;
  'ID Lama': string;
  'Keputusan': string;
}

interface RowKegiatan {
  'ID Baru': string;
  'Judul Kegiatan': string;
  'Nilai (Akar)': string;
  'Sub-tahap': string;
  'ID Lama': string;
  'Keputusan': string;
}

interface RowUsulanTag {
  'Jenis': string;
  'Rujukan': string;
  'Judul': string;
  'Usulan Nilai': string;
  'Alasan': string;
  'Keputusan': string;
  'Nilai Pengganti': string;
  'Catatan Reviewer': string;
}

interface LaporanKonversi {
  sikapDikonversi: number;
  sikapDitolak: number;
  sikapPindahKeKegiatan: number;
  sikapFaseTidakValid: number;
  sikapNilaiTidakDikenal: { judul: string; nilai: string }[];
  kegiatanDikonversi: number;
  tagNilaiDiterapkan: number;
  tagTanpaTemaNilai: number;
}

// ─── Rujukan yang sengaja dilewati (item dihapus dari kode) ──────────────────

// unduhan:1 ("Checklist Tumbuh Kembang 0-12 Bulan") dihapus di Rekah Iterasi 2.
// xlsx masih menyertakannya agar riwayat review tetap lengkap — abaikan saja.
const RUJUKAN_DIHAPUS = new Set(['unduhan:1']);

// ─── Entry point ──────────────────────────────────────────────────────────────

function main(): void {
  const xlsxPath = process.argv[2];
  if (!xlsxPath) {
    console.error('Error: Tidak ada path file xlsx.\n  Pakai: pnpm rekah:konversi path/ke/file.xlsx');
    process.exit(1);
  }

  const absPath = path.resolve(xlsxPath);
  if (!fs.existsSync(absPath)) {
    console.error(`Error: File tidak ditemukan: ${absPath}`);
    process.exit(1);
  }

  console.log(`Membaca: ${absPath}`);
  const wb = XLSX.readFile(absPath);
  const laporan: LaporanKonversi = {
    sikapDikonversi: 0,
    sikapDitolak: 0,
    sikapPindahKeKegiatan: 0,
    sikapFaseTidakValid: 0,
    sikapNilaiTidakDikenal: [],
    kegiatanDikonversi: 0,
    tagNilaiDiterapkan: 0,
    tagTanpaTemaNilai: 0,
  };

  // ── Sheet: Sikap (opsional) ───────────────────────────────────────────────
  const wsSikap = wb.Sheets['Sikap'];
  if (!wsSikap) {
    console.log('  INFO: Sheet "Sikap" tidak ada dalam file xlsx — dilewati.');
  } else {
    const rowsSikap = XLSX.utils.sheet_to_json<RowSikap>(wsSikap, { defval: '' });
    const sikapItems: string[] = [];
    const kegiatanTambahanItems: string[] = [];

    for (const row of rowsSikap) {
      const keputusan = String(row['Keputusan'] ?? '').trim();
      const judul = String(row['Judul Sikap'] ?? '').trim();

      if (/tolak/i.test(keputusan)) {
        laporan.sikapDitolak++;
        continue;
      }

      if (/pindah ke kegiatan/i.test(keputusan)) {
        laporan.sikapPindahKeKegiatan++;
        const nilaiStr = String(row['Nilai (Akar)'] ?? '');
        kegiatanTambahanItems.push(
          buildKegiatanTambahanEntry(row['ID Baru'], judul, nilaiStr, row['ID Lama']),
        );
        continue;
      }

      const faseMulai = parseInt(String(row['Fase Mulai (1-5)']), 10);
      const faseSelesai = parseInt(String(row['Fase Selesai (1-5)']), 10);

      if (
        isNaN(faseMulai) || isNaN(faseSelesai) ||
        faseMulai < 1 || faseMulai > 5 ||
        faseSelesai < 1 || faseSelesai > 5 ||
        faseMulai > faseSelesai
      ) {
        console.warn(`  FASE_TIDAK_VALID: "${judul}" (faseMulai=${row['Fase Mulai (1-5)']}, faseSelesai=${row['Fase Selesai (1-5)']})`);
        laporan.sikapFaseTidakValid++;
        continue;
      }

      const nilaiStr = String(row['Nilai (Akar)'] ?? '');
      const nilaiList = nilaiStr.split(',').map(n => n.trim()).filter(Boolean);

      for (const n of nilaiList) {
        if (!NILAI_KANONIK.has(n)) {
          console.warn(`  NILAI_TIDAK_DIKENAL: "${n}" pada sikap "${judul}"`);
          laporan.sikapNilaiTidakDikenal.push({ judul, nilai: n });
        }
      }

      sikapItems.push(buildSikapEntry(
        row['ID Baru'],
        judul,
        nilaiList,
        faseMulai,
        faseSelesai,
        String(row['ID Lama'] ?? ''),
      ));
      laporan.sikapDikonversi++;
    }

    // Sheet: Kegiatan (opsional)
    const wsKegiatan = wb.Sheets['Kegiatan'];
    if (wsKegiatan) {
      const rowsKegiatan = XLSX.utils.sheet_to_json<RowKegiatan>(wsKegiatan, { defval: '' });
      for (const row of rowsKegiatan) {
        const judul = String(row['Judul Kegiatan'] ?? '').trim();
        const nilaiStr = String(row['Nilai (Akar)'] ?? '');
        kegiatanTambahanItems.push(
          buildKegiatanTambahanEntry(row['ID Baru'], judul, nilaiStr, row['ID Lama']),
        );
        laporan.kegiatanDikonversi++;
      }
    }

    // Tulis output Sikap
    fs.mkdirSync(OUTPUT_BASE, { recursive: true });
    const tanggal = new Date().toISOString().split('T')[0];
    const namaFile = path.basename(xlsxPath);

    fs.writeFileSync(
      path.join(OUTPUT_BASE, 'sikap.generated.ts'),
      `${buildHeader(namaFile, tanggal)}\nimport type { NilaiAkar } from '../../akar-keluarga/content';\nimport type { ItemSikap } from '../adapter/sikapAdapter';\n\nexport const SIKAP_GENERATED: ItemSikap[] = [\n${sikapItems.join(',\n')}\n];\n`,
      'utf-8',
    );
    fs.writeFileSync(
      path.join(OUTPUT_BASE, 'kegiatanTambahan.generated.ts'),
      `${buildHeader(namaFile, tanggal)}\nimport type { NilaiAkar } from '../../akar-keluarga/content';\n\nexport const KEGIATAN_TAMBAHAN_GENERATED: Array<{\n  id: string;\n  judul: string;\n  nilai: NilaiAkar[];\n  subTahap: string;\n  sumberId: string;\n}> = [\n${kegiatanTambahanItems.join(',\n')}\n];\n`,
      'utf-8',
    );
  }

  // ── Sheet: Usulan Tag ──────────────────────────────────────────────────────
  prosesSheetUsulanTag(wb, path.basename(xlsxPath), laporan);

  // ── Ringkasan ─────────────────────────────────────────────────────────────
  console.log('\n── Hasil konversi ───────────────────────────────────────────');
  if (laporan.sikapDikonversi + laporan.sikapDitolak + laporan.sikapPindahKeKegiatan > 0) {
    console.log(`Sikap dikonversi          : ${laporan.sikapDikonversi}`);
    console.log(`Sikap ditolak             : ${laporan.sikapDitolak}`);
    console.log(`Sikap pindah ke kegiatan  : ${laporan.sikapPindahKeKegiatan}`);
    console.log(`Sikap fase tidak valid    : ${laporan.sikapFaseTidakValid}`);
    console.log(`Nilai tidak dikenal       : ${laporan.sikapNilaiTidakDikenal.length}`);
    console.log(`Kegiatan tambahan         : ${laporan.kegiatanDikonversi}`);
  }
  if (laporan.tagNilaiDiterapkan + laporan.tagTanpaTemaNilai > 0) {
    console.log(`Tag nilai diterapkan      : ${laporan.tagNilaiDiterapkan}`);
    console.log(`Tag tanpaTemaNilai        : ${laporan.tagTanpaTemaNilai}`);
  }

  if (laporan.sikapNilaiTidakDikenal.length > 0) {
    console.log('\nNilai yang ejaan-nya perlu dicek (tidak otomatis diperbaiki):');
    for (const { judul, nilai } of laporan.sikapNilaiTidakDikenal) {
      console.log(`  "${nilai}" pada sikap "${judul}"`);
    }
  }
}

// ─── Proses sheet Usulan Tag ──────────────────────────────────────────────────

function prosesSheetUsulanTag(
  wb: XLSX.WorkBook,
  namaFile: string,
  laporan: LaporanKonversi,
): void {
  const ws = wb.Sheets['Usulan Tag'];
  if (!ws) {
    console.log('  INFO: Sheet "Usulan Tag" tidak ada — dilewati.');
    return;
  }

  const rows = XLSX.utils.sheet_to_json<RowUsulanTag>(ws, { defval: '' });

  // ── Verifikasi jumlah per jenis ──────────────────────────────────────────
  const aktRow = rows.filter(r => String(r['Jenis']).trim() === 'Aktivitas');
  const eduRow = rows.filter(r => String(r['Jenis']).trim() === 'Alat edukasi');
  const dlRow  = rows.filter(r => String(r['Jenis']).trim() === 'Unduhan');

  const EXPECTED_AKTIVITAS = ACTIVITIES.length;   // 79
  const EXPECTED_EDU       = EDU_TOOLS.length;    // 14
  // xlsx menyertakan unduhan:1 yang sudah dihapus — toleransi +1
  const EXPECTED_UNDUHAN   = DOWNLOADABLES.length + RUJUKAN_DIHAPUS.size; // 11 + 1 = 12

  if (aktRow.length !== EXPECTED_AKTIVITAS) {
    console.error(`\nBerhenti: Jumlah aktivitas dalam xlsx (${aktRow.length}) berbeda dari kode (${EXPECTED_AKTIVITAS}).`);
    process.exit(1);
  }
  if (eduRow.length !== EXPECTED_EDU) {
    console.error(`\nBerhenti: Jumlah alat edukasi dalam xlsx (${eduRow.length}) berbeda dari kode (${EXPECTED_EDU}).`);
    process.exit(1);
  }
  if (dlRow.length !== EXPECTED_UNDUHAN) {
    console.error(`\nBerhenti: Jumlah unduhan dalam xlsx (${dlRow.length}) berbeda dari yang diharapkan (${EXPECTED_UNDUHAN}).`);
    process.exit(1);
  }

  // ── Verifikasi judul: satu ketidakcocokan pun → berhenti total ───────────
  const aktById = new Map(ACTIVITIES.map(a => [a.id, a.judul]));
  const eduById = new Map(EDU_TOOLS.map(e => [e.id, e.nama]));
  const dlById  = new Map(DOWNLOADABLES.map(d => [d.id, d.nama]));

  const ketidakcocokan: string[] = [];

  for (const row of rows) {
    const rujukan    = String(row['Rujukan']).trim();
    const xlsxJudul  = String(row['Judul']).trim();

    if (RUJUKAN_DIHAPUS.has(rujukan)) {
      console.log(`  INFO: ${rujukan} = "${xlsxJudul}" — item dihapus dari kode, dilewati.`);
      continue;
    }

    const match = rujukan.match(/^(aktivitas|alatEdukasi|unduhan):(\d+)$/);
    if (!match) {
      ketidakcocokan.push(`  Rujukan tidak dikenali: "${rujukan}"`);
      continue;
    }
    const [, jenis, idStr] = match;
    const id = parseInt(idStr, 10);

    let kodeJudul: string | undefined;
    if (jenis === 'aktivitas') kodeJudul = aktById.get(id);
    else if (jenis === 'alatEdukasi') kodeJudul = eduById.get(id);
    else kodeJudul = dlById.get(id);

    if (kodeJudul === undefined) {
      ketidakcocokan.push(`  ${rujukan}: id=${id} tidak ditemukan di kode`);
    } else if (xlsxJudul !== kodeJudul) {
      ketidakcocokan.push(`  ${rujukan}:\n    xlsx : "${xlsxJudul}"\n    kode : "${kodeJudul}"`);
    }
  }

  if (ketidakcocokan.length > 0) {
    console.error(`\nPENGGABUNGAN DIBATALKAN — judul tidak cocok:\n${ketidakcocokan.join('\n')}`);
    process.exit(1);
  }

  // ── Bangun entri tag ──────────────────────────────────────────────────────
  const entries: string[] = [];

  for (const row of rows) {
    const rujukan = String(row['Rujukan']).trim();
    if (RUJUKAN_DIHAPUS.has(rujukan)) continue;

    const usul = String(row['Usulan Nilai']).trim();
    const kep  = String(row['Keputusan']).trim();
    const peng = String(row['Nilai Pengganti']).trim();

    const isTanpa =
      /tidak bertema/i.test(usul) ||
      /tidak bertema/i.test(kep);

    if (isTanpa) {
      entries.push(`  ${JSON.stringify(rujukan)}: { tanpaTemaNilai: true as const },`);
      laporan.tagTanpaTemaNilai++;
    } else {
      const finalStr  = peng || usul;
      const nilaiList = finalStr.split(',').map(n => n.trim()).filter(Boolean);

      for (const n of nilaiList) {
        if (!NILAI_KANONIK.has(n)) {
          console.error(`\nBerhenti: Nilai "${n}" di ${rujukan} di luar daftar kanonik. Tidak diperbaiki otomatis.`);
          process.exit(1);
        }
      }

      if (nilaiList.length > 0) {
        const nilaiCode = nilaiList.map(n => `'${n.replace(/'/g, "\\'")}'`).join(', ');
        entries.push(`  ${JSON.stringify(rujukan)}: { nilai: [${nilaiCode}] as NilaiAkar[] },`);
        laporan.tagNilaiDiterapkan++;
      }
    }
  }

  // ── Tulis file output ─────────────────────────────────────────────────────
  const tanggal = new Date().toISOString().split('T')[0];
  const outputPath = path.join(DATA_BASE, 'tagNilaiLS.generated.ts');

  const lines: string[] = [
    '// FILE INI DIHASILKAN OTOMATIS — JANGAN DIEDIT MANUAL.',
    `// Sumber: ${namaFile} · dihasilkan: ${tanggal}`,
    '// Ubah isinya lewat xlsx, lalu jalankan: pnpm rekah:konversi',
    '',
    "import type { NilaiAkar } from '../features/akar-keluarga/content';",
    '',
    `// Tag nilai diterapkan dari review Psikolog Fitri, ${tanggal}.`,
    `// Sumber: ${namaFile}, sheet 'Usulan Tag'.`,
    'export const TAG_NILAI_LS: Record<string, { nilai?: NilaiAkar[]; tanpaTemaNilai?: true }> = {',
    ...entries,
    '};',
    '',
  ];

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log(`\nTag nilai LS:`);
  console.log(`  Bertag nilai    : ${laporan.tagNilaiDiterapkan}`);
  console.log(`  tanpaTemaNilai  : ${laporan.tagTanpaTemaNilai}`);
  console.log(`  → ${outputPath}`);
}

// ─── Builder string ───────────────────────────────────────────────────────────

function buildHeader(namaFile: string, tanggal: string): string {
  return [
    '// FILE INI DIHASILKAN OTOMATIS — JANGAN DIEDIT MANUAL.',
    `// Sumber: ${namaFile} · dihasilkan: ${tanggal}`,
    '// Ubah isinya lewat xlsx, lalu jalankan: pnpm rekah:konversi',
  ].join('\n');
}

function buildSikapEntry(
  id: string,
  judul: string,
  nilai: string[],
  faseMulai: number,
  faseSelesai: number,
  sumberId: string,
): string {
  const nilaiStr = nilai.map(n => `'${n.replace(/'/g, "\\'")}'`).join(', ');
  return `  {
    id: ${JSON.stringify(id)},
    judul: ${JSON.stringify(judul)},
    nilai: [${nilaiStr}] as NilaiAkar[],
    faseMulai: ${faseMulai},
    faseSelesai: ${faseSelesai},
    sumberId: ${JSON.stringify(sumberId)},
  }`;
}

function buildKegiatanTambahanEntry(
  id: string,
  judul: string,
  nilaiStr: string,
  sumberId: string,
): string {
  const nilai = nilaiStr.split(',').map(n => n.trim()).filter(Boolean);
  const nilaiCode = nilai.map(n => `'${n.replace(/'/g, "\\'")}'`).join(', ');
  return `  {
    id: ${JSON.stringify(id)},
    judul: ${JSON.stringify(judul)},
    nilai: [${nilaiCode}] as NilaiAkar[],
    subTahap: 'TODO',
    sumberId: ${JSON.stringify(sumberId)},
  }`;
}

main();
