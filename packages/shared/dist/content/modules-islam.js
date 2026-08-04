"use strict";
// ============================================================================
// Studiva Digital — Akar Keluarga: Nilai Keislaman
// Panel "Apa Kata Sains + Apa Kata Islam" per band usia (0–6 tahun).
//
// STATUS: DRAFT — wajib review sebelum rilis:
//   - Psikolog Fitri Effendy (klinis-pedagogis)
//   - Reviewer keagamaan (akurasi syar'i, redaksi hadits & ayat)
//
// Ditampilkan hanya bila profil keluarga menetapkan akarKeluarga = 'islam'.
// Konten ini TIDAK menyentuh kartu universal — dikomposisikan di lapisan UI.
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISLAMIC_PANELS = void 0;
/**
 * Panel Nilai Keislaman per band usia.
 * Satu panel per AgeKey, ditampilkan di semua kartu band tersebut
 * bila akarKeluarga = 'islam' aktif di profil keluarga.
 *
 * DRAFT — belum dirilis. Lihat catatan review di atas file ini.
 */
exports.ISLAMIC_PANELS = {
    // Band 1 · 0–3 bulan — "Sambutan Iman"
    '0-3m': {
        nilaiInti: 'Asosiasi pertama antara rasa aman dan suasana keimanan',
        sains: 'Bayi baru lahir mengenali suara orang tuanya sejak dalam kandungan, dan respons konsisten terhadap tangisan membangun kelekatan aman — fondasi seluruh perkembangan empati dan nilai di masa depan.',
        islam: 'Islam menyambut bayi dengan bunyi: adzan dan iqamah di telinga, tahnik, lalu aqiqah. Kalimat pertama yang didengar bayi adalah kalimat tauhid — simbol bahwa iman hadir sejak hari pertama, dalam suasana kasih.',
        praktik: [
            'Perdengarkan adzan atau kalimat thayyibah dengan suara sendiri di momen tenang',
            'Rayakan aqiqah sebagai syukur atas kehadiran anak, sesuai kemampuan keluarga',
            'Ingat: menenangkan bayi yang menangis adalah "pelajaran iman" pertama — Allah dikenal lewat tangan yang lembut',
        ],
    },
    // Band 2 · 3–6 bulan — "Suara yang Menenangkan"
    '3-6m': {
        nilaiInti: 'Murottal dan doa sebagai bagian ritme harian',
        sains: 'Bayi usia ini mulai membedakan nada emosi dan menoleh ke sumber suara; rutinitas yang dapat diprediksi menurunkan stres dan mendukung regulasi diri awal.',
        islam: 'Lantunan Al-Qur\'an dan doa harian orang tua menjadi "soundtrack rumah" — anak menyerap suasana sebelum makna. Suara orang tua yang membaca sendiri lebih berharga daripada audio, karena membawa kehangatan relasi.',
        praktik: [
            'Bacakan doa pendek dengan intonasi lembut saat menyusui dan menjelang tidur',
            'Murottal berdurasi pendek di momen tertentu (bukan sepanjang hari) agar tetap istimewa',
            'Senandungkan shalawat sebagai lagu pengantar tidur',
        ],
    },
    // Band 3 · 6–9 bulan — "Rumah yang Berdzikir"
    '6-9m': {
        nilaiInti: 'Melihat ibadah sebagai pemandangan sehari-hari',
        sains: 'Bayi mulai mengamati dan mengingat rutinitas orang di sekitarnya; kebiasaan yang dilihat berulang terekam sebagai "normal"-nya dunia.',
        islam: 'Keteladanan (qudwah) dimulai jauh sebelum anak bisa diajari. Bayi yang setiap hari melihat orang tuanya shalat, mendengar bismillah sebelum makan dan salam di pintu, sedang menyerap kurikulum iman tanpa satu pun instruksi.',
        praktik: [
            'Shalat di tempat yang terlihat bayi; biarkan ia mengamati dari dekat',
            'Ucapkan bismillah dan alhamdulillah dengan ekspresif di meja makan',
            'Jadikan salam ritual pintu yang konsisten untuk seluruh anggota keluarga',
        ],
    },
    // Band 4 · 9–12 bulan — "Ikut Menunjuk, Ikut Menoleh"
    '9-12m': {
        nilaiInti: 'Perhatian bersama pada momen-momen iman',
        sains: 'Joint attention berkembang pesat di usia 9–12 bulan — bayi mengikuti arah pandang dan tunjukan orang tua, lalu belajar bahwa yang diperhatikan orang tuanya adalah hal penting.',
        islam: 'Inilah jendela untuk "menunjukkan" iman: mengangkat tangan saat berdoa sambil menatap anak, menunjuk bulan sambil berkata "Ciptaan Allah, indah ya" — anak belajar bahwa Allah adalah bagian dari hal-hal yang dianggap penting keluarganya.',
        praktik: [
            'Ajak anak "ikut" berdoa dengan mengangkat tangannya, lalu usapkan ke wajah sambil tersenyum',
            'Tunjukkan keindahan alam dan namai sebagai ciptaan Allah',
            'Balas ocehannya dengan kata thayyibah sederhana sebagai percakapan',
        ],
    },
    // Band 5 · 12–18 bulan — "Peniru Kecil"
    '12-18m': {
        nilaiInti: 'Imitasi gerakan ibadah + kata thayyibah pertama',
        sains: 'Anak usia ini belajar hampir seluruhnya lewat meniru, dan riset menunjukkan imitasi responsif balita memprediksi tumbuhnya hati nurani di usia prasekolah. Empati primitif sudah muncul sejak 14 bulan.',
        islam: 'Anak yang ikut sujud di samping orang tua sedang menjalani "pendidikan shalat" terbaik untuk usianya. Nabi ﷺ membiarkan cucunya menaiki punggung beliau saat sujud — ibadah dan kelembutan pada anak tidak pernah dipertentangkan.',
        praktik: [
            'Sambut anak yang ikut-ikutan sujud atau mengangkat tangan — jangan larang karena "mengganggu shalat"',
            'Kenalkan 1–2 kata thayyibah sebagai kosakata awal (Allah, bismillah)',
            'Narasikan perilaku baik saat terjadi ("MasyaAllah, Adik bantu Bunda!")',
        ],
    },
    // Band 6 · 18–24 bulan — "Doa-Doa Mini"
    '18-24m': {
        nilaiInti: 'Doa harian pendek + adab dasar (tangan kanan, salam)',
        sains: 'Ledakan bahasa dimulai — frasa pendek berulang mudah diserap. Di usia ini anak juga sudah mampu perilaku menolong dan menghibur sederhana; apresiasi spesifik memperkuatnya.',
        islam: 'Pembiasaan (ta\'wid) doa sebelum makan dan tidur — bukan untuk hafal sempurna, tapi agar doa terasa bagian alami aktivitas. Adab makan dengan tangan kanan diperkenalkan dengan lembut, tanpa drama.',
        praktik: [
            'Bacakan doa makan dan tidur di momen yang sama setiap hari; biarkan anak menyambung kata terakhirnya',
            'Apresiasi spesifik untuk adab ("Wah, Adik makan pakai tangan kanan!")',
            'Mulai buku cerita bergambar bertema kasih sayang Allah',
        ],
    },
    // Band 7 · 2–3 tahun — "Allah Sayang Aku"
    '2-3y': {
        nilaiInti: 'Mengenal Allah yang Maha Penyayang + jujur sederhana + berbagi',
        sains: 'Kehangatan pengasuh membentuk cara anak membayangkan figur otoritas — termasuk konsep Tuhan. Percakapan tentang perasaan mempercepat empati, dan cerita moral positif efektif menanamkan kejujuran sejak usia sangat dini.',
        islam: 'Ma\'rifatullah dimulai dari cinta: perkenalkan Allah lewat Ar-Rahman dan Ar-Rahim — Allah yang memberi hujan, menciptakan kucing lucu, menyayangi anak. "Siapa mengenal Allah akan mencintai-Nya; siapa mencintai Allah akan menaati-Nya" — cinta dulu, taat kemudian.',
        praktik: [
            'Kaitkan hal menyenangkan dengan Allah ("Hujan ini Allah yang kasih, biar tanaman minum")',
            'Hindari "Nanti Allah marah lho!" sebagai alat menakut-nakuti',
            'Respons tenang saat anak mengaku salah — kejujuran diapresiasi sebelum kesalahan dibahas',
        ],
    },
    // Band 8 · 3–4 tahun — "Kisah dan Kagum"
    '3-4y': {
        nilaiInti: 'Cinta Rasul lewat kisah + syukur + tolong-menolong',
        sains: 'Metode kisah sangat membekas dalam ingatan anak dan efektif membentuk karakter; praktik syukur sejak dini meningkatkan resiliensi emosional dan pandangan hidup positif.',
        islam: 'Kisah Nabi dan orang shalih adalah kurikulum akhlak utama usia ini — satu kisah, satu sifat baik. Syukur ditanam sebagai cara melihat dunia: alhamdulillah bukan sekadar ucapan sopan, tapi respons hati.',
        praktik: [
            'Rutinkan "syukur sebelum tidur": satu hal yang disyukuri hari ini + alhamdulillah',
            'Satu kisah Nabi per pekan, diulang-ulang (anak menyukai repetisi)',
            'Libatkan anak dalam sedekah konkret — memasukkan uang ke kotak amal dengan tangannya sendiri',
        ],
    },
    // Band 9 · 4–5 tahun — "Ikut Beribadah, Suka-Suka Dulu"
    '4-5y': {
        nilaiInti: 'Partisipasi ibadah sukarela + hafalan surat pendek + adab sosial',
        sains: 'Regulasi diri menguat tapi konsentrasi masih pendek — anak di bawah 7 tahun banyak bergerak dan sulit diam, sehingga latihan ibadah formal memang belum waktunya. Paksaan dini berisiko membentuk asosiasi negatif dengan ibadah.',
        islam: 'Fase mahabbatullah: menumbuhkan cinta sebelum kewajiban. Para ulama sengaja menempatkan "usia perintah" di 7 tahun — sebelum itu, ajakan bersifat sukarela dan gembira. Hafalan Al-Fatihah dan surat pendek dimulai lewat lagu dan permainan.',
        praktik: [
            'Ajak (jangan wajibkan) ikut shalat berjamaah; puji kehadirannya, bukan kesempurnaan gerakannya',
            'Hafalan lewat murottal ceria dan pengulangan santai di perjalanan',
            'Latih adab bertamu, meminta maaf, dan berterima kasih lewat main peran',
        ],
    },
    // Band 10 · 5–6 tahun — "Persiapan Mushalli Kecil"
    '5-6y': {
        nilaiInti: 'Wudhu dan gerakan shalat sebagai keterampilan + puasa latihan + jembatan ke usia 7',
        sains: 'Motorik halus dan kemampuan mengikuti urutan langkah (sequencing) sudah cukup matang untuk wudhu; identitas moral mulai terbentuk. Latihan bertahap dengan scaffolding jauh lebih efektif daripada tuntutan langsung sempurna.',
        islam: '"Perintahkanlah anak kalian shalat ketika berumur tujuh tahun" (HR Abu Dawud) — perintah yang ditujukan kepada orang tua untuk melatih dengan sabar (QS Thaha: 132), bukan kewajiban di pundak anak. Puasa dikenalkan bertahap — puasa "sampai dzuhur" adalah latihan yang sah secara pedagogis.',
        praktik: [
            'Ajarkan wudhu langkah demi langkah dengan praktik bersama di depan keran',
            'Buat "kartu urutan shalat" bergambar; anak menyusun urutannya sebagai permainan',
            'Rayakan puasa pertama (setengah hari pun) sebagai pencapaian besar',
            'Menjelang usia 7: bicarakan dengan gembira bahwa sebentar lagi ia "naik kelas" menjadi mushalli kecil',
        ],
    },
};
//# sourceMappingURL=modules-islam.js.map