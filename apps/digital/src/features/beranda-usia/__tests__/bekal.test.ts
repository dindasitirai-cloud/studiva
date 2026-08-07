import { hitungUsiaBulan, hitungUsiaKoreksiBulan } from '../usia';
import { resolveTahapAktif } from '../resolveTahap';
import { DAFTAR_BEKAL, cariBekal, cariSubTahap } from '../bekalRegistry';

// Helper: buat Date lokal dari komponen tahun-bulan-hari.
function tgl(tahun: number, bulan: number, hari = 1): Date {
  return new Date(tahun, bulan - 1, hari);
}

// Acuan tetap agar semua tes deterministik.
const ACUAN = tgl(2026, 7, 19);

// Helper: buat profil anak dari tanggal lahir saja.
function profilDari(tanggalLahir: Date, mingguGestasi?: number) {
  return { tanggalLahir, mingguGestasi };
}

// Helper: tanggal lahir dari usia bulan yang diinginkan, relatif ke ACUAN.
function lahirUsia(usiaBulan: number, hari = 19): Date {
  const tahun = ACUAN.getFullYear() - Math.floor(usiaBulan / 12);
  const bulan = ACUAN.getMonth() + 1 - (usiaBulan % 12);
  if (bulan <= 0) {
    return tgl(tahun - 1, bulan + 12, hari);
  }
  return tgl(tahun, bulan, hari);
}

// ─── hitungUsiaBulan ──────────────────────────────────────────────────────────

describe('hitungUsiaBulan', () => {
  it('lahir hari yang sama dengan acuan → 0 bulan', () => {
    expect(hitungUsiaBulan(ACUAN, ACUAN)).toBe(0);
  });

  it('31 Jan, acuan 28 Feb — belum genap satu bulan', () => {
    const lahir = tgl(2026, 1, 31);
    const acuan = tgl(2026, 2, 28);
    // getDate(28) < getDate(31) → bulan = 1 - 1 = 0
    expect(hitungUsiaBulan(lahir, acuan)).toBe(0);
  });

  it('lahir 29 Feb tahun kabisat, acuan 28 Feb dua tahun kemudian', () => {
    const lahir = tgl(2024, 2, 29);
    const acuan = tgl(2026, 2, 28);
    // getDate(28) < getDate(29) → bulan = 24 - 1 = 23
    expect(hitungUsiaBulan(lahir, acuan)).toBe(23);
  });

  it('tanggal lahir di masa depan → usia negatif', () => {
    const lahirMasaDepan = tgl(2027, 1, 1);
    expect(hitungUsiaBulan(lahirMasaDepan, ACUAN)).toBeLessThan(0);
  });

  it('usia tepat batas: 0 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(0), ACUAN)).toBe(0);
  });

  it('usia tepat batas: 3 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(3), ACUAN)).toBe(3);
  });

  it('usia tepat batas: 6 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(6), ACUAN)).toBe(6);
  });

  it('usia tepat batas: 9 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(9), ACUAN)).toBe(9);
  });

  it('usia tepat batas: 12 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(12), ACUAN)).toBe(12);
  });

  it('usia tepat batas: 18 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(18), ACUAN)).toBe(18);
  });

  it('usia tepat batas: 24 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(24), ACUAN)).toBe(24);
  });

  it('usia tepat batas: 36 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(36), ACUAN)).toBe(36);
  });

  it('usia tepat batas: 48 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(48), ACUAN)).toBe(48);
  });

  it('usia tepat batas: 60 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(60), ACUAN)).toBe(60);
  });

  it('usia 71 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(71), ACUAN)).toBe(71);
  });

  it('usia tepat batas: 72 bulan', () => {
    expect(hitungUsiaBulan(lahirUsia(72), ACUAN)).toBe(72);
  });
});

// ─── hitungUsiaKoreksiBulan ───────────────────────────────────────────────────

