-- 026_kebiasaan_irama.sql
-- Kebiasaan Baik jadi SATU katalog dengan 2 kategori:
--   • rutin        → menempel di kegiatan template Irama Hari (template_key)
--   • situasional  → muncul "kapan saja" di Kelola (kapan)
-- Plus kegiatan template Irama Hari (Bangun tidur, Sarapan, …) yang bisa diatur admin.
--
-- • kebiasaan_baik  = katalog TAYANG. Ubah lewat pipeline tinjauan (konten_draf jenis
--   'kebiasaan_baik' → Psikolog Fitri → terapkan_kebiasaan), pola sama dengan 024/025.
-- • irama_template  = kerangka kegiatan harian (nama, jam, waktu, urutan, tampil/sembunyi).
--   Bukan copy pengasuhan, jadi admin menyimpan langsung tanpa antre tinjauan.
-- • Seed = 57 butir MATERI + 11 kebiasaan bawaan Irama Hari + 5 Momen + 4 situasional lama,
--   ID dipertahankan (centang lama tetap cocok). ON CONFLICT DO NOTHING → aman dijalankan ulang
--   dan tidak menimpa suntingan admin.
-- Idempoten. Jalankan SETELAH 006.

ALTER TYPE jenis_konten ADD VALUE IF NOT EXISTS 'kebiasaan_baik';

-- ─── Kegiatan template Irama Hari ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS irama_template (
  key             TEXT PRIMARY KEY CHECK (key ~ '^[a-z0-9]+([_-][a-z0-9]+)*$'),
  waktu           TEXT NOT NULL CHECK (waktu IN ('pagi','siang','malam')),
  nama            TEXT NOT NULL CHECK (char_length(nama) BETWEEN 1 AND 60),
  jam             TEXT NOT NULL DEFAULT '' CHECK (jam = '' OR jam ~ '^[0-2][0-9]:[0-5][0-9]$'),
  ikon            TEXT NOT NULL DEFAULT 'main',
  urutan          INT  NOT NULL DEFAULT 100,
  aktif           BOOLEAN NOT NULL DEFAULT TRUE,
  -- [{ "id": text, "tipe": "main"|"buku", "t": text }] — saran to-do bawaan kartu
  saran           JSONB NOT NULL DEFAULT '[]',
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS irama_template_touch ON irama_template;
CREATE TRIGGER irama_template_touch
  BEFORE UPDATE ON irama_template
  FOR EACH ROW EXECUTE FUNCTION touch_diperbarui_pada();

ALTER TABLE irama_template ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "baca irama template" ON irama_template;
CREATE POLICY "baca irama template"
  ON irama_template FOR SELECT
  USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "admin tulis irama template" ON irama_template;
CREATE POLICY "admin tulis irama template"
  ON irama_template FOR ALL
  USING (peran_staf() = 'admin')
  WITH CHECK (peran_staf() = 'admin');

-- ─── Katalog Kebiasaan Baik ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kebiasaan_baik (
  id               TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  judul            TEXT NOT NULL CHECK (char_length(judul) BETWEEN 1 AND 90),
  deskripsi        TEXT NOT NULL DEFAULT '',
  nilai            TEXT[] NOT NULL CHECK (cardinality(nilai) BETWEEN 1 AND 3),
  usia_min_bulan   INT NOT NULL DEFAULT 0  CHECK (usia_min_bulan BETWEEN 0 AND 71),
  usia_max_bulan   INT NOT NULL DEFAULT 71 CHECK (usia_max_bulan BETWEEN 0 AND 71),
  kategori         TEXT NOT NULL CHECK (kategori IN ('rutin','situasional')),
  template_key     TEXT REFERENCES irama_template(key) ON UPDATE CASCADE ON DELETE SET NULL,
  kapan            TEXT,
  urutan           INT NOT NULL DEFAULT 100,
  status           TEXT NOT NULL DEFAULT 'tayang' CHECK (status IN ('tayang','diarsipkan')),
  versi            INT NOT NULL DEFAULT 1,
  id_draf_asal     UUID REFERENCES konten_draf(id) ON DELETE SET NULL,
  id_penyetuju     UUID REFERENCES auth.users(id),
  diterbitkan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dibuat_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (usia_min_bulan <= usia_max_bulan)
);

CREATE INDEX IF NOT EXISTS kebiasaan_baik_status_idx   ON kebiasaan_baik (status);
CREATE INDEX IF NOT EXISTS kebiasaan_baik_template_idx ON kebiasaan_baik (template_key);

DROP TRIGGER IF EXISTS kebiasaan_baik_touch ON kebiasaan_baik;
CREATE TRIGGER kebiasaan_baik_touch
  BEFORE UPDATE ON kebiasaan_baik
  FOR EACH ROW EXECUTE FUNCTION touch_diperbarui_pada();

ALTER TABLE kebiasaan_baik ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "baca kebiasaan tayang" ON kebiasaan_baik;
CREATE POLICY "baca kebiasaan tayang"
  ON kebiasaan_baik FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND status = 'tayang')
    OR peran_staf() IN ('admin','peninjau_klinis')
  );

DROP POLICY IF EXISTS "admin hapus draf kebiasaan milik sendiri" ON konten_draf;
CREATE POLICY "admin hapus draf kebiasaan milik sendiri"
  ON konten_draf FOR DELETE
  USING (
    peran_staf() = 'admin'
    AND id_penulis = auth.uid()
    AND jenis::text = 'kebiasaan_baik'
    AND status IN ('draf','ditolak')
  );

-- ─── Seed (konten yang sudah ada) ────────────────────────────────────────────
INSERT INTO irama_template (key, waktu, nama, jam, ikon, urutan, aktif, saran) VALUES
  ('bangun', 'pagi', 'Bangun tidur', '06:30', 'bangun', 10, TRUE, '[]'::jsonb),
  ('sarapan', 'pagi', 'Sarapan', '07:30', 'makan', 20, TRUE, '[]'::jsonb),
  ('mandipagi', 'pagi', 'Mandi pagi', '08:30', 'mandi', 30, TRUE, '[]'::jsonb),
  ('main', 'siang', 'Main bersama', '10:00', 'main', 10, TRUE, '[{"id": "md-main-1", "tipe": "main", "t": "Tumpuk balok warna"}]'::jsonb),
  ('makansiang', 'siang', 'Makan siang', '12:00', 'sup', 20, TRUE, '[]'::jsonb),
  ('tidursiang', 'siang', 'Tidur siang', '13:00', 'tidurSiang', 30, TRUE, '[]'::jsonb),
  ('makanmalam', 'malam', 'Makan malam', '18:00', 'sup', 10, TRUE, '[]'::jsonb),
  ('beres', 'malam', 'Beres-beres', '18:45', 'beres', 20, TRUE, '[]'::jsonb),
  ('tidur', 'malam', 'Rutinitas sebelum tidur', '19:30', 'tidur', 30, TRUE, '[{"id": "bk-tidur-1", "tipe": "buku", "t": "Baca buku bersama"}]'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO kebiasaan_baik (id, judul, deskripsi, nilai, usia_min_bulan, usia_max_bulan, kategori, template_key, kapan, urutan) VALUES
  ('kb-001', 'Kontak mata & sapaan lembut', 'Menyapa bayi dengan wajah dekat setiap kali terbangun.', ARRAY['Kasih Sayang']::text[], 0, 2, 'rutin', 'bangun', NULL, 101),
  ('kb-002', 'Merespons tangisan dengan tenang', 'Hadir konsisten — bayi belajar dunia bisa dipercaya.', ARRAY['Kasih Sayang','Sabar']::text[], 0, 2, 'situasional', NULL, 'saat bayi menangis', 102),
  ('kb-003', 'Sentuhan & pijat bayi', 'Pijat ringan sambil mengajak bicara pelan.', ARRAY['Kasih Sayang']::text[], 0, 2, 'rutin', 'mandipagi', NULL, 103),
  ('kb-004', 'Bergumam & bernyanyi bersama', 'Membalas suara bayi seperti percakapan.', ARRAY['Cinta Ilmu','Empati']::text[], 0, 2, 'rutin', 'main', NULL, 104),
  ('kb-005', 'Mengenalkan wajah keluarga', 'Menyebut nama anggota keluarga saat menggendong.', ARRAY['Hormat pada Sesama']::text[], 0, 2, 'situasional', NULL, 'saat menggendong', 105),
  ('kb-006', 'Ritual tidur yang sama', 'Lagu atau cerita pendek yang berulang tiap malam.', ARRAY['Sabar','Kesederhanaan']::text[], 3, 5, 'rutin', 'tidur', NULL, 106),
  ('kb-007', 'Membacakan buku kontras', 'Buku kain sederhana, dibaca dengan suara ekspresif.', ARRAY['Cinta Ilmu']::text[], 3, 5, 'rutin', 'main', NULL, 107),
  ('kb-008', 'Cilukba & permainan wajah', 'Melatih antisipasi dan kegembiraan bersama.', ARRAY['Cinta Ilmu','Keberanian']::text[], 3, 5, 'rutin', 'main', NULL, 108),
  ('kb-009', 'Membalas ocehan bayi', 'Setiap suara dibalas — dasar percakapan dan empati.', ARRAY['Empati','Kasih Sayang']::text[], 3, 5, 'situasional', NULL, 'saat bayi mengoceh', 109),
  ('kb-010', 'Tummy time didampingi', 'Memberi ruang berusaha sambil ditemani.', ARRAY['Kemandirian','Keberanian']::text[], 3, 5, 'rutin', 'main', NULL, 110),
  ('kb-011', 'Melihat kebiasaan baik keluarga', 'Bayi mengamati orang tua berterima kasih & menolong.', ARRAY['Hormat pada Sesama','Berbagi']::text[], 6, 8, 'situasional', NULL, 'saat keluarga saling menolong', 111),
  ('kb-012', 'Ikut duduk di meja makan', 'Merasakan kebersamaan makan keluarga.', ARRAY['Syukur','Kesederhanaan']::text[], 6, 8, 'rutin', 'makanmalam', NULL, 112),
  ('kb-013', 'Bermain sebab-akibat', 'Menjatuhkan, menekan, membunyikan — rasa ingin tahu.', ARRAY['Cinta Ilmu']::text[], 6, 8, 'rutin', 'main', NULL, 113),
  ('kb-014', 'Memberi & menerima mainan', 'Latihan pertama memberi dengan gembira.', ARRAY['Berbagi']::text[], 6, 8, 'rutin', 'main', NULL, 114),
  ('kb-015', 'Eksplorasi merangkak aman', 'Rumah disiapkan agar bayi bebas menjelajah.', ARRAY['Kemandirian','Keberanian']::text[], 6, 8, 'rutin', 'main', NULL, 115),
  ('kb-016', 'Menunjuk & menamai bersama', 'Mengikuti arah minat bayi lalu menamainya.', ARRAY['Cinta Ilmu']::text[], 9, 11, 'situasional', NULL, 'saat anak menunjuk sesuatu', 116),
  ('kb-017', '"Terima kasih" untuk si kecil', 'Setiap bayi memberi benda, sambut dengan terima kasih.', ARRAY['Hormat pada Sesama','Berbagi']::text[], 9, 11, 'situasional', NULL, 'saat anak memberi benda', 117),
  ('kb-018', 'Tugas mini pertama', 'Memegang sendok sendiri, memasukkan mainan ke keranjang.', ARRAY['Kemandirian','Tanggung Jawab']::text[], 9, 11, 'rutin', 'sarapan', NULL, 118),
  ('kb-019', 'Mengamati alam', 'Daun, hujan, kucing — dinikmati dan disyukuri bersama.', ARRAY['Syukur','Cinta Ilmu']::text[], 9, 11, 'situasional', NULL, 'saat di luar rumah', 119),
  ('kb-020', 'Permainan giliran sederhana', 'Menggelindingkan bola bergantian.', ARRAY['Sabar','Berbagi']::text[], 9, 11, 'rutin', 'main', NULL, 120),
  ('kb-021', 'Ritual salam & pamit', 'Melambai dan salam setiap ada yang datang/pergi.', ARRAY['Hormat pada Sesama']::text[], 9, 11, 'situasional', NULL, 'saat ada yang datang atau pergi', 121),
  ('kb-022', 'Meniru pekerjaan rumah ringan', 'Mengelap, menyapu mini — sambutan untuk niat membantunya.', ARRAY['Tanggung Jawab','Kemandirian']::text[], 12, 17, 'rutin', 'beres', NULL, 122),
  ('kb-023', 'Menarasikan perilaku baik', '"Wah, Adik bantu Bunda!" tepat saat terjadi.', ARRAY['Empati']::text[], 12, 17, 'situasional', NULL, 'saat anak berbuat baik', 123),
  ('kb-024', 'Buku cerita keluarga & hewan', 'Membaca berulang dengan menunjuk gambar.', ARRAY['Cinta Ilmu','Kasih Sayang']::text[], 12, 17, 'rutin', 'tidur', NULL, 124),
  ('kb-025', 'Berbagi camilan', 'Menawarkan camilan ke anggota keluarga satu per satu.', ARRAY['Berbagi']::text[], 12, 17, 'situasional', NULL, 'saat ada camilan', 125),
  ('kb-026', 'Menyapa orang di sekitar', 'Melambai pada tetangga dan pengasuh.', ARRAY['Hormat pada Sesama','Keberanian']::text[], 12, 17, 'situasional', NULL, 'saat bertemu orang', 126),
  ('kb-027', 'Latihan menunggu sebentar', '"Sabar ya... satu, dua..." dengan hitungan pendek.', ARRAY['Sabar']::text[], 12, 17, 'situasional', NULL, 'saat perlu menunggu', 127),
  ('kb-028', 'Tiga kata ajaib', 'Tolong, terima kasih, maaf — dicontohkan di tiap interaksi.', ARRAY['Hormat pada Sesama','Kejujuran']::text[], 18, 23, 'situasional', NULL, 'di setiap interaksi', 128),
  ('kb-029', 'Beres-beres mainan bersama', 'Merapikan jadi bagian akhir dari bermain.', ARRAY['Tanggung Jawab']::text[], 18, 23, 'rutin', 'beres', NULL, 129),
  ('kb-030', 'Memilih dari dua pilihan', '"Baju merah atau biru?" — latihan memutuskan.', ARRAY['Kemandirian']::text[], 18, 23, 'rutin', 'mandipagi', NULL, 130),
  ('kb-031', 'Cerita & syukur sebelum tidur', 'Satu cerita, satu hal menyenangkan hari ini.', ARRAY['Syukur']::text[], 18, 23, 'rutin', 'tidur', NULL, 131),
  ('kb-032', 'Merawat tanaman/hewan', 'Menyiram atau memberi makan dengan didampingi.', ARRAY['Kasih Sayang','Tanggung Jawab']::text[], 18, 23, 'rutin', 'main', NULL, 132),
  ('kb-033', 'Main peran menolong boneka', 'Boneka "sedih" lalu dihibur bersama.', ARRAY['Empati']::text[], 18, 23, 'rutin', 'main', NULL, 133),
  ('kb-034', '"Aku bisa sendiri"', 'Pakai sepatu, cuci tangan, makan sendiri — dengan waktu ekstra.', ARRAY['Kemandirian']::text[], 24, 35, 'rutin', 'mandipagi', NULL, 134),
  ('kb-035', 'Jujur tanpa takut', 'Pengakuan disambut tenang sebelum kesalahan dibahas.', ARRAY['Kejujuran']::text[], 24, 35, 'situasional', NULL, 'saat anak mengaku salah', 135),
  ('kb-036', 'Menamai emosi', '"Kamu kesal ya?" — kosakata perasaan diri & orang lain.', ARRAY['Empati']::text[], 24, 35, 'situasional', NULL, 'saat anak kesal', 136),
  ('kb-037', 'Syukur sebelum makan', 'Ucapan syukur singkat jadi kebiasaan meja makan.', ARRAY['Syukur']::text[], 24, 35, 'rutin', 'sarapan', NULL, 137),
  ('kb-038', 'Bergiliran di taman bermain', 'Menunggu giliran ayunan dengan didampingi.', ARRAY['Sabar','Berbagi']::text[], 24, 35, 'situasional', NULL, 'saat di taman bermain', 138),
  ('kb-039', 'Tugas rumah mini', 'Menaruh piring plastik, memasukkan baju ke keranjang.', ARRAY['Tanggung Jawab']::text[], 24, 35, 'rutin', 'makanmalam', NULL, 139),
  ('kb-040', 'Satu kisah, satu sifat baik', 'Cerita tokoh baik dibacakan berulang sepekan.', ARRAY['Cinta Ilmu','Kejujuran']::text[], 36, 47, 'rutin', 'tidur', NULL, 140),
  ('kb-041', 'Ritual syukur sebelum tidur', '"Hari ini kamu senang karena apa?"', ARRAY['Syukur']::text[], 36, 47, 'rutin', 'tidur', NULL, 141),
  ('kb-042', 'Kotak berbagi', 'Menyisihkan mainan atau uang jajan untuk diberikan.', ARRAY['Berbagi','Kesederhanaan']::text[], 36, 47, 'situasional', NULL, 'sepekan sekali', 142),
  ('kb-043', 'Proyek menanam', 'Merawat satu tanaman dari biji — menyiram tiap hari.', ARRAY['Tanggung Jawab','Sabar']::text[], 36, 47, 'rutin', 'main', NULL, 143),
  ('kb-044', 'Main peran penolong', 'Jadi dokter, pemadam, penolong — merasakan membantu.', ARRAY['Empati','Keberanian']::text[], 36, 47, 'rutin', 'main', NULL, 144),
  ('kb-045', '"Bagaimana perasaanmu?"', 'Percakapan emosi jadi rutinitas santai.', ARRAY['Empati']::text[], 36, 47, 'situasional', NULL, 'saat santai bersama', 145),
  ('kb-046', 'Permainan kelompok beraturan', 'Ular naga, lompat tali — belajar aturan main bersama.', ARRAY['Sabar','Hormat pada Sesama']::text[], 48, 59, 'rutin', 'main', NULL, 146),
  ('kb-047', 'Main peran adab', 'Bertamu, meminta maaf, berterima kasih lewat drama kecil.', ARRAY['Hormat pada Sesama','Kejujuran']::text[], 48, 59, 'rutin', 'main', NULL, 147),
  ('kb-048', 'Lagu & sajak nilai', 'Menghafal lewat irama dan gerakan.', ARRAY['Cinta Ilmu']::text[], 48, 59, 'rutin', 'main', NULL, 148),
  ('kb-049', 'Misi kebaikan mingguan', 'Satu misi kecil: membantu adik, menyapa satpam.', ARRAY['Berbagi','Empati']::text[], 48, 59, 'situasional', NULL, 'sekali sepekan', 149),
  ('kb-050', 'Menuntaskan tugas', 'Puzzle atau prakarya diselesaikan sampai akhir.', ARRAY['Tanggung Jawab','Kemandirian']::text[], 48, 59, 'rutin', 'main', NULL, 150),
  ('kb-051', 'Mencoba hal baru', 'Naik panjatan lebih tinggi, kenalan dengan teman baru.', ARRAY['Keberanian']::text[], 48, 59, 'situasional', NULL, 'saat ada kesempatan baru', 151),
  ('kb-052', 'Tanggung jawab miliknya', 'Satu tugas rumah yang benar-benar jadi miliknya.', ARRAY['Tanggung Jawab']::text[], 60, 71, 'rutin', 'beres', NULL, 152),
  ('kb-053', 'Menabung: butuh vs ingin', 'Celengan pertama dan percakapan sederhana soal uang.', ARRAY['Kesederhanaan']::text[], 60, 71, 'situasional', NULL, 'saat ingin membeli sesuatu', 153),
  ('kb-054', 'Proyek berbagi ke sesama', 'Menyiapkan paket kecil untuk yang membutuhkan.', ARRAY['Berbagi','Empati']::text[], 60, 71, 'situasional', NULL, 'saat ada kesempatan berbagi', 154),
  ('kb-055', 'Refleksi jujur harian', 'Cerita jujur tentang harinya — termasuk yang tidak enak.', ARRAY['Kejujuran']::text[], 60, 71, 'rutin', 'tidur', NULL, 155),
  ('kb-056', 'Persiapan sekolah mandiri', 'Menyiapkan tas dan seragam sendiri malam sebelumnya.', ARRAY['Kemandirian']::text[], 60, 71, 'rutin', 'tidur', NULL, 156),
  ('kb-057', 'Presentasi kecil keluarga', 'Bercerita di depan keluarga tentang hal yang disukainya.', ARRAY['Keberanian','Cinta Ilmu']::text[], 60, 71, 'situasional', NULL, 'saat kumpul keluarga', 157),
  ('kbd-bangun-1', 'Sapa hangat & kontak mata', '', ARRAY['Kasih Sayang']::text[], 0, 71, 'rutin', 'bangun', NULL, 10),
  ('kbd-sarap-1', 'Cuci tangan sebelum makan', '', ARRAY['Kemandirian']::text[], 0, 71, 'rutin', 'sarapan', NULL, 10),
  ('kbd-sarap-2', 'Ucap terima kasih', '', ARRAY['Syukur']::text[], 0, 71, 'rutin', 'sarapan', NULL, 20),
  ('kbd-mandi-1', 'Coba pakai baju sendiri', '', ARRAY['Kemandirian']::text[], 0, 71, 'rutin', 'mandipagi', NULL, 10),
  ('kbd-main-1', 'Bermain bergiliran', '', ARRAY['Berbagi']::text[], 0, 71, 'rutin', 'main', NULL, 10),
  ('kbd-main-2', 'Tunjukkan perasaan teman', '', ARRAY['Empati']::text[], 0, 71, 'rutin', 'main', NULL, 20),
  ('kbd-msiang-1', 'Makan sendiri', '', ARRAY['Kemandirian']::text[], 0, 71, 'rutin', 'makansiang', NULL, 10),
  ('kbd-mmalam-1', 'Bantu siapkan meja', '', ARRAY['Tanggung Jawab']::text[], 0, 71, 'rutin', 'makanmalam', NULL, 10),
  ('kbd-beres-1', 'Rapikan mainan sendiri', '', ARRAY['Tanggung Jawab']::text[], 0, 71, 'rutin', 'beres', NULL, 10),
  ('kbd-tidur-1', 'Sikat gigi sendiri', '', ARRAY['Kemandirian']::text[], 0, 71, 'rutin', 'tidur', NULL, 10),
  ('kbd-tidur-2', 'Cerita & doa', '', ARRAY['Kasih Sayang']::text[], 0, 71, 'rutin', 'tidur', NULL, 20),
  ('msh-001', 'Peluk & sapa hangat saat bangun', 'Sambut anak dengan hangat begitu ia bangun.', ARRAY['Kasih Sayang']::text[], 0, 71, 'rutin', 'bangun', NULL, 20),
  ('msh-002', 'Tunjukkan perasaan orang lain', '"Lihat, temanmu sedih." — melatih membaca perasaan.', ARRAY['Empati']::text[], 0, 71, 'situasional', NULL, 'saat bermain dengan teman', 20),
  ('msh-003', 'Hargai saat ia bercerita apa adanya', 'Sambut cerita jujurnya dengan tenang.', ARRAY['Kejujuran']::text[], 0, 71, 'situasional', NULL, 'saat anak bercerita', 20),
  ('msh-004', 'Nikmati permainan sederhana bersama', 'Main dengan barang sederhana, tanpa perlu mainan mahal.', ARRAY['Kesederhanaan']::text[], 0, 71, 'rutin', 'main', NULL, 30),
  ('msh-005', 'Ceritakan apa yang sedang kalian lakukan', 'Narasikan aktivitas sehari-hari sebagai percakapan.', ARRAY['Cinta Ilmu']::text[], 0, 71, 'situasional', NULL, 'saat beraktivitas bersama', 20),
  ('sit-1', 'Tetap tenang saat anak rewel', '', ARRAY['Sabar']::text[], 0, 71, 'situasional', NULL, 'saat rewel', 10),
  ('sit-2', 'Berbagi mainan saat ada teman', '', ARRAY['Berbagi']::text[], 0, 71, 'situasional', NULL, 'saat main dgn teman', 10),
  ('sit-3', 'Minta maaf saat berbuat salah', '', ARRAY['Kejujuran']::text[], 0, 71, 'situasional', NULL, 'saat ada masalah', 10),
  ('sit-4', 'Berani coba hal baru', '', ARRAY['Keberanian']::text[], 0, 71, 'situasional', NULL, 'saat ragu', 10)
ON CONFLICT (id) DO NOTHING;

-- ─── Terapkan draf yang sudah disetujui ──────────────────────────────────────
CREATE OR REPLACE FUNCTION terapkan_kebiasaan(p_id_draf UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draf konten_draf%ROWTYPE;
  v_isi  JSONB;
  v_kat  TEXT;
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerapkan Kebiasaan Baik.';
  END IF;

  SELECT * INTO v_draf FROM konten_draf
   WHERE id = p_id_draf AND jenis::text = 'kebiasaan_baik' AND status = 'disetujui';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draf Kebiasaan % tidak ditemukan atau belum disetujui peninjau.', p_id_draf;
  END IF;
  v_isi := v_draf.isi;
  v_kat := v_isi->>'kategori';
  IF v_isi->>'id' IS NULL OR COALESCE(jsonb_array_length(v_isi->'nilai'), 0) = 0 THEN
    RAISE EXCEPTION 'Isi draf tidak lengkap (id/nilai kosong).';
  END IF;
  IF v_kat = 'rutin' AND NOT EXISTS (SELECT 1 FROM irama_template WHERE key = v_isi->>'template_key') THEN
    RAISE EXCEPTION 'Kegiatan template "%" tidak ditemukan.', v_isi->>'template_key';
  END IF;

  INSERT INTO kebiasaan_baik AS k (
    id, judul, deskripsi, nilai, usia_min_bulan, usia_max_bulan, kategori, template_key, kapan, urutan,
    status, versi, id_draf_asal, id_penyetuju, diterbitkan_pada
  ) VALUES (
    v_isi->>'id',
    v_isi->>'judul',
    COALESCE(v_isi->>'deskripsi', ''),
    ARRAY(SELECT jsonb_array_elements_text(v_isi->'nilai')),
    COALESCE((v_isi->>'usia_min_bulan')::INT, 0),
    COALESCE((v_isi->>'usia_max_bulan')::INT, 71),
    v_kat,
    CASE WHEN v_kat = 'rutin' THEN v_isi->>'template_key' END,
    CASE WHEN v_kat = 'situasional' THEN NULLIF(v_isi->>'kapan', '') END,
    COALESCE((v_isi->>'urutan')::INT, 100),
    'tayang', 1, v_draf.id, v_draf.id_penyetuju, NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    judul            = EXCLUDED.judul,
    deskripsi        = EXCLUDED.deskripsi,
    nilai            = EXCLUDED.nilai,
    usia_min_bulan   = EXCLUDED.usia_min_bulan,
    usia_max_bulan   = EXCLUDED.usia_max_bulan,
    kategori         = EXCLUDED.kategori,
    template_key     = EXCLUDED.template_key,
    kapan            = EXCLUDED.kapan,
    urutan           = EXCLUDED.urutan,
    status           = 'tayang',
    versi            = k.versi + 1,
    id_draf_asal     = EXCLUDED.id_draf_asal,
    id_penyetuju     = EXCLUDED.id_penyetuju,
    diterbitkan_pada = NOW();

  UPDATE konten_draf SET status = 'tayang' WHERE id = p_id_draf;
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO riwayat_tinjauan (id_draf, id_pelaku, tindakan) VALUES (p_id_draf, auth.uid(), 'tayang');
  END IF;
  RETURN v_isi->>'id';
END;
$$;

CREATE OR REPLACE FUNCTION atur_status_kebiasaan(p_id TEXT, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat mengarsipkan atau memulihkan Kebiasaan Baik.';
  END IF;
  IF p_status NOT IN ('tayang','diarsipkan') THEN
    RAISE EXCEPTION 'Status % tidak dikenal.', p_status;
  END IF;
  UPDATE kebiasaan_baik SET status = p_status WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kebiasaan % tidak ditemukan.', p_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION terapkan_kebiasaan(UUID)          FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION atur_status_kebiasaan(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION terapkan_kebiasaan(UUID)          TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION atur_status_kebiasaan(TEXT, TEXT) TO authenticated, service_role;
