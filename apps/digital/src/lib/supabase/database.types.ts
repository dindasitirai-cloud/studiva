// Types TypeScript untuk skema Rekah di Supabase.
// Dibuat manual sesuai 001_rekah_schema.sql.
// Untuk regenerasi otomatis: npx supabase gen types typescript --project-id <id>

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

/** Satu elemen di kolom JSONB `anak.pendamping`. */
export interface PendampingJson {
  panggilan: string;
  peran: 'ibu' | 'ayah' | 'nenek-kakek' | 'pengasuh' | 'lainnya';
}

export interface Database {
  public: {
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      orang_tua: {
        Row: {
          id: string;
          email: string;
          nomor_hp: string | null;
          dibuat_pada: string;
        };
        Insert: {
          id: string;
          email: string;
          nomor_hp?: string | null;
          dibuat_pada?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nomor_hp?: string | null;
        };
        Relationships: [];
      };

      // Tabel `anak` adalah SATU-SATUNYA sumber data anak di seluruh aplikasi.
      // Diakses hanya lewat lib/supabase/rekah.ts, dan hanya dikonsumsi UI
      // lewat context/AnakContext.tsx. Jangan menyimpan salinan profil anak
      // di context, state, atau endpoint lain.
      anak: {
        Row: {
          id: string;
          id_orang_tua: string;
          nama_anak: string;
          tanggal_lahir: string; // ISO date 'YYYY-MM-DD'
          jenis_kelamin: 'perempuan' | 'laki-laki' | null;
          foto_url: string | null; // path objek di bucket privat "foto-anak"
          /** Larik {panggilan, peran}. Lihat 010_pendamping_jamak.sql. */
          pendamping: PendampingJson[];
          /** @deprecated Diganti kolom `pendamping`. Dihapus setelah rilis stabil. */
          panggilan_pendamping: string | null;
          /** @deprecated Diganti kolom `pendamping`. Dihapus setelah rilis stabil. */
          peran_pendamping: 'ibu' | 'ayah' | 'nenek-kakek' | 'pengasuh' | 'lainnya' | null;
          nama_ibu: string | null;
          nama_bapak: string | null;
          /** 011. Deskriptif, bukan diagnosis. */
          temperamen: 'tenang' | 'aktif' | 'sensitif' | 'campuran' | null;
          /** 011. Teks bebas dari orang tua. */
          tantangan_utama: string | null;
          dibuat_pada: string;
          diperbarui_pada: string;
        };
        Insert: {
          id?: string;
          id_orang_tua: string;
          nama_anak: string;
          tanggal_lahir: string;
          jenis_kelamin?: 'perempuan' | 'laki-laki' | null;
          foto_url?: string | null;
          pendamping?: PendampingJson[];
          nama_ibu?: string | null;
          nama_bapak?: string | null;
          temperamen?: 'tenang' | 'aktif' | 'sensitif' | 'campuran' | null;
          tantangan_utama?: string | null;
          dibuat_pada?: string;
          diperbarui_pada?: string;
        };
        Update: {
          nama_anak?: string;
          jenis_kelamin?: 'perempuan' | 'laki-laki' | null;
          foto_url?: string | null;
          pendamping?: PendampingJson[];
          nama_ibu?: string | null;
          nama_bapak?: string | null;
          temperamen?: 'tenang' | 'aktif' | 'sensitif' | 'campuran' | null;
          tantangan_utama?: string | null;
          // tanggal_lahir tidak ada di sini — imutabel dari sisi pengguna.
          // Trigger tolak_ubah_tanggal_lahir menolaknya di level database juga.
        };
        Relationships: [];
      };

      consent: {
        Row: {
          id: string;
          id_orang_tua: string;
          versi_kebijakan: string;
          disetujui_pada: string;
        };
        Insert: {
          id?: string;
          id_orang_tua: string;
          versi_kebijakan: string;
          disetujui_pada?: string;
        };
        Update: never;
        Relationships: [];
      };

      nilai_ditanam: {
        Row: {
          id: string;
          id_anak: string;
          id_nilai: string;
          ditanam_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          id_nilai: string;
          ditanam_pada?: string;
        };
        Update: never;
        Relationships: [];
      };

      pilihan_harian: {
        Row: {
          id: string;
          id_anak: string;
          tanggal: string;
          diff: Json;
          /**
           * 012. Centang Kebiasaan Baik untuk tanggal baris ini:
           * `{ idNilai: [idButir, ...] }`. Dimensi tanggal datang dari kolom
           * `tanggal`, jadi tidak diulang di dalam JSON.
           *
           * Kolom terpisah dari `diff` karena keduanya ditulis alur berbeda —
           * `diff` ditimpa utuh oleh simpanPilihanHarian.
           */
          centang: Record<string, string[]>;
          dibuat_pada: string;
          diperbarui_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          tanggal: string;
          diff: Json;
          centang?: Record<string, string[]>;
          dibuat_pada?: string;
          diperbarui_pada?: string;
        };
        Update: {
          diff?: Json;
          centang?: Record<string, string[]>;
          diperbarui_pada?: string;
        };
        Relationships: [];
      };

      kebun_riwayat: {
        Row: {
          id: string;
          id_anak: string;
          id_domain: string;
          tanggal_dirawat: string;
          dibuat_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          id_domain: string;
          tanggal_dirawat: string;
          dibuat_pada?: string;
        };
        Update: never;
        Relationships: [];
      };

      jejak: {
        Row: {
          id: string;
          id_anak: string;
          tanggal: string;
          entri: Json;
          dibuat_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          tanggal: string;
          entri: Json;
          dibuat_pada?: string;
        };
        Update: {
          entri?: Json;
        };
        Relationships: [];
      };

      langganan: {
        Row: {
          id: string;
          id_orang_tua: string;
          status: 'aktif' | 'dibatalkan' | 'tertunggak' | 'belum_pernah';
          akhir_periode: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          diperbarui_pada: string;
        };
        Insert: {
          id?: string;
          id_orang_tua: string;
          status?: 'aktif' | 'dibatalkan' | 'tertunggak' | 'belum_pernah';
          akhir_periode?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          diperbarui_pada?: string;
        };
        Update: {
          status?: 'aktif' | 'dibatalkan' | 'tertunggak' | 'belum_pernah';
          akhir_periode?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          diperbarui_pada?: string;
        };
        Relationships: [];
      };

      permohonan_koreksi_tgl_lahir: {
        Row: {
          id: string;
          id_anak: string;
          tanggal_diminta: string;
          alasan: string;
          status: 'menunggu' | 'disetujui' | 'ditolak';
          dibuat_pada: string;
          ditangani_pada: string | null;
        };
        Insert: {
          id?: string;
          id_anak: string;
          tanggal_diminta: string;
          alasan: string;
          status?: 'menunggu' | 'disetujui' | 'ditolak';
          dibuat_pada?: string;
          ditangani_pada?: string | null;
        };
        Update: {
          status?: 'menunggu' | 'disetujui' | 'ditolak';
          ditangani_pada?: string | null;
        };
        Relationships: [];
      };

      konten_draf: {
        Row: {
          id: string;
          jenis: 'kegiatan_ajak_main' | 'panduan_tumbuh' | 'sikap';
          id_konten_sumber: string | null;
          judul: string;
          isi: Json;
          catatan_penulis: string | null;
          status: 'draf' | 'diajukan' | 'disetujui' | 'ditolak' | 'tayang';
          id_penulis: string;
          id_penyetuju: string | null;
          catatan_tinjauan: string | null;
          dibuat_pada: string;
          diperbarui_pada: string;
        };
        Insert: {
          id?: string;
          jenis: 'kegiatan_ajak_main' | 'panduan_tumbuh' | 'sikap';
          id_konten_sumber?: string | null;
          judul: string;
          isi?: Json;
          catatan_penulis?: string | null;
          status?: 'draf' | 'diajukan' | 'disetujui' | 'ditolak' | 'tayang';
          id_penulis: string;
          id_penyetuju?: string | null;
          catatan_tinjauan?: string | null;
        };
        Update: {
          judul?: string;
          isi?: Json;
          catatan_penulis?: string | null;
          status?: 'draf' | 'diajukan' | 'disetujui' | 'ditolak' | 'tayang';
          id_penyetuju?: string | null;
          catatan_tinjauan?: string | null;
        };
        Relationships: [];
      };

      riwayat_tinjauan: {
        Row: {
          id: string;
          id_draf: string;
          id_pelaku: string;
          tindakan: string;
          catatan: string | null;
          dibuat_pada: string;
        };
        Insert: {
          id?: string;
          id_draf: string;
          id_pelaku: string;
          tindakan: string;
          catatan?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      sikap: {
        Row: {
          id: string;
          judul: string;
          deskripsi: string | null;
          nilai: string[];
          fase_mulai: number;
          fase_selesai: number;
          id_draf_asal: string | null;
          dibuat_pada: string;
          diperbarui_pada: string;
        };
        Insert: {
          id?: string;
          judul: string;
          deskripsi?: string | null;
          nilai: string[];
          fase_mulai: number;
          fase_selesai: number;
          id_draf_asal?: string | null;
        };
        Update: {
          judul?: string;
          deskripsi?: string | null;
          nilai?: string[];
          fase_mulai?: number;
          fase_selesai?: number;
        };
        Relationships: [];
      };

      // ── 011_rekah_musim_jurnal ──────────────────────────────────────────────
      // Semua di-key ke id_anak, bukan id orang tua. Lihat catatan di migrasi:
      // model lama di Express membuat dua anak berbagi satu profil dan jurnal.

      rekah_musim: {
        Row: {
          id: string;
          id_anak: string;
          musim_ke: number;
          minggu_ke: number;
          /** Larik NilaiId, 1–3 elemen. */
          nilai_fokus: string[];
          mulai: string; // ISO date 'YYYY-MM-DD'
          /** null = musim berjalan. Hanya satu per anak (partial unique index). */
          selesai: string | null;
          total_langkah: number;
          refleksi_musim: Json | null;
          dibuat_pada: string;
          diperbarui_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          musim_ke: number;
          minggu_ke?: number;
          nilai_fokus: string[];
          mulai?: string;
          selesai?: string | null;
          total_langkah?: number;
          refleksi_musim?: Json | null;
        };
        Update: {
          minggu_ke?: number;
          nilai_fokus?: string[];
          selesai?: string | null;
          total_langkah?: number;
          refleksi_musim?: Json | null;
          // mulai & musim_ke tidak diubah setelah musim dibuat.
        };
        Relationships: [];
      };

      rekah_langkah_selesai: {
        Row: {
          id: string;
          id_anak: string;
          id_modul: string;
          musim_ke: number;
          minggu_ke: number;
          selesai_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          id_modul: string;
          musim_ke: number;
          minggu_ke: number;
          selesai_pada?: string;
        };
        Update: never;
        Relationships: [];
      };

      rekah_refleksi: {
        Row: {
          id: string;
          id_anak: string;
          id_modul: string;
          tanggal: string;
          respon_anak: 'seru' | 'menantang' | 'belum-tertarik';
          mood_pendamping: 'lega' | 'biasa' | 'lelah' | null;
          catatan: string | null;
          nilai_utama: string | null;
          simpan_ke_jurnal: boolean;
          musim_ke: number;
          dibuat_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          id_modul: string;
          tanggal: string;
          respon_anak: 'seru' | 'menantang' | 'belum-tertarik';
          mood_pendamping?: 'lega' | 'biasa' | 'lelah' | null;
          catatan?: string | null;
          nilai_utama?: string | null;
          simpan_ke_jurnal?: boolean;
          musim_ke: number;
        };
        Update: never;
        Relationships: [];
      };

      rekah_jurnal: {
        Row: {
          id: string;
          id_anak: string;
          judul: string;
          catatan: string;
          tanggal: string;
          id_nilai: string | null;
          tag: 'refleksi' | 'penutup-musim' | 'manual';
          dibuat_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          judul: string;
          catatan: string;
          tanggal?: string;
          id_nilai?: string | null;
          tag?: 'refleksi' | 'penutup-musim' | 'manual';
        };
        Update: {
          judul?: string;
          catatan?: string;
          id_nilai?: string | null;
        };
        Relationships: [];
      };

      rekah_rencana_pekan: {
        Row: {
          id: string;
          id_anak: string;
          musim_ke: number;
          minggu_ke: number;
          /** Terurut. Maksimal 7 (dijaga CHECK di database). */
          id_modul: string[];
          dibuat_pada: string;
          diperbarui_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          musim_ke: number;
          minggu_ke: number;
          id_modul: string[];
        };
        Update: {
          id_modul?: string[];
        };
        Relationships: [];
      };

      // ── 013_ruang_teduh ─────────────────────────────────────────────────────

      /**
       * ⚠️ DATA KESEHATAN (UU 27/2022, data pribadi spesifik).
       *
       * Hanya untuk ditampilkan kembali kepada ibu yang mencatatnya. DILARANG
       * dipakai untuk personalisasi rekomendasi, penentuan kapan tautan belanja
       * muncul, penargetan, profiling, atau analitik per individu.
       * Lihat penyimpanan/kontrak.ts dan kepala migrasi 013.
       *
       * Di-key ke id_anak: nifas adalah peristiwa per-kelahiran, bukan keadaan
       * per-ibu. Migrasi 013 sempat memakai id_orang_tua dan itu membuat data
       * satu anak muncul di layar anak lain — dikoreksi di migrasi 014.
       */
      catatan_harian_ibu: {
        Row: {
          id: string;
          id_anak: string;
          tanggal: string; // ISO date 'YYYY-MM-DD'
          cuaca_hati: 'cerah' | 'berawan' | 'mendung' | 'hujan' | 'badai' | null;
          kondisi_nifas: string[];
          porsi: Record<string, number>;
          gelas_air: number | null;
          suplemen: Record<string, boolean>;
          dibuat_pada: string;
          diperbarui_pada: string;
        };
        Insert: {
          id?: string;
          id_anak: string;
          tanggal: string;
          cuaca_hati?: 'cerah' | 'berawan' | 'mendung' | 'hujan' | 'badai' | null;
          kondisi_nifas?: string[];
          porsi?: Record<string, number>;
          gelas_air?: number | null;
          suplemen?: Record<string, boolean>;
        };
        Update: {
          cuaca_hati?: 'cerah' | 'berawan' | 'mendung' | 'hujan' | 'badai' | null;
          kondisi_nifas?: string[];
          porsi?: Record<string, number>;
          gelas_air?: number | null;
          suplemen?: Record<string, boolean>;
        };
        Relationships: [];
      };

      /**
       * Checklist "Menyambut Si Kecil". BUKAN data kesehatan.
       * Per anak: persiapan kelahiran milik satu kelahiran, bukan milik akun.
       */
      centang_persiapan: {
        Row: {
          id_anak: string;
          kesiapan: Record<string, boolean>;
          barang: Record<string, boolean>;
          diperbarui_pada: string;
        };
        Insert: {
          id_anak: string;
          kesiapan?: Record<string, boolean>;
          barang?: Record<string, boolean>;
        };
        Update: {
          kesiapan?: Record<string, boolean>;
          barang?: Record<string, boolean>;
        };
        Relationships: [];
      };
    };

    Functions: {
      admin_koreksi_tanggal_lahir: {
        Args: { p_id_anak: string; p_tanggal_lahir: string };
        Returns: void;
      };
      admin_tolak_koreksi_tanggal_lahir: {
        Args: { p_id_anak: string };
        Returns: void;
      };
      admin_hapus_anak: {
        Args: { p_id_anak: string };
        Returns: void;
      };
      admin_hapus_orang_tua: {
        Args: { p_id_orang_tua: string };
        Returns: void;
      };
      peran_staf: {
        Args: Record<string, never>;
        Returns: string;
      };
      terapkan_sikap: {
        Args: { p_id_draf: string };
        Returns: string;
      };
    };
  };
}