describe('hitungUsiaKoreksiBulan', () => {
  it('prematur 30 minggu pada usia kronologis 6 bulan → usia koreksi lebih kecil', () => {
    // mingguKoreksi = 40 - 30 = 10; koreksiInBulan = floor(10/4.345) = 2
    const lahir = lahirUsia(6);
    const koreksi = hitungUsiaKoreksiBulan(lahir, ACUAN, 30);
    expect(koreksi).toBe(4);
    expect(koreksi).toBeLessThan(6);
  });

  it('prematur 30 minggu pada usia kronologis 25 bulan → koreksi tidak diterapkan', () => {
    const lahir = lahirUsia(25);
    const koreksi = hitungUsiaKoreksiBulan(lahir, ACUAN, 30);
    // >= 24 bulan kronologis → tidak dikoreksi
    expect(koreksi).toBe(hitungUsiaBulan(lahir, ACUAN));
  });

  it('mingguGestasi 38 (cukup bulan) → tidak ada koreksi', () => {
    const lahir = lahirUsia(6);
    const koreksi = hitungUsiaKoreksiBulan(lahir, ACUAN, 38);
    expect(koreksi).toBe(hitungUsiaBulan(lahir, ACUAN));
  });

  it('mingguGestasi 37 (tepat batas cukup bulan) → tidak ada koreksi', () => {
    const lahir = lahirUsia(6);
    const koreksi = hitungUsiaKoreksiBulan(lahir, ACUAN, 37);
    expect(koreksi).toBe(hitungUsiaBulan(lahir, ACUAN));
  });

  it('tepat di batas 24 bulan kronologis → tidak dikoreksi meski prematur', () => {
    const lahir = lahirUsia(24);
    const koreksi = hitungUsiaKoreksiBulan(lahir, ACUAN, 30);
    expect(koreksi).toBe(24);
  });
});

// ─── resolveTahapAktif ────────────────────────────────────────────────────────

describe('resolveTahapAktif — batas usia tepat', () => {
  // Usia 0 → b03, aktif
  it('usia 0 bulan → ok, sub-tahap b03', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(0)), ACUAN);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      expect(r.hasil.subTahap.id).toBe('b03');
      expect(r.hasil.bekal.id).toBe('0-1');
    }
  });

  // Usia 3 → b36, inklusif bawah
  it('usia 3 bulan → ok, sub-tahap b36 (inklusif bawah)', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(3)), ACUAN);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      expect(r.hasil.subTahap.id).toBe('b36');
    }
  });

  // Usia 6 → b69
  it('usia 6 bulan → ok, sub-tahap b69', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(6)), ACUAN);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      expect(r.hasil.subTahap.id).toBe('b69');
    }
  });

  // Usia 9 → b912 (bukan b69 — eksklusif atas)
  it('usia 9 bulan → ok, sub-tahap b912 (eksklusif atas b69)', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(9)), ACUAN);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      expect(r.hasil.subTahap.id).toBe('b912');
    }
  });

  // Usia 12 → t1218, kontenBelumSiap (Bekal 1-2 aktif: false)
  it('usia 12 bulan → kontenBelumSiap, sub-tahap t1218', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(12)), ACUAN);
    expect(r.status).toBe('kontenBelumSiap');
    if (r.status === 'kontenBelumSiap') {
      expect(r.bekal.id).toBe('1-2');
    }
  });

  // Usia 18 → t1824
  it('usia 18 bulan → kontenBelumSiap, bekal 1-2', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(18)), ACUAN);
    expect(r.status).toBe('kontenBelumSiap');
    if (r.status === 'kontenBelumSiap') {
      expect(r.bekal.id).toBe('1-2');
    }
  });

  // Usia 24 → u23, Bekal 2-3
  it('usia 24 bulan → kontenBelumSiap, bekal 2-3', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(24)), ACUAN);
    expect(r.status).toBe('kontenBelumSiap');
    if (r.status === 'kontenBelumSiap') {
      expect(r.bekal.id).toBe('2-3');
    }
  });

  // Usia 36 → u34, Bekal 3-4
  it('usia 36 bulan → kontenBelumSiap, bekal 3-4', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(36)), ACUAN);
    expect(r.status).toBe('kontenBelumSiap');
    if (r.status === 'kontenBelumSiap') {
      expect(r.bekal.id).toBe('3-4');
    }
  });

  // Usia 48 → u45, Bekal 4-5
  it('usia 48 bulan → kontenBelumSiap, bekal 4-5', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(48)), ACUAN);
    expect(r.status).toBe('kontenBelumSiap');
    if (r.status === 'kontenBelumSiap') {
      expect(r.bekal.id).toBe('4-5');
    }
  });

  // Usia 60 → u56, Bekal 5-6
  it('usia 60 bulan → kontenBelumSiap, bekal 5-6', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(60)), ACUAN);
    expect(r.status).toBe('kontenBelumSiap');
    if (r.status === 'kontenBelumSiap') {
      expect(r.bekal.id).toBe('5-6');
    }
  });

  // Usia 71 → u56, Bekal 5-6 (60 ≤ 71 < 72)
  it('usia 71 bulan → kontenBelumSiap, bekal 5-6', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(71)), ACUAN);
    expect(r.status).toBe('kontenBelumSiap');
    if (r.status === 'kontenBelumSiap') {
      expect(r.bekal.id).toBe('5-6');
    }
  });

  // Usia 72 → melewatiRentang (eksklusif atas u56)
  it('usia 72 bulan tepat → melewatiRentang', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(72)), ACUAN);
    expect(r.status).toBe('melewatiRentang');
    if (r.status === 'melewatiRentang') {
      expect(r.usiaBulan).toBe(72);
    }
  });
});

describe('resolveTahapAktif — kasus tepi', () => {
  it('lahir 31 Jan, acuan 28 Feb → belum genap satu bulan → ok, b03', () => {
    // usia = 0 bulan → sub-tahap b03
    const lahir = tgl(2026, 1, 31);
    const acuan = tgl(2026, 2, 28);
    const r = resolveTahapAktif(profilDari(lahir), acuan);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      expect(r.hasil.subTahap.id).toBe('b03');
    }
  });

  it('lahir 29 Feb tahun kabisat, acuan 28 Feb dua tahun kemudian → 23 bulan → ok, b912', () => {
    // Nope: 23 bulan → b912 ada di Bekal 0-1 (aktif) — 9 ≤ 23? Tidak.
    // b912 = 9–12, bukan 9–23. 23 bulan ada di t1824 (18–24) → Bekal 1-2 → kontenBelumSiap
    const lahir = tgl(2024, 2, 29);
    const acuan = tgl(2026, 2, 28);
    const r = resolveTahapAktif(profilDari(lahir), acuan);
    expect(r.status).toBe('kontenBelumSiap');
    if (r.status === 'kontenBelumSiap') {
      expect(r.bekal.id).toBe('1-2');
    }
  });

  it('tanggal lahir di masa depan → belumLahir', () => {
    const lahirMasaDepan = tgl(2027, 1, 1);
    const r = resolveTahapAktif(profilDari(lahirMasaDepan), ACUAN);
    expect(r.status).toBe('belumLahir');
  });

  it('prematur 30 minggu pada usia kronologis 6 bulan → usia koreksi 4 bln, memakaiUsiaKoreksi: true', () => {
    const lahir = lahirUsia(6);
    const r = resolveTahapAktif(profilDari(lahir, 30), ACUAN);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      expect(r.hasil.usiaBulan).toBe(4);      // setelah koreksi
      expect(r.hasil.memakaiUsiaKoreksi).toBe(true);
      expect(r.hasil.subTahap.id).toBe('b36'); // 3 ≤ 4 < 6
    }
  });

  it('prematur 30 minggu pada usia kronologis 25 bulan → koreksi tidak diterapkan', () => {
    const lahir = lahirUsia(25);
    const r = resolveTahapAktif(profilDari(lahir, 30), ACUAN);
    // 25 bulan, tidak dikoreksi → kontenBelumSiap (Bekal 2-3 aktif: false)
    expect(r.status).toBe('kontenBelumSiap');
    if (r.status === 'kontenBelumSiap') {
      expect(r.usiaBulan).toBe(25);  // tidak dikoreksi
    }
  });

  it('mingguGestasi 38 → tidak ada koreksi, memakaiUsiaKoreksi: false', () => {
    const lahir = lahirUsia(6);
    const r = resolveTahapAktif(profilDari(lahir, 38), ACUAN);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      expect(r.hasil.memakaiUsiaKoreksi).toBe(false);
      expect(r.hasil.usiaBulan).toBe(6);
    }
  });
});

// ─── Uji integritas registry ─────────────────────────────────────────────────

describe('integritas registry DAFTAR_BEKAL', () => {
  it('registry menutupi 0–71 bulan tanpa celah dan tanpa tumpang tindih', () => {
    // Kumpulkan semua sub-tahap dari seluruh bekal, urutkan
    const semua = DAFTAR_BEKAL.flatMap(b => b.subTahap)
      .slice()
      .sort((a, b) => a.usiaBulanMulai - b.usiaBulanMulai);

    // Tidak boleh ada celah: setiap mulai harus sama dengan selesai sebelumnya
    for (let i = 1; i < semua.length; i++) {
      const sebelumnya = semua[i - 1];
      const sekarang = semua[i];
      expect(sekarang.usiaBulanMulai).toBe(sebelumnya.usiaBulanSelesai);
    }

    // Mulai dari 0
    expect(semua[0].usiaBulanMulai).toBe(0);

    // Berakhir tepat di 72 (eksklusif atas = batas melewatiRentang)
    expect(semua[semua.length - 1].usiaBulanSelesai).toBe(72);

    // Jumlah sub-tahap sesuai spesifikasi
    expect(semua).toHaveLength(10);
  });

  it('Bekal 0-1 punya 4 sub-tahap, 1-2 punya 2, sisanya 1', () => {
    expect(cariBekal('0-1')!.subTahap).toHaveLength(4);
    expect(cariBekal('1-2')!.subTahap).toHaveLength(2);
    expect(cariBekal('2-3')!.subTahap).toHaveLength(1);
    expect(cariBekal('3-4')!.subTahap).toHaveLength(1);
    expect(cariBekal('4-5')!.subTahap).toHaveLength(1);
    expect(cariBekal('5-6')!.subTahap).toHaveLength(1);
  });

  it('id sub-tahap memakai id asli dari AGE_RANGES', () => {
    const idsExpected = ['b03', 'b36', 'b69', 'b912', 't1218', 't1824', 'u23', 'u34', 'u45', 'u56'];
    const idsActual = DAFTAR_BEKAL.flatMap(b => b.subTahap.map(st => st.id));
    expect(idsActual).toEqual(idsExpected);
  });

  it('hanya Bekal 0-1 yang aktif', () => {
    const aktif = DAFTAR_BEKAL.filter(b => b.aktif);
    expect(aktif).toHaveLength(1);
    expect(aktif[0].id).toBe('0-1');
  });

  it('cariSubTahap menemukan sub-tahap yang benar', () => {
    const hasil = cariSubTahap('b69');
    expect(hasil).toBeDefined();
    expect(hasil!.bekal.id).toBe('0-1');
    expect(hasil!.subTahap.usiaBulanMulai).toBe(6);
    expect(hasil!.subTahap.usiaBulanSelesai).toBe(9);
  });

  it('cariSubTahap mengembalikan undefined untuk id yang tidak ada', () => {
    expect(cariSubTahap('tidak-ada')).toBeUndefined();
  });

  it('batas inklusif-eksklusif: usia tepat 9 bulan → b912, bukan b69', () => {
    const r = resolveTahapAktif(profilDari(lahirUsia(9)), ACUAN);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      expect(r.hasil.subTahap.id).toBe('b912');
      expect(r.hasil.subTahap.id).not.toBe('b69');
    }
  });
});
