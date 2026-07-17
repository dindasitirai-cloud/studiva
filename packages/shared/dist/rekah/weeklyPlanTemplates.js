"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEEKLY_PLAN_TEMPLATES = void 0;
// 8 template terisi untuk kombinasi nilaiTema × ageBand yang paling umum dipilih.
// Komposer dinamis (planComposer.ts) menangani kombinasi lain & rotasi pekan 2-4.
exports.WEEKLY_PLAN_TEMPLATES = [
    // ── 1. mandiri × 0-6 ─────────────────────────────────────────────────
    {
        id: 'wpt-001',
        judul: 'Pekan Pertama: Bergerak Sendiri',
        ageBand: '0-6',
        nilaiTema: 'mandiri',
        deskripsi: 'Tiga sesi pendek untuk memperkenalkan gerak mandiri bayi — tummy time, lantai bebas, dan percakapan pertama.',
        hari: [
            {
                hari: 'senin',
                activityModuleId: 'am-tummy-time',
                waktuDisarankan: 'Pagi, saat bayi segar setelah bangun tidur',
                catatan: 'Mulai 3 menit saja — tingkatkan bertahap setiap hari.',
            },
            {
                hari: 'rabu',
                activityModuleId: 'am-serve-return',
                waktuDisarankan: 'Kapan saja bayi terjaga dan waspada',
                catatan: 'Balas setiap ocehan atau tatapan — tidak perlu alat apapun.',
            },
            {
                hari: 'sabtu',
                activityModuleId: 'am-001',
                waktuDisarankan: 'Pagi, setelah menyusui',
                catatan: 'Matras bersih sudah cukup. Duduk di dekat — hadir tapi tidak mengarahkan.',
            },
        ],
    },
    // ── 2. empatik × 0-6 ─────────────────────────────────────────────────
    {
        id: 'wpt-002',
        judul: 'Pekan Kedekatan & Kepekaan',
        ageBand: '0-6',
        nilaiTema: 'empatik',
        deskripsi: 'Empat momen singkat yang membangun kelekatan dan kepekaan sejak bulan pertama — sentuhan, tatapan, dan respons konsisten.',
        hari: [
            {
                hari: 'senin',
                activityModuleId: 'am-senyum-balas',
                waktuDisarankan: 'Pagi, saat bayi baru bangun dan segar',
                catatan: 'Duduk dekat, tatap matanya, dan tunggu — biarkan ia yang memulai.',
            },
            {
                hari: 'selasa',
                activityModuleId: 'am-kelekatan',
                waktuDisarankan: 'Sore, saat bayi gelisah atau ingin digendong',
                catatan: 'Menggendong dan merespons tangis bukan memanjakan — ini membangun rasa aman.',
            },
            {
                hari: 'kamis',
                activityModuleId: 'am-003',
                waktuDisarankan: 'Kapan saja bayi dalam kondisi tenang dan terjaga',
                catatan: 'Tatapan dan senyum cukup — tidak perlu mainan.',
            },
            {
                hari: 'sabtu',
                activityModuleId: 'am-temperamen',
                waktuDisarankan: 'Sore, saat kamu punya waktu tenang untuk refleksi',
                catatan: 'Baca modul ini seperti membaca kamus bayi — kenali polanya pekan ini.',
            },
        ],
    },
    // ── 3. mandiri × 7-12 ────────────────────────────────────────────────
    {
        id: 'wpt-003',
        judul: 'Eksplorasi Aktif',
        ageBand: '7-12',
        nilaiTema: 'mandiri',
        deskripsi: 'Tiga sesi yang memberi bayi ruang untuk bergerak, merangkak, dan memecahkan "teka-teki" kecil — inisiatif tumbuh dari kebebasan terarah.',
        hari: [
            {
                hari: 'senin',
                activityModuleId: 'am-001',
                waktuDisarankan: 'Pagi, setelah sarapan',
                catatan: 'Zona bebas di lantai — biarkan ia menentukan ke mana pergi.',
            },
            {
                hari: 'rabu',
                activityModuleId: 'am-motorik',
                waktuDisarankan: 'Sore, setelah tidur siang',
                catatan: 'Ikuti dari dekat tapi jangan mencegah hal yang sebetulnya aman.',
            },
            {
                hari: 'jumat',
                activityModuleId: 'am-object-perm',
                waktuDisarankan: 'Pagi, saat bayi segar',
                catatan: 'Beri jeda setelah menyembunyikan benda — rasa ingin tahu-nya yang memimpin.',
            },
        ],
    },
    // ── 4. komunikatif × 7-12 ────────────────────────────────────────────
    {
        id: 'wpt-004',
        judul: 'Belajar Bicara Bersama',
        ageBand: '7-12',
        nilaiTema: 'komunikatif',
        deskripsi: 'Empat aktivitas yang membangun fondasi bahasa melalui balasan, buku, narasi sehari-hari, dan koneksi langsung — tanpa gadget.',
        hari: [
            {
                hari: 'senin',
                activityModuleId: 'am-serve-return',
                waktuDisarankan: 'Pagi, saat bayi aktif dan responsif',
                catatan: 'Jeda adalah bagian terpenting — tunggu gilirannya.',
            },
            {
                hari: 'rabu',
                activityModuleId: 'am-002',
                waktuDisarankan: 'Sore, setelah mandi',
                catatan: 'Ikuti ke mana ia melihat — tidak perlu mengikuti urutan halaman.',
            },
            {
                hari: 'jumat',
                activityModuleId: 'am-tonggak-bahasa',
                waktuDisarankan: 'Sepanjang hari — saat makan, mandi, ganti baju',
                catatan: 'Narasi apa yang kamu lakukan: "Sekarang kita cuci tangan, air-nya dingin ya."',
            },
            {
                hari: 'minggu',
                activityModuleId: 'am-koneksi-nyata',
                waktuDisarankan: 'Sore, waktu santai keluarga',
                catatan: 'Satu jam tanpa layar — cerita, nyanyian, atau sekadar menemani.',
            },
        ],
    },
    // ── 5. regulasi-emosi × 13-18 ────────────────────────────────────────
    {
        id: 'wpt-005',
        judul: 'Tenang di Tengah Badai Kecil',
        ageBand: '13-18',
        nilaiTema: 'regulasi-emosi',
        deskripsi: 'Empat langkah mingguan untuk membangun ruang emosi yang aman — ko-regulasi, bahasa perasaan, ritual tidur, dan panduan ketika tantrum datang.',
        hari: [
            {
                hari: 'senin',
                activityModuleId: 'am-ko-regulasi',
                waktuDisarankan: 'Kapan pun anak menunjukkan emosi kuat',
                catatan: 'Tenangkan dirimu dulu sebelum menenangkan anak — mereka merasakan energimu.',
            },
            {
                hari: 'rabu',
                activityModuleId: 'am-nama-perasaan',
                waktuDisarankan: 'Sore, saat aktivitas sehari-hari',
                catatan: 'Beri nama perasaan saat muncul: "Kamu kelihatan frustrasi ya?"',
            },
            {
                hari: 'jumat',
                activityModuleId: 'am-tidur-sehat',
                waktuDisarankan: 'Malam, mulai 30 menit sebelum jam tidur',
                catatan: 'Urutan yang sama setiap malam — mandi, baju, buku, tidur.',
            },
            {
                hari: 'minggu',
                activityModuleId: 'am-tantrum',
                waktuDisarankan: 'Baca di waktu tenang; terapkan saat dibutuhkan',
                catatan: 'Panduan ini paling berguna dibaca sebelum tantrum terjadi, bukan di tengah-tengahnya.',
            },
        ],
    },
    // ── 6. percaya-diri × 13-18 ──────────────────────────────────────────
    {
        id: 'wpt-006',
        judul: 'Berani Mencoba Sendiri',
        ageBand: '13-18',
        nilaiTema: 'percaya-diri',
        deskripsi: 'Tiga aktivitas untuk membangun kepercayaan diri dari dalam — bukan dari pujian berlebihan, tapi dari pengalaman berhasil mencoba sendiri.',
        hari: [
            {
                hari: 'senin',
                activityModuleId: 'am-pilihan-kecil',
                waktuDisarankan: 'Pagi, saat rutinitas berpakaian atau sarapan',
                catatan: 'Dua pilihan sudah cukup — terlalu banyak opsi membuat anak kewalahan.',
            },
            {
                hari: 'rabu',
                activityModuleId: 'am-coba-lagi',
                waktuDisarankan: 'Sore, saat bermain bebas',
                catatan: 'Tahan dorongan menyelesaikan — beri ia waktu untuk berjuang sedikit.',
            },
            {
                hari: 'sabtu',
                activityModuleId: 'am-pujian-proses',
                waktuDisarankan: 'Sepanjang hari — puji saat kamu melihat usaha',
                catatan: 'Fokus pada proses: "Kamu sudah coba berkali-kali!" bukan "Kamu pintar."',
            },
        ],
    },
    // ── 7. regulasi-emosi × 19-24 ────────────────────────────────────────
    {
        id: 'wpt-007',
        judul: 'Mengenal Perasaan Besar',
        ageBand: '19-24',
        nilaiTema: 'regulasi-emosi',
        deskripsi: 'Empat momen mingguan untuk mendampingi ledakan emosi di usia dua tahun — menamai, menerima, dan perlahan mengajarkan cara keluar dari badai.',
        hari: [
            {
                hari: 'senin',
                activityModuleId: 'am-nama-perasaan',
                waktuDisarankan: 'Sore, saat aktivitas rutin atau membaca buku',
                catatan: 'Gunakan buku bergambar untuk mengenalkan kosakata emosi baru.',
            },
            {
                hari: 'rabu',
                activityModuleId: 'am-tantrum',
                waktuDisarankan: 'Baca di waktu tenang; terapkan saat dibutuhkan',
                catatan: 'Di usia ini tantrum adalah bagian dari tumbuh kembang — panduan ini tentang respons, bukan pencegahan.',
            },
            {
                hari: 'jumat',
                activityModuleId: 'am-bebas-mencoba',
                waktuDisarankan: 'Pagi atau sore, waktu bermain bebas',
                catatan: 'Anak yang merasa bebas mencoba lebih jarang frustrasi dengan ketidakberdayaan.',
            },
            {
                hari: 'minggu',
                activityModuleId: 'am-tidur-sehat',
                waktuDisarankan: 'Malam, mulai 30 menit sebelum jam tidur',
                catatan: 'Tidur cukup adalah perlindungan terbesar dari ledakan emosi di siang hari.',
            },
        ],
    },
    // ── 8. sosial × 25-36 ────────────────────────────────────────────────
    {
        id: 'wpt-008',
        judul: 'Belajar Bersama Dunia',
        ageBand: '25-36',
        nilaiTema: 'sosial',
        deskripsi: 'Empat aktivitas untuk mempersiapkan anak masuk ke dunia sosial yang lebih luas — bermain peran, giliran, membaca bersama, dan kesiapan berteman.',
        hari: [
            {
                hari: 'senin',
                activityModuleId: 'am-005',
                waktuDisarankan: 'Sore, waktu bermain bebas',
                catatan: 'Ikuti skenario bermainnya — biarkan ia yang memimpin cerita.',
            },
            {
                hari: 'rabu',
                activityModuleId: 'am-kesiapan-sosial',
                waktuDisarankan: 'Sebelum pergi ke tempat ramai atau bertemu teman baru',
                catatan: 'Ceritakan apa yang akan terjadi — anak yang siap lebih mudah beradaptasi.',
            },
            {
                hari: 'jumat',
                activityModuleId: 'am-keterampilan-sosial',
                waktuDisarankan: 'Saat bermain bersama anak lain atau saudara',
                catatan: 'Empati tidak dipaksakan — fasilitasi situasinya dan biarkan ia merasakannya sendiri.',
            },
            {
                hari: 'minggu',
                activityModuleId: 'am-pra-literasi',
                waktuDisarankan: 'Pagi, saat suasana tenang',
                catatan: 'Buku dan cerita adalah jembatan pertama ke dunia imajinasi bersama orang lain.',
            },
        ],
    },
];
//# sourceMappingURL=weeklyPlanTemplates.js.map