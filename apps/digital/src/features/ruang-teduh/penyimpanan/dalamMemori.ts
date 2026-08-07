/**
 * Implementasi sementara. Data hidup di memori dan hilang saat halaman
 * dimuat ulang. Ini disengaja.
 *
 * Keputusan tempat penyimpanan sungguhan belum diambil karena menyangkut
 * data kesehatan. Lihat dokumen rancangan penyimpanan data caregiver.
 *
 * TODO: backend, ganti file ini saat keputusan penyimpanan turun.
 * Komponen tidak perlu diubah.
 */
import type { CatatanHarianIbu, CaregiverProfile } from '../types';
import type { CatatanHarianRepository, CaregiverRepository } from './kontrak';

export class CatatanHarianDalamMemori implements CatatanHarianRepository {
  // kunci luar: caregiverId; kunci dalam: tanggal (YYYY-MM-DD)
  private readonly peta = new Map<string, Map<string, CatatanHarianIbu>>();

  async ambilRentang(
    caregiverId: string,
    dariTanggal: string,
    sampaiTanggal: string,
  ): Promise<CatatanHarianIbu[]> {
    const bucket = this.peta.get(caregiverId);
    if (!bucket) return [];

    const hasil: CatatanHarianIbu[] = [];
    for (const [tgl, catatan] of bucket) {
      if (tgl >= dariTanggal && tgl <= sampaiTanggal) {
        hasil.push(catatan);
      }
    }
    // Urutan naik menurut tanggal
    hasil.sort((a, b) => (a.tanggal < b.tanggal ? -1 : a.tanggal > b.tanggal ? 1 : 0));
    return hasil;
  }

  async simpanDiff(caregiverId: string, diff: CatatanHarianIbu): Promise<void> {
    if (!this.peta.has(caregiverId)) {
      this.peta.set(caregiverId, new Map());
    }
    const bucket = this.peta.get(caregiverId)!;
    const lama = bucket.get(diff.tanggal);

    // Gabungkan per field secara eksplisit.
    // Aturan: field di diff yang nilainya bukan undefined menimpa nilai lama.
    // Field yang tidak ada di diff (undefined) dibiarkan dari nilai lama.
    // Ini memenuhi jaminan: array kosong mengosongkan, undefined tidak menghapus.
    const baru: CatatanHarianIbu = { tanggal: diff.tanggal };

    if (diff.cuacaHati !== undefined) {
      baru.cuacaHati = diff.cuacaHati;
    } else if (lama?.cuacaHati !== undefined) {
      baru.cuacaHati = lama.cuacaHati;
    }

    if (diff.kondisiNifas !== undefined) {
      baru.kondisiNifas = diff.kondisiNifas;
    } else if (lama?.kondisiNifas !== undefined) {
      baru.kondisiNifas = lama.kondisiNifas;
    }

    if (diff.porsi !== undefined) {
      baru.porsi = diff.porsi;
    } else if (lama?.porsi !== undefined) {
      baru.porsi = lama.porsi;
    }

    if (diff.gelasAir !== undefined) {
      baru.gelasAir = diff.gelasAir;
    } else if (lama?.gelasAir !== undefined) {
      baru.gelasAir = lama.gelasAir;
    }

    if (diff.suplemen !== undefined) {
      baru.suplemen = diff.suplemen;
    } else if (lama?.suplemen !== undefined) {
      baru.suplemen = lama.suplemen;
    }

    bucket.set(diff.tanggal, baru);
  }

  async hapusSemua(caregiverId: string): Promise<void> {
    this.peta.delete(caregiverId);
  }
}

export class CaregiverDalamMemori implements CaregiverRepository {
  private readonly peta = new Map<string, CaregiverProfile>();

  async ambil(caregiverId: string): Promise<CaregiverProfile | null> {
    return this.peta.get(caregiverId) ?? null;
  }

  async simpan(profil: CaregiverProfile): Promise<void> {
    this.peta.set(profil.id, profil);
  }
}
