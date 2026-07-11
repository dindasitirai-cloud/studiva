// ============================================================================
// Studiva Digital, Resource Library : data 60 kartu (Model A)
// Ringkasan (2 menit) lengkap untuk seluruh 60 kartu.
// Detail ilmiah PENUH untuk rentang 0–3 bulan (6 kartu) sebagai acuan.
// Kartu lain: scientific.paragraphs kosong + TODO → diisi per batch (dengan review).
// CATATAN UI: sembunyikan tombol "Detail ilmiah terkait ini" bila
//   scientific.paragraphs.length === 0.
// Konten sudah divalidasi terhadap sumber; jangan mengubah kalimat tanpa review.
// ============================================================================

import { Activity, Lightbulb, MessageCircle, Heart, Stethoscope, Puzzle, LucideIcon } from 'lucide-react';

export type DomainCode = "FM" | "KG" | "BH" | "SE" | "KS" | "PS";
export type AgeKey =
  | "0-3m" | "3-6m" | "6-9m" | "9-12m" | "12-18m" | "18-24m"
  | "2-3y" | "3-4y" | "4-5y" | "5-6y";

export interface ScientificStat {
  value: string;
  label: string;
  ref?: number;
}

export interface ScientificSection {
  judul: string;
  isi: string;
}

export interface ScientificReference {
  n: number;
  text: string;
  url?: string;
}

export interface ScientificFigure {
  id: string;
  caption: string;
  afterSectionIndex?: number;
}

export interface KnowledgeCard {
  id: string;
  ageKey: AgeKey;
  domain: DomainCode;
  title: string;
  photo: { src: string; alt: string; credit?: string };
  readMinutes: number;
  summary: {
    terjadi: string;
    penting: string;
    lakukan: string[];
    perhatian: string;
  };
  isMedical?: boolean;
  scientific: {
    title: string;
    readMinutes?: number;
    /** Badge: reviewed by whom and when */
    reviewedBy?: { name: string; date: string };
    /** Key statistics callout (2–3 items) */
    stats?: ScientificStat[];
    /** Inline diagram to insert after a section */
    figure?: ScientificFigure;
    /** Structured sections with numbered citation markers like [n] */
    sections?: ScientificSection[];
    /** Numbered reference list */
    references?: ScientificReference[];
    /** Legacy fallback, still rendered if sections is absent/empty */
    paragraphs?: string[];
  };
  sources: string[];
  adminStatus?: 'draft' | 'published'; // undefined = published (backward compat)
}

export const AGE_RANGES: { key: AgeKey; label: string; fill: string; ink: string }[] = [
  { key: "0-3m",   label: "0–3 bulan",   fill: "#FAEEDA", ink: "#633806" },
  { key: "3-6m",   label: "3–6 bulan",   fill: "#E1F5EE", ink: "#085041" },
  { key: "6-9m",   label: "6–9 bulan",   fill: "#E6F1FB", ink: "#0C447C" },
  { key: "9-12m",  label: "9–12 bulan",  fill: "#FBEAF0", ink: "#72243E" },
  { key: "12-18m", label: "12–18 bulan", fill: "#EEEDFE", ink: "#3C3489" },
  { key: "18-24m", label: "18–24 bulan", fill: "#EAF3DE", ink: "#27500A" },
  { key: "2-3y",   label: "2–3 tahun",   fill: "#F1EFE8", ink: "#444441" },
  { key: "3-4y",   label: "3–4 tahun",   fill: "#FAECE7", ink: "#712B13" },
  { key: "4-5y",   label: "4–5 tahun",   fill: "#FCEBEB", ink: "#791F1F" },
  { key: "5-6y",   label: "5–6 tahun",   fill: "#CECBF6", ink: "#26215C" },
];

export const DOMAIN_MAP: Record<DomainCode, { label: string; icon: LucideIcon; bg: string; fg: string }> = {
  FM: { label: "Fisik & Motorik",        icon: Activity,      bg: "#FAEEDA", fg: "#633806" },
  KG: { label: "Kognitif",               icon: Lightbulb,     bg: "#F1EFE8", fg: "#444441" },
  BH: { label: "Bahasa & Komunikasi",    icon: MessageCircle, bg: "#E1F5EE", fg: "#0F6E56" },
  SE: { label: "Sosial-Emosional",       icon: Heart,         bg: "#FBEAF0", fg: "#72243E" },
  KS: { label: "Kesehatan & Gizi",       icon: Stethoscope,   bg: "#E6F1FB", fg: "#0C447C" },
  PS: { label: "Pengasuhan & Stimulasi", icon: Puzzle,        bg: "#EEEDFE", fg: "#3C3489" },
};

export const SUMMARY_LABEL_STYLES = {
  terjadi: { text: "Yang biasa terjadi di usia ini", bg: "#FAEEDA", fg: "#633806" },
  penting:  { text: "Kenapa penting",                bg: "#E1F5EE", fg: "#0F6E56" },
  lakukan:  { text: "Yang bisa Anda lakukan",        bg: "#E6F1FB", fg: "#185FA5" },
};

const P = (id: string, alt: string, credit = "Unsplash") => ({ src: `/images/rl/${id}.jpg`, alt, credit });

export const CARDS: KnowledgeCard[] = [

  // ===================== 0–3 BULAN (detail ilmiah PENUH) =====================
  {
    id: "RL-0-3m-FM", ageKey: "0-3m", domain: "FM", title: "Tummy time: menegakkan kepala",
    photo: { src: "", alt: "Tummy time: menegakkan kepala" }, readMinutes: 2,
    summary: {
      terjadi: "Otot leher dan bahu bayi menguat. Saat tengkurap dalam keadaan bangun, ia mulai mengangkat kepala; tangannya sering dibawa ke mulut.",
      penting: "Tummy time membangun kekuatan untuk berguling, duduk, dan merangkak, sekaligus mencegah kepala peyang. Prinsipnya: \"back to sleep, tummy to play\".",
      lakukan: ["Mulai 3–5 menit, 2–3 kali sehari saat bayi bangun & diawasi.", "Turun ke lantai; ajak bicara sejajar matanya.", "Pakai mainan kontras atau cermin bayi.", "Jika menolak, coba di dada Anda sambil berbaring."],
      perhatian: "Menjelang 3 bulan kepala belum terangkat sama sekali, atau tubuh sangat kaku/lemas."
    },
    scientific: {
      title: "Mengapa gerakan membangun otak, bukan hanya otot",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 1 },
        { value: ">50%", label: "penurunan tajam angka SIDS sejak kampanye 'tidur telentang' (1990-an)", ref: 2 },
      ],
      figure: { id: "motor-sequence", caption: "Arah perkembangan gerak: dari kepala ke kaki", afterSectionIndex: 0 },
      sections: [
        { judul: "Perkembangan yang berurutan", isi: "Kendali tubuh berkembang dari atas ke bawah, bayi menguasai kepala lebih dulu, lalu bahu, badan, dan kaki. Gerak juga berkembang dari tengah tubuh ke arah luar: bahu dulu, baru jari-jari halus. Menegakkan kepala saat tummy time adalah anak tangga pertama menuju berguling, duduk, dan berjalan." },
        { judul: "Mengapa tummy time penting", isi: "Sejak kampanye tidur telentang pada 1990-an berhasil menurunkan angka kematian bayi mendadak (SIDS) secara tajam [2], bayi menghabiskan lebih banyak waktu telentang. Sebagian lalu mengalami kepala peyang dan otot leher yang lebih lambat menguat. Waktu tengkurap saat bangun mengimbangi hal ini, prinsipnya 'back to sleep, tummy to play'." },
        { judul: "Gerak adalah cara belajar", isi: "Menurut Piaget, bayi di tahun pertama berada pada tahap sensorimotor: ia membangun pemahaman tentang dunia lewat indra dan gerak [3]. Saat mengangkat kepala atau meraih mainan, bayi mengumpulkan informasi tentang jarak, keseimbangan, dan tubuhnya sendiri, bagian dari lebih dari sejuta koneksi saraf yang terbentuk tiap detik [1]." },
        { judul: "Batasi alat penyangga", isi: "Beri bayi banyak waktu bergerak bebas di alas aman, dan jangan terlalu lama menaruhnya di kursi pantul atau ayunan. Baby walker tidak dianjurkan karena berisiko cedera dan tidak membantu bayi belajar berjalan [4]." },
        { judul: "Rentang normal itu lebar", isi: "Sebagian bayi berguling di usia 4 bulan, sebagian di usia 6 bulan, keduanya normal [4]. Yang penting bukan mengejar tanggal milestone, melainkan memberi kesempatan bergerak setiap hari." },
      ],
      references: [
        { n: 1, text: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
        { n: 2, text: "CDC / AAP, Back to Sleep dan penurunan SIDS.", url: "https://www.cdc.gov/sids/" },
        { n: 3, text: "Jean Piaget, tahap sensorimotor." },
        { n: 4, text: "American Academy of Pediatrics, HealthyChildren.org; CDC Learn the Signs.", url: "https://www.healthychildren.org" },
      ],
    },
    sources: ["AAP HealthyChildren.org", "CDC Learn the Signs. Act Early."]
  },
  {
    id: "RL-0-3m-KG", ageKey: "0-3m", domain: "KG", title: "Menatap & mengikuti: indra yang sedang belajar",
    photo: P("0-3m-kg", "Bayi menatap wajah ibu dari dekat"), readMinutes: 2,
    summary: {
      terjadi: "Bayi menatap wajah dengan lekat, mulai mengikuti benda bergerak dengan mata, dan menyukai pola kontras tinggi (hitam-putih).",
      penting: "Ini tahap sensorimotor (Piaget): bayi membangun pemahaman dunia lewat indra. Menatap wajah adalah pelajaran pertamanya.",
      lakukan: ["Dekatkan wajah pada jarak ±20–30 cm.", "Gerakkan mainan perlahan kiri–kanan untuk melatih mengikuti.", "Sediakan gambar atau mainan kontras tinggi."],
      perhatian: "Di usia 2–3 bulan mata tidak mengikuti benda bergerak, atau bayi tidak pernah menatap wajah."
    },
    scientific: {
      title: "Bagaimana bayi belajar lewat mata dan indra",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "20–30 cm", label: "jarak fokus terbaik bayi baru lahir, persis jarak wajah pengasuh", ref: 1 },
        { value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "focus-distance", caption: "Jarak fokus bayi baru lahir kira-kira sejauh wajah Anda saat menggendong", afterSectionIndex: 0 },
      sections: [
        { judul: "Penglihatan yang belum matang", isi: "Penglihatan adalah indra yang paling belum matang saat lahir. Bayi baru lahir hanya bisa memfokuskan pandangan pada jarak sekitar 20–30 cm [1], persis jarak wajah Anda saat menggendong atau menyusui. Alam seolah merancang agar hal pertama yang jelas ia lihat adalah wajah manusia." },
        { judul: "Melatih mata mengikuti", isi: "Di bulan-bulan pertama, otak bayi berlatih menggerakkan kedua mata secara terkoordinasi untuk mengikuti benda bergerak. Kemampuan ini menjadi dasar perhatian dan kelak koordinasi mata-tangan. Pola kontras tinggi paling mudah ditangkap otak yang sedang belajar melihat." },
        { judul: "Tahap sensorimotor", isi: "Menurut Piaget, bayi membangun pengetahuan langsung dari indra dan gerak, bukan dari kata [3]. Setiap tatapan, sentuhan, dan suara adalah 'data' yang otaknya kumpulkan, bagian dari lebih dari sejuta koneksi saraf yang terbentuk tiap detik [2]." },
        { judul: "Stimulasi terbaik itu sederhana", isi: "Stimulasi paling bermakna di usia ini bukan mainan mahal atau layar, melainkan wajah Anda, suara Anda, dan benda nyata yang bisa diamati. Menggerakkan mainan perlahan atau mengganti posisi gendong memberi 'pemandangan' baru untuk dipelajari." },
        { judul: "Kapan perlu perhatian", isi: "Bila menjelang 3 bulan mata bayi tidak pernah mengikuti benda atau menatap wajah, sampaikan ke dokter. Otak visual berkembang paling pesat di tahun pertama, sehingga deteksi dini sangat penting [4]." },
      ],
      references: [
        { n: 1, text: "American Academy of Pediatrics, perkembangan penglihatan bayi.", url: "https://www.healthychildren.org" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
        { n: 3, text: "Jean Piaget, tahap sensorimotor." },
        { n: 4, text: "CDC, Learn the Signs. Act Early.", url: "https://www.cdc.gov/act-early/" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "Jean Piaget (sensorimotor)"]
  },
  {
    id: "RL-0-3m-BH", ageKey: "0-3m", domain: "BH", title: "Cooing: obrolan pertama sebelum kata",
    photo: P("0-3m-bh", "Ibu mengajak bayi bicara"), readMinutes: 2,
    summary: {
      terjadi: "Sekitar 6–8 minggu bayi mengeluarkan suara lembut \"ooh/aah\" (cooing), menoleh ke sumber suara, dan tenang mendengar suara familiar.",
      penting: "Otak bahasa dibangun sebelum kata pertama. Menanggapi suara bayi memperkuat jalur bahasa; makin banyak kata yang ia dengar dalam interaksi hangat, makin kaya bahasanya kelak.",
      lakukan: ["Ajak bicara sepanjang hari; narasikan aktivitas.", "Tirukan cooing-nya lalu beri jeda untuk \"giliran\"-nya.", "Gunakan nada \"parentese\" yang lembut & ekspresif.", "Nyanyikan lagu dan bacakan buku."],
      perhatian: "Menjelang 3 bulan bayi tidak bereaksi pada suara keras, tidak bersuara, atau tidak menoleh ke suara."
    },
    scientific: {
      title: "Bagaimana bahasa tumbuh jauh sebelum kata pertama",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 1 },
        { value: "Reseptif → ekspresif", label: "kemampuan memahami tumbuh lebih dulu daripada bicara", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Percakapan bergantian (serve & return) memperkuat jalur bahasa", afterSectionIndex: 2 },
      sections: [
        { judul: "Bahasa dimulai sejak lahir", isi: "Meski belum bisa bicara, otak bayi sudah mempelajari bahasa sejak hari pertama, bahkan sejak dalam kandungan, saat mengenali irama suara ibunya. Kemampuan memahami (bahasa reseptif) selalu tumbuh lebih dulu daripada kemampuan bicara [2]." },
        { judul: "Bayi si ahli statistik", isi: "Dari lautan suara yang ia dengar, otak bayi diam-diam menghitung pola: bunyi mana yang sering muncul bersama, di mana satu kata berakhir. Semakin sering dan kaya bahasa yang ia dengar dalam interaksi nyata, semakin banyak bahan untuk otaknya mengurai pola itu [1]." },
        { judul: "Belajar dari manusia, bukan layar", isi: "Bayi belajar bahasa dari orang, bukan dari layar. Dalam banyak penelitian, bayi yang mendengar bahasa dari orang sungguhan bisa mempelajarinya, sementara yang mendengar dari video hampir tidak belajar apa pun, fenomena 'video deficit' [3]. Bayi butuh tatapan, giliran bicara, dan tanggapan hangat." },
        { judul: "Cara bicara Anda berpengaruh", isi: "Nada tinggi, lambat, dan ekspresif ('parentese') membantu bayi memisahkan kata dan memperhatikan lebih lama [3]. Menirukan ocehannya lalu memberi jeda mengajarkan pola dasar percakapan: bergantian bicara." },
        { judul: "Kualitas kata & pendengaran", isi: "Banyaknya kata yang bayi dengar di tahun awal berkaitan dengan kosakata dan kesiapan sekolahnya kelak. Mendengar dengan baik adalah syarat bicara; bila bayi tampak tak merespons suara, pemeriksaan pendengaran dini sangat membantu [4]." },
      ],
      references: [
        { n: 1, text: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
        { n: 2, text: "American Speech-Language-Hearing Association (ASHA).", url: "https://www.asha.org" },
        { n: 3, text: "Riset infant-directed speech & 'video deficit' (mis. Kuhl dkk.)." },
        { n: 4, text: "CDC, Learn the Signs. Act Early.", url: "https://www.cdc.gov/act-early/" },
      ],
    },
    sources: ["ASHA (American Speech-Language-Hearing Association)", "CDC Learn the Signs. Act Early."]
  },
  {
    id: "RL-0-3m-SE", ageKey: "0-3m", domain: "SE", title: "Senyum sosial & rasa aman",
    photo: P("0-3m-se", "Ibu dan bayi saling tersenyum"), readMinutes: 2,
    summary: {
      terjadi: "Antara minggu ke-6 hingga ke-8 muncul senyum sosial, senyuman yang membalas wajah dan suara Anda, bukan refleks. Bayi menatap mata lebih lama dan tenang saat digendong.",
      penting: "Interaksi bolak-balik (\"serve & return\") membentuk fondasi otak sosial dan emosi bayi. Menanggapi kebutuhannya secara konsisten membangun rasa aman, dan ingat, bayi baru lahir tidak bisa \"dimanja\".",
      lakukan: ["Tanggapi tangis dengan cepat dan tenang.", "Balas senyum dan lakukan kontak mata.", "Tirukan suaranya, beri jeda untuk \"giliran\"-nya.", "Perbanyak kontak kulit (skin-to-skin)."],
      perhatian: "Menjelang 3 bulan tidak ada senyum sosial, tidak ada kontak mata, atau bayi sangat sulit ditenangkan."
    },
    scientific: {
      title: "Bagaimana rasa aman membentuk otak bayi",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 1 },
        { value: "90%", label: "ukuran otak dewasa sudah tercapai pada usia 5 tahun", ref: 2 },
        { value: "±50–60%", label: "bayi membentuk kelekatan aman saat pengasuhan responsif", ref: 3 },
      ],
      figure: { id: "serve-return", caption: "Siklus serve & return yang memperkuat arsitektur otak", afterSectionIndex: 1 },
      sections: [
        { judul: "Otak dibangun oleh pengalaman", isi: "Otak bayi tidak lahir dalam keadaan selesai. Ia dibangun bertahap setelah lahir, dengan lebih dari satu juta koneksi saraf baru terbentuk setiap detik pada tahun-tahun awal [1], hingga mencapai sekitar 90% ukuran otak dewasa pada usia 5 tahun [2]. Pengalaman sehari-hari, terutama interaksi dengan pengasuh, menentukan koneksi mana yang menguat dan mana yang dipangkas." },
        { judul: "Mekanisme: serve & return", isi: "Harvard Center on the Developing Child menjelaskan mekanisme utamanya sebagai serve and return [1]: pertukaran bolak-balik antara bayi dan pengasuh. Ketika bayi memberi sinyal dan pengasuh menanggapi secara konsisten, sirkuit saraf untuk bahasa, regulasi emosi, dan hubungan sosial menguat. Ketiadaan respons yang berkepanjangan justru mengaktifkan sistem stres tubuh dan dapat mengganggu proses ini [1]." },
        { judul: "Bukti: responsivitas & kelekatan aman", isi: "Penelitian klasik Ainsworth melalui prosedur Strange Situation menunjukkan bayi yang pengasuhnya responsif dan konsisten lebih mungkin mengembangkan kelekatan aman [3]. Meta-analisis lintas budaya memperkirakan sekitar separuh hingga dua pertiga bayi tergolong kelekatan aman, dengan responsivitas pengasuh sebagai salah satu prediktor terkuatnya [3]. Erikson menempatkan periode ini sebagai tahap trust vs mistrust, pembentukan rasa percaya dasar [4]." },
        { judul: "Menjawab miskonsepsi umum", isi: "Apakah menanggapi setiap tangisan akan memanjakan bayi? Bukti perkembangan menunjukkan tidak, setidaknya pada tahun pertama. Pada bayi, menangis adalah sinyal kebutuhan, bukan manipulasi; respons yang konsisten membangun rasa aman yang menjadi fondasi kemandirian, bukan ketergantungan [5]." },
        { judul: "Implikasi praktis", isi: "Temuan ini menyederhanakan menjadi satu prinsip: interaksi hangat dan responsif sehari-hari, menanggapi tangis, membalas tatapan, meniru suara, adalah bentuk stimulasi paling bermakna. Yang dibutuhkan bukan kesempurnaan, melainkan respons yang cukup sering dan cukup hangat [5]." },
      ],
      references: [
        { n: 1, text: "Center on the Developing Child, Harvard University. Brain Architecture & Serve and Return.", url: "https://developingchild.harvard.edu/key-concepts/serve-and-return/" },
        { n: 2, text: "Center on the Developing Child, otak mencapai ~90% ukuran dewasa pada usia 5.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
        { n: 3, text: "Ainsworth, M. D. S. (1978); van IJzendoorn & Kroonenberg (1988), distribusi kelekatan lintas budaya.", url: "https://www.simplypsychology.org/mary-ainsworth.html" },
        { n: 4, text: "Erikson, E. H. Childhood and Society, trust vs mistrust." },
        { n: 5, text: "American Academy of Pediatrics, Responsive caregiving.", url: "https://www.healthychildren.org" },
      ],
    },
    sources: ["Harvard Center on the Developing Child", "Ainsworth & Bowlby (attachment)", "Erik Erikson", "AAP HealthyChildren.org"]
  },
  {
    id: "RL-0-3m-KS", ageKey: "0-3m", domain: "KS", title: "Tidur aman & menyusu di bulan pertama",
    photo: P("0-3m-ks", "Bayi tidur telentang di boks"), readMinutes: 2, isMedical: true,
    summary: {
      terjadi: "Bayi tidur 14–17 jam per 24 jam dalam potongan pendek dan menyusu sering (ASI 8–12 kali sehari, sesuai permintaan). Pola tidur teratur belum terbentuk, ini normal.",
      penting: "Posisi & lingkungan tidur yang aman menurunkan risiko SIDS hingga ~50%. ASI eksklusif direkomendasikan untuk 6 bulan pertama. (Edukatif, bukan pengganti nasihat dokter.)",
      lakukan: ["Selalu tidurkan telentang di alas datar & keras, tanpa bantal/selimut/boneka.", "Room-sharing: kamar sama, kasur terpisah, minimal 6 bulan.", "Susui sesuai permintaan; hindari asap rokok & kepanasan."],
      perhatian: "Demam ≥38°C, malas menyusu, kuning menyebar, napas cepat/sesak, atau popok basah <6x/hari, segera ke dokter."
    },
    scientific: {
      title: "Mengapa tidur telentang dan ASI melindungi bayi",
      readMinutes: 7,
      reviewedBy: { name: "Apoteker Raisha", date: "2026-07" },
      stats: [
        { value: "~50%", label: "penurunan risiko SIDS dengan tidur sekamar (kasur terpisah)", ref: 1 },
        { value: "6 bln", label: "durasi ASI eksklusif yang direkomendasikan WHO", ref: 2 },
        { value: ">50%", label: "penurunan tajam angka SIDS sejak kampanye 'tidur telentang'", ref: 3 },
      ],
      figure: { id: "safe-sleep-abc", caption: "Prinsip tidur aman: sendiri, telentang, di boks (Alone, Back, Crib)", afterSectionIndex: 1 },
      sections: [
        { judul: "Tidur telentang menyelamatkan nyawa", isi: "Rekomendasi menidurkan bayi telentang adalah salah satu keberhasilan kesehatan masyarakat terbesar. Sejak kampanye 'back to sleep' pada 1990-an, angka SIDS turun tajam di banyak negara [3]. Posisi telentang menjaga jalan napas tetap terbuka." },
        { judul: "Lingkungan tidur yang aman", isi: "Alas datar dan keras tanpa bantal, selimut tebal, bumper, atau boneka mencegah tersumbatnya napas dan kepanasan. Tidur sekamar dengan orang tua namun di kasur terpisah menurunkan risiko SIDS hingga sekitar 50% [1], sekaligus memudahkan menyusui malam hari." },
        { judul: "ASI eksklusif 6 bulan", isi: "ASI eksklusif dianjurkan untuk 6 bulan pertama karena memberi gizi ideal sekaligus antibodi pelindung [2]. Menyusui sesuai permintaan sesuai dengan lambung bayi yang kecil, dan dikaitkan dengan penurunan risiko SIDS." },
        { judul: "Pola tidur bayi baru", isi: "Total tidur 14–17 jam sehari dalam potongan pendek adalah normal, karena bayi perlu sering menyusu. Pola akan matang seiring waktu; jangan memaksa jadwal tidur di minggu-minggu awal." },
        { judul: "Kapan menghubungi dokter", isi: "Segera hubungi tenaga kesehatan bila bayi demam ≥38°C, malas menyusu, tampak sangat kuning, napas cepat/sesak, atau popok basah kurang dari 6 kali sehari. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter." },
      ],
      references: [
        { n: 1, text: "AAP, Sleep-Related Infant Deaths: Updated 2022 Recommendations.", url: "https://publications.aap.org/pediatrics/article/150/1/e2022057990/188304/" },
        { n: 2, text: "WHO / UNICEF, Breastfeeding.", url: "https://www.who.int/health-topics/breastfeeding" },
        { n: 3, text: "CDC, Sudden Infant Death Syndrome.", url: "https://www.cdc.gov/sids/" },
      ],
    },
    sources: ["AAP Safe Sleep 2022", "WHO / UNICEF (ASI eksklusif)", "IDAI", "Kemenkes RI, Buku KIA"]
  },
  {
    id: "RL-0-3m-PS", ageKey: "0-3m", domain: "PS", title: "Stimulasi lewat interaksi (tanpa layar)",
    photo: P("0-3m-ps", "Ibu membacakan buku untuk bayi"), readMinutes: 2,
    summary: {
      terjadi: "Bayi belajar paling banyak dari interaksi manusia, bukan mainan mahal. Otaknya berkembang lewat 'serve & return' harian.",
      penting: "Harvard: interaksi responsif membentuk arsitektur otak. AAP menganjurkan hindari layar untuk bayi di bawah 18–24 bulan (kecuali video call).",
      lakukan: ["Bacakan buku/ceritakan gambar meski belum paham.", "Beri kesempatan bergerak bebas di alas aman (Montessori).", "Bicara & bernyanyi saat rutinitas; jauhkan dari layar."],
      perhatian: "Bila caregiver merasa kewalahan atau tertekan terus-menerus, cari dukungan; kesejahteraan pengasuh memengaruhi bayi."
    },
    scientific: {
      title: "Mengapa interaksi mengalahkan gadget di tahun pertama",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "18–24 bln", label: "usia minimal sebelum layar dianjurkan (kecuali video call)", ref: 1 },
        { value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Interaksi bolak-balik sehari-hari membangun arsitektur otak", afterSectionIndex: 1 },
      sections: [
        { judul: "Kurikulum terbaik: interaksi", isi: "Di tahun pertama, 'kurikulum' terbaik bagi bayi bukan aplikasi atau mainan elektronik, melainkan interaksi hangat sehari-hari. Otak bayi dirancang untuk belajar dari manusia, wajah yang menanggapi, suara yang membalas, sentuhan yang menenangkan." },
        { judul: "Serve & return membangun otak", isi: "Harvard Center on the Developing Child menyebut interaksi bolak-balik (serve & return) sebagai bahan bangunan arsitektur otak [2]. Setiap kali Anda menanggapi ocehan atau tangis bayi, Anda memperkuat jalur otaknya untuk bahasa, emosi, dan hubungan. Rutinitas biasa, mengganti popok, memandikan, adalah kesempatan emas untuk berbicara dan bernyanyi." },
        { judul: "Mengapa hindari layar", isi: "AAP menganjurkan menghindari layar (TV, ponsel, tablet) untuk bayi di bawah 18–24 bulan, kecuali panggilan video dengan keluarga [1]. Bayi belum bisa belajar dari layar seperti dari manusia, dan waktu layar menggantikan waktu interaksi yang jauh lebih bernilai." },
        { judul: "Kebebasan bergerak", isi: "Sejalan dengan pendekatan Montessori, beri bayi kebebasan bergerak di lingkungan aman dan amati apa yang menarik minatnya. Anda tak perlu terus menstimulasi; mengikuti isyaratnya adalah bentuk stimulasi yang paling menghormati perkembangannya." },
        { judul: "Kesejahteraan Anda penting", isi: "Bayi menyerap suasana emosi pengasuhnya. Merawat diri dan mencari dukungan saat kewalahan bukan kemewahan, melainkan kebutuhan yang berdampak langsung pada bayi." },
      ],
      references: [
        { n: 1, text: "American Academy of Pediatrics, Media and Young Minds (screen time).", url: "https://www.healthychildren.org" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Serve and Return.", url: "https://developingchild.harvard.edu/key-concepts/serve-and-return/" },
      ],
    },
    sources: ["Harvard Center on the Developing Child", "AAP (screen time)", "Maria Montessori"]
  },

  // ===================== 3–6 BULAN =====================
  {
    id: "RL-3-6m-FM", ageKey: "3-6m", domain: "FM", title: "Berguling & meraih",
    photo: P("3-6m-fm", "Bayi berguling dan meraih mainan"), readMinutes: 2,
    summary: {
      terjadi: "Kontrol kepala mantap; bayi mulai berguling, menahan kepala saat didudukkan, serta meraih dan menggenggam benda lalu membawanya ke mulut.",
      penting: "Gerakan ini menguatkan otot untuk duduk dan melatih koordinasi mata-tangan.",
      lakukan: ["Perpanjang tummy time; taruh mainan sedikit di luar jangkauan.", "Beri benda ringan yang mudah digenggam.", "Jangan tinggalkan di tempat tinggi, bayi bisa berguling jatuh."],
      perhatian: "Di usia 6 bulan bayi belum bisa menahan kepala, tidak meraih benda, atau tubuh sangat kaku/lemas."
    },
    scientific: {
      title: "Meraih: ketika mata dan tangan mulai bekerja sama",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "4–6 bln", label: "rentang normal bayi mulai berguling, sangat bervariasi", ref: 1 },
        { value: "1 jt+",   label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "motor-sequence", caption: "Kendali tubuh dari kepala ke bawah membuka kemampuan meraih", afterSectionIndex: 0 },
      sections: [
        { judul: "Dari kepala ke tangan", isi: "Kendali otot yang tadinya di kepala kini menjalar ke bahu, lengan, dan tangan. Inilah yang memungkinkan bayi mulai meraih benda dengan sengaja, sebuah lompatan dari gerakan acak menjadi gerakan bertujuan." },
        { judul: "Koordinasi mata-tangan", isi: "Meraih menggabungkan penglihatan dan gerak dalam satu tindakan. Bayi harus melihat benda, memperkirakan jaraknya, lalu mengarahkan tangan, latihan awal koordinasi yang kelak dipakai untuk makan sendiri dan menulis." },
        { judul: "Berguling: mobilitas pertama", isi: "Berguling menandai mobilitas pertama dan menguatkan otot inti untuk duduk. Karena bayi kini bisa berpindah, jangan pernah meninggalkannya di permukaan tinggi seperti kasur atau sofa." },
        { judul: "Mulut sebagai alat belajar", isi: "Membawa benda ke mulut bukan kebiasaan buruk, melainkan cara utama bayi mengenali tekstur dan bentuk pada tahap sensorimotor [3]. Pastikan benda di sekitarnya aman dan cukup besar agar tidak tertelan." },
        { judul: "Rentang normal itu lebar", isi: "Sebagian bayi berguling lebih awal, sebagian lebih lambat [1]. Yang penting adalah kemajuan yang konsisten dan kesempatan bergerak setiap hari, bukan kecocokan dengan tanggal tertentu." },
      ],
      references: [
        { n: 1, text: "CDC, Learn the Signs. Act Early.", url: "https://www.cdc.gov/act-early/" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
        { n: 3, text: "Jean Piaget, tahap sensorimotor." },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "AAP HealthyChildren.org"]
  },
  {
    id: "RL-3-6m-KG", ageKey: "3-6m", domain: "KG", title: "Sebab-akibat & rasa ingin tahu",
    photo: P("3-6m-kg", "Bayi mengeksplorasi mainan"), readMinutes: 2,
    summary: {
      terjadi: "Bayi mengeksplorasi benda dengan tangan dan mulut, memandangi benda yang jatuh (awal object permanence), dan menoleh ke sumber suara.",
      penting: "Lanjutan tahap sensorimotor: bayi belajar bahwa tindakannya menimbulkan reaksi (sebab-akibat).",
      lakukan: ["Beri mainan aman untuk dieksplorasi.", "Mainan yang bereaksi (kerincingan) mengajarkan sebab-akibat.", "Mainkan ciluk-ba."],
      perhatian: "Di usia 6 bulan bayi tidak berusaha meraih, tidak merespons suara/wajah."
    },
    scientific: {
      title: "Sebab-akibat: penemuan besar pertama bayi",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 1 },
      ],
      figure: { id: "cause-effect", caption: "Aku melakukan, sesuatu terjadi, aku ulangi: bayi belajar sebab-akibat", afterSectionIndex: 0 },
      sections: [
        { judul: "Aku melakukan, sesuatu terjadi", isi: "Ketika bayi menggoyang kerincingan dan mendengar bunyi, lalu mengulanginya, ia sedang membuat penemuan besar: tindakannya bisa memengaruhi dunia. Pemahaman sebab-akibat ini adalah fondasi berpikir logis." },
        { judul: "Awal object permanence", isi: "Bayi mulai memandangi benda yang jatuh atau menghilang. Ini benih dari object permanence, pemahaman bahwa benda (dan orang) tetap ada meski tak terlihat, yang menjadi dasar memori dan rasa aman." },
        { judul: "Tangan dan mulut sebagai laboratorium", isi: "Menurut Piaget, bayi di tahap sensorimotor membangun pengetahuan lewat indra dan gerak [2]. Mengeksplorasi benda dengan tangan dan mulut adalah 'eksperimen' hariannya untuk memahami cara kerja dunia." },
        { judul: "Mengapa mainan sederhana menang", isi: "Mainan yang bereaksi terhadap tindakan bayi, kerincingan, tombol berbunyi, mengajarkan sebab-akibat jauh lebih baik daripada layar yang pasif. Interaksi nyata mengalahkan tontonan." },
        { judul: "Rasa ingin tahu, mesin belajar", isi: "Beri bayi kesempatan mengeksplorasi benda aman dan tanggapi rasa ingin tahunya. Setiap eksplorasi memperkuat sebagian dari lebih dari sejuta koneksi saraf yang terbentuk tiap detik [1]." },
      ],
      references: [
        { n: 1, text: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
        { n: 2, text: "Jean Piaget, tahap sensorimotor." },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "Jean Piaget"]
  },
  {
    id: "RL-3-6m-BH", ageKey: "3-6m", domain: "BH", title: "Babbling: suku kata pertama",
    photo: P("3-6m-bh", "Bayi mengoceh"), readMinutes: 2,
    summary: {
      terjadi: "Bayi mengoceh dengan suku kata (\"ba-ba\", \"ma-ma\" tanpa arti), tertawa dan memekik, serta \"bercakap\" bergantian dengan Anda.",
      penting: "Babbling adalah latihan otot bicara dan pola percakapan; menanggapinya memperkuat jalur bahasa.",
      lakukan: ["Tirukan ocehan lalu beri jeda.", "Sebut nama benda yang ia lihat.", "Bacakan buku bergambar; panggil namanya."],
      perhatian: "Di usia 6 bulan bayi tidak mengoceh, tidak tertawa/memekik, atau tidak merespons suara."
    },
    scientific: {
      title: "Babbling: latihan besar sebelum kata pertama",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "Universal", label: "babbling muncul pada semua bayi lintas budaya dan bahasa", ref: 1 },
        { value: "1 jt+",     label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Menirukan ocehan lalu memberi jeda melatih pola percakapan", afterSectionIndex: 2 },
      sections: [
        { judul: "Babbling itu universal", isi: "Semua bayi di seluruh dunia mulai mengoceh dengan pola serupa, apa pun bahasa di rumahnya [1]. Ini menunjukkan babbling adalah tahap alami yang terprogram dalam perkembangan bicara." },
        { judul: "Melatih otot dan pola", isi: "Suara 'ba-ba' dan 'ma-ma' adalah latihan bagi otot bibir, lidah, dan pita suara, sekaligus percobaan menyusun bunyi menjadi pola, bahan mentah untuk kata pertama." },
        { judul: "Serve & return mempercepat", isi: "Ketika Anda menirukan ocehan bayi lalu memberi jeda, Anda mengajarkan inti percakapan: bergantian bicara. Tanggapan hangat memperkuat jalur bahasa di otaknya [2]." },
        { judul: "Dengar dulu, bicara kemudian", isi: "Kemampuan memahami tumbuh lebih dulu daripada bicara. Karena mendengar adalah syarat belajar bicara, reaksi bayi terhadap suara penting diperhatikan; keraguan sekecil apa pun sebaiknya diperiksakan lebih awal." },
        { judul: "Batasi layar", isi: "Bayi belajar bahasa dari manusia, bukan dari video. Percakapan langsung, nyanyian, dan buku jauh lebih bernilai daripada tontonan di layar." },
      ],
      references: [
        { n: 1, text: "American Speech-Language-Hearing Association (ASHA), perkembangan bicara dan bahasa.", url: "https://www.asha.org" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Serve and Return.", url: "https://developingchild.harvard.edu/key-concepts/serve-and-return/" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "ASHA"]
  },
  {
    id: "RL-3-6m-SE", ageKey: "3-6m", domain: "SE", title: "Tertawa, bermain & mengenali orang",
    photo: P("3-6m-se", "Bayi tertawa saat bermain"), readMinutes: 2,
    summary: {
      terjadi: "Bayi membedakan wajah familiar dan asing, senang bermain (bisa menangis saat permainan berhenti), dan tertawa spontan.",
      penting: "Ikatan sosial menguat dan regulasi emosi mulai terbentuk lewat interaksi.",
      lakukan: ["Ajak bermain interaktif (ciluk-ba, tepuk).", "Tanggapi emosinya dengan menamai.", "Jaga rutinitas yang bisa diprediksi."],
      perhatian: "Di usia 6 bulan bayi tidak tersenyum ke orang atau tidak menunjukkan kasih sayang pada pengasuh."
    },
    scientific: {
      title: "Tawa pertama dan awal ikatan sosial",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "±50–60%", label: "bayi membentuk kelekatan aman saat pengasuhan responsif", ref: 1 },
        { value: "1 jt+",   label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Bermain interaktif memperkuat ikatan dan regulasi emosi", afterSectionIndex: 1 },
      sections: [
        { judul: "Mengenali wajah familiar", isi: "Bayi kini jelas membedakan orang yang dikenal dari orang asing, dan menunjukkan preferensi pada pengasuhnya. Ini tanda ikatan yang sedang menguat, bukan sikap manja." },
        { judul: "Tawa: bahasa sosial", isi: "Tawa spontan adalah bentuk komunikasi sosial: bayi 'mengajak' Anda berinteraksi. Membalasnya memberi sinyal bahwa dunia sosialnya menyenangkan dan aman." },
        { judul: "Regulasi lewat co-regulation", isi: "Bayi belum bisa menenangkan diri sendiri. Ketika Anda menenangkannya secara konsisten, ia perlahan belajar bahwa emosi besar bisa mereda, fondasi pengaturan emosi (co-regulation) di kemudian hari." },
        { judul: "Bermain sama dengan ikatan", isi: "Permainan interaktif seperti ciluk-ba memperkuat kelekatan. Pengasuhan yang responsif dan konsisten dikaitkan dengan kelekatan aman [1], yang membuat anak lebih percaya diri menjelajah." },
        { judul: "Rutinitas menumbuhkan rasa aman", isi: "Pola harian yang dapat diprediksi membantu bayi merasa aman. Rasa aman inilah yang menopang seluruh perkembangan sosial-emosionalnya." },
      ],
      references: [
        { n: 1, text: "Ainsworth (1978); van IJzendoorn & Kroonenberg (1988), kelekatan dan responsivitas.", url: "https://www.simplypsychology.org/mary-ainsworth.html" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Serve and Return.", url: "https://developingchild.harvard.edu/key-concepts/serve-and-return/" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "Bowlby & Ainsworth", "AAP"]
  },
  {
    id: "RL-3-6m-KS", ageKey: "3-6m", domain: "KS", title: "ASI berlanjut, tidur berpola, imunisasi",
    photo: P("3-6m-ks", "Ibu menyusui bayi"), readMinutes: 2, isMedical: true,
    summary: {
      terjadi: "ASI tetap menjadi satu-satunya makanan (MPASI belum sebelum ~6 bulan). Tidur malam mulai lebih panjang, total ~12–16 jam. Imunisasi terus berjalan.",
      penting: "Makanan padat terlalu dini tidak dianjurkan; imunisasi tepat waktu melindungi dari penyakit serius. (Edukatif, bukan pengganti nasihat dokter.)",
      lakukan: ["Lanjutkan ASI eksklusif hingga ~6 bulan.", "Bangun rutinitas tidur; letakkan saat mengantuk belum tertidur.", "Ikuti jadwal imunisasi sesuai anjuran dokter/IDAI."],
      perhatian: "Berat badan tidak naik, menolak menyusu, demam tinggi, atau sangat rewel/lemas, konsultasikan."
    },
    scientific: {
      title: "Gizi, tidur, dan imunisasi di paruh pertama tahun pertama",
      readMinutes: 7,
      reviewedBy: { name: "Apoteker Raisha", date: "2026-07" },
      stats: [
        { value: "6 bln",    label: "durasi ASI eksklusif yang direkomendasikan sebelum MPASI", ref: 1 },
        { value: "12–16 jam", label: "kebutuhan tidur per 24 jam untuk bayi 4–12 bulan (termasuk tidur siang)", ref: 2 },
      ],
      figure: { id: "safe-sleep-abc", caption: "Prinsip tidur aman tetap berlaku: sendiri, telentang, di boks", afterSectionIndex: 1 },
      sections: [
        { judul: "ASI masih cukup hingga 6 bulan", isi: "Hingga sekitar usia 6 bulan, ASI (atau susu formula) masih memenuhi seluruh kebutuhan gizi bayi [1]. Memberi makanan padat lebih dini tidak dianjurkan karena sistem cerna dan kesiapan menelan bayi belum matang." },
        { judul: "Tidur yang mulai berpola", isi: "Bayi 4–12 bulan membutuhkan sekitar 12–16 jam tidur per 24 jam termasuk tidur siang [2]. Tidur malam mulai lebih panjang; membangun rutinitas tidur sederhana membantu pola ini terbentuk." },
        { judul: "Imunisasi tepat waktu", isi: "Jadwal imunisasi berlanjut di masa ini dan melindungi bayi dari penyakit serius pada saat sistem kekebalannya masih berkembang. Ikuti jadwal dari dokter/IDAI dan catat setiap dosis." },
        { judul: "Tidur aman tetap penting", isi: "Meski bayi makin aktif, prinsip tidur aman tidak berubah: telentang, di alas datar dan keras, tanpa benda empuk, dan idealnya sekamar dengan orang tua di kasur terpisah." },
        { judul: "Kapan menghubungi dokter", isi: "Berat badan tidak naik, menolak menyusu, demam tinggi, atau sangat rewel/lemas perlu diperiksakan. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter." },
      ],
      references: [
        { n: 1, text: "WHO / UNICEF, Breastfeeding.", url: "https://www.who.int/health-topics/breastfeeding" },
        { n: 2, text: "American Academy of Pediatrics / AASM, rekomendasi durasi tidur anak.", url: "https://www.healthychildren.org" },
        { n: 3, text: "IDAI, jadwal imunisasi.", url: "https://www.idai.or.id" },
      ],
    },
    sources: ["WHO / UNICEF", "IDAI", "AAP Safe Sleep 2022", "Kemenkes RI, Buku KIA"]
  },
  {
    id: "RL-3-6m-PS", ageKey: "3-6m", domain: "PS", title: "Bermain & membaca: stimulasi yang tepat",
    photo: P("3-6m-ps", "Bayi bermain mainan bertekstur"), readMinutes: 2,
    summary: {
      terjadi: "Bayi makin responsif terhadap permainan dan buku, rentang perhatiannya bertambah, dan ia menyukai mainan bertekstur atau berbunyi.",
      penting: "Bermain adalah cara utama bayi belajar (Vygotsky, Montessori); membacakan dini menumbuhkan bahasa dan kelekatan. Layar tetap tidak dianjurkan.",
      lakukan: ["Sediakan mainan aman beragam tekstur/bunyi.", "Bacakan board book setiap hari.", "Beri waktu bermain di lantai; ikuti minat bayi."],
      perhatian: "Bayi tampak tidak tertarik berinteraksi atau bermain sama sekali."
    },
    scientific: {
      title: "Bermain dan membaca: fondasi belajar tanpa layar",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "Sejak lahir", label: "usia yang dianjurkan untuk mulai membacakan buku pada anak", ref: 1 },
        { value: "18–24 bln",  label: "usia minimal sebelum layar dianjurkan (kecuali video call)", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Bermain dan membaca bersama adalah interaksi yang membangun otak", afterSectionIndex: 1 },
      sections: [
        { judul: "Bermain adalah kerja bayi", isi: "Bermain bukan sekadar hiburan; itu cara utama bayi belajar (Vygotsky, Montessori). Mainan bertekstur dan berbunyi memberi masukan sensorik yang memperkaya perkembangannya." },
        { judul: "Membacakan sejak dini", isi: "Membacakan buku sejak lahir dianjurkan karena menumbuhkan bahasa dan mempererat ikatan [1]. Bayi belum paham cerita, tetapi menyerap suara, irama, dan kedekatan, semuanya bahan bangunan bahasa." },
        { judul: "Ikuti minat bayi", isi: "Perhatikan apa yang menarik perhatian bayi dan tanggapi (serve & return). Pengalaman yang mengikuti minatnya lebih bermakna daripada aktivitas yang dipaksakan." },
        { judul: "Mengapa tanpa layar", isi: "AAP menganjurkan menghindari layar untuk bayi di bawah 18–24 bulan, kecuali panggilan video [2]. Waktu layar menggantikan interaksi manusia yang jauh lebih bernilai bagi otak yang sedang dibangun." },
        { judul: "Sederhana tapi konsisten", isi: "Beberapa menit bermain dan membaca setiap hari, dilakukan konsisten, lebih berdampak daripada sesi panjang sesekali. Kedekatan dan pengulangan adalah kuncinya." },
      ],
      references: [
        { n: 1, text: "American Academy of Pediatrics, literasi dini (membacakan sejak lahir).", url: "https://www.healthychildren.org" },
        { n: 2, text: "American Academy of Pediatrics, Media and Young Minds (screen time).", url: "https://www.healthychildren.org" },
      ],
    },
    sources: ["Harvard Center on the Developing Child", "AAP", "Montessori & Vygotsky"]
  },

  // ===================== 6–9 BULAN =====================
  {
    id: "RL-6-9m-FM", ageKey: "6-9m", domain: "FM", title: "Duduk & merangkak",
    photo: P("6-9m-fm", "Bayi duduk dan merangkak"), readMinutes: 2,
    summary: {
      terjadi: "Bayi mulai duduk (dengan/tanpa topangan), bergerak maju atau merangkak, memindahkan benda antar tangan, dan menuju gerakan menjumput.",
      penting: "Kemampuan bergerak membuka eksplorasi mandiri; menjumput melatih motorik halus untuk makan sendiri.",
      lakukan: ["Beri ruang lantai yang aman dan luas.", "Amankan rumah (baby-proofing): colokan, tangga, sudut tajam, benda kecil.", "Beri benda untuk dipindah-tangan."],
      perhatian: "Di usia 9 bulan bayi belum bisa duduk meski dibantu, tidak menumpu berat pada kaki, atau tidak memindahkan benda antar tangan."
    },
    scientific: {
      title: "Duduk dan merangkak: dunia yang bisa dijelajahi",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "6–10 bln", label: "rentang normal mulai merangkak, sebagian bayi bahkan melewatinya", ref: 1 },
        { value: "1 jt+",    label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "motor-sequence", caption: "Kendali badan yang menguat memungkinkan duduk tanpa topangan", afterSectionIndex: 0 },
      sections: [
        { judul: "Duduk membebaskan tangan", isi: "Ketika bayi bisa duduk tanpa topangan, kedua tangannya bebas untuk memegang, memindahkan, dan memeriksa benda. Ini melompatkan kemampuan belajar karena ia bisa memanipulasi dunia sambil mengamatinya." },
        { judul: "Merangkak dan mobilitas mandiri", isi: "Merangkak memberi bayi kendali atas ke mana ia pergi. Kemampuan berpindah sendiri mengubah cara ia belajar tentang ruang dan jarak. Sebagian bayi melewati fase merangkak dan langsung merambat, ini normal [1]." },
        { judul: "Menuju menjumput", isi: "Genggaman bayi menghalus dari seluruh telapak menuju ujung jari (pincer grasp). Keterampilan ini menyiapkannya untuk makan sendiri dan memegang benda kecil dengan presisi." },
        { judul: "Amankan lingkungan sekarang", isi: "Karena bayi kini bergerak dan memasukkan segala hal ke mulut, mengamankan rumah (baby-proofing) menjadi wajib: tutup colokan, halangi tangga, jauhkan benda kecil dan cairan berbahaya." },
        { judul: "Rentang normal itu lebar", isi: "Waktu setiap milestone bervariasi. Yang penting adalah kemajuan yang konsisten dan kesempatan bergerak bebas setiap hari di alas yang aman." },
      ],
      references: [
        { n: 1, text: "CDC, Learn the Signs. Act Early.", url: "https://www.cdc.gov/act-early/" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "AAP"]
  },
  {
    id: "RL-6-9m-KG", ageKey: "6-9m", domain: "KG", title: "Object permanence: benda tetap ada",
    photo: P("6-9m-kg", "Bayi mencari mainan tersembunyi"), readMinutes: 2,
    summary: {
      terjadi: "Bayi mulai mencari benda yang dijatuhkan atau disembunyikan (object permanence menguat), serta memindahkan dan membenturkan benda sambil mengamati reaksinya.",
      penting: "Object permanence adalah tonggak kognitif Piaget, dasar memori dan rasa aman: ibu tetap ada meski tak terlihat.",
      lakukan: ["Mainkan ciluk-ba dan sembunyikan mainan sebagian.", "Beri wadah untuk memasukkan-mengeluarkan benda.", "Biarkan mengeksplorasi benda aman."],
      perhatian: "Di usia 9 bulan bayi tidak mencari benda yang disembunyikan atau tidak menunjukkan minat menjelajah."
    },
    scientific: {
      title: "Object permanence: benda tetap ada meski hilang",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "±8 bln", label: "sekitar usia object permanence mulai berkembang (Piaget)", ref: 1 },
        { value: "1 jt+",  label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "object-permanence", caption: "Bayi mulai mencari benda yang disembunyikan, tanda ia paham benda tetap ada", afterSectionIndex: 0 },
      sections: [
        { judul: "Menemukan bahwa benda tak lenyap", isi: "Bayi mulai mencari benda yang dijatuhkan atau disembunyikan. Ia sedang membangun object permanence, pemahaman bahwa sesuatu tetap ada meski tak terlihat [1]." },
        { judul: "Mengapa ini tonggak besar", isi: "Object permanence adalah dasar memori dan rasa aman. Pemahaman bahwa ibu tetap ada meski sedang tak terlihat inilah yang juga memunculkan kecemasan berpisah, dua sisi dari kemajuan kognitif yang sama." },
        { judul: "Ciluk-ba sebagai sains", isi: "Permainan ciluk-ba bukan sekadar hiburan; ia melatih object permanence secara langsung. Bayi belajar bahwa wajah Anda menghilang lalu muncul kembali, dan bisa diandalkan." },
        { judul: "Wadah, isi, dan kosongkan", isi: "Memasukkan dan mengeluarkan benda dari wadah adalah 'eksperimen' favorit di usia ini. Aktivitas sederhana ini melatih pemahaman ruang, sebab-akibat, dan ketekunan." },
        { judul: "Eksplorasi tetap lewat indra", isi: "Tangan dan mulut tetap menjadi alat belajar utama. Sediakan benda aman yang beragam bentuk dan tekstur untuk dieksplorasi." },
      ],
      references: [
        { n: 1, text: "Jean Piaget, object permanence (tahap sensorimotor)." },
        { n: 2, text: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "Jean Piaget"]
  },
  {
    id: "RL-6-9m-BH", ageKey: "6-9m", domain: "BH", title: "Mengerti kata & mengoceh berantai",
    photo: P("6-9m-bh", "Bayi mengoceh dan menunjuk"), readMinutes: 2,
    summary: {
      terjadi: "Bayi mengoceh dalam rantai suku kata (\"ba-ba-ba\"), merespons namanya, mulai memahami \"tidak\", dan meniru suara serta gestur.",
      penting: "Pemahaman (bahasa reseptif) berkembang lebih dulu daripada bicara; semakin sering ditanggapi, semakin kuat fondasi bahasanya.",
      lakukan: ["Sebut nama benda secara konsisten.", "Tanggapi setiap kali bayi bersuara.", "Gunakan gestur (dadah, menunjuk); bacakan buku."],
      perhatian: "Di usia 9 bulan bayi tidak merespons namanya, tidak mengoceh, atau tidak mengeluarkan beragam suara."
    },
    scientific: {
      title: "Memahami lebih dulu: bahasa reseptif menguat",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "Reseptif lalu ekspresif", label: "bayi memahami jauh lebih banyak daripada yang bisa ia ucapkan", ref: 1 },
        { value: "1 jt+",                  label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Menanggapi suara dan gestur bayi memperkuat pemahaman bahasanya", afterSectionIndex: 2 },
      sections: [
        { judul: "Merespons nama dan kata 'tidak'", isi: "Bayi mulai menoleh saat namanya dipanggil dan bereaksi terhadap kata 'tidak'. Ini menunjukkan pemahaman (bahasa reseptif) yang berkembang jauh sebelum ia bisa mengucap kata [1]." },
        { judul: "Ocehan berantai", isi: "Ocehan berubah menjadi rantai suku kata seperti 'ba-ba-ba' dan 'ma-ma-ma'. Bayi bereksperimen menyusun bunyi, latihan langsung menuju kata pertama." },
        { judul: "Gestur adalah bahasa", isi: "Menunjuk, melambai, dan mengulurkan tangan adalah komunikasi pra-verbal yang penting. Berbagi perhatian lewat gestur (joint attention) adalah fondasi kuat bagi bahasa." },
        { judul: "Namai dunianya", isi: "Sebut nama benda dan orang secara konsisten. Setiap kali Anda menanggapi suara atau gestur bayi, jalur bahasanya menguat [2]." },
        { judul: "Dengar dengan baik", isi: "Mendengar adalah syarat belajar bicara. Bila bayi tampak tidak merespons suara atau namanya menjelang 9 bulan, pemeriksaan pendengaran dini sangat membantu." },
      ],
      references: [
        { n: 1, text: "American Speech-Language-Hearing Association (ASHA).", url: "https://www.asha.org" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Serve and Return.", url: "https://developingchild.harvard.edu/key-concepts/serve-and-return/" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "ASHA"]
  },
  {
    id: "RL-6-9m-SE", ageKey: "6-9m", domain: "SE", title: "Kecemasan pada orang asing & kelekatan",
    photo: P("6-9m-se", "Bayi menempel pada ibu"), readMinutes: 2,
    summary: {
      terjadi: "Bayi menempel pada pengasuh familiar, bisa cemas atau menangis pada orang asing (stranger anxiety), dan mulai cemas saat berpisah.",
      penting: "Stranger anxiety justru tanda kelekatan aman sudah terbentuk, bayi tahu siapa 'orang'-nya. Ini normal dan sehat.",
      lakukan: ["Jangan paksa bayi didekati orang asing; beri waktu.", "Berpamitanlah singkat & konsisten, jangan menyelinap pergi.", "Tenangkan dengan pelukan."],
      perhatian: "Di usia 9 bulan bayi tidak menunjukkan kelekatan pada pengasuh mana pun, atau tidak ada kontak mata/ekspresi."
    },
    scientific: {
      title: "Kecemasan pada orang asing: tanda ikatan yang sehat",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "6–9 bln",   label: "usia khas munculnya kecemasan pada orang asing", ref: 1 },
        { value: "±50–60%",   label: "bayi membentuk kelekatan aman saat pengasuhan responsif", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Pengasuh yang responsif menjadi 'basis aman' bagi bayi", afterSectionIndex: 1 },
      sections: [
        { judul: "Mengapa tiba-tiba takut orang asing", isi: "Kecemasan pada orang asing muncul justru karena kemajuan kognitif: bayi kini bisa membedakan wajah familiar dari yang asing, dan tahu siapa 'orang'-nya [1]." },
        { judul: "Ini sehat, bukan manja", isi: "Menempel pada pengasuh dan cemas pada orang asing adalah tanda kelekatan yang aman sedang terbentuk. Ini perkembangan normal, bukan sikap yang perlu 'diperbaiki'." },
        { judul: "Kaitan dengan berpisah", isi: "Kecemasan berpisah muncul bersamaan karena bayi kini paham Anda tetap ada meski pergi (object permanence). Ia belum tahu kapan Anda kembali, karena itu ia protes." },
        { judul: "Cara membantu", isi: "Jangan memaksa bayi ke orang asing; beri waktu penyesuaian. Saat berpisah, berpamitanlah singkat dan konsisten, jangan menyelinap pergi, karena itu menambah cemas [2]." },
        { judul: "Anda adalah basis aman", isi: "Kehadiran Anda yang bisa diandalkan justru membuat bayi lebih berani menjelajah. Rasa aman adalah landasan keberanian, bukan lawannya." },
      ],
      references: [
        { n: 1, text: "CDC, Learn the Signs. Act Early.", url: "https://www.cdc.gov/act-early/" },
        { n: 2, text: "Ainsworth & Bowlby, teori kelekatan.", url: "https://www.simplypsychology.org/mary-ainsworth.html" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "Bowlby & Ainsworth", "AAP"]
  },
  {
    id: "RL-6-9m-KS", ageKey: "6-9m", domain: "KS", title: "Mulai MPASI: makanan pertama bayi",
    photo: P("6-9m-ks", "Bayi makan MPASI"), readMinutes: 2, isMedical: true,
    summary: {
      terjadi: "Sekitar 6 bulan bayi siap MPASI (bisa duduk dengan topangan, kepala tegak, tertarik makanan). ASI tetap dilanjutkan. Tekstur dimulai lumat lalu makin kasar.",
      penting: "Setelah 6 bulan, ASI saja tidak cukup zat besi & energi; zat besi sangat krusial. Responsive feeding membangun kebiasaan makan sehat. (Edukatif, bukan pengganti nasihat dokter.)",
      lakukan: ["Mulai ~6 bulan dengan makanan kaya zat besi (hati, daging, kuning telur, kacang halus) + sayur/buah.", "Naikkan tekstur bertahap; kenalkan finger food.", "Kenalkan alergen satu per satu; teruskan ASI."],
      perhatian: "Hindari makanan pemicu tersedak (kacang/anggur utuh) dan madu <1 tahun. Reaksi alergi (ruam/bengkak/sesak), hentikan & ke dokter."
    },
    scientific: {
      title: "Memulai MPASI: gizi, zat besi, dan keamanan",
      readMinutes: 7,
      reviewedBy: { name: "Apoteker Raisha", date: "2026-07" },
      stats: [
        { value: "6 bln",    label: "usia umum bayi siap memulai MPASI", ref: 1 },
        { value: "Zat besi", label: "nutrien paling krusial saat MPASI dimulai", ref: 1 },
        { value: "<1 thn",   label: "madu harus dihindari sepenuhnya (risiko botulisme)", ref: 2 },
      ],
      figure: { id: "mpasi-texture", caption: "Tekstur MPASI dinaikkan bertahap; ASI tetap dilanjutkan", afterSectionIndex: 2 },
      sections: [
        { judul: "Tanda siap MPASI", isi: "Sekitar usia 6 bulan, bayi umumnya siap MPASI: bisa duduk dengan topangan, kepala tegak, tertarik pada makanan, dan refleks menjulurkan lidah berkurang [1]." },
        { judul: "Zat besi jadi prioritas", isi: "Setelah 6 bulan, cadangan dan asupan zat besi dari ASI tidak lagi mencukupi. Karena itu makanan kaya zat besi, seperti hati, daging, kuning telur, dan kacang halus, dianjurkan sejak awal MPASI [1]." },
        { judul: "Tekstur naik bertahap", isi: "MPASI dimulai dari tekstur lumat/saring lalu makin kasar seiring kemampuan bayi. Pola responsive feeding, mengikuti isyarat lapar dan kenyang bayi, membangun kebiasaan makan yang sehat." },
        { judul: "Keamanan: tersedak dan madu", isi: "Hindari makanan pemicu tersedak seperti kacang atau anggur utuh dan potongan keras. Madu tidak boleh diberikan sebelum usia 1 tahun karena risiko botulisme [2]. Reaksi alergi (ruam, bengkak, sesak) perlu segera diperiksakan." },
        { judul: "ASI tetap dilanjutkan", isi: "MPASI melengkapi, bukan menggantikan, ASI. Menyusui tetap dianjurkan berdampingan dengan makanan pendamping. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter/ahli gizi." },
      ],
      references: [
        { n: 1, text: "WHO, Complementary feeding of infants and young children 6-23 months (2023).", url: "https://www.who.int/publications/i/item/9789240081864" },
        { n: 2, text: "American Academy of Pediatrics; IDAI, keamanan MPASI dan madu.", url: "https://www.healthychildren.org" },
      ],
    },
    sources: ["WHO, Complementary feeding 6–23 bln (2023)", "IDAI", "AAP", "Kemenkes RI, Buku KIA"]
  },
  {
    id: "RL-6-9m-PS", ageKey: "6-9m", domain: "PS", title: "Eksplorasi aman & rutinitas",
    photo: P("6-9m-ps", "Bayi menjelajah ruangan yang aman"), readMinutes: 2,
    summary: {
      terjadi: "Bayi ingin menjelajahi segalanya dan hampir semuanya masuk mulut. Ia butuh lingkungan aman untuk belajar, dan rutinitas makin penting.",
      penting: "Eksplorasi bebas dalam lingkungan aman adalah cara utama bayi belajar (Montessori: prepared environment). Rutinitas memberi rasa aman.",
      lakukan: ["Baby-proof rumah agar bayi bebas menjelajah tanpa 'jangan' terus.", "Sediakan mainan menantang sesuai usia (wadah, balok).", "Jaga rutinitas makan–main–tidur; tetap tanpa layar."],
      perhatian: "Bila Anda kesulitan mengamankan lingkungan atau merasa kewalahan, carilah dukungan."
    },
    scientific: {
      title: "Rumah sebagai ruang belajar yang aman",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "18–24 bln", label: "usia minimal sebelum layar dianjurkan (kecuali video call)", ref: 1 },
        { value: "1 jt+",     label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Menanggapi eksplorasi bayi mengubah rumah jadi ruang belajar", afterSectionIndex: 1 },
      sections: [
        { judul: "Menjelajah adalah belajar", isi: "Bayi yang mobile ingin menjelajahi segalanya. Menurut pendekatan Montessori, lingkungan yang disiapkan dengan aman (prepared environment) adalah 'guru' terbaik di usia ini." },
        { judul: "Baby-proofing membebaskan", isi: "Rumah yang aman berarti Anda tidak perlu terus melarang. Semakin sedikit 'jangan', semakin banyak kesempatan bayi belajar lewat eksplorasi bebas." },
        { judul: "Rutinitas memberi rasa aman", isi: "Pola makan-main-tidur yang dapat diprediksi membantu bayi merasa aman. Rasa aman ini menopang keberanian bereksplorasi." },
        { judul: "Mainan yang menantang", isi: "Wadah bertutup, balok, dan mainan sebab-akibat sesuai usia mendorong pemecahan masalah. Mainan sederhana yang bereaksi terhadap tindakan bayi lebih bernilai daripada layar." },
        { judul: "Tetap tanpa layar", isi: "Layar tetap tidak dianjurkan di bawah 18–24 bulan [1]. Interaksi langsung dan eksplorasi nyata jauh lebih memperkaya otak yang sedang dibangun [2]." },
      ],
      references: [
        { n: 1, text: "American Academy of Pediatrics, Media and Young Minds.", url: "https://www.healthychildren.org" },
        { n: 2, text: "Center on the Developing Child, Harvard University.", url: "https://developingchild.harvard.edu" },
      ],
    },
    sources: ["Harvard Center on the Developing Child", "Montessori", "AAP"]
  },

  // ===================== 9–12 BULAN =====================
  {
    id: "RL-9-12m-FM", ageKey: "9-12m", domain: "FM", title: "Berdiri, merambat & menjumput halus",
    photo: P("9-12m-fm", "Bayi berdiri berpegangan furnitur"), readMinutes: 2,
    summary: {
      terjadi: "Bayi menarik badan untuk berdiri, merambat (cruising), mungkin melangkah pertama menjelang 12 bulan, menjumput dengan ujung jari (pincer grasp), dan makan finger food sendiri.",
      penting: "Pincer grasp menandai kesiapan makan mandiri; berdiri dan merambat adalah persiapan berjalan.",
      lakukan: ["Sediakan furnitur stabil untuk merambat.", "Beri finger food untuk melatih menjumput.", "Hindari baby walker (berisiko cedera)."],
      perhatian: "Di usia 12 bulan bayi tidak menarik badan untuk berdiri, tidak menjumput, atau kehilangan keterampilan."
    },
    scientific: {
      title: "Bersiap berjalan: berdiri, merambat, dan menjumput",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "9–15 bln", label: "rentang normal bayi mulai berjalan sendiri, sangat bervariasi", ref: 1 },
        { value: "1 jt+",    label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "motor-sequence", caption: "Kekuatan yang menjalar ke kaki membawa bayi dari duduk ke berdiri", afterSectionIndex: 0 },
      sections: [
        { judul: "Menarik badan dan merambat", isi: "Bayi menarik badan untuk berdiri dan merambat sambil berpegangan furnitur (cruising). Ini latihan keseimbangan dan kekuatan kaki, persiapan langsung untuk berjalan." },
        { judul: "Pincer grasp: presisi jari", isi: "Genggaman kini memakai ujung ibu jari dan telunjuk (pincer grasp), memungkinkan bayi menjumput benda kecil. Keterampilan halus ini menandai kesiapan makan sendiri." },
        { judul: "Hindari baby walker", isi: "Baby walker tidak dianjurkan karena berisiko cedera dan tidak membantu bayi belajar berjalan [3]. Bayi belajar berjalan paling baik lewat berdiri dan merambat secara alami." },
        { judul: "Belajar lewat kesempatan", isi: "Sediakan furnitur yang stabil untuk merambat dan ruang lantai yang aman. Finger food juga melatih pincer grasp sekaligus kemandirian makan." },
        { judul: "Rentang normal itu lebar", isi: "Berjalan bisa muncul kapan saja antara 9 hingga 15 bulan [1]. Yang penting adalah kemajuan yang konsisten, bukan kecocokan dengan tanggal tertentu." },
      ],
      references: [
        { n: 1, text: "CDC, Learn the Signs. Act Early.", url: "https://www.cdc.gov/act-early/" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
        { n: 3, text: "American Academy of Pediatrics, baby walkers.", url: "https://www.healthychildren.org" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "AAP"]
  },
  {
    id: "RL-9-12m-KG", ageKey: "9-12m", domain: "KG", title: "Meniru & memecahkan masalah kecil",
    photo: P("9-12m-kg", "Bayi meniru tepuk tangan"), readMinutes: 2,
    summary: {
      terjadi: "Bayi meniru gestur (tepuk, dadah), mencari benda yang benar-benar disembunyikan, memasukkan-mengeluarkan benda dari wadah, dan memakai benda sesuai fungsi.",
      penting: "Meniru adalah cara belajar utama; menunjuk untuk berbagi perhatian (joint attention) adalah fondasi bahasa dan interaksi sosial.",
      lakukan: ["Tunjukkan gestur sederhana untuk ditiru.", "Beri mainan sebab-akibat & shape sorter.", "Namai apa pun yang ia tunjuk."],
      perhatian: "Di usia 12 bulan bayi tidak menunjuk, tidak meniru, atau tidak mencari benda yang disembunyikan."
    },
    scientific: {
      title: "Meniru dan berbagi perhatian: lompatan sosial-kognitif",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "9–12 bln", label: "usia munculnya joint attention, menunjuk untuk berbagi perhatian", ref: 1 },
        { value: "1 jt+",    label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "joint-attention", caption: "Bayi, benda, dan Anda menatap hal yang sama: fondasi bahasa dan sosial", afterSectionIndex: 1 },
      sections: [
        { judul: "Meniru adalah belajar", isi: "Bayi meniru gestur seperti bertepuk dan melambai. Meniru adalah cara utamanya menyerap keterampilan dan kebiasaan dari orang di sekitarnya." },
        { judul: "Menunjuk untuk berbagi", isi: "Menunjuk bukan sekadar meminta; bayi mulai menunjuk untuk berbagi perhatian, mengajak Anda melihat hal yang sama (joint attention) [1]. Ini tonggak sosial-kognitif yang kuat memprediksi perkembangan bahasa." },
        { judul: "Memakai benda sesuai fungsi", isi: "Bayi mulai mendekatkan sisir ke rambut atau telepon mainan ke telinga. Ini menunjukkan ia memahami fungsi benda, bentuk awal berpikir simbolik." },
        { judul: "Memecahkan masalah kecil", isi: "Menarik kain untuk meraih mainan di atasnya adalah pemecahan masalah sederhana (means-end). Bayi belajar merencanakan langkah untuk mencapai tujuan." },
        { judul: "Mengapa menunjuk penting", isi: "Karena menunjuk dan berbagi perhatian begitu penting bagi bahasa dan sosial, ketiadaannya menjelang 12 bulan termasuk hal yang perlu didiskusikan dengan dokter." },
      ],
      references: [
        { n: 1, text: "CDC, Learn the Signs. Act Early.; riset joint attention.", url: "https://www.cdc.gov/act-early/" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "Jean Piaget"]
  },
  {
    id: "RL-9-12m-BH", ageKey: "9-12m", domain: "BH", title: "Kata pertama & menunjuk untuk berbagi",
    photo: P("9-12m-bh", "Bayi menunjuk sambil bersuara"), readMinutes: 2,
    summary: {
      terjadi: "Bayi mengucap \"mama/dada\" dengan arti, mungkin 1–3 kata menjelang 12 bulan, memahami perintah sederhana, menunjuk benda yang diinginkan, dan menggeleng \"tidak\".",
      penting: "Menunjuk dan berbagi perhatian adalah fondasi bahasa; kata pertama yang bermakna adalah tonggak besar.",
      lakukan: ["Beri nama saat bayi menunjuk (\"iya, itu bola\").", "Perluas ocehannya menjadi kata utuh.", "Bacakan buku dan tanya \"mana ...?\"."],
      perhatian: "Di usia 12 bulan bayi tidak mengucap kata, tidak menunjuk, tidak merespons perintah, atau kehilangan kata/kemampuan sosial."
    },
    scientific: {
      title: "Kata pertama dan kekuatan menunjuk",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "±12 bln", label: "usia umum munculnya kata pertama yang bermakna", ref: 1 },
        { value: "1 jt+",   label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "joint-attention", caption: "Menunjuk sambil menatap Anda: jembatan menuju kata pertama", afterSectionIndex: 1 },
      sections: [
        { judul: "Mama/dada dengan arti", isi: "Sekitar usia 12 bulan, banyak bayi mengucap kata pertama yang bermakna seperti 'mama' atau 'dada' [1]. Ini puncak dari setahun mendengarkan dan mengoceh." },
        { judul: "Menunjuk membuka bahasa", isi: "Menunjuk yang disertai menatap Anda adalah 'jembatan' menuju kata. Bayi yang banyak berbagi perhatian lewat menunjuk cenderung mengembangkan kosakata lebih cepat." },
        { judul: "Memahami perintah sederhana", isi: "Bayi memahami permintaan seperti 'sini' atau 'dadah' jauh sebelum bisa mengucapkannya. Pemahaman selalu mendahului ucapan." },
        { judul: "Perluas dan namai", isi: "Saat bayi menunjuk sesuatu, beri namanya ('iya, itu bola'). Memperluas ucapannya menjadi kata utuh memperkaya bahasanya." },
        { judul: "Waspadai kemunduran", isi: "Kehilangan kata atau kemampuan sosial yang pernah dimiliki adalah tanda penting yang perlu segera dikonsultasikan, terlepas dari usia." },
      ],
      references: [
        { n: 1, text: "American Speech-Language-Hearing Association (ASHA); CDC.", url: "https://www.asha.org" },
        { n: 2, text: "Center on the Developing Child, Harvard University.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "ASHA"]
  },
  {
    id: "RL-9-12m-SE", ageKey: "9-12m", domain: "SE", title: "Kelekatan puncak & kemandirian awal",
    photo: P("9-12m-se", "Bayi memeluk selimut favorit"), readMinutes: 2,
    summary: {
      terjadi: "Separation anxiety memuncak. Bayi mungkin punya objek transisi (selimut/boneka favorit), menunjukkan preferensi jelas, dan menguji reaksi (menjatuhkan benda berulang).",
      penting: "Kelekatan kuat dan objek transisi adalah hal sehat; keduanya membantu bayi merasa aman saat mulai mandiri.",
      lakukan: ["Buat rutinitas perpisahan yang konsisten & hangat.", "Izinkan objek transisi.", "Tanggapi dengan sabar saat ia 'menguji'."],
      perhatian: "Di usia 12 bulan bayi tidak menunjukkan kelekatan, tidak ada kontak mata atau berbagi perhatian."
    },
    scientific: {
      title: "Puncak kelekatan dan selimut kesayangan",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "6–12 bln",  label: "periode kecemasan berpisah biasanya memuncak", ref: 1 },
        { value: "±50–60%",   label: "bayi membentuk kelekatan aman saat pengasuhan responsif", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Respons yang konsisten membuat bayi merasa aman untuk mandiri", afterSectionIndex: 1 },
      sections: [
        { judul: "Kecemasan berpisah memuncak", isi: "Menjelang usia 1 tahun, kecemasan berpisah sering memuncak [1]. Bayi protes saat ditinggal karena kini ia paham Anda tetap ada meski pergi, tetapi belum tahu kapan kembali." },
        { judul: "Objek transisi", isi: "Selimut atau boneka kesayangan (objek transisi) membantu bayi merasa aman saat Anda tidak ada. Menurut Winnicott, ini perkembangan yang sehat, bukan tanda ketergantungan." },
        { judul: "Menguji reaksi", isi: "Menjatuhkan benda berulang kali dan menunggu reaksi Anda adalah cara bayi belajar sebab-akibat sosial. Tanggapi dengan sabar; ini eksplorasi, bukan kenakalan." },
        { judul: "Perpisahan yang menenangkan", isi: "Buat ritual perpisahan yang singkat, hangat, dan konsisten. Beri kepastian bahwa Anda akan kembali; hindari menyelinap pergi karena justru menambah cemas." },
        { judul: "Kelekatan aman sama dengan keberanian", isi: "Kelekatan yang kuat bukan penghambat kemandirian. Justru dari basis aman itulah bayi berani menjelajah dunia." },
      ],
      references: [
        { n: 1, text: "CDC, Learn the Signs. Act Early.", url: "https://www.cdc.gov/act-early/" },
        { n: 2, text: "Bowlby & Ainsworth; Winnicott (objek transisi).", url: "https://www.simplypsychology.org/mary-ainsworth.html" },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "Bowlby & Ainsworth", "Winnicott"]
  },
  {
    id: "RL-9-12m-KS", ageKey: "9-12m", domain: "KS", title: "Makan keluarga, self-feeding, menuju 1 tahun",
    photo: P("9-12m-ks", "Bayi makan sendiri"), readMinutes: 2, isMedical: true,
    summary: {
      terjadi: "Bayi makan 3 kali sehari plus camilan, tekstur makin kasar, dan mulai makan sendiri (berantakan itu normal). ASI/susu tetap dilanjutkan.",
      penting: "Variasi makanan dan self-feeding membangun keterampilan & kemandirian. Susu sapi tidak dianjurkan sebagai minuman utama sebelum 12 bulan. (Edukatif, bukan pengganti nasihat dokter.)",
      lakukan: ["Tawarkan makanan keluarga yang dilunakkan dan beragam.", "Biarkan bayi makan sendiri.", "Jaga jadwal makan; hindari gula/garam berlebih & madu <1 tahun."],
      perhatian: "Menolak makan terus-menerus, berat badan turun/stagnan, tanda alergi, atau tersedak, konsultasikan."
    },
    scientific: {
      title: "Makan mandiri dan aturan susu menjelang usia 1 tahun",
      readMinutes: 7,
      reviewedBy: { name: "Apoteker Raisha", date: "2026-07" },
      stats: [
        { value: "12 bln",  label: "usia minimal sebelum susu sapi jadi minuman utama", ref: 1 },
        { value: "<1 thn",  label: "madu harus dihindari sepenuhnya (risiko botulisme)", ref: 2 },
      ],
      figure: { id: "mpasi-texture", caption: "Tekstur meningkat menuju makanan keluarga; bayi mulai makan sendiri", afterSectionIndex: 0 },
      sections: [
        { judul: "Self-feeding dan berantakan itu baik", isi: "Membiarkan bayi makan sendiri dengan tangan atau sendok, meski berantakan, membangun keterampilan motorik dan kemandirian. Ini investasi kebiasaan makan yang sehat." },
        { judul: "Susu sapi tunggu 12 bulan", isi: "Susu sapi tidak dianjurkan sebagai minuman utama sebelum usia 12 bulan [1], karena dapat mengganggu penyerapan zat besi dan membebani ginjal bayi. ASI atau formula tetap jadi susu utama hingga usia 1 tahun." },
        { judul: "Variasi dan zat besi", isi: "Tawarkan makanan keluarga yang dilunakkan dan beragam, dengan tetap mengutamakan sumber zat besi. Variasi rasa dan tekstur sejak dini membantu anak lebih mudah menerima banyak jenis makanan." },
        { judul: "Hindari gula, garam, madu", isi: "Batasi gula dan garam berlebih, dan jangan berikan madu sebelum usia 1 tahun karena risiko botulisme [2]. Perhatikan pula tanda alergi saat mengenalkan makanan baru." },
        { judul: "Kapan menghubungi dokter", isi: "Menolak makan terus-menerus, berat badan turun atau stagnan, atau tanda alergi perlu diperiksakan. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter/ahli gizi." },
      ],
      references: [
        { n: 1, text: "American Academy of Pediatrics, susu sapi pada bayi < 1 tahun.", url: "https://www.healthychildren.org" },
        { n: 2, text: "WHO; IDAI, keamanan makanan bayi dan madu.", url: "https://www.idai.or.id" },
      ],
    },
    sources: ["WHO, Complementary feeding (2023)", "IDAI", "AAP (susu sapi <1 thn)"]
  },
  {
    id: "RL-9-12m-PS", ageKey: "9-12m", domain: "PS", title: "Bermain interaktif & menetapkan batas lembut",
    photo: P("9-12m-ps", "Ibu bermain ciluk-ba dengan bayi"), readMinutes: 2,
    summary: {
      terjadi: "Bayi makin mobile dan ingin tahu, mulai menguji batas, menyukai permainan interaktif, dan meniru pekerjaan rumah.",
      penting: "Batas yang konsisten dan lembut mengajarkan rasa aman, bukan hukuman. Layar tetap tidak dianjurkan di bawah 18–24 bulan.",
      lakukan: ["Alihkan (redirect) daripada terus melarang.", "Tetapkan sedikit batas jelas demi keamanan.", "Libatkan dalam rutinitas; perbanyak main & baca."],
      perhatian: "Bila Anda merasa perlu sering menghukum atau kewalahan, carilah strategi disiplin positif atau dukungan."
    },
    scientific: {
      title: "Batas yang lembut dan bermain yang membangun",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { value: "18–24 bln", label: "usia minimal sebelum layar dianjurkan (kecuali video call)", ref: 1 },
        { value: "1 jt+",     label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", ref: 2 },
      ],
      figure: { id: "serve-return", caption: "Menanggapi dan mengalihkan dengan hangat mengajarkan rasa aman", afterSectionIndex: 1 },
      sections: [
        { judul: "Menguji batas adalah belajar", isi: "Bayi yang makin mobile mulai menguji batas, bukan untuk menantang, melainkan untuk memahami aturan dunia. Ini bagian normal dari perkembangan." },
        { judul: "Alihkan, bukan menghukum", isi: "Di usia ini, mengalihkan perhatian (redirection) jauh lebih efektif daripada larangan berulang atau hukuman. Bayi belum mampu memahami konsekuensi abstrak." },
        { judul: "Sedikit batas yang konsisten", isi: "Tetapkan beberapa batas jelas demi keamanan dan terapkan secara konsisten. Konsistensi yang hangat mengajarkan rasa aman, bukan rasa takut." },
        { judul: "Bermain interaktif", isi: "Ciluk-ba, tepuk ame-ame, dan meniru pekerjaan rumah adalah permainan yang memperkuat ikatan sekaligus keterampilan. Ini juga latihan serve & return [2]." },
        { judul: "Tetap tanpa layar", isi: "Layar tetap tidak dianjurkan di bawah 18–24 bulan [1]. Waktu bermain dan membaca bersama jauh lebih bernilai bagi perkembangan." },
      ],
      references: [
        { n: 1, text: "American Academy of Pediatrics, Media and Young Minds.", url: "https://www.healthychildren.org" },
        { n: 2, text: "Center on the Developing Child, Harvard University, Serve and Return.", url: "https://developingchild.harvard.edu/key-concepts/serve-and-return/" },
      ],
    },
    sources: ["Harvard Center on the Developing Child", "AAP", "Montessori"]
  },

  // ===================== 12–18 BULAN =====================
  {
    id: "RL-12-18m-FM", ageKey: "12-18m", domain: "FM", title: "Berjalan & menjelajah dengan kaki sendiri",
    photo: P("12-18m-fm", "Batita belajar berjalan"), readMinutes: 2,
    summary: {
      terjadi: "Anak mulai berjalan sendiri (umumnya 12–15 bulan), memanjat, jongkok lalu bangun, mencoret dengan krayon, menumpuk dua balok, dan mulai minum dari cangkir.",
      penting: "Berjalan membuka kemandirian dan sudut pandang baru untuk belajar; motorik halus adalah persiapan menulis.",
      lakukan: ["Sediakan ruang aman untuk berjalan dan memanjat.", "Beri krayon besar dan balok.", "Dorong anak makan/minum sendiri (kaki telanjang bantu keseimbangan di rumah)."],
      perhatian: "Di usia 18 bulan anak belum berjalan, tidak mencoret, atau kehilangan keterampilan."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "AAP"]
  },
  {
    id: "RL-12-18m-KG", ageKey: "12-18m", domain: "KG", title: "Bermain fungsional & meniru kegiatan",
    photo: P("12-18m-kg", "Batita bermain pura-pura menelepon"), readMinutes: 2,
    summary: {
      terjadi: "Anak memakai benda sesuai fungsinya (telepon mainan ke telinga, menyuapi boneka), meniru pekerjaan rumah, dan menunjuk untuk menunjukkan minat.",
      penting: "Awal bermain pura-pura adalah lompatan kognitif menuju berpikir simbolik; meniru adalah cara menyerap keterampilan.",
      lakukan: ["Sediakan mainan tiruan kehidupan nyata.", "Libatkan anak dalam kegiatan rumah sederhana.", "Beri puzzle dan shape sorter."],
      perhatian: "Di usia 18 bulan anak tidak meniru, tidak mengenali fungsi benda umum, atau tidak menunjuk untuk berbagi minat."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "Piaget", "Vygotsky"]
  },
  {
    id: "RL-12-18m-BH", ageKey: "12-18m", domain: "BH", title: "Ledakan kata & memahami perintah",
    photo: P("12-18m-bh", "Batita menunjuk bagian tubuh"), readMinutes: 2,
    summary: {
      terjadi: "Anak mengucap beberapa kata (umumnya 3–10+ menjelang 18 bulan), menunjuk bagian tubuh saat ditanya, dan mengikuti perintah satu langkah.",
      penting: "Kosakata tumbuh cepat bila anak sering diajak bicara; kemampuan memahami mendahului mengucap.",
      lakukan: ["Banyak bicara dan namai benda.", "Perluas kata anak menjadi frasa (\"bola\" → \"bola merah\").", "Bacakan buku tiap hari; batasi layar (menghambat bahasa)."],
      perhatian: "Di usia 18 bulan anak tidak mengucap kata bermakna, tidak mengikuti perintah, tidak menunjuk, atau kehilangan kata."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "ASHA"]
  },
  {
    id: "RL-12-18m-SE", ageKey: "12-18m", domain: "SE", title: "Autonomi & tantrum pertama",
    photo: P("12-18m-se", "Batita menunjukkan kemandirian"), readMinutes: 2,
    summary: {
      terjadi: "Anak ingin mandiri (\"aku sendiri\"), dan tantrum muncul saat frustrasi atau lelah, normal karena otak pengendali emosi belum matang.",
      penting: "Tantrum adalah ketidakmampuan meregulasi emosi, bukan kenakalan. Anak butuh dibantu menenangkan diri (co-regulation). Erikson: autonomy vs shame.",
      lakukan: ["Tetap tenang saat tantrum, Anda jangkarnya.", "Namai emosinya (\"kamu marah, ya\").", "Beri pilihan terbatas; cukupkan tidur & jaga rutinitas."],
      perhatian: "Di usia 18 bulan anak tidak menunjukkan afeksi, tidak ada kontak mata, tidak meniru, atau mengalami kemunduran sosial."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "Erikson", "Siegel & Bryson"]
  },
  {
    id: "RL-12-18m-KS", ageKey: "12-18m", domain: "KS", title: "Makan mandiri, susu & tidur batita",
    photo: P("12-18m-ks", "Batita makan bersama keluarga"), readMinutes: 2, isMedical: true,
    summary: {
      terjadi: "Anak makan makanan keluarga; nafsu makan bisa menurun/pilih-pilih (normal, pertumbuhan melambat). Susu sapi boleh setelah 1 tahun. Tidur ~11–14 jam termasuk 1–2 nap.",
      penting: "Picky eating wajar, memaksa kontraproduktif. Susu berlebih mengganggu penyerapan zat besi. Tidur cukup penting untuk emosi & belajar. (Edukatif, bukan pengganti nasihat dokter.)",
      lakukan: ["Sajikan variasi; biarkan anak menentukan jumlah (division of responsibility).", "Batasi susu ~2 gelas/hari.", "Jaga rutinitas tidur; ikuti imunisasi."],
      perhatian: "Berat badan menurun, pilih-pilih sampai berisiko kurang gizi, atau tanda anemia (pucat, lemas), konsultasikan."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["WHO", "IDAI", "AAP", "Kemenkes RI, Buku KIA"]
  },
  {
    id: "RL-12-18m-PS", ageKey: "12-18m", domain: "PS", title: "Disiplin positif & batasi layar",
    photo: P("12-18m-ps", "Orang tua membimbing batita dengan tenang"), readMinutes: 2,
    summary: {
      terjadi: "Anak menguji batas lebih aktif dan meniru segala hal. Ia ingin mandiri tetapi belum mampu, sumber frustrasi dan tantrum.",
      penting: "Disiplin berarti mengajarkan, bukan menghukum; konsistensi dan kehangatan membangun rasa aman. AAP: hindari layar di bawah 18–24 bulan.",
      lakukan: ["Tetapkan sedikit aturan yang jelas dan konsisten.", "Alihkan perhatian dan beri pilihan; puji perilaku baik.", "Jadi teladan; minimalkan layar, perbanyak bermain & membaca."],
      perhatian: "Bila Anda cenderung mengandalkan hukuman fisik atau merasa kewalahan, carilah pendekatan disiplin positif dan dukungan."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["AAP (screen time & disiplin positif)", "Harvard Center on the Developing Child", "Montessori"]
  },

  // ===================== 18–24 BULAN =====================
  {
    id: "RL-18-24m-FM", ageKey: "18-24m", domain: "FM", title: "Berlari, menendang & tangan makin terampil",
    photo: P("18-24m-fm", "Batita menendang bola"), readMinutes: 2,
    summary: {
      terjadi: "Anak mulai berlari, naik tangga sambil berpegangan, menendang bola, menumpuk 4 balok atau lebih, dan makan memakai sendok cukup baik.",
      penting: "Keseimbangan dan koordinasi meningkat; motorik halus menyiapkan anak untuk mandiri (makan, berpakaian, menulis).",
      lakukan: ["Beri ruang untuk gerak aktif: berlari, memanjat rendah, bermain bola.", "Sediakan mainan dorong-tarik dan bola.", "Latih memakai sendok, membuka-menutup wadah, menuang."],
      perhatian: "Di usia 24 bulan anak belum berjalan stabil, tidak menumpuk balok, atau kehilangan keterampilan."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "AAP"]
  },
  {
    id: "RL-18-24m-KG", ageKey: "18-24m", domain: "KG", title: "Bermain pura-pura & memilah",
    photo: P("18-24m-kg", "Batita bermain masak-masakan"), readMinutes: 2,
    summary: {
      terjadi: "Bermain pura-pura anak makin kaya (menyuapi boneka, masak-masakan). Ia memilah bentuk dan warna, meniru urutan tindakan, dan menemukan solusi sederhana.",
      penting: "Bermain pura-pura membangun imajinasi, bahasa, dan awal fungsi eksekutif (merencanakan).",
      lakukan: ["Sediakan properti bermain peran.", "Beri puzzle dan mainan memilah bentuk/warna.", "Beri waktu bermain bebas; ajukan pertanyaan \"apa ini?\"."],
      perhatian: "Di usia 24 bulan anak tidak bermain pura-pura, tidak meniru, atau tidak mengikuti perintah dua langkah."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "Piaget", "Vygotsky"]
  },
  {
    id: "RL-18-24m-BH", ageKey: "18-24m", domain: "BH", title: "Gabung dua kata & kosakata meledak",
    photo: P("18-24m-bh", "Batita berbicara dua kata"), readMinutes: 2,
    summary: {
      terjadi: "Kosakata anak tumbuh ke 50 kata atau lebih menjelang 24 bulan, dan ia mulai menggabungkan dua kata (\"mama pergi\"). Ia mengikuti perintah dua langkah.",
      penting: "Menggabungkan kata adalah lompatan menuju tata bahasa; interaksi dan membaca setiap hari mempercepatnya.",
      lakukan: ["Perluas ucapan anak (\"susu\" → \"kamu mau susu?\").", "Bacakan buku interaktif dan ajukan pertanyaan.", "Deskripsikan kegiatan; batasi layar."],
      perhatian: "Di usia 24 bulan kosakata di bawah 50 kata atau belum menggabungkan dua kata, tidak mengikuti perintah, atau kehilangan bahasa, pertimbangkan skrining."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "ASHA"]
  },
  {
    id: "RL-18-24m-SE", ageKey: "18-24m", domain: "SE", title: "Puncak tantrum & menguji batas",
    photo: P("18-24m-se", "Batita belajar mengelola emosi"), readMinutes: 2,
    summary: {
      terjadi: "Tantrum memuncak dan anak jadi keras kepala (\"tidak!\"). Ia masih egosentris dan belum bisa berbagi penuh (normal), serta bermain paralel di dekat anak lain.",
      penting: "Melawan adalah bagian perkembangan autonomi yang sehat (Erikson). Empati dan berbagi tumbuh bertahap; co-regulation dari Anda tetap kuncinya.",
      lakukan: ["Tetap tenang dan konsisten.", "Validasi emosi lalu tetapkan batas (\"kamu kesal, tapi tidak boleh memukul\").", "Beri pilihan; ajarkan berbagi lewat contoh & giliran, hindari hukuman saat tantrum."],
      perhatian: "Di usia 24 bulan anak tidak meniru, tidak tertarik pada orang lain, tidak bermain pura-pura, atau kehilangan keterampilan sosial."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "Erikson", "Siegel & Bryson"]
  },
  {
    id: "RL-18-24m-KS", ageKey: "18-24m", domain: "KS", title: "Gizi batita, tidur satu kali siang & rawat gigi",
    photo: P("18-24m-ks", "Batita menyikat gigi"), readMinutes: 2, isMedical: true,
    summary: {
      terjadi: "Anak makan porsi kecil dan sering; picky eating umum. Ia biasanya beralih ke satu kali tidur siang (total ~11–14 jam), dan banyak gigi mulai tumbuh.",
      penting: "Kebiasaan makan & tidur sehat terbentuk sekarang. Kesehatan gigi penting sejak gigi pertama, karies bisa muncul sangat dini. (Edukatif, bukan pengganti nasihat dokter.)",
      lakukan: ["Tawarkan makanan bervariasi tanpa memaksa (butuh paparan berulang).", "Sikat gigi 2x sehari dengan pasta fluoride seukuran biji beras; kunjungan gigi pertama ~usia 1 tahun.", "Batasi jajanan manis & susu berlebih; jaga rutinitas tidur."],
      perhatian: "Berat badan tidak naik, tanda gigi berlubang (bercak putih/cokelat), atau pilih-pilih hingga berisiko kurang gizi, konsultasikan."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["AAP & AAPD (kesehatan gigi)", "IDAI", "WHO", "Kemenkes RI, Buku KIA"]
  },
  {
    id: "RL-18-24m-PS", ageKey: "18-24m", domain: "PS", title: "Konsistensi, contoh & kesiapan toilet",
    photo: P("18-24m-ps", "Batita membantu tugas rumah kecil"), readMinutes: 2,
    summary: {
      terjadi: "Anak meniru dengan intens dan ingin membantu. Menjelang usia 2 tahun sebagian mulai menunjukkan tanda kesiapan toilet, tetapi belum tentu benar-benar siap.",
      penting: "Teladan dan rutinitas konsisten paling efektif; toilet training yang terlalu dini atau dipaksa justru kontraproduktif, tunggu tanda kesiapan (umumnya 2–3 tahun).",
      lakukan: ["Libatkan anak dalam tugas kecil (membuang popok, merapikan mainan).", "Buat rutinitas harian yang jelas.", "Kenalkan konsep toilet tanpa tekanan; batasi layar."],
      perhatian: "Bila tekanan soal toilet atau makan menimbulkan konflik terus-menerus, longgarkan dan tunggu kesiapan anak."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["AAP (kesiapan toilet training)", "Harvard Center on the Developing Child", "Montessori"]
  },

  // ===================== 2–3 TAHUN =====================
  {
    id: "RL-2-3y-FM", ageKey: "2-3y", domain: "FM", title: "Melompat, memanjat & tangan makin cekatan",
    photo: P("2-3y-fm", "Anak melompat dan bermain aktif"), readMinutes: 2,
    summary: {
      terjadi: "Anak berlari lancar, melompat dengan dua kaki, naik-turun tangga, mulai mengayuh sepeda roda tiga, menumpuk 6 balok atau lebih, dan makan dengan sendok/garpu.",
      penting: "Kontrol tubuh dan tangan berkembang pesat; motorik halus menyiapkan menggambar dan menulis. Aktivitas fisik penting untuk kesehatan dan otak.",
      lakukan: ["Sediakan banyak waktu bermain aktif, terutama di luar.", "Beri sepeda roda tiga atau mainan panjat yang aman.", "Latih tangan dengan krayon, playdough, meronce; libatkan berpakaian sendiri."],
      perhatian: "Di usia 3 tahun anak sering jatuh atau sangat kesulitan di tangga, tidak bisa mencoret, atau kehilangan keterampilan."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "AAP"]
  },
  {
    id: "RL-2-3y-KG", ageKey: "2-3y", domain: "KG", title: "Berpikir simbolik, memilah & \"kenapa\"",
    photo: P("2-3y-kg", "Anak bertanya dan mengeksplorasi"), readMinutes: 2,
    summary: {
      terjadi: "Bermain pura-pura anak makin berskenario. Ia memilah warna dan bentuk, mulai menghitung, memahami waktu sederhana, dan menjelang 3 tahun gencar bertanya \"kenapa?\".",
      penting: "Berpikir simbolik dan rasa ingin tahu adalah mesin belajarnya (tahap praoperasional Piaget).",
      lakukan: ["Sediakan bahan main terbuka (balok, playdough, kostum).", "Jawab pertanyaan \"kenapa\" dengan sabar; hitung benda sehari-hari.", "Beri puzzle dan kegiatan memilah; bacakan cerita lalu bahas."],
      perhatian: "Di usia 3 tahun anak tidak bermain pura-pura, tidak memahami perintah dua langkah, atau tidak tertarik pada anak lain."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "Piaget", "Vygotsky"]
  },
  {
    id: "RL-2-3y-BH", ageKey: "2-3y", domain: "BH", title: "Kalimat & percakapan",
    photo: P("2-3y-bh", "Anak bercerita kepada orang tua"), readMinutes: 2,
    summary: {
      terjadi: "Anak berbicara dengan kalimat 2–3 kata atau lebih, memakai kata ganti (aku, kamu), mengikuti perintah dua langkah, dan menjelang 3 tahun ~50–75% ucapannya dimengerti keluarga.",
      penting: "Bahasa meledak lewat interaksi; percakapan bolak-balik dan membaca setiap hari adalah kuncinya, ini masa kritis bahasa.",
      lakukan: ["Ngobrol banyak dan ajukan pertanyaan terbuka.", "Bacakan buku setiap hari dan bahas ceritanya.", "Nyanyikan lagu dan sajak; batasi layar."],
      perhatian: "Di usia 3 tahun anak belum berbicara dengan kalimat, ucapannya tidak dimengerti keluarga, tidak bertanya, atau kehilangan bahasa, pertimbangkan skrining."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "ASHA"]
  },
  {
    id: "RL-2-3y-SE", ageKey: "2-3y", domain: "SE", title: "Emosi besar, empati awal & mulai berbagi",
    photo: P("2-3y-se", "Anak menghibur temannya"), readMinutes: 2,
    summary: {
      terjadi: "Emosi anak kuat dan cepat berubah. Tantrum mulai bisa dibantu reda. Ia menunjukkan empati awal (menghibur teman yang menangis) dan mulai bisa berbagi giliran dalam bermain.",
      penting: "Regulasi emosi sedang dibangun; co-regulation dari Anda mengajarkannya cara menenangkan diri secara bertahap.",
      lakukan: ["Namai dan validasi emosi.", "Modelkan empati dan berbagi dalam kehidupan sehari-hari.", "Beri strategi menenangkan (napas, pelukan, tempat tenang)."],
      perhatian: "Di usia 3 tahun anak tidak menunjukkan empati, tidak bisa bermain berdampingan, atau tantrum sangat sering & intens."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["CDC Learn the Signs. Act Early.", "Siegel & Bryson", "Erikson"]
  },
  {
    id: "RL-2-3y-KS", ageKey: "2-3y", domain: "KS", title: "Gizi anak prasekolah & toilet training",
    photo: P("2-3y-ks", "Anak makan sayur dan buah"), readMinutes: 2, isMedical: true,
    summary: {
      terjadi: "Anak makan makanan keluarga bervariasi (sayur, protein, karbohidrat). Picky eating masih umum. Toilet training biasanya siap di usia 2–3 tahun.",
      penting: "Pola makan sehat terbentuk sekarang untuk seumur hidup. Toilet training yang dipaksa berdampak negatif, ikuti tanda kesiapan anak. (Edukatif, bukan pengganti nasihat dokter.)",
      lakukan: ["Sajikan porsi kecil beragam; ekspos berulang tanpa memaksa.", "Tunggu tanda kesiapan toilet (sadar pipis, bisa tahan sebentar, mau duduk di toilet).", "Sikat gigi 2x/hari; imunisasi sesuai jadwal."],
      perhatian: "Berat badan tidak naik, pilih-pilih hingga berisiko kurang gizi, atau tanda infeksi saluran kemih, konsultasikan."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["AAP (toilet training)", "IDAI", "WHO", "Kemenkes RI"]
  },
  {
    id: "RL-2-3y-PS", ageKey: "2-3y", domain: "PS", title: "Rutinitas, batas, & bermain bebas",
    photo: P("2-3y-ps", "Anak bermain bebas di luar"), readMinutes: 2,
    summary: {
      terjadi: "Anak butuh rutinitas yang bisa diprediksi dan batas yang jelas, namun juga waktu bermain bebas yang luas untuk mengembangkan kreativitas dan kemandirian.",
      penting: "Bermain bebas (unstructured play) adalah hak anak dan fondasi belajar terpenting (AAP). Layar kurang dari 1 jam/hari untuk usia 2–5 tahun, dengan konten berkualitas.",
      lakukan: ["Jaga rutinitas makan-main-tidur.", "Beri waktu bermain bebas setiap hari, terutama di luar.", "Batasi layar; pilih konten edukatif dan tonton bersama bila perlu."],
      perhatian: "Bila anak sangat bergantung pada layar atau kesulitan bermain sendiri, kurangi bertahap dan perbanyak aktivitas fisik."
    },
    scientific: { title: "Detail ilmiah, TODO" },
    sources: ["AAP (play 2018)", "Harvard Center on the Developing Child", "Montessori"]
  },

  // ===================== 3–4 TAHUN, TODO =====================
  // TODO: RL-3-4y-FM (Berlari, melompat, bersepeda)
  // TODO: RL-3-4y-KG (Menghitung, mengenali huruf, fungsi eksekutif awal)
  // TODO: RL-3-4y-BH (Kalimat panjang, bertanya terus-menerus)
  // TODO: RL-3-4y-SE (Bermain kooperatif, mengatur emosi)
  // TODO: RL-3-4y-KS (Gizi, tidur, kesehatan gigi isMedical:true)
  // TODO: RL-3-4y-PS (Persiapan sekolah, layar, membaca bersama)

  // ===================== 4–5 TAHUN, TODO =====================
  // TODO: RL-4-5y-FM (Melompat satu kaki, menulis nama, menggunting)
  // TODO: RL-4-5y-KG (Angka, huruf, memecahkan masalah)
  // TODO: RL-4-5y-BH (Bercerita, kosakata kaya, baca dini)
  // TODO: RL-4-5y-SE (Aturan, persahabatan, identitas diri)
  // TODO: RL-4-5y-KS (Gizi prasekolah, tidur, imunisasi isMedical:true)
  // TODO: RL-4-5y-PS (Kesiapan sekolah, kemandirian, media digital)

  // ===================== 5–6 TAHUN, TODO =====================
  // TODO: RL-5-6y-FM (Koordinasi lebih halus, olahraga, menulis)
  // TODO: RL-5-6y-KG (Membaca permulaan, logika, memori kerja)
  // TODO: RL-5-6y-BH (Membaca, bercerita kompleks, bahasa kedua)
  // TODO: RL-5-6y-SE (Persahabatan, aturan, regulasi diri)
  // TODO: RL-5-6y-KS (Gizi usia sekolah, tidur, kesehatan gigi isMedical:true)
  // TODO: RL-5-6y-PS (Transisi ke sekolah, disiplin positif, layar)
];
