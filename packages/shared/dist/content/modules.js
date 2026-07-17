"use strict";
// ============================================================================
// Studiva Digital — reusable knowledge modules.
// Sections/stats are referenced by cards (see knowledgeCardData.ts) and
// resolved by composeScientific(). Inline citations use [ref:<sourceId>].
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODULES = void 0;
exports.MODULES = {
    "serve-return": {
        id: "serve-return",
        title: "Serve & return: percakapan yang membangun otak",
        domainHints: ["BH", "SE", "PS"],
        sections: [
            { key: "bahasa-dimulai", judul: "Bahasa dimulai sejak lahir", isi: "Meski belum bisa bicara, otak bayi sudah mempelajari bahasa sejak hari pertama, bahkan sejak dalam kandungan, saat mengenali irama suara ibunya. Kemampuan memahami (bahasa reseptif) selalu tumbuh lebih dulu daripada kemampuan bicara [ref:asha]." },
            { key: "bayi-ahli-statistik", judul: "Bayi si ahli statistik", isi: "Dari lautan suara yang ia dengar, otak bayi diam-diam menghitung pola: bunyi mana yang sering muncul bersama, di mana satu kata berakhir. Semakin sering dan kaya bahasa yang ia dengar dalam interaksi nyata, semakin banyak bahan untuk otaknya mengurai pola itu [ref:harvard-brain]." },
            { key: "belajar-dari-manusia", judul: "Belajar dari manusia, bukan layar", isi: "Bayi belajar bahasa dari orang, bukan dari layar. Dalam banyak penelitian, bayi yang mendengar bahasa dari orang sungguhan bisa mempelajarinya, sementara yang mendengar dari video hampir tidak belajar apa pun, fenomena 'video deficit' [ref:kuhl-ids]. Bayi butuh tatapan, giliran bicara, dan tanggapan hangat." },
            { key: "cara-bicara", judul: "Cara bicara Anda berpengaruh", isi: "Nada tinggi, lambat, dan ekspresif ('parentese') membantu bayi memisahkan kata dan memperhatikan lebih lama [ref:kuhl-ids]. Menirukan ocehannya lalu memberi jeda mengajarkan pola dasar percakapan: bergantian bicara." },
            { key: "kurikulum-interaksi", judul: "Kurikulum terbaik: interaksi", isi: "Di tahun pertama, 'kurikulum' terbaik bagi bayi bukan aplikasi atau mainan elektronik, melainkan interaksi hangat sehari-hari. Otak bayi dirancang untuk belajar dari manusia, wajah yang menanggapi, suara yang membalas, sentuhan yang menenangkan." },
            { key: "serve-return-membangun", judul: "Serve & return membangun otak", isi: "Harvard Center on the Developing Child menyebut interaksi bolak-balik (serve & return) sebagai bahan bangunan arsitektur otak [ref:harvard-serve-return]. Setiap kali Anda menanggapi ocehan atau tangis bayi, Anda memperkuat jalur otaknya untuk bahasa, emosi, dan hubungan. Rutinitas biasa, mengganti popok, memandikan, adalah kesempatan emas untuk berbicara dan bernyanyi." },
            { key: "kebebasan-bergerak", judul: "Kebebasan bergerak", isi: "Sejalan dengan pendekatan Montessori, beri bayi kebebasan bergerak di lingkungan aman dan amati apa yang menarik minatnya. Anda tak perlu terus menstimulasi; mengikuti isyaratnya adalah bentuk stimulasi yang paling menghormati perkembangannya." },
            { key: "kesejahteraan", judul: "Kesejahteraan Anda penting", isi: "Bayi menyerap suasana emosi pengasuhnya. Merawat diri dan mencari dukungan saat kewalahan bukan kemewahan, melainkan kebutuhan yang berdampak langsung pada bayi." },
            { key: "babbling-universal", judul: "Babbling itu universal", isi: "Semua bayi di seluruh dunia mulai mengoceh dengan pola serupa, apa pun bahasa di rumahnya [ref:asha]. Ini menunjukkan babbling adalah tahap alami yang terprogram dalam perkembangan bicara." },
            { key: "melatih-otot", judul: "Melatih otot dan pola", isi: "Suara 'ba-ba' dan 'ma-ma' adalah latihan bagi otot bibir, lidah, dan pita suara, sekaligus percobaan menyusun bunyi menjadi pola, bahan mentah untuk kata pertama." },
            { key: "serve-return-mempercepat", judul: "Serve & return mempercepat", isi: "Ketika Anda menirukan ocehan bayi lalu memberi jeda, Anda mengajarkan inti percakapan: bergantian bicara. Tanggapan hangat memperkuat jalur bahasa di otaknya [ref:harvard-serve-return]." },
            { key: "dengar-dulu", judul: "Dengar dulu, bicara kemudian", isi: "Kemampuan memahami tumbuh lebih dulu daripada bicara. Karena mendengar adalah syarat belajar bicara, reaksi bayi terhadap suara penting diperhatikan; keraguan sekecil apa pun sebaiknya diperiksakan lebih awal." },
            { key: "batasi-layar", judul: "Batasi layar", isi: "Bayi belajar bahasa dari manusia, bukan dari video. Percakapan langsung, nyanyian, dan buku jauh lebih bernilai daripada tontonan di layar." },
        ],
        stats: [
            { key: "neural", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
            { key: "reseptif", value: "Reseptif → ekspresif", label: "kemampuan memahami tumbuh lebih dulu daripada bicara", sourceId: "asha" },
        ],
        figureId: "serve-return",
        sourceIds: ["harvard-brain", "asha", "kuhl-ids", "harvard-serve-return"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "urutan-motorik-kasar": {
        id: "urutan-motorik-kasar",
        title: "Urutan perkembangan motorik kasar",
        domainHints: ["FM"],
        sections: [
            { key: "perkembangan-berurutan", judul: "Perkembangan yang berurutan", isi: "Kendali tubuh berkembang dari atas ke bawah, bayi menguasai kepala lebih dulu, lalu bahu, badan, dan kaki. Gerak juga berkembang dari tengah tubuh ke arah luar: bahu dulu, baru jari-jari halus. Menegakkan kepala saat tummy time adalah anak tangga pertama menuju berguling, duduk, dan berjalan." },
            { key: "gerak-belajar", judul: "Gerak adalah cara belajar", isi: "Menurut Piaget, bayi di tahun pertama berada pada tahap sensorimotor: ia membangun pemahaman tentang dunia lewat indra dan gerak [ref:piaget]. Saat mengangkat kepala atau meraih mainan, bayi mengumpulkan informasi tentang jarak, keseimbangan, dan tubuhnya sendiri, bagian dari lebih dari sejuta koneksi saraf yang terbentuk tiap detik [ref:harvard-brain]." },
            { key: "batasi-penyangga", judul: "Batasi alat penyangga", isi: "Beri bayi banyak waktu bergerak bebas di alas aman, dan jangan terlalu lama menaruhnya di kursi pantul atau ayunan. Baby walker tidak dianjurkan karena berisiko cedera dan tidak membantu bayi belajar berjalan [ref:aap-healthychildren]." },
            { key: "rentang-normal", judul: "Rentang normal itu lebar", isi: "Sebagian bayi berguling di usia 4 bulan, sebagian di usia 6 bulan, keduanya normal [ref:aap-healthychildren]. Yang penting bukan mengejar tanggal milestone, melainkan memberi kesempatan bergerak setiap hari." },
        ],
        stats: [
            { key: "sids-drop", value: ">50%", label: "penurunan tajam angka SIDS sejak kampanye 'tidur telentang' (1990-an)", sourceId: "cdc-sids" },
        ],
        figureId: "motor-sequence",
        sourceIds: ["cdc-sids", "piaget", "harvard-brain", "aap-healthychildren"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "tummy-time": {
        id: "tummy-time",
        title: "Tummy time",
        domainHints: ["FM"],
        sections: [
            { key: "mengapa-tummy", judul: "Mengapa tummy time penting", isi: "Sejak kampanye tidur telentang pada 1990-an berhasil menurunkan angka kematian bayi mendadak (SIDS) secara tajam [ref:cdc-sids], bayi menghabiskan lebih banyak waktu telentang. Sebagian lalu mengalami kepala peyang dan otot leher yang lebih lambat menguat. Waktu tengkurap saat bangun mengimbangi hal ini, prinsipnya 'back to sleep, tummy to play'." },
        ],
        stats: [],
        sourceIds: ["cdc-sids"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "tidur-aman-abc": {
        id: "tidur-aman-abc",
        title: "Tidur aman (ABC: Alone, Back, Crib)",
        domainHints: ["KS"],
        sections: [
            { key: "tidur-telentang", judul: "Tidur telentang menyelamatkan nyawa", isi: "Rekomendasi menidurkan bayi telentang adalah salah satu keberhasilan kesehatan masyarakat terbesar. Sejak kampanye 'back to sleep' pada 1990-an, angka SIDS turun tajam di banyak negara [ref:cdc-sids]. Posisi telentang menjaga jalan napas tetap terbuka." },
            { key: "lingkungan-tidur", judul: "Lingkungan tidur yang aman", isi: "Alas datar dan keras tanpa bantal, selimut tebal, bumper, atau boneka mencegah tersumbatnya napas dan kepanasan. Tidur sekamar dengan orang tua namun di kasur terpisah menurunkan risiko SIDS hingga sekitar 50% [ref:aap-safe-sleep-2022], sekaligus memudahkan menyusui malam hari." },
            { key: "tidur-aman-tetap", judul: "Tidur aman tetap penting", isi: "Meski bayi makin aktif, prinsip tidur aman tidak berubah: telentang, di alas datar dan keras, tanpa benda empuk, dan idealnya sekamar dengan orang tua di kasur terpisah." },
        ],
        stats: [
            { key: "room-sharing", value: "~50%", label: "penurunan risiko SIDS dengan tidur sekamar (kasur terpisah)", sourceId: "aap-safe-sleep-2022" },
            { key: "sids-drop", value: ">50%", label: "penurunan tajam angka SIDS sejak kampanye 'tidur telentang'", sourceId: "cdc-sids" },
        ],
        figureId: "safe-sleep-abc",
        sourceIds: ["aap-safe-sleep-2022", "cdc-sids"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "asi-menyusui": {
        id: "asi-menyusui",
        title: "ASI & menyusui",
        domainHints: ["KS"],
        sections: [
            { key: "asi-eksklusif", judul: "ASI eksklusif 6 bulan", isi: "ASI eksklusif dianjurkan untuk 6 bulan pertama karena memberi gizi ideal sekaligus antibodi pelindung [ref:who-breastfeeding]. Menyusui sesuai permintaan sesuai dengan lambung bayi yang kecil, dan dikaitkan dengan penurunan risiko SIDS." },
            { key: "asi-cukup", judul: "ASI masih cukup hingga 6 bulan", isi: "Hingga sekitar usia 6 bulan, ASI (atau susu formula) masih memenuhi seluruh kebutuhan gizi bayi [ref:who-breastfeeding]. Memberi makanan padat lebih dini tidak dianjurkan karena sistem cerna dan kesiapan menelan bayi belum matang." },
        ],
        stats: [
            { key: "exclusive-6m", value: "6 bln", label: "durasi ASI eksklusif yang direkomendasikan WHO", sourceId: "who-breastfeeding" },
        ],
        sourceIds: ["who-breastfeeding"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "mpasi": {
        id: "mpasi",
        title: "MPASI: makanan pendamping ASI",
        domainHints: ["KS"],
        sections: [
            { key: "tanda-siap", judul: "Tanda siap MPASI", isi: "Sekitar usia 6 bulan, bayi umumnya siap MPASI: bisa duduk dengan topangan, kepala tegak, tertarik pada makanan, dan refleks menjulurkan lidah berkurang [ref:who-complementary-2023]." },
            { key: "zat-besi", judul: "Zat besi jadi prioritas", isi: "Setelah 6 bulan, cadangan dan asupan zat besi dari ASI tidak lagi mencukupi. Karena itu makanan kaya zat besi, seperti hati, daging, kuning telur, dan kacang halus, dianjurkan sejak awal MPASI [ref:who-complementary-2023]." },
            { key: "tekstur", judul: "Tekstur naik bertahap", isi: "MPASI dimulai dari tekstur lumat/saring lalu makin kasar seiring kemampuan bayi. Pola responsive feeding, mengikuti isyarat lapar dan kenyang bayi, membangun kebiasaan makan yang sehat." },
            { key: "keamanan", judul: "Keamanan: tersedak dan madu", isi: "Hindari makanan pemicu tersedak seperti kacang atau anggur utuh dan potongan keras. Madu tidak boleh diberikan sebelum usia 1 tahun karena risiko botulisme [ref:aap-idai-mpasi]. Reaksi alergi (ruam, bengkak, sesak) perlu segera diperiksakan." },
            { key: "asi-lanjut", judul: "ASI tetap dilanjutkan", isi: "MPASI melengkapi, bukan menggantikan, ASI. Menyusui tetap dianjurkan berdampingan dengan makanan pendamping. Manfaatkan juga penimbangan rutin di posyandu, pencatatan pertumbuhan di Buku KIA, dan pemeriksaan perkembangan (KPSP) di posyandu/puskesmas. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter/ahli gizi." },
            { key: "susu-sapi-tunggu", judul: "Susu sapi tunggu 12 bulan", isi: "Susu sapi tidak dianjurkan sebagai minuman utama sebelum usia 12 bulan [ref:aap-cow-milk], karena dapat mengganggu penyerapan zat besi dan membebani ginjal bayi. ASI atau formula tetap jadi susu utama hingga usia 1 tahun." },
            { key: "variasi-zat-besi", judul: "Variasi dan zat besi", isi: "Tawarkan makanan keluarga yang dilunakkan dan beragam, dengan tetap mengutamakan sumber zat besi. Variasi rasa dan tekstur sejak dini membantu anak lebih mudah menerima banyak jenis makanan." },
            { key: "hindari-gula", judul: "Hindari gula, garam, madu", isi: "Batasi gula dan garam berlebih, dan jangan berikan madu sebelum usia 1 tahun karena risiko botulisme [ref:who-idai-mpasi]. Perhatikan pula tanda alergi saat mengenalkan makanan baru." },
        ],
        stats: [
            { key: "start-6m", value: "6 bln", label: "usia umum bayi siap memulai MPASI", sourceId: "who-complementary-2023" },
            { key: "iron", value: "Zat besi", label: "nutrien paling krusial saat MPASI dimulai", sourceId: "who-complementary-2023" },
            { key: "honey", value: "<1 thn", label: "madu harus dihindari sepenuhnya (risiko botulisme)", sourceId: "aap-idai-mpasi" },
        ],
        figureId: "mpasi-texture",
        sourceIds: ["who-complementary-2023", "aap-idai-mpasi", "aap-cow-milk", "who-idai-mpasi"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "object-permanence": {
        id: "object-permanence",
        title: "Object permanence",
        domainHints: ["KG"],
        sections: [
            { key: "menemukan", judul: "Menemukan bahwa benda tak lenyap", isi: "Bayi mulai mencari benda yang dijatuhkan atau disembunyikan. Ia sedang membangun object permanence, pemahaman bahwa sesuatu tetap ada meski tak terlihat [ref:piaget]." },
            { key: "mengapa-tonggak", judul: "Mengapa ini tonggak besar", isi: "Object permanence adalah dasar memori dan rasa aman. Pemahaman bahwa ibu tetap ada meski sedang tak terlihat inilah yang juga memunculkan kecemasan berpisah, dua sisi dari kemajuan kognitif yang sama." },
            { key: "cilukba", judul: "Ciluk-ba sebagai sains", isi: "Permainan ciluk-ba bukan sekadar hiburan; ia melatih object permanence secara langsung. Bayi belajar bahwa wajah Anda menghilang lalu muncul kembali, dan bisa diandalkan." },
        ],
        stats: [],
        figureId: "object-permanence",
        sourceIds: ["piaget"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "sebab-akibat": {
        id: "sebab-akibat",
        title: "Sebab-akibat",
        domainHints: ["KG"],
        sections: [
            { key: "aku-melakukan", judul: "Aku melakukan, sesuatu terjadi", isi: "Ketika bayi menggoyang kerincingan dan mendengar bunyi, lalu mengulanginya, ia sedang membuat penemuan besar: tindakannya bisa memengaruhi dunia. Pemahaman sebab-akibat ini adalah fondasi berpikir logis." },
            { key: "mainan-sederhana", judul: "Mengapa mainan sederhana menang", isi: "Mainan yang bereaksi terhadap tindakan bayi, kerincingan, tombol berbunyi, mengajarkan sebab-akibat jauh lebih baik daripada layar yang pasif. Interaksi nyata mengalahkan tontonan." },
        ],
        stats: [],
        figureId: "cause-effect",
        sourceIds: [],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "joint-attention": {
        id: "joint-attention",
        title: "Joint attention & menunjuk",
        domainHints: ["KG", "BH"],
        sections: [
            { key: "menunjuk-berbagi", judul: "Menunjuk untuk berbagi", isi: "Menunjuk bukan sekadar meminta; bayi mulai menunjuk untuk berbagi perhatian, mengajak Anda melihat hal yang sama (joint attention) [ref:cdc-act-early]. Ini tonggak sosial-kognitif yang kuat memprediksi perkembangan bahasa." },
            { key: "mengapa-menunjuk", judul: "Mengapa menunjuk penting", isi: "Karena menunjuk dan berbagi perhatian begitu penting bagi bahasa dan sosial, ketiadaannya menjelang 12 bulan termasuk hal yang perlu didiskusikan dengan dokter." },
            { key: "menunjuk-membuka", judul: "Menunjuk membuka bahasa", isi: "Menunjuk yang disertai menatap Anda adalah 'jembatan' menuju kata. Bayi yang banyak berbagi perhatian lewat menunjuk cenderung mengembangkan kosakata lebih cepat." },
        ],
        stats: [],
        figureId: "joint-attention",
        sourceIds: ["cdc-act-early"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "tonggak-bahasa": {
        id: "tonggak-bahasa",
        title: "Tonggak bahasa & pendengaran",
        domainHints: ["BH"],
        sections: [
            { key: "kualitas-kata", judul: "Kualitas kata & pendengaran", isi: "Banyaknya kata yang bayi dengar di tahun awal berkaitan dengan kosakata dan kesiapan sekolahnya kelak. Mendengar dengan baik adalah syarat bicara; bila bayi tampak tak merespons suara, pemeriksaan pendengaran dini sangat membantu [ref:cdc-act-early]." },
            { key: "dengar-baik", judul: "Dengar dengan baik", isi: "Mendengar adalah syarat belajar bicara. Bila bayi tampak tidak merespons suara atau namanya menjelang 9 bulan, pemeriksaan pendengaran dini sangat membantu." },
            { key: "waspadai-kemunduran", judul: "Waspadai kemunduran", isi: "Kehilangan kata atau kemampuan sosial yang pernah dimiliki adalah tanda penting yang perlu segera dikonsultasikan, terlepas dari usia." },
        ],
        stats: [],
        sourceIds: ["cdc-act-early"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "kelekatan-aman": {
        id: "kelekatan-aman",
        title: "Kelekatan aman",
        domainHints: ["SE"],
        sections: [
            { key: "regulasi-co", judul: "Regulasi lewat co-regulation", isi: "Bayi belum bisa menenangkan diri sendiri. Ketika Anda menenangkannya secara konsisten, ia perlahan belajar bahwa emosi besar bisa mereda, fondasi pengaturan emosi (co-regulation) di kemudian hari." },
            { key: "bermain-ikatan", judul: "Bermain sama dengan ikatan", isi: "Permainan interaktif seperti ciluk-ba memperkuat kelekatan. Pengasuhan yang responsif dan konsisten dikaitkan dengan kelekatan aman [ref:ainsworth-1978], yang membuat anak lebih percaya diri menjelajah." },
            { key: "mengapa-takut", judul: "Mengapa tiba-tiba takut orang asing", isi: "Kecemasan pada orang asing muncul justru karena kemajuan kognitif: bayi kini bisa membedakan wajah familiar dari yang asing, dan tahu siapa 'orang'-nya [ref:cdc-act-early]." },
            { key: "sehat-bukan-manja", judul: "Ini sehat, bukan manja", isi: "Menempel pada pengasuh dan cemas pada orang asing adalah tanda kelekatan yang aman sedang terbentuk. Ini perkembangan normal, bukan sikap yang perlu 'diperbaiki'." },
            { key: "kaitan-berpisah", judul: "Kaitan dengan berpisah", isi: "Kecemasan berpisah muncul bersamaan karena bayi kini paham Anda tetap ada meski pergi (object permanence). Ia belum tahu kapan Anda kembali, karena itu ia protes." },
            { key: "cara-membantu", judul: "Cara membantu", isi: "Jangan memaksa bayi ke orang asing; beri waktu penyesuaian. Saat berpisah, berpamitanlah singkat dan konsisten, jangan menyelinap pergi, karena itu menambah cemas [ref:ainsworth-1978]." },
            { key: "basis-aman", judul: "Anda adalah basis aman", isi: "Kehadiran Anda yang bisa diandalkan justru membuat bayi lebih berani menjelajah. Rasa aman adalah landasan keberanian, bukan lawannya." },
            { key: "perpisahan", judul: "Perpisahan yang menenangkan", isi: "Buat ritual perpisahan yang singkat, hangat, dan konsisten. Beri kepastian bahwa Anda akan kembali; hindari menyelinap pergi karena justru menambah cemas." },
            { key: "kelekatan-keberanian", judul: "Kelekatan aman sama dengan keberanian", isi: "Kelekatan yang kuat bukan penghambat kemandirian. Justru dari basis aman itulah bayi berani menjelajah dunia." },
        ],
        stats: [
            { key: "secure", value: "±50–60%", label: "bayi membentuk kelekatan aman saat pengasuhan responsif", sourceId: "ainsworth-1978" },
        ],
        sourceIds: ["ainsworth-1978", "cdc-act-early"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "screen-time": {
        id: "screen-time",
        title: "Screen time / tanpa layar",
        domainHints: ["PS"],
        sections: [
            { key: "mengapa-hindari-layar", judul: "Mengapa hindari layar", isi: "AAP menganjurkan menghindari layar (TV, ponsel, tablet) untuk bayi di bawah 18–24 bulan, kecuali panggilan video dengan keluarga [ref:aap-media]. Bayi belum bisa belajar dari layar seperti dari manusia, dan waktu layar menggantikan waktu interaksi yang jauh lebih bernilai." },
            { key: "tetap-tanpa-layar", judul: "Tetap tanpa layar", isi: "Layar tetap tidak dianjurkan di bawah 18–24 bulan [ref:aap-media]. Interaksi langsung dan eksplorasi nyata jauh lebih memperkaya otak yang sedang dibangun [ref:harvard-brain]." },
        ],
        stats: [
            { key: "min-age", value: "18–24 bln", label: "usia minimal sebelum layar dianjurkan (kecuali video call)", sourceId: "aap-media" },
            { key: "neural", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
            { key: "max-1h", value: "≤1 jam", label: "layar per hari untuk anak usia 2–5 tahun, konten berkualitas dan didampingi", sourceId: "aap-media" },
        ],
        sourceIds: ["aap-media", "harvard-brain"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "disiplin-positif": {
        id: "disiplin-positif",
        title: "Disiplin positif & batas lembut",
        domainHints: ["PS"],
        sections: [
            { key: "menguji-batas", judul: "Menguji batas adalah belajar", isi: "Bayi yang makin mobile mulai menguji batas, bukan untuk menantang, melainkan untuk memahami aturan dunia. Ini bagian normal dari perkembangan." },
            { key: "alihkan", judul: "Alihkan, bukan menghukum", isi: "Di usia ini, mengalihkan perhatian (redirection) jauh lebih efektif daripada larangan berulang atau hukuman. Bayi belum mampu memahami konsekuensi abstrak." },
            { key: "sedikit-batas", judul: "Sedikit batas yang konsisten", isi: "Tetapkan beberapa batas jelas demi keamanan dan terapkan secara konsisten. Konsistensi yang hangat mengajarkan rasa aman, bukan rasa takut." },
        ],
        stats: [],
        sourceIds: [],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "kesehatan-gigi": {
        id: "kesehatan-gigi",
        title: "Kesehatan gigi & fluoride",
        domainHints: ["KS"],
        sections: [
            { key: "fluoride-takaran", judul: "Takaran pasta fluoride", isi: "Sikat gigi dua kali sehari dengan pasta berfluoride — seukuran sebutir beras untuk anak di bawah 3 tahun, dan sebutir kacang polong sejak usia 3 tahun [ref:aap-aapd-dental] — dan batasi minuman manis." },
        ],
        stats: [
            { key: "fluoride", value: "Beras → kacang polong", label: "takaran pasta fluoride: sebutir beras (<3 thn), sebutir kacang polong (≥3 thn)", sourceId: "aap-aapd-dental" },
        ],
        sourceIds: ["aap-aapd-dental"],
        status: "approved",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "ko-regulasi": {
        id: "ko-regulasi",
        title: "Ko-regulasi",
        domainHints: ["SE"],
        sections: [
            { key: "co-regulation-anchor", judul: "Co-regulation: Anda jadi jangkar", isi: "TODO: konten dari RL-12-18m-SE (belum terisi)" },
            { key: "menamai-emosi", judul: "Menamai emosi anak", isi: "TODO: konten dari RL-12-18m-SE (belum terisi)" },
        ],
        stats: [],
        sourceIds: [],
        status: "draft",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "tantrum-regulasi-emosi": {
        id: "tantrum-regulasi-emosi",
        title: "Tantrum & regulasi emosi",
        domainHints: ["SE"],
        sections: [
            { key: "tantrum-bukan-kenakalan", judul: "Tantrum bukan kenakalan", isi: "TODO: konten dari RL-18-24m-SE (belum terisi)" },
            { key: "validasi-lalu-batas", judul: "Validasi emosi lalu tetapkan batas", isi: "TODO: konten dari RL-18-24m-SE (belum terisi)" },
        ],
        stats: [],
        sourceIds: [],
        status: "draft",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "divisi-tanggung-jawab-makan": {
        id: "divisi-tanggung-jawab-makan",
        title: "Divisi tanggung jawab makan",
        domainHints: ["KS"],
        sections: [
            { key: "division-of-responsibility", judul: "Divisi tanggung jawab makan", isi: "TODO: konten dari RL-12-18m-KS / RL-2-3y-KS (belum terisi)" },
            { key: "picky-eating-normal", judul: "Picky eating itu wajar", isi: "TODO: konten dari RL-12-18m-KS (belum terisi)" },
        ],
        stats: [],
        sourceIds: [],
        status: "draft",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    "toilet-training": {
        id: "toilet-training",
        title: "Toilet training",
        domainHints: ["PS", "KS"],
        sections: [
            { key: "tanda-kesiapan", judul: "Tunggu tanda kesiapan", isi: "TODO: konten dari RL-18-24m-PS / RL-2-3y-KS (belum terisi)" },
            { key: "tanpa-tekanan", judul: "Tanpa paksaan", isi: "TODO: konten dari RL-2-3y-KS (belum terisi)" },
        ],
        stats: [],
        sourceIds: [],
        status: "draft",
        lastReviewed: "2026-07", // TODO: migrate to DB/CMS
    },
    // =========================================================================
    // Batch 3-4y (2026-07) — modul baru, status: "review"
    // =========================================================================
    "fungsi-eksekutif": {
        id: "fungsi-eksekutif",
        title: "Fungsi eksekutif",
        domainHints: ["KG", "PS"],
        figureId: "executive-function",
        sourceIds: ["harvard-executive", "vygotsky-piaget-play"],
        stats: [
            { key: "jendela-3-5", value: "3–5 thn", label: "jendela perkembangan pesat fungsi eksekutif", sourceId: "harvard-executive" },
        ],
        sections: [
            { key: "tiga-inti", judul: "Tiga keterampilan inti", isi: "Fungsi eksekutif adalah 'menara kontrol lalu lintas' otak: memori kerja (menyimpan informasi sambil memakainya), kontrol diri (menahan dorongan), dan fleksibilitas berpikir (berpindah aturan atau sudut pandang) [ref:harvard-executive]. Ketiganya menopang hampir semua kemampuan belajar." },
            { key: "berkembang-3-5", judul: "Berkembang pesat di usia 3–5 tahun", isi: "Anak tidak lahir dengan fungsi eksekutif; kemampuan ini dibentuk oleh pengalaman, dan usia 3–5 tahun adalah masa perkembangannya yang paling pesat [ref:harvard-executive]. Interaksi dan permainan sehari-hari adalah 'gimnasium'-nya." },
            { key: "dilatih-bermain", judul: "Dilatih lewat bermain, bukan drilling", isi: "Permainan berperan, permainan beraturan (mis. 'lampu merah–lampu hijau'), menunggu giliran, dan lagu bergerak melatih memori kerja dan kontrol diri secara alami [ref:harvard-executive]. Latihan terbaik terasa seperti bermain, bukan pelajaran." },
            { key: "fondasi-sekolah", judul: "Fondasi kesiapan sekolah", isi: "Kemampuan menahan diri, mengikuti aturan main, dan menyelesaikan tugas kecil adalah fondasi belajar di kelas — sering kali lebih menentukan kesiapan sekolah daripada hafalan huruf dan angka yang dipaksakan dini." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    "pra-literasi": {
        id: "pra-literasi",
        title: "Pra-literasi",
        domainHints: ["BH", "PS"],
        figureId: "pre-literacy-path",
        sourceIds: ["aap-healthychildren", "asha"],
        stats: [
            { key: "sejak-lahir", value: "Sejak lahir", label: "membacakan buku dianjurkan — fondasi literasi dibangun jauh sebelum sekolah", sourceId: "aap-healthychildren" },
        ],
        sections: [
            { key: "dari-lisan", judul: "Literasi tumbuh dari bahasa lisan", isi: "Kemampuan membaca kelak dibangun di atas bahasa lisan hari ini. Rima, lagu, dan permainan bunyi melatih kesadaran fonologis — kepekaan mendengar bunyi-bunyi di dalam kata — yang merupakan salah satu fondasi terkuat membaca [ref:asha]." },
            { key: "print-awareness", judul: "Kenal buku sebelum kenal huruf", isi: "Memegang buku dengan benar, tahu arah membaca, dan mengenali huruf pertama namanya sendiri adalah 'print awareness' — kesadaran tentang cara kerja tulisan. Ini tumbuh dari paparan yang menyenangkan, bukan dari les membaca dini." },
            { key: "membaca-dialogis", judul: "Membaca nyaring yang interaktif", isi: "Cara membaca lebih penting daripada jumlah buku: ajukan pertanyaan ('menurutmu kenapa dia sedih?'), biarkan anak melanjutkan cerita, dan hubungkan isi buku dengan pengalamannya [ref:aap-healthychildren]. Membaca dialogis seperti ini memperkaya bahasa jauh lebih dalam daripada membaca satu arah." },
            { key: "coretan", judul: "Coretan adalah pra-menulis", isi: "Menggambar dan mencoret adalah latihan menulis yang sesungguhnya di usia ini. Hargai coretannya dan minta anak 'membacakan' apa yang ia tulis — jangan buru-buru menuntut huruf yang sempurna." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    "temperamen": {
        id: "temperamen",
        title: "Temperamen & goodness of fit",
        domainHints: ["SE", "PS"],
        figureId: "temperament-fit",
        sourceIds: ["thomas-chess"],
        stats: [
            { key: "9-dimensi", value: "9 dimensi", label: "ciri temperamen bawaan yang teramati sejak bayi (Thomas & Chess)", sourceId: "thomas-chess" },
        ],
        sections: [
            { key: "bawaan", judul: "Setiap anak lahir dengan 'setelan' berbeda", isi: "Riset klasik Thomas & Chess memetakan sembilan dimensi temperamen bawaan — antara lain tingkat aktivitas, reaksi terhadap hal baru, intensitas emosi, kemampuan beradaptasi, dan ketekunan [ref:thomas-chess]. Temperamen tampak sejak bayi dan relatif menetap." },
            { key: "tidak-ada-buruk", judul: "Tidak ada temperamen yang buruk", isi: "Anak yang pemalu bukan 'bermasalah', dan anak yang sangat aktif bukan 'nakal'. Temperamen adalah gaya, bukan kualitas. Melabeli anak berdasarkan temperamennya justru membebani perkembangannya." },
            { key: "goodness-of-fit", judul: "Goodness of fit: kecocokan yang menentukan", isi: "Temuan terpenting Thomas & Chess: yang paling memengaruhi perkembangan bukan temperamen itu sendiri, melainkan kecocokan antara temperamen anak dan respons lingkungannya (goodness of fit) [ref:thomas-chess]. Pengasuhan yang menyesuaikan diri dengan 'setelan' anak membuat temperamen apa pun bisa berkembang sehat." },
            { key: "sesuaikan", judul: "Sesuaikan cara, bukan ubah anaknya", isi: "Anak yang lambat hangat (slow to warm up) butuh waktu pemanasan sebelum situasi baru — beri jeda, jangan dorong paksa. Anak berenergi tinggi butuh saluran gerak yang cukup sebelum diminta duduk tenang. Menyesuaikan cara bukan memanjakan; itu bekerja sama dengan bawaan anak." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    "pujian-proses": {
        id: "pujian-proses",
        title: "Pujian proses & growth mindset",
        domainHints: ["PS", "SE"],
        figureId: "praise-process",
        sourceIds: ["dweck-mindset"],
        stats: [
            { key: "proses-bukan-label", value: "Proses, bukan label", label: "pujian efektif menyebut usaha & strategi, bukan sifat ('pintar')", sourceId: "dweck-mindset" },
        ],
        sections: [
            { key: "dua-jenis", judul: "Dua jenis pujian, dua efek berbeda", isi: "Riset Dweck membedakan pujian proses ('kamu mencoba terus sampai bisa') dari pujian pribadi/label ('kamu memang pintar') [ref:dweck-mindset]. Keduanya terdengar positif, tetapi efek jangka panjangnya berlawanan." },
            { key: "label-beban", judul: "Mengapa label bisa jadi beban", isi: "Anak yang sering dipuji 'pintar' cenderung memilih tugas yang aman dan menghindari tantangan — karena kegagalan terasa mengancam label itu [ref:dweck-mindset]. Anak yang dipuji atas usahanya justru lebih berani mencoba hal sulit." },
            { key: "growth-mindset", judul: "Menumbuhkan keyakinan 'bisa bertumbuh'", isi: "Pujian proses mengajarkan bahwa kemampuan bertumbuh lewat latihan (growth mindset). Kata 'belum' sederhana tapi kuat: 'kamu belum bisa' membuka pintu, 'kamu tidak bisa' menutupnya." },
            { key: "contoh-kalimat", judul: "Contoh yang bisa langsung dipakai", isi: "Sebut yang spesifik dan tulus: 'Kamu sabar sekali menyusun balok itu sampai berdiri' atau 'Caramu mencoba dari sisi lain tadi cerdik'. Pujian berlebihan atau asal-asalan cepat kehilangan makna — anak bisa membedakannya." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    // REVIEW: aturan "2T" dan frasa rujukan — konfirmasi ke pedoman posyandu/Kemenkes terbaru (Apoteker Raisha).
    "pemantauan-pertumbuhan": {
        id: "pemantauan-pertumbuhan",
        title: "Pemantauan pertumbuhan (Buku KIA & posyandu)",
        domainHints: ["KS"],
        figureId: "growth-curve",
        sourceIds: ["who-growth-standards", "kemenkes-kia-kpsp"],
        stats: [
            { key: "1x-bulan", value: "1×/bulan", label: "penimbangan balita di posyandu & pencatatan di Buku KIA", sourceId: "kemenkes-kia-kpsp" },
            { key: "aturan-2t", value: "2T", label: "berat tidak naik dua kali penimbangan berturut-turut = tanda perlu dirujuk", sourceId: "kemenkes-kia-kpsp" },
        ],
        sections: [
            { key: "kurva-bukan-angka", judul: "Kurva lebih penting daripada angka tunggal", isi: "Satu kali penimbangan hanyalah potret; kurva pertumbuhan adalah filmnya. Yang dinilai bukan berapa berat anak hari ini, melainkan apakah kurvanya bergerak sesuai jalurnya pada grafik pertumbuhan WHO yang dipakai di Buku KIA [ref:who-growth-standards]." },
            { key: "kia-posyandu", judul: "Buku KIA & posyandu: alat pantau yang sudah di tangan", isi: "Penimbangan rutin setiap bulan di posyandu dan pencatatannya di Buku KIA adalah sistem deteksi dini yang paling mudah diakses [ref:kemenkes-kia-kpsp]. Bawa Buku KIA di setiap kunjungan dan pastikan titiknya tergambar — deretan titik itulah yang bercerita." },
            { key: "tanda-rujukan", judul: "Tanda yang perlu ditindaklanjuti", isi: "Berat yang tidak naik dua kali penimbangan berturut-turut (2T), kurva yang mendatar lama atau memotong garis ke bawah, adalah sinyal untuk pemeriksaan lebih lanjut di puskesmas [ref:kemenkes-kia-kpsp]. Ditangkap dini, sebagian besar masalah pertumbuhan bisa dikejar." },
            { key: "tinggi-stunting", judul: "Tinggi badan sama pentingnya", isi: "Selain berat, panjang/tinggi badan diukur berkala untuk mendeteksi risiko stunting sedini mungkin. Pencegahannya adalah kombinasi gizi cukup (terutama protein hewani), stimulasi, dan penanganan infeksi berulang." },
            { key: "kpsp", judul: "Tumbuh dan kembang dipantau bersama", isi: "Pertumbuhan (fisik) dipantau lewat kurva; perkembangan (kemampuan) dipantau lewat KPSP — kuesioner skrining per kelompok usia di posyandu/puskesmas [ref:kemenkes-kia-kpsp]. Keduanya saling melengkapi." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    // REVIEW: klaim rentang usia risiko tenggelam — konfirmasi ke WHO/CDC terkini (Apoteker Raisha).
    "pencegahan-cedera": {
        id: "pencegahan-cedera",
        title: "Pencegahan cedera",
        domainHints: ["KS", "PS"],
        figureId: "injury-by-age",
        sourceIds: ["who-injury", "aap-healthychildren"],
        stats: [
            { key: "tenggelam-1-4", value: "1–4 thn", label: "rentang usia dengan risiko tenggelam tertinggi pada anak", sourceId: "who-injury" },
            { key: "jangkauan-tangan", value: "Jangkauan tangan", label: "jarak pengawasan orang dewasa saat anak berada di dekat air", sourceId: "aap-healthychildren" },
        ],
        sections: [
            { key: "bergeser-usia", judul: "Bahaya bergeser seiring usia", isi: "Risiko cedera berubah mengikuti kemampuan anak: bayi paling rentan jatuh dan tersedak; batita rentan tenggelam, luka bakar, dan keracunan benda rumah tangga; anak prasekolah mulai menghadapi risiko jalan raya dan sepeda [ref:who-injury]. Pencegahan yang baik selalu selangkah di depan kemampuan barunya." },
            { key: "tenggelam", judul: "Tenggelam: senyap dan cepat", isi: "Tenggelam pada anak kecil berlangsung senyap — tanpa teriakan — dan bisa terjadi di air yang dangkal seperti ember, bak mandi, atau kolam kecil [ref:who-injury]. Saat anak berada di dekat air, orang dewasa harus berada dalam jangkauan tangan, tanpa terdistraksi ponsel; kosongkan ember dan bak segera setelah dipakai." },
            { key: "racun-panas", judul: "Racun dan luka bakar di dalam rumah", isi: "Simpan cairan pembersih, obat, dan minyak tanah di tempat tinggi atau terkunci — jangan memindahkannya ke botol minuman. Di dapur, arahkan gagang panci ke dalam dan jauhkan anak dari air panas yang baru mendidih." },
            { key: "jalan-sepeda", judul: "Jalan raya dan sepeda", isi: "Di sekitar jalan, tangan anak selalu digenggam — kemampuan menilai kecepatan kendaraan belum berkembang di usia prasekolah. Biasakan helm sejak sepeda pertama; kebiasaan yang dibangun dini akan bertahan." },
            { key: "ajarkan", judul: "Ajarkan aturan, tapi jangan andalkan aturan", isi: "Sejak usia 3 tahun anak mulai bisa memahami aturan aman sederhana ('air hanya dengan ayah/ibu'). Tetap ingat: aturan melengkapi pengawasan, tidak menggantikannya — kontrol diri anak belum bisa diandalkan penuh." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    // =========================================================================
    // Batch 4-5y (2026-07) — 3 modul penutup katalog, status: "review"
    // =========================================================================
    "kesiapan-sekolah": {
        id: "kesiapan-sekolah",
        title: "Kesiapan sekolah",
        domainHints: ["KG", "PS"],
        figureId: "school-readiness-domains",
        sourceIds: ["aap-healthychildren", "harvard-executive"],
        stats: [
            { key: "lima-ranah", value: "5 ranah", label: "kesiapan sekolah: fisik, sosial-emosional, bahasa, kognitif, dan kemandirian — bukan calistung semata", sourceId: "aap-healthychildren" },
        ],
        sections: [
            { key: "lima-ranah", judul: "Kesiapan sekolah itu lima ranah", isi: "Kesiapan sekolah jauh lebih luas daripada mengenal huruf dan angka: ia mencakup fisik-motorik, sosial-emosional, bahasa, kognitif & cara belajar, serta kemandirian [ref:aap-healthychildren]. Anak yang 'siap' adalah anak yang bisa berpisah dengan tenang, mengikuti instruksi, dan penasaran — bukan yang paling cepat membaca." },
            { key: "sosem-menentukan", judul: "Sosial-emosional sering paling menentukan", isi: "Kemampuan bergiliran, mengelola frustrasi, meminta bantuan, dan menyelesaikan konflik kecil adalah bekal yang paling terpakai di hari-hari pertama sekolah. Fungsi eksekutif yang dilatih lewat bermain adalah mesin di baliknya [ref:harvard-executive]." },
            { key: "calistung-bukan-syarat", judul: "Calistung dini bukan jalan pintas", isi: "Memaksakan latihan akademik terlalu dini bisa kontraproduktif: anak belajar bahwa 'belajar itu tidak menyenangkan' sebelum sekolah dimulai. Fondasi membaca dan berhitung paling kokoh dibangun lewat bahasa lisan, bermain, dan rasa ingin tahu." },
            { key: "cara-menyiapkan", judul: "Cara menyiapkan yang bekerja", isi: "Bangun rutinitas yang menyerupai hari sekolah (bangun, sarapan, kegiatan, tidur teratur), perbanyak kesempatan bermain dengan anak sebaya, kenalkan lingkungan sekolahnya sebelum hari pertama, dan teruskan membaca bersama setiap hari." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    // REVIEW: rentang usia false belief "±4–5 thn" — konfirmasi literatur ToM (Psikolog Fitri).
    "keterampilan-sosial-empati": {
        id: "keterampilan-sosial-empati",
        title: "Keterampilan sosial & empati",
        domainHints: ["SE"],
        figureId: "theory-of-mind",
        sourceIds: ["theory-of-mind", "cdc-act-early"],
        stats: [
            { key: "false-belief", value: "±4–5 thn", label: "usia anak umumnya mulai memahami bahwa keyakinan orang lain bisa berbeda (theory of mind)", sourceId: "theory-of-mind" },
        ],
        sections: [
            { key: "teori-pikiran", judul: "Penemuan besar: orang lain berpikir berbeda", isi: "Sekitar usia 4–5 tahun anak mencapai tonggak 'theory of mind': memahami bahwa orang lain punya pikiran, keinginan, dan keyakinan yang bisa berbeda — bahkan keliru [ref:theory-of-mind]. Inilah fondasi empati, kerja sama, dan memahami cerita." },
            { key: "empati-akurat", judul: "Empati menjadi lebih tepat sasaran", isi: "Karena kini bisa membayangkan isi hati orang lain, anak mulai menghibur dengan cara yang sesuai kebutuhan temannya — bukan sekadar memberikan apa yang ia sendiri sukai. Bantu dengan menyuarakan perspektif: 'Lihat wajah adik — kira-kira dia sedih kenapa, ya?'" },
            { key: "main-beraturan", judul: "Permainan beraturan: kurikulum sosial", isi: "Permainan dengan aturan dan peran menuntut negosiasi, giliran, dan menerima kalah. Konflik kecil di dalamnya bukan kegagalan — itulah latihan intinya [ref:cdc-act-early]. Tahan diri untuk tidak selalu menjadi wasit; beri kesempatan mereka berunding dulu." },
            { key: "bohong-kecil", judul: "Bohong kecil: tonggak, sekaligus kesempatan mengajar", isi: "Dusta sederhana justru menandakan theory of mind berkembang — anak paham bahwa Anda tidak otomatis tahu isi pikirannya [ref:theory-of-mind]. Tanggapi dengan tenang: hargai kejujuran, jelaskan dampaknya, dan hindari melabeli 'pembohong'. Reaksi keras justru mengajarkan berbohong lebih rapi." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    "kemandirian-praktis": {
        id: "kemandirian-praktis",
        title: "Kemandirian praktis (practical life)",
        domainHints: ["PS"],
        figureId: "practical-life",
        sourceIds: ["montessori", "aap-healthychildren"],
        stats: [
            { key: "tugas-nyata", value: "Tugas nyata", label: "pekerjaan rumah sungguhan membangun rasa mampu lebih kuat daripada aktivitas pura-pura", sourceId: "montessori" },
        ],
        sections: [
            { key: "bantu-sendiri", judul: "'Bantu aku melakukannya sendiri'", isi: "Prinsip Montessori merangkum kebutuhan usia ini: anak tidak ingin dilayani, ia ingin mampu [ref:montessori]. Keinginan membantu dan mengerjakan sendiri adalah dorongan perkembangan yang sehat — sayang bila dipadamkan karena 'lebih cepat kalau dikerjakan orang dewasa'." },
            { key: "rasa-mampu", judul: "Kemandirian membangun rasa mampu", isi: "Menyelesaikan tugas nyata — bukan sekadar dipuji — adalah sumber rasa percaya diri yang paling jujur. Anak yang tahu dirinya berguna di rumah membawa keyakinan itu ke sekolah dan pertemanannya." },
            { key: "tugas-usia", judul: "Tugas yang pas untuk usia prasekolah", isi: "Berpakaian sendiri, merapikan mainan, menata meja makan, menyiram tanaman, memasukkan baju kotor, dan menyiapkan tas sendiri — semuanya berada dalam jangkauan usia 4–5 tahun bila alatnya dibuat terjangkau (gantungan rendah, wadah berlabel gambar)." },
            { key: "terima-tidak-sempurna", judul: "Beri waktu, terima ketidaksempurnaan", isi: "Kancing yang meleset dan air yang tumpah adalah biaya belajar, bukan alasan mengambil alih. Sediakan waktu lebih longgar, tunjukkan caranya perlahan, lalu mundur. Mengambil alih tugas yang sedang ia perjuangkan mengirim pesan 'kamu tidak mampu'." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    // ─── Batch DK-1 (2026-07): Deteksi Dini & Kebutuhan Khusus ──────────────────
    "deteksi-intervensi-dini": {
        id: "deteksi-intervensi-dini",
        title: "Deteksi dini dan intervensi: mengapa waktu sangat bermakna",
        domainHints: ["DK"],
        stats: [
            { key: "jendela-0-3", value: "0–3 thn", label: "periode otak paling responsif terhadap stimulasi dan intervensi", sourceId: "harvard-brain" },
        ],
        sections: [
            { key: "jendela-emas", judul: "Jendela emas neuroplastisitas", isi: "Otak anak paling lentur di tahun-tahun awal — lebih dari sejuta koneksi saraf terbentuk tiap detik dan jalur yang sering dipakai menguat [ref:harvard-brain]. Itulah mengapa dukungan yang datang lebih awal bekerja lebih efektif: ia menumpang pada masa otak paling mudah dibentuk." },
            { key: "tunggu-dulu-mahal", judul: "'Tunggu saja dulu' adalah taruhan yang mahal", isi: "Evaluasi dini tidak pernah merugikan: bila hasilnya variasi normal, keluarga mendapat ketenangan; bila ada kebutuhan, waktu paling berharga terselamatkan. Sebaliknya, menunda karena 'nanti juga bisa sendiri' mempertaruhkan justru bulan-bulan ketika bantuan paling berdampak [ref:cdc-act-early]." },
            { key: "tanpa-menunggu-label", judul: "Intervensi tidak menunggu diagnosis", isi: "Stimulasi terarah dan terapi (wicara, okupasi, fisioterapi) dapat dimulai atas dasar keterlambatan yang teramati — tanpa harus menunggu kepastian label. Diagnosis membantu memetakan, tetapi bukan syarat untuk mulai membantu anak [ref:idai]." },
            { key: "ortu-intervensionis", judul: "Orang tua adalah intervensionis utama", isi: "Program intervensi yang paling efektif melibatkan orang tua sebagai pelaku utamanya: jam bersama Anda jauh melampaui jam sesi terapi mana pun. Terapis terbaik memposisikan diri sebagai pelatih Anda, bukan pengganti Anda." },
        ],
        sourceIds: ["harvard-brain", "cdc-act-early", "idai"],
        status: "review",
        lastReviewed: "2026-07",
    },
    "variasi-vs-red-flag": {
        id: "variasi-vs-red-flag",
        title: "Variasi normal vs. red flag: cara membedakan",
        domainHints: ["DK"],
        stats: [
            { key: "regresi", value: "Regresi", label: "kehilangan kemampuan yang pernah ada = selalu perlu evaluasi, pada usia berapa pun", sourceId: "cdc-act-early" },
        ],
        sections: [
            { key: "rentang-dan-pagar", judul: "Rentang normal itu lebar — tapi ada pagarnya", isi: "Waktu pencapaian milestone sangat bervariasi antaranak dan hampir selalu baik-baik saja. 'Pagar'-nya adalah red flag: batas usia ketika sebuah kemampuan yang belum muncul layak dievaluasi [ref:cdc-act-early]. Kartu-kartu di perpustakaan ini menandai pagar itu di tiap usia." },
            { key: "regresi", judul: "Regresi: satu aturan tanpa kecuali", isi: "Kehilangan kemampuan yang pernah dimiliki — kata yang dulu diucapkan lalu hilang, kontak sosial yang memudar — adalah satu-satunya tanda yang tidak mengenal 'tunggu dulu': selalu perlu evaluasi segera, pada usia berapa pun [ref:cdc-act-early]." },
            { key: "pola-bukan-satu", judul: "Pola lebih bermakna daripada satu tanda", isi: "Satu milestone yang terlambat jarang berarti apa-apa. Yang bermakna adalah pola: keterlambatan di beberapa area sekaligus, tanda yang menetap dari waktu ke waktu, atau kemajuan yang berhenti. Amati polanya, catat, dan bawa catatan itu saat berkonsultasi." },
            { key: "percayai-naluri", judul: "Percayai naluri Anda", isi: "Orang tua adalah pengamat terbaik anaknya — Anda melihatnya di semua suasana, setiap hari. Kekhawatiran yang menetap layak diperiksakan, meski orang di sekitar berkata 'ah, dulu bapaknya juga begitu'. Paling buruk, Anda pulang dengan ketenangan." },
        ],
        sourceIds: ["cdc-act-early"],
        status: "review",
        lastReviewed: "2026-07",
    },
    "jalur-layanan-abk": {
        id: "jalur-layanan-abk",
        title: "Jalur layanan anak berkebutuhan khusus di Indonesia",
        domainHints: ["DK"],
        figureId: "jalur-layanan",
        stats: [
            { key: "kpsp-gratis", value: "KPSP", label: "pintu pertama skrining perkembangan — tersedia di posyandu/puskesmas", sourceId: "kemenkes-kia-kpsp" },
        ],
        sections: [
            { key: "empat-pintu", judul: "Empat pintu yang berurutan", isi: "Jalur layanan di Indonesia berjenjang dan bisa dimulai dari yang paling dekat: (1) skrining KPSP di posyandu/puskesmas, (2) pemeriksaan dan rujukan di puskesmas, (3) asesmen oleh dokter spesialis anak atau klinik tumbuh kembang, (4) program bersama psikolog dan terapis — wicara, okupasi, atau fisioterapi sesuai kebutuhan [ref:kemenkes-kia-kpsp]." },
            { key: "isi-tiap-pintu", judul: "Apa yang terjadi di tiap pintu", isi: "KPSP adalah kuesioner singkat sesuai kelompok usia — bukan tes lulus-gagal, melainkan penyaring. Bila hasilnya 'perlu tindak lanjut', puskesmas merujuk ke jenjang berikutnya untuk asesmen yang lebih dalam. Skrining bukan diagnosis; ia hanya memastikan anak yang membutuhkan sampai ke evaluasi yang tepat." },
            { key: "datang-dengan-catatan", judul: "Datang dengan catatan", isi: "Asesmen jauh lebih cepat dan akurat bila Anda membawa bahan: video singkat perilaku sehari-hari, catatan milestone dan kapan tercapainya, serta Buku KIA. Perilaku anak di ruang praktik sering tidak mewakili kesehariannya — rekaman Anda mengisi celah itu." },
            { key: "pembiayaan", judul: "Soal biaya: bertanya dulu, menyerah jangan", isi: "Sebagian layanan tumbuh kembang dan terapi tersedia melalui fasilitas kesehatan publik dan skema jaminan kesehatan — cakupannya berbeda antar daerah dan jenis layanan, jadi tanyakan langsung di puskesmas atau rumah sakit rujukan Anda. Jangan biarkan asumsi soal biaya menghentikan langkah pertama yang gratis: KPSP." },
            // REVIEW: (Tim) verifikasi frasa pembiayaan/jaminan kesehatan terhadap ketentuan yang berlaku.
        ],
        sourceIds: ["kemenkes-kia-kpsp"],
        status: "review",
        lastReviewed: "2026-07",
    },
    "spektrum-autisme": {
        id: "spektrum-autisme",
        title: "Spektrum autisme: memahami, mendeteksi, dan mendukung",
        domainHints: ["DK"],
        figureId: "spektrum",
        stats: [
            { key: "mchat-window", value: "16–30 bln", label: "rentang usia skrining autisme M-CHAT-R", sourceId: "mchat-robins" },
            { key: "vaksin-aman", value: "Bukan penyebab", label: "vaksin tidak menyebabkan autisme — konsensus dari banyak penelitian besar", sourceId: "cdc-autism" },
        ],
        sections: [
            { key: "apa-itu", judul: "Apa itu spektrum autisme", isi: "Autisme adalah perbedaan perkembangan saraf yang memengaruhi cara anak berkomunikasi, berinteraksi sosial, dan mengolah dunia — dengan pola minat serta cara bermain yang khas [ref:cdc-autism]. Disebut 'spektrum' karena tampilannya sangat beragam: tidak ada dua anak autistik yang sama." },
            { key: "tanda-awal", judul: "Tanda awal yang paling bermakna", isi: "Yang paling layak diamati sejak dini: jarang merespons saat namanya dipanggil, minim berbagi perhatian (jarang menunjuk atau menunjukkan benda kepada Anda), kontak mata dan senyum sosial yang terbatas, permainan pura-pura yang tak kunjung muncul, dan terutama regresi — kemampuan yang pernah ada lalu menghilang [ref:cdc-autism]. Satu tanda bukan kesimpulan; pola beberapa tanda adalah alasan evaluasi." },
            { key: "mchat", judul: "M-CHAT-R: skrining, bukan vonis", isi: "M-CHAT-R adalah kuesioner singkat tervalidasi untuk usia 16–30 bulan, dan tersedia gratis [ref:mchat-robins]. Hasil 'berisiko' TIDAK berarti anak autistik — ia berarti anak sebaiknya dievaluasi lebih lanjut oleh profesional. Sebagian besar anak dengan hasil skrining positif ternyata membutuhkan dukungan lain atau tidak membutuhkan apa-apa; yang memang membutuhkan mendapat awalan yang lebih dini." },
            { key: "vaksin", judul: "Vaksin tidak menyebabkan autisme", isi: "Ini salah satu pertanyaan yang paling sering menghantui orang tua, dan sains telah menjawabnya berulang kali: penelitian-penelitian besar di banyak negara, dengan jutaan anak, tidak menemukan kaitan antara vaksin dan autisme [ref:cdc-autism]. Menunda imunisasi tidak menurunkan risiko autisme — ia hanya menambah risiko penyakit yang bisa dicegah." },
            { key: "kekuatan", judul: "Melihat anak seutuhnya", isi: "Banyak anak autistik memiliki kekuatan yang nyata: memori yang kuat, ketelitian pada detail, minat yang dalam, dan kejujuran yang menyegarkan. Intervensi dini bukan untuk 'menghapus' siapa dia, melainkan membantunya berkomunikasi, belajar, dan berdaya dengan caranya." },
        ],
        sourceIds: ["mchat-robins", "cdc-autism"],
        status: "review",
        lastReviewed: "2026-07",
    },
    "keterlambatan-bicara": {
        id: "keterlambatan-bicara",
        title: "Keterlambatan bicara: mengenali, mengevaluasi, dan mendukung",
        domainHints: ["DK"],
        stats: [
            { key: "pendengaran-dulu", value: "Pendengaran", label: "pemeriksaan pertama pada setiap keterlambatan bicara", sourceId: "asha" },
        ],
        sections: [
            { key: "pendengaran-dulu", judul: "Periksa pendengaran lebih dulu — selalu", isi: "Mendengar adalah syarat belajar bicara, dan gangguan pendengaran adalah penyebab keterlambatan yang paling bisa ditangani. Bahkan infeksi telinga berulang dapat mengaburkan suara yang bayi dengar [ref:asha]. Karena itu langkah pertama setiap keterlambatan bicara selalu sama: pastikan pendengarannya baik." },
            { key: "late-talker", judul: "Terlambat bicara tidak selalu sama", isi: "Anak yang terlambat berbicara tetapi memahami dengan baik, aktif memakai gestur, dan terhubung secara sosial ('late talker') sebagian besar akan mengejar. Yang risikonya lebih tinggi: bila pemahaman ikut terlambat, gestur minim, atau interaksi sosial terbatas [ref:asha]. Bedanya sulit dipastikan dari rumah — di situlah evaluasi membantu, dan menunggu bukan strategi." },
            { key: "stimulasi-fondasi", judul: "Stimulasi di rumah tetap fondasinya", isi: "Apa pun hasil evaluasi, resep dasarnya sama dan ada di tangan Anda: percakapan bolak-balik yang banyak, membaca bersama setiap hari, memperluas ucapan anak, dan mengurangi layar yang menggantikan interaksi [ref:asha]." },
            { key: "kapan-terapi", judul: "Kapan terapi wicara dipertimbangkan", isi: "Patokan praktis yang lazim dipakai: belum ada kata bermakna menjelang 16–18 bulan, kosakata jauh di bawah 50 kata atau belum menggabungkan dua kata menjelang 24 bulan, ucapan yang tak kunjung dipahami keluarga, atau regresi [ref:asha]. Terapi wicara di usia dini berbentuk bermain — dan sebagian besar 'PR'-nya dikerjakan orang tua di rumah." },
        ],
        sourceIds: ["asha"],
        status: "review",
        lastReviewed: "2026-07",
    },
    "down-syndrome-stimulasi": {
        id: "down-syndrome-stimulasi",
        title: "Down syndrome: stimulasi dini dan dukungan keluarga",
        domainHints: ["DK"],
        stats: [
            { key: "sejak-lahir", value: "Sejak lahir", label: "stimulasi dan fisioterapi dini dapat dimulai pada minggu-minggu pertama", sourceId: "aap-down-syndrome" },
        ],
        sections: [
            { key: "peluang-awal", judul: "Diketahui sejak awal adalah peluang", isi: "Down syndrome umumnya diketahui saat atau segera setelah lahir. Di balik beratnya kabar itu ada satu keuntungan yang nyata: dukungan bisa dimulai dari titik paling awal — tepat ketika otak paling siap dibentuk. Tidak perlu menunggu apa pun untuk mulai." },
            { key: "tonus-fisioterapi", judul: "Tonus otot rendah dan fisioterapi dini", isi: "Sebagian besar bayi dengan Down syndrome memiliki tonus otot yang lebih rendah (hipotonia), sehingga milestone motorik dicapai lebih lambat [ref:aap-down-syndrome]. Fisioterapi yang dimulai dini — ditambah tummy time dan banyak kesempatan bergerak — membantu setiap anak tangga motorik tercapai lebih kokoh." },
            // REVIEW: (Apoteker Raisha) daftar & frasa pemantauan kesehatan penyerta — cocokkan dengan pedoman AAP/IDAI terbaru.
            { key: "kesehatan-penyerta", judul: "Kesehatan penyerta dipantau rutin", isi: "Anak dengan Down syndrome memerlukan pemantauan kesehatan berkala yang lebih terjadwal — antara lain jantung, fungsi tiroid, pendengaran, dan penglihatan — sesuai panduan dokter anak [ref:aap-down-syndrome]. Mintalah jadwal pemeriksaan berkala ini sejak kunjungan-kunjungan pertama; deteksi dini pada aspek-aspek ini sangat mengubah hasil." },
            { key: "jalur-sama", judul: "Jalur yang sama, kecepatan yang berbeda", isi: "Anak dengan Down syndrome melewati milestone yang sama, dengan urutan yang sama — hanya dengan tempo masing-masing. Bandingkan anak dengan dirinya bulan lalu, bukan dengan tabel usia; setiap anak tangga pantas dirayakan penuh." },
            { key: "kekuatan-sosial", judul: "Kekuatan yang bisa diandalkan", isi: "Banyak anak dengan Down syndrome kuat dalam peniruan, kehangatan sosial, dan belajar visual. Isyarat tangan sederhana yang menyertai kata terbukti membantu menjembatani komunikasi sebelum bicara lancar — dan tidak menghambat bicara, justru mendorongnya." },
        ],
        sourceIds: ["aap-down-syndrome"],
        status: "review",
        lastReviewed: "2026-07",
    },
    // ─── Batch DK-2 (2026-07): ADHD, sensorik, dukungan keluarga ─────────────────
    "adhd-atensi-regulasi": {
        id: "adhd-atensi-regulasi",
        title: "ADHD: atensi dan regulasi",
        domainHints: ["DK"],
        figureId: "executive-function",
        sourceIds: ["aap-adhd", "harvard-executive"],
        stats: [
            { key: "usia-4", value: "< 4 thn", label: "gejala yang konsisten dengan ADHD pada anak di bawah 4 tahun memerlukan pengamatan lebih lama sebelum diagnosis ditegakkan", sourceId: "aap-adhd" },
            { key: "berbagai-tempat", value: "≥ 2 setting", label: "gejala ADHD harus muncul di dua situasi atau lebih (mis. rumah dan sekolah) untuk memenuhi kriteria diagnostik", sourceId: "aap-adhd" },
        ],
        sections: [
            { key: "apa-itu-adhd", judul: "Apa itu ADHD dan apa yang bukan", isi: "ADHD adalah kondisi perkembangan otak yang mempengaruhi kemampuan mengatur perhatian, impuls, dan aktivitas [ref:aap-adhd]. Ia bukan akibat pola asuh yang salah, kurang disiplin, atau terlalu banyak layar. Namun banyak perilaku yang tampak seperti ADHD — terutama pada usia 2–5 tahun — adalah variasi perkembangan normal yang membutuhkan observasi panjang, bukan diagnosis cepat." },
            // REVIEW: (Apoteker Raisha) kriteria ≥2 setting dan durasi 6 bulan — verifikasi DSM-5 vs pedoman AAP 2019.
            { key: "kapan-evaluasi", judul: "Kapan evaluasi layak dipertimbangkan", isi: "Perhatikan bila gejala muncul secara konsisten di lebih dari satu situasi (rumah DAN sekolah/TPA), berlangsung lebih dari 6 bulan, dan tampak lebih berat dibandingkan anak usia dan tingkat perkembangan yang sama [ref:aap-adhd]. Satu lingkungan yang terlalu kaku atau terlalu merangsang bisa meniru gejala — konteks penting dibaca sebelum kesimpulan apa pun." },
            { key: "yang-bisa-sekarang", judul: "Yang bisa dilakukan orang tua sekarang", isi: "Fungsi eksekutif — yang menjadi tantangan utama pada ADHD — tumbuh melalui bermain bebas, rutinitas yang dapat diprediksi, instruksi singkat satu langkah, dan co-regulation bersama orang tua yang tenang [ref:harvard-executive]. Lingkungan yang terstruktur longgar (bukan kaku) membantu otak yang aktif berkembang tanpa terlalu banyak gesekan." },
            { key: "stigma-bukan-kelemahan", judul: "ADHD bukan kelemahan karakter", isi: "Anak dengan ADHD sering memiliki energi tinggi, kreativitas luar biasa, dan kemampuan hyperfocus pada topik yang mereka sukai. Diagnosis yang tepat waktu membuka akses ke dukungan yang tepat — bukan sekadar label, tetapi peta untuk menemukan cara belajar yang sesuai dengan otak unik mereka [ref:aap-adhd]." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    "sensorik-regulasi": {
        id: "sensorik-regulasi",
        title: "Pemrosesan sensorik dan regulasi",
        domainHints: ["DK"],
        figureId: "sensorik-hiper-hipo",
        sourceIds: ["sensorik-ot"],
        stats: [
            { key: "hiper-hipo", value: "Hiper / Hipo", label: "dua pola utama pemrosesan sensorik berbeda: hiper-reaktif (mudah terganggu rangsangan) dan hipo-reaktif (kurang merespons rangsangan)", sourceId: "sensorik-ot" },
        ],
        sections: [
            { key: "apa-itu-sensorik", judul: "Apa itu integrasi sensorik", isi: "Setiap detik otak menerima ribuan sinyal sensorik — sentuhan, suara, gerakan, cahaya, rasa — dan tugasnya adalah mengorganisasi semua itu menjadi respons yang tepat [ref:sensorik-ot]. Bila sistem ini tidak berjalan mulus, anak bisa terlihat 'terlalu sensitif', 'tidak peka', atau tampak tidak mau berpartisipasi — bukan karena keras kepala, tapi karena dunianya terasa berbeda." },
            { key: "hiper-reaktif", judul: "Hiper-reaktif: dunia yang terasa terlalu keras", isi: "Anak hiper-reaktif merespons rangsangan biasa lebih intens: suara kipas angin bisa terasa menyiksa, label baju terasa menggigit, keramaian memicu meltdown [ref:sensorik-ot]. Ini bukan lebay — ambang batas sensoriknya memang lebih rendah. Strategi: minimalkan overload, beri peringatan sebelum transisi, kenalkan rangsangan baru secara bertahap." },
            { key: "hipo-reaktif", judul: "Hipo-reaktif: mencari rangsangan lebih", isi: "Anak hipo-reaktif membutuhkan input sensorik lebih besar untuk merasa 'terdaftar': mereka membentur dinding, berputar terus, memasukkan benda ke mulut jauh melewati usianya [ref:sensorik-ot]. Ini bukan kenakalan — otaknya sedang mencari rangsangan yang cukup. Sediakan 'pojok sensorik' yang aman: bantal berat, trampolin kecil, permainan tekstur." },
            { key: "kapan-konsultasi", judul: "Kapan konsultasi terapis okupasi", isi: "Bila kesulitan sensorik mengganggu keseharian — makan, tidur, berpakaian, bermain bersama — evaluasi dengan terapis okupasi yang terlatih integrasi sensorik layak dipertimbangkan [ref:sensorik-ot]. Terapis dapat merancang 'diet sensorik': jadwal aktivitas harian yang menyeimbangkan sistem saraf anak. Variasi sensorik luas dan bukan otomatis butuh terapi — konteks dan dampaknya yang menentukan." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    "penerimaan-dukungan-ortu": {
        id: "penerimaan-dukungan-ortu",
        title: "Penerimaan dan dukungan untuk orang tua ABK",
        domainHints: ["DK"],
        sourceIds: ["riset-keluarga-abk"],
        stats: [
            { key: "bergelombang", value: "Tidak linear", label: "perjalanan penerimaan orang tua ABK bersifat bergelombang — bukan tahapan linier yang harus diselesaikan sebelum bisa bergerak maju", sourceId: "riset-keluarga-abk" },
        ],
        sections: [
            { key: "perasaan-valid", judul: "Semua perasaan itu valid", isi: "Menerima kabar bahwa anak memiliki kebutuhan khusus bisa datang dengan gelombang: syok, sedih, marah, bingung, lega karena akhirnya ada nama, dan harapan — semua bisa hadir bergantian, bahkan pada hari yang sama [ref:riset-keluarga-abk]. Tidak ada urutan yang 'benar'. Izinkan diri merasakan semuanya tanpa menghakimi jadwalnya sendiri." },
            { key: "ortu-sebagai-ahli", judul: "Orang tua adalah ahli tentang anaknya", isi: "Tenaga profesional memiliki pengetahuan tentang kondisinya — orang tua memiliki pengetahuan tentang anaknya secara spesifik [ref:riset-keluarga-abk]. Kolaborasi keduanya menghasilkan rencana terbaik. Percayai observasi Anda; Anda yang paling tahu kapan anak dalam kondisi terbaik, apa yang menenangkan, dan apa yang memperkeruh." },
            { key: "jaringan-dukungan", judul: "Jaringan dukungan itu kekuatan, bukan kelemahan", isi: "Keluarga yang memiliki jaringan dukungan — baik dari keluarga besar, komunitas orang tua ABK, atau konselor — cenderung lebih lama bertahan dan lebih efektif mengadvokasi kebutuhan anak [ref:riset-keluarga-abk]. Mencari dukungan bukan berarti tidak mampu; ia berarti Anda memahami bahwa merawat anak berkebutuhan khusus adalah pekerjaan tim." },
            { key: "jaga-diri-sendiri", judul: "Menjaga diri bukan kemewahan", isi: "Kelelahan pengasuh (caregiver burnout) nyata dan berdampak langsung pada kualitas pengasuhan [ref:riset-keluarga-abk]. Tidur cukup, waktu untuk diri sendiri, dan koneksi sosial bukan egois — mereka adalah fondasi agar Anda bisa hadir secara penuh untuk anak Anda hari demi hari. Minta bantuan adalah strategi, bukan kegagalan." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
    "kebutuhan-tidur": {
        id: "kebutuhan-tidur",
        title: "Kebutuhan tidur per usia",
        domainHints: ["KS"],
        sourceIds: ["aap-aasm-sleep"],
        stats: [
            { key: "tidur-0-3m", value: "14–17 jam", label: "kebutuhan tidur per 24 jam bayi 0–3 bulan", sourceId: "aap-aasm-sleep" },
            { key: "tidur-4-12m", value: "12–16 jam", label: "kebutuhan tidur per 24 jam untuk bayi 4–12 bulan (termasuk tidur siang)", sourceId: "aap-aasm-sleep" },
            { key: "tidur-1-2y", value: "11–14 jam", label: "kebutuhan tidur per 24 jam untuk anak 1–2 tahun (termasuk tidur siang)", sourceId: "aap-aasm-sleep" },
            { key: "tidur-3-5y", value: "10–13 jam", label: "kebutuhan tidur per 24 jam usia 3–5 tahun (termasuk tidur siang)", sourceId: "aap-aasm-sleep" },
        ],
        sections: [
            { key: "rentang", judul: "Rentang tidur sesuai usia", isi: "Kebutuhan tidur menurun bertahap: bayi baru lahir 14–17 jam, bayi 4–12 bulan 12–16 jam, usia 1–2 tahun 11–14 jam, dan usia 3–5 tahun 10–13 jam per 24 jam, termasuk tidur siang [ref:aap-aasm-sleep]. Rentang ini panduan, bukan target kaku — perhatikan juga kesegaran anak di siang hari." },
            { key: "transisi-nap", judul: "Transisi berhenti tidur siang", isi: "Banyak anak berhenti tidur siang secara bertahap antara usia 3–5 tahun. Tandanya: sulit tidur siang tetapi tetap segar sampai sore, dan tidur malam tidak terganggu. Saat transisi, 'waktu tenang' (berbaring dengan buku) bisa menggantikan tidur siang." },
            { key: "higiene", judul: "Higiene tidur sederhana", isi: "Jam tidur yang konsisten, ritual pendek yang sama setiap malam (mis. sikat gigi → buku → lampu redup), kamar yang tenang, dan tanpa layar setidaknya satu jam sebelum tidur — kombinasi sederhana ini menyelesaikan sebagian besar masalah tidur balita." },
            { key: "tidur-emosi", judul: "Tidur adalah 'baterai' regulasi emosi", isi: "Kurang tidur tampil sebagai tantrum, rewel, dan sulit fokus — sering disalahartikan sebagai masalah perilaku. Bila emosi anak memburuk, jadwal tidur adalah hal pertama yang layak diperiksa." },
        ],
        status: "review",
        lastReviewed: "2026-07",
    },
};
//# sourceMappingURL=modules.js.map