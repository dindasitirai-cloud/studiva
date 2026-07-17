// ============================================================================
// Studiva Digital, Resource Library : data kartu (Model A)
// Ringkasan (2 menit) lengkap untuk seluruh 60 kartu konten lama.
// Domain ke-7 (DK) ditambahkan sebagai 10 kartu placeholder ("segera-hadir").
// Detail ilmiah PENUH untuk rentang 0–3 bulan (6 kartu) sebagai acuan.
// Kartu lain: scientific.paragraphs kosong + TODO → diisi per batch (dengan review).
// CATATAN UI: sembunyikan tombol "Detail ilmiah terkait ini" bila
//   scientific.paragraphs.length === 0.
// Konten sudah divalidasi terhadap sumber; jangan mengubah kalimat tanpa review.
// ============================================================================

import { LucideIcon } from 'lucide-react';
import { DOMAIN_CONFIGS } from './domains';
import type { DomainCode } from './domains';
export type { DomainCode } from './domains';
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

// ---------------------------------------------------------------------------
// New (composable) data layer. Cards reference reusable module content by id,
// or supply their own text. Inline citations use [ref:<sourceId>] tokens which
// composeScientific() renumbers into [n] markers. See lib/composeScientific.ts.
// ---------------------------------------------------------------------------
export type ScientificSectionRef =
  | { type: "module"; moduleId: string; sectionKey: string; judulOverride?: string; isiOverride?: string }
  | { type: "own"; judul: string; isi: string };

export type ScientificStatRef =
  | { type: "module"; moduleId: string; statKey: string }
  | { type: "own"; value: string; label: string; sourceId: string };

/** Card scientific payload — accepts BOTH the legacy shape (plain
 *  ScientificSection/ScientificStat with numbered [n] markers + references) and
 *  the new composable shape (…Ref arrays with [ref:id] tokens, no references). */
export interface ScientificData {
  title: string;
  readMinutes?: number;
  reviewedBy?: { name: string; date: string };
  stats?: (ScientificStat | ScientificStatRef)[];
  figure?: ScientificFigure;
  sections?: (ScientificSection | ScientificSectionRef)[];
  references?: ScientificReference[];
  /** Legacy fallback, still rendered if sections is absent/empty */
  paragraphs?: string[];
}

export interface KnowledgeCard {
  id: string;
  ageKey: AgeKey;
  domain: DomainCode;
  title: string;
  photo: { src: string; alt: string; credit?: string };
  readMinutes: number;
  /** Absent on placeholder cards (domain DK batch 1) → status derivasi = "segera-hadir" */
  summary?: {
    terjadi: string;
    penting: string;
    lakukan: string[];
    perhatian: string;
  };
  isMedical?: boolean;
  scientific: ScientificData;
  sources: string[];
  adminStatus?: 'draft' | 'published'; // undefined = published (backward compat)
}

/** Derived content-fill status — NOT stored as data, computed from field presence. */
export type CardContentStatus = 'segera-hadir' | 'ringkasan-saja' | 'lengkap';

export function getCardContentStatus(card: KnowledgeCard): CardContentStatus {
  if (!card.summary) return 'segera-hadir';
  const hasSections =
    (card.scientific.sections?.length ?? 0) > 0 ||
    (card.scientific.paragraphs?.length ?? 0) > 0;
  return hasSections ? 'lengkap' : 'ringkasan-saja';
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

/** Derived from DOMAIN_CONFIGS — adding a domain only requires updating domains.ts. */
export const DOMAIN_MAP: Record<DomainCode, { label: string; icon: LucideIcon; bg: string; fg: string }> =
  Object.fromEntries(
    DOMAIN_CONFIGS.map(d => [d.code, { label: d.label, icon: d.icon, bg: d.bg, fg: d.fg }])
  ) as Record<DomainCode, { label: string; icon: LucideIcon; bg: string; fg: string }>;

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
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
        { type: "own", value: ">50%", label: "penurunan tajam angka SIDS sejak kampanye 'tidur telentang' (1990-an)", sourceId: "cdc-sids" },
      ],
      figure: { id: "motor-sequence", caption: "Arah perkembangan gerak: dari kepala ke kaki", afterSectionIndex: 0 },
      sections: [
        { type: "module", moduleId: "urutan-motorik-kasar", sectionKey: "perkembangan-berurutan" },
        { type: "module", moduleId: "tummy-time", sectionKey: "mengapa-tummy" },
        { type: "module", moduleId: "urutan-motorik-kasar", sectionKey: "gerak-belajar" },
        { type: "module", moduleId: "urutan-motorik-kasar", sectionKey: "batasi-penyangga" },
        { type: "module", moduleId: "urutan-motorik-kasar", sectionKey: "rentang-normal" },
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
        { type: "own", value: "20–30 cm", label: "jarak fokus terbaik bayi baru lahir, persis jarak wajah pengasuh", sourceId: "aap-vision" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
      ],
      figure: { id: "focus-distance", caption: "Jarak fokus bayi baru lahir kira-kira sejauh wajah Anda saat menggendong", afterSectionIndex: 0 },
      sections: [
        { type: "own", judul: "Penglihatan yang belum matang", isi: "Penglihatan adalah indra yang paling belum matang saat lahir. Bayi baru lahir hanya bisa memfokuskan pandangan pada jarak sekitar 20–30 cm [ref:aap-vision], persis jarak wajah Anda saat menggendong atau menyusui. Alam seolah merancang agar hal pertama yang jelas ia lihat adalah wajah manusia." },
        { type: "own", judul: "Melatih mata mengikuti", isi: "Di bulan-bulan pertama, otak bayi berlatih menggerakkan kedua mata secara terkoordinasi untuk mengikuti benda bergerak. Kemampuan ini menjadi dasar perhatian dan kelak koordinasi mata-tangan. Pola kontras tinggi paling mudah ditangkap otak yang sedang belajar melihat." },
        { type: "own", judul: "Tahap sensorimotor", isi: "Menurut Piaget, bayi membangun pengetahuan langsung dari indra dan gerak, bukan dari kata [ref:piaget]. Setiap tatapan, sentuhan, dan suara adalah 'data' yang otaknya kumpulkan, bagian dari lebih dari sejuta koneksi saraf yang terbentuk tiap detik [ref:harvard-brain]." },
        { type: "own", judul: "Stimulasi terbaik itu sederhana", isi: "Stimulasi paling bermakna di usia ini bukan mainan mahal atau layar, melainkan wajah Anda, suara Anda, dan benda nyata yang bisa diamati. Menggerakkan mainan perlahan atau mengganti posisi gendong memberi 'pemandangan' baru untuk dipelajari." },
        { type: "own", judul: "Kapan perlu perhatian", isi: "Bila menjelang 3 bulan mata bayi tidak pernah mengikuti benda atau menatap wajah, sampaikan ke dokter. Otak visual berkembang paling pesat di tahun pertama, sehingga deteksi dini sangat penting [ref:cdc-act-early]." },
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
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
        { type: "own", value: "Reseptif → ekspresif", label: "kemampuan memahami tumbuh lebih dulu daripada bicara", sourceId: "asha" },
      ],
      figure: { id: "serve-return", caption: "Percakapan bergantian (serve & return) memperkuat jalur bahasa", afterSectionIndex: 2 },
      sections: [
        { type: "module", moduleId: "serve-return", sectionKey: "bahasa-dimulai" },
        { type: "module", moduleId: "serve-return", sectionKey: "bayi-ahli-statistik" },
        { type: "module", moduleId: "serve-return", sectionKey: "belajar-dari-manusia" },
        { type: "module", moduleId: "serve-return", sectionKey: "cara-bicara" },
        { type: "module", moduleId: "tonggak-bahasa", sectionKey: "kualitas-kata" },
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
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-serve-return" },
        { type: "own", value: "90%", label: "ukuran otak dewasa sudah tercapai pada usia 5 tahun", sourceId: "harvard-brain" },
        { type: "own", value: "±50–60%", label: "bayi membentuk kelekatan aman saat pengasuhan responsif", sourceId: "ainsworth-1978" },
      ],
      figure: { id: "serve-return", caption: "Siklus serve & return yang memperkuat arsitektur otak", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Otak dibangun oleh pengalaman", isi: "Otak bayi tidak lahir dalam keadaan selesai. Ia dibangun bertahap setelah lahir, dengan lebih dari satu juta koneksi saraf baru terbentuk setiap detik pada tahun-tahun awal [ref:harvard-serve-return], hingga mencapai sekitar 90% ukuran otak dewasa pada usia 5 tahun [ref:harvard-brain]. Pengalaman sehari-hari, terutama interaksi dengan pengasuh, menentukan koneksi mana yang menguat dan mana yang dipangkas." },
        { type: "own", judul: "Mekanisme: serve & return", isi: "Harvard Center on the Developing Child menjelaskan mekanisme utamanya sebagai serve and return [ref:harvard-serve-return]: pertukaran bolak-balik antara bayi dan pengasuh. Ketika bayi memberi sinyal dan pengasuh menanggapi secara konsisten, sirkuit saraf untuk bahasa, regulasi emosi, dan hubungan sosial menguat. Ketiadaan respons yang berkepanjangan justru mengaktifkan sistem stres tubuh dan dapat mengganggu proses ini [ref:harvard-serve-return]." },
        { type: "own", judul: "Bukti: responsivitas & kelekatan aman", isi: "Penelitian klasik Ainsworth melalui prosedur Strange Situation menunjukkan bayi yang pengasuhnya responsif dan konsisten lebih mungkin mengembangkan kelekatan aman [ref:ainsworth-1978]. Meta-analisis lintas budaya memperkirakan sekitar separuh hingga dua pertiga bayi tergolong kelekatan aman, dengan responsivitas pengasuh sebagai salah satu prediktor terkuatnya [ref:ainsworth-1978]. Erikson menempatkan periode ini sebagai tahap trust vs mistrust, pembentukan rasa percaya dasar [ref:erikson]." },
        { type: "own", judul: "Menjawab miskonsepsi umum", isi: "Apakah menanggapi setiap tangisan akan memanjakan bayi? Bukti perkembangan menunjukkan tidak, setidaknya pada tahun pertama. Pada bayi, menangis adalah sinyal kebutuhan, bukan manipulasi; respons yang konsisten membangun rasa aman yang menjadi fondasi kemandirian, bukan ketergantungan [ref:aap-responsive]." },
        { type: "own", judul: "Implikasi praktis", isi: "Temuan ini menyederhanakan menjadi satu prinsip: interaksi hangat dan responsif sehari-hari, menanggapi tangis, membalas tatapan, meniru suara, adalah bentuk stimulasi paling bermakna. Yang dibutuhkan bukan kesempurnaan, melainkan respons yang cukup sering dan cukup hangat [ref:aap-responsive]." },
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
        { type: "own", value: "~50%", label: "penurunan risiko SIDS dengan tidur sekamar (kasur terpisah)", sourceId: "aap-safe-sleep-2022" },
        { type: "own", value: "6 bln", label: "durasi ASI eksklusif yang direkomendasikan WHO", sourceId: "who-breastfeeding" },
        { type: "own", value: ">50%", label: "penurunan tajam angka SIDS sejak kampanye 'tidur telentang'", sourceId: "cdc-sids" },
      ],
      figure: { id: "safe-sleep-abc", caption: "Prinsip tidur aman: sendiri, telentang, di boks (Alone, Back, Crib)", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "tidur-aman-abc", sectionKey: "tidur-telentang" },
        { type: "module", moduleId: "tidur-aman-abc", sectionKey: "lingkungan-tidur" },
        { type: "module", moduleId: "asi-menyusui", sectionKey: "asi-eksklusif" },
        { type: "own", judul: "Pola tidur bayi baru", isi: "Total tidur 14–17 jam sehari dalam potongan pendek adalah normal, karena bayi perlu sering menyusu. Pola akan matang seiring waktu; jangan memaksa jadwal tidur di minggu-minggu awal." },
        { type: "own", judul: "Kapan menghubungi dokter", isi: "Segera hubungi tenaga kesehatan bila bayi demam ≥38°C, malas menyusu, tampak sangat kuning, napas cepat/sesak, atau popok basah kurang dari 6 kali sehari. Manfaatkan juga penimbangan rutin di posyandu, pencatatan pertumbuhan di Buku KIA, dan pemeriksaan perkembangan (KPSP) di posyandu/puskesmas. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter." },
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
        { type: "own", value: "18–24 bln", label: "usia minimal sebelum layar dianjurkan (kecuali video call)", sourceId: "aap-media" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-serve-return" },
      ],
      figure: { id: "serve-return", caption: "Interaksi bolak-balik sehari-hari membangun arsitektur otak", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "serve-return", sectionKey: "kurikulum-interaksi" },
        { type: "module", moduleId: "serve-return", sectionKey: "serve-return-membangun" },
        { type: "module", moduleId: "screen-time", sectionKey: "mengapa-hindari-layar" },
        { type: "module", moduleId: "serve-return", sectionKey: "kebebasan-bergerak" },
        { type: "module", moduleId: "serve-return", sectionKey: "kesejahteraan" },
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
        { type: "own", value: "4–6 bln", label: "rentang normal bayi mulai berguling, sangat bervariasi", sourceId: "cdc-act-early" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
      ],
      figure: { id: "motor-sequence", caption: "Kendali tubuh dari kepala ke bawah membuka kemampuan meraih", afterSectionIndex: 0 },
      sections: [
        { type: "own", judul: "Dari kepala ke tangan", isi: "Kendali otot yang tadinya di kepala kini menjalar ke bahu, lengan, dan tangan. Inilah yang memungkinkan bayi mulai meraih benda dengan sengaja, sebuah lompatan dari gerakan acak menjadi gerakan bertujuan." },
        { type: "own", judul: "Koordinasi mata-tangan", isi: "Meraih menggabungkan penglihatan dan gerak dalam satu tindakan. Bayi harus melihat benda, memperkirakan jaraknya, lalu mengarahkan tangan, latihan awal koordinasi yang kelak dipakai untuk makan sendiri dan menulis." },
        { type: "own", judul: "Berguling: mobilitas pertama", isi: "Berguling menandai mobilitas pertama dan menguatkan otot inti untuk duduk. Karena bayi kini bisa berpindah, jangan pernah meninggalkannya di permukaan tinggi seperti kasur atau sofa." },
        { type: "own", judul: "Mulut sebagai alat belajar", isi: "Membawa benda ke mulut bukan kebiasaan buruk, melainkan cara utama bayi mengenali tekstur dan bentuk pada tahap sensorimotor [ref:piaget]. Pastikan benda di sekitarnya aman dan cukup besar agar tidak tertelan." },
        { type: "own", judul: "Rentang normal itu lebar", isi: "Sebagian bayi berguling lebih awal, sebagian lebih lambat [ref:cdc-act-early]. Yang penting adalah kemajuan yang konsisten dan kesempatan bergerak setiap hari, bukan kecocokan dengan tanggal tertentu." },
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
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
      ],
      figure: { id: "cause-effect", caption: "Aku melakukan, sesuatu terjadi, aku ulangi: bayi belajar sebab-akibat", afterSectionIndex: 0 },
      sections: [
        { type: "module", moduleId: "sebab-akibat", sectionKey: "aku-melakukan" },
        { type: "own", judul: "Awal object permanence", isi: "Bayi mulai memandangi benda yang jatuh atau menghilang. Ini benih dari object permanence, pemahaman bahwa benda (dan orang) tetap ada meski tak terlihat, yang menjadi dasar memori dan rasa aman." },
        { type: "own", judul: "Tangan dan mulut sebagai laboratorium", isi: "Menurut Piaget, bayi di tahap sensorimotor membangun pengetahuan lewat indra dan gerak [ref:piaget]. Mengeksplorasi benda dengan tangan dan mulut adalah 'eksperimen' hariannya untuk memahami cara kerja dunia." },
        { type: "module", moduleId: "sebab-akibat", sectionKey: "mainan-sederhana" },
        { type: "own", judul: "Rasa ingin tahu, mesin belajar", isi: "Beri bayi kesempatan mengeksplorasi benda aman dan tanggapi rasa ingin tahunya. Setiap eksplorasi memperkuat sebagian dari lebih dari sejuta koneksi saraf yang terbentuk tiap detik [ref:harvard-brain]." },
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
        { type: "own", value: "Universal", label: "babbling muncul pada semua bayi lintas budaya dan bahasa", sourceId: "asha" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-serve-return" },
      ],
      figure: { id: "serve-return", caption: "Menirukan ocehan lalu memberi jeda melatih pola percakapan", afterSectionIndex: 2 },
      sections: [
        { type: "module", moduleId: "serve-return", sectionKey: "babbling-universal" },
        { type: "module", moduleId: "serve-return", sectionKey: "melatih-otot" },
        { type: "module", moduleId: "serve-return", sectionKey: "serve-return-mempercepat" },
        { type: "module", moduleId: "serve-return", sectionKey: "dengar-dulu" },
        { type: "module", moduleId: "serve-return", sectionKey: "batasi-layar" },
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
        { type: "own", value: "±50–60%", label: "bayi membentuk kelekatan aman saat pengasuhan responsif", sourceId: "ainsworth-1978" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-serve-return" },
      ],
      figure: { id: "serve-return", caption: "Bermain interaktif memperkuat ikatan dan regulasi emosi", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Mengenali wajah familiar", isi: "Bayi kini jelas membedakan orang yang dikenal dari orang asing, dan menunjukkan preferensi pada pengasuhnya. Ini tanda ikatan yang sedang menguat, bukan sikap manja." },
        { type: "own", judul: "Tawa: bahasa sosial", isi: "Tawa spontan adalah bentuk komunikasi sosial: bayi 'mengajak' Anda berinteraksi. Membalasnya memberi sinyal bahwa dunia sosialnya menyenangkan dan aman." },
        { type: "module", moduleId: "kelekatan-aman", sectionKey: "regulasi-co" },
        { type: "module", moduleId: "kelekatan-aman", sectionKey: "bermain-ikatan" },
        { type: "own", judul: "Rutinitas menumbuhkan rasa aman", isi: "Pola harian yang dapat diprediksi membantu bayi merasa aman. Rasa aman inilah yang menopang seluruh perkembangan sosial-emosionalnya." },
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
        { type: "own", value: "6 bln", label: "durasi ASI eksklusif yang direkomendasikan sebelum MPASI", sourceId: "who-breastfeeding" },
        { type: "module", moduleId: "kebutuhan-tidur", statKey: "tidur-4-12m" },
      ],
      figure: { id: "safe-sleep-abc", caption: "Prinsip tidur aman tetap berlaku: sendiri, telentang, di boks", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "asi-menyusui", sectionKey: "asi-cukup" },
        { type: "own", judul: "Tidur yang mulai berpola", isi: "Bayi 4–12 bulan membutuhkan sekitar 12–16 jam tidur per 24 jam termasuk tidur siang [ref:aap-aasm-sleep]. Tidur malam mulai lebih panjang; membangun rutinitas tidur sederhana membantu pola ini terbentuk." },
        { type: "own", judul: "Imunisasi tepat waktu", isi: "Jadwal imunisasi berlanjut di masa ini dan melindungi bayi dari penyakit serius pada saat sistem kekebalannya masih berkembang. Ikuti jadwal dari dokter/IDAI dan catat setiap dosis." },
        { type: "module", moduleId: "tidur-aman-abc", sectionKey: "tidur-aman-tetap" },
        { type: "own", judul: "Kapan menghubungi dokter", isi: "Berat badan tidak naik, menolak menyusu, demam tinggi, atau sangat rewel/lemas perlu diperiksakan. Manfaatkan juga penimbangan rutin di posyandu, pencatatan pertumbuhan di Buku KIA, dan pemeriksaan perkembangan (KPSP) di posyandu/puskesmas. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter." },
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
        { type: "own", value: "Sejak lahir", label: "usia yang dianjurkan untuk mulai membacakan buku pada anak", sourceId: "aap-literacy" },
        { type: "own", value: "18–24 bln", label: "usia minimal sebelum layar dianjurkan (kecuali video call)", sourceId: "aap-media" },
      ],
      figure: { id: "serve-return", caption: "Bermain dan membaca bersama adalah interaksi yang membangun otak", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Bermain adalah kerja bayi", isi: "Bermain bukan sekadar hiburan; itu cara utama bayi belajar (Vygotsky, Montessori). Mainan bertekstur dan berbunyi memberi masukan sensorik yang memperkaya perkembangannya." },
        { type: "own", judul: "Membacakan sejak dini", isi: "Membacakan buku sejak lahir dianjurkan karena menumbuhkan bahasa dan mempererat ikatan [ref:aap-literacy]. Bayi belum paham cerita, tetapi menyerap suara, irama, dan kedekatan, semuanya bahan bangunan bahasa." },
        { type: "own", judul: "Ikuti minat bayi", isi: "Perhatikan apa yang menarik perhatian bayi dan tanggapi (serve & return). Pengalaman yang mengikuti minatnya lebih bermakna daripada aktivitas yang dipaksakan." },
        { type: "own", judul: "Mengapa tanpa layar", isi: "AAP menganjurkan menghindari layar untuk bayi di bawah 18–24 bulan, kecuali panggilan video [ref:aap-media]. Waktu layar menggantikan interaksi manusia yang jauh lebih bernilai bagi otak yang sedang dibangun." },
        { type: "own", judul: "Sederhana tapi konsisten", isi: "Beberapa menit bermain dan membaca setiap hari, dilakukan konsisten, lebih berdampak daripada sesi panjang sesekali. Kedekatan dan pengulangan adalah kuncinya." },
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
        { type: "own", value: "6–10 bln", label: "rentang normal mulai merangkak, sebagian bayi bahkan melewatinya", sourceId: "cdc-act-early" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
      ],
      figure: { id: "motor-sequence", caption: "Kendali badan yang menguat memungkinkan duduk tanpa topangan", afterSectionIndex: 0 },
      sections: [
        { type: "own", judul: "Duduk membebaskan tangan", isi: "Ketika bayi bisa duduk tanpa topangan, kedua tangannya bebas untuk memegang, memindahkan, dan memeriksa benda. Ini melompatkan kemampuan belajar karena ia bisa memanipulasi dunia sambil mengamatinya." },
        { type: "own", judul: "Merangkak dan mobilitas mandiri", isi: "Merangkak memberi bayi kendali atas ke mana ia pergi. Kemampuan berpindah sendiri mengubah cara ia belajar tentang ruang dan jarak. Sebagian bayi melewati fase merangkak dan langsung merambat, ini normal [ref:cdc-act-early]." },
        { type: "own", judul: "Menuju menjumput", isi: "Genggaman bayi menghalus dari seluruh telapak menuju ujung jari (pincer grasp). Keterampilan ini menyiapkannya untuk makan sendiri dan memegang benda kecil dengan presisi." },
        { type: "own", judul: "Amankan lingkungan sekarang", isi: "Karena bayi kini bergerak dan memasukkan segala hal ke mulut, mengamankan rumah (baby-proofing) menjadi wajib: tutup colokan, halangi tangga, jauhkan benda kecil dan cairan berbahaya." },
        { type: "own", judul: "Rentang normal itu lebar", isi: "Waktu setiap milestone bervariasi. Yang penting adalah kemajuan yang konsisten dan kesempatan bergerak bebas setiap hari di alas yang aman." },
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
        { type: "own", value: "±8 bln", label: "sekitar usia object permanence mulai berkembang (Piaget)", sourceId: "piaget" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
      ],
      figure: { id: "object-permanence", caption: "Bayi mulai mencari benda yang disembunyikan, tanda ia paham benda tetap ada", afterSectionIndex: 0 },
      sections: [
        { type: "module", moduleId: "object-permanence", sectionKey: "menemukan" },
        { type: "module", moduleId: "object-permanence", sectionKey: "mengapa-tonggak" },
        { type: "module", moduleId: "object-permanence", sectionKey: "cilukba" },
        { type: "own", judul: "Wadah, isi, dan kosongkan", isi: "Memasukkan dan mengeluarkan benda dari wadah adalah 'eksperimen' favorit di usia ini. Aktivitas sederhana ini melatih pemahaman ruang, sebab-akibat, dan ketekunan." },
        { type: "own", judul: "Eksplorasi tetap lewat indra", isi: "Tangan dan mulut tetap menjadi alat belajar utama. Sediakan benda aman yang beragam bentuk dan tekstur untuk dieksplorasi." },
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
        { type: "own", value: "Reseptif lalu ekspresif", label: "bayi memahami jauh lebih banyak daripada yang bisa ia ucapkan", sourceId: "asha" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-serve-return" },
      ],
      figure: { id: "serve-return", caption: "Menanggapi suara dan gestur bayi memperkuat pemahaman bahasanya", afterSectionIndex: 2 },
      sections: [
        { type: "own", judul: "Merespons nama dan kata 'tidak'", isi: "Bayi mulai menoleh saat namanya dipanggil dan bereaksi terhadap kata 'tidak'. Ini menunjukkan pemahaman (bahasa reseptif) yang berkembang jauh sebelum ia bisa mengucap kata [ref:asha]." },
        { type: "own", judul: "Ocehan berantai", isi: "Ocehan berubah menjadi rantai suku kata seperti 'ba-ba-ba' dan 'ma-ma-ma'. Bayi bereksperimen menyusun bunyi, latihan langsung menuju kata pertama." },
        { type: "own", judul: "Gestur adalah bahasa", isi: "Menunjuk, melambai, dan mengulurkan tangan adalah komunikasi pra-verbal yang penting. Berbagi perhatian lewat gestur (joint attention) adalah fondasi kuat bagi bahasa." },
        { type: "own", judul: "Namai dunianya", isi: "Sebut nama benda dan orang secara konsisten. Setiap kali Anda menanggapi suara atau gestur bayi, jalur bahasanya menguat [ref:harvard-serve-return]." },
        { type: "module", moduleId: "tonggak-bahasa", sectionKey: "dengar-baik" },
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
        { type: "own", value: "6–9 bln", label: "usia khas munculnya kecemasan pada orang asing", sourceId: "cdc-act-early" },
        { type: "own", value: "±50–60%", label: "bayi membentuk kelekatan aman saat pengasuhan responsif", sourceId: "ainsworth-1978" },
      ],
      figure: { id: "serve-return", caption: "Pengasuh yang responsif menjadi 'basis aman' bagi bayi", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "kelekatan-aman", sectionKey: "mengapa-takut" },
        { type: "module", moduleId: "kelekatan-aman", sectionKey: "sehat-bukan-manja" },
        { type: "module", moduleId: "kelekatan-aman", sectionKey: "kaitan-berpisah" },
        { type: "module", moduleId: "kelekatan-aman", sectionKey: "cara-membantu" },
        { type: "module", moduleId: "kelekatan-aman", sectionKey: "basis-aman" },
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
        { type: "own", value: "6 bln", label: "usia umum bayi siap memulai MPASI", sourceId: "who-complementary-2023" },
        { type: "own", value: "Zat besi", label: "nutrien paling krusial saat MPASI dimulai", sourceId: "who-complementary-2023" },
        { type: "own", value: "<1 thn", label: "madu harus dihindari sepenuhnya (risiko botulisme)", sourceId: "aap-idai-mpasi" },
      ],
      figure: { id: "mpasi-texture", caption: "Tekstur MPASI dinaikkan bertahap; ASI tetap dilanjutkan", afterSectionIndex: 2 },
      sections: [
        { type: "module", moduleId: "mpasi", sectionKey: "tanda-siap" },
        { type: "module", moduleId: "mpasi", sectionKey: "zat-besi" },
        { type: "module", moduleId: "mpasi", sectionKey: "tekstur" },
        { type: "module", moduleId: "mpasi", sectionKey: "keamanan" },
        { type: "module", moduleId: "mpasi", sectionKey: "asi-lanjut" },
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
        { type: "own", value: "18–24 bln", label: "usia minimal sebelum layar dianjurkan (kecuali video call)", sourceId: "aap-media" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
      ],
      figure: { id: "serve-return", caption: "Menanggapi eksplorasi bayi mengubah rumah jadi ruang belajar", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Menjelajah adalah belajar", isi: "Bayi yang mobile ingin menjelajahi segalanya. Menurut pendekatan Montessori, lingkungan yang disiapkan dengan aman (prepared environment) adalah 'guru' terbaik di usia ini." },
        { type: "own", judul: "Baby-proofing membebaskan", isi: "Rumah yang aman berarti Anda tidak perlu terus melarang. Semakin sedikit 'jangan', semakin banyak kesempatan bayi belajar lewat eksplorasi bebas." },
        { type: "own", judul: "Rutinitas memberi rasa aman", isi: "Pola makan-main-tidur yang dapat diprediksi membantu bayi merasa aman. Rasa aman ini menopang keberanian bereksplorasi." },
        { type: "own", judul: "Mainan yang menantang", isi: "Wadah bertutup, balok, dan mainan sebab-akibat sesuai usia mendorong pemecahan masalah. Mainan sederhana yang bereaksi terhadap tindakan bayi lebih bernilai daripada layar." },
        { type: "module", moduleId: "screen-time", sectionKey: "tetap-tanpa-layar" },
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
        { type: "own", value: "9–15 bln", label: "rentang normal bayi mulai berjalan sendiri, sangat bervariasi", sourceId: "cdc-act-early" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
      ],
      figure: { id: "motor-sequence", caption: "Kekuatan yang menjalar ke kaki membawa bayi dari duduk ke berdiri", afterSectionIndex: 0 },
      sections: [
        { type: "own", judul: "Menarik badan dan merambat", isi: "Bayi menarik badan untuk berdiri dan merambat sambil berpegangan furnitur (cruising). Ini latihan keseimbangan dan kekuatan kaki, persiapan langsung untuk berjalan." },
        { type: "own", judul: "Pincer grasp: presisi jari", isi: "Genggaman kini memakai ujung ibu jari dan telunjuk (pincer grasp), memungkinkan bayi menjumput benda kecil. Keterampilan halus ini menandai kesiapan makan sendiri." },
        { type: "own", judul: "Hindari baby walker", isi: "Baby walker tidak dianjurkan karena berisiko cedera dan tidak membantu bayi belajar berjalan [ref:aap-baby-walker]. Bayi belajar berjalan paling baik lewat berdiri dan merambat secara alami." },
        { type: "own", judul: "Belajar lewat kesempatan", isi: "Sediakan furnitur yang stabil untuk merambat dan ruang lantai yang aman. Finger food juga melatih pincer grasp sekaligus kemandirian makan." },
        { type: "own", judul: "Rentang normal itu lebar", isi: "Berjalan bisa muncul kapan saja antara 9 hingga 15 bulan [ref:cdc-act-early]. Yang penting adalah kemajuan yang konsisten, bukan kecocokan dengan tanggal tertentu." },
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
        { type: "own", value: "9–12 bln", label: "usia munculnya joint attention, menunjuk untuk berbagi perhatian", sourceId: "cdc-act-early" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
      ],
      figure: { id: "joint-attention", caption: "Bayi, benda, dan Anda menatap hal yang sama: fondasi bahasa dan sosial", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Meniru adalah belajar", isi: "Bayi meniru gestur seperti bertepuk dan melambai. Meniru adalah cara utamanya menyerap keterampilan dan kebiasaan dari orang di sekitarnya." },
        { type: "module", moduleId: "joint-attention", sectionKey: "menunjuk-berbagi" },
        { type: "own", judul: "Memakai benda sesuai fungsi", isi: "Bayi mulai mendekatkan sisir ke rambut atau telepon mainan ke telinga. Ini menunjukkan ia memahami fungsi benda, bentuk awal berpikir simbolik." },
        { type: "own", judul: "Memecahkan masalah kecil", isi: "Menarik kain untuk meraih mainan di atasnya adalah pemecahan masalah sederhana (means-end). Bayi belajar merencanakan langkah untuk mencapai tujuan." },
        { type: "module", moduleId: "joint-attention", sectionKey: "mengapa-menunjuk" },
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
        { type: "own", value: "±12 bln", label: "usia umum munculnya kata pertama yang bermakna", sourceId: "asha" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-brain" },
      ],
      figure: { id: "joint-attention", caption: "Menunjuk sambil menatap Anda: jembatan menuju kata pertama", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Mama/dada dengan arti", isi: "Sekitar usia 12 bulan, banyak bayi mengucap kata pertama yang bermakna seperti 'mama' atau 'dada' [ref:asha]. Ini puncak dari setahun mendengarkan dan mengoceh." },
        { type: "module", moduleId: "joint-attention", sectionKey: "menunjuk-membuka" },
        { type: "own", judul: "Memahami perintah sederhana", isi: "Bayi memahami permintaan seperti 'sini' atau 'dadah' jauh sebelum bisa mengucapkannya. Pemahaman selalu mendahului ucapan." },
        { type: "own", judul: "Perluas dan namai", isi: "Saat bayi menunjuk sesuatu, beri namanya ('iya, itu bola'). Memperluas ucapannya menjadi kata utuh memperkaya bahasanya." },
        { type: "module", moduleId: "tonggak-bahasa", sectionKey: "waspadai-kemunduran" },
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
        { type: "own", value: "6–12 bln", label: "periode kecemasan berpisah biasanya memuncak", sourceId: "cdc-act-early" },
        { type: "own", value: "±50–60%", label: "bayi membentuk kelekatan aman saat pengasuhan responsif", sourceId: "ainsworth-1978" },
      ],
      figure: { id: "serve-return", caption: "Respons yang konsisten membuat bayi merasa aman untuk mandiri", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Kecemasan berpisah memuncak", isi: "Menjelang usia 1 tahun, kecemasan berpisah sering memuncak [ref:cdc-act-early]. Bayi protes saat ditinggal karena kini ia paham Anda tetap ada meski pergi, tetapi belum tahu kapan kembali." },
        { type: "own", judul: "Objek transisi", isi: "Selimut atau boneka kesayangan (objek transisi) membantu bayi merasa aman saat Anda tidak ada. Menurut Winnicott, ini perkembangan yang sehat, bukan tanda ketergantungan." },
        { type: "own", judul: "Menguji reaksi", isi: "Menjatuhkan benda berulang kali dan menunggu reaksi Anda adalah cara bayi belajar sebab-akibat sosial. Tanggapi dengan sabar; ini eksplorasi, bukan kenakalan." },
        { type: "module", moduleId: "kelekatan-aman", sectionKey: "perpisahan" },
        { type: "module", moduleId: "kelekatan-aman", sectionKey: "kelekatan-keberanian" },
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
        { type: "own", value: "12 bln", label: "usia minimal sebelum susu sapi jadi minuman utama", sourceId: "aap-cow-milk" },
        { type: "own", value: "<1 thn", label: "madu harus dihindari sepenuhnya (risiko botulisme)", sourceId: "who-idai-mpasi" },
      ],
      figure: { id: "mpasi-texture", caption: "Tekstur meningkat menuju makanan keluarga; bayi mulai makan sendiri", afterSectionIndex: 0 },
      sections: [
        { type: "own", judul: "Self-feeding dan berantakan itu baik", isi: "Membiarkan bayi makan sendiri dengan tangan atau sendok, meski berantakan, membangun keterampilan motorik dan kemandirian. Ini investasi kebiasaan makan yang sehat." },
        { type: "module", moduleId: "mpasi", sectionKey: "susu-sapi-tunggu" },
        { type: "module", moduleId: "mpasi", sectionKey: "variasi-zat-besi" },
        { type: "module", moduleId: "mpasi", sectionKey: "hindari-gula" },
        { type: "own", judul: "Kapan menghubungi dokter", isi: "Menolak makan terus-menerus, berat badan turun atau stagnan, atau tanda alergi perlu diperiksakan. Manfaatkan juga penimbangan rutin di posyandu, pencatatan pertumbuhan di Buku KIA, dan pemeriksaan perkembangan (KPSP) di posyandu/puskesmas. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter/ahli gizi." },
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
        { type: "own", value: "18–24 bln", label: "usia minimal sebelum layar dianjurkan (kecuali video call)", sourceId: "aap-media" },
        { type: "own", value: "1 jt+", label: "koneksi saraf baru terbentuk tiap detik di tahun-tahun awal", sourceId: "harvard-serve-return" },
      ],
      figure: { id: "serve-return", caption: "Menanggapi dan mengalihkan dengan hangat mengajarkan rasa aman", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "disiplin-positif", sectionKey: "menguji-batas" },
        { type: "module", moduleId: "disiplin-positif", sectionKey: "alihkan" },
        { type: "module", moduleId: "disiplin-positif", sectionKey: "sedikit-batas" },
        { type: "own", judul: "Bermain interaktif", isi: "Ciluk-ba, tepuk ame-ame, dan meniru pekerjaan rumah adalah permainan yang memperkuat ikatan sekaligus keterampilan. Ini juga latihan serve & return [ref:harvard-serve-return]." },
        { type: "module", moduleId: "screen-time", sectionKey: "tetap-tanpa-layar", isiOverride: "Layar tetap tidak dianjurkan di bawah 18–24 bulan [ref:aap-media]. Waktu bermain dan membaca bersama jauh lebih bernilai bagi perkembangan." },
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
    scientific: {
      title: "Detail ilmiah, TODO",
      sections: [
        { judul: "Waspadai kemunduran", isi: "Kehilangan kata atau kemampuan sosial yang pernah dimiliki adalah tanda penting yang perlu segera dikonsultasikan, terlepas dari usia. Skrining perkembangan (KPSP) di posyandu/puskesmas dapat menjadi langkah awal yang mudah diakses." },
      ],
    },
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
    scientific: {
      title: "Detail ilmiah, TODO",
      sections: [
        { judul: "Kapan menghubungi dokter", isi: "Berat badan menurun, pilih-pilih hingga berisiko kurang gizi, atau tanda anemia (pucat, lemas) perlu diperiksakan. Manfaatkan juga penimbangan rutin di posyandu, pencatatan pertumbuhan di Buku KIA, dan pemeriksaan perkembangan (KPSP) di posyandu/puskesmas. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter/ahli gizi." },
      ],
      references: [
        { n: 1, text: "Kementerian Kesehatan RI — Buku KIA; SDIDTK/KPSP (pemantauan pertumbuhan & perkembangan).", url: "https://www.kemkes.go.id" },
      ],
    },
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
    scientific: {
      title: "Detail ilmiah, TODO",
      sections: [
        { judul: "Kapan skrining bicara", isi: "Pertimbangkan skrining bila kosakata anak di bawah 50 kata menjelang 24 bulan, belum menggabungkan dua kata, tidak mengikuti perintah, atau kehilangan bahasa. Skrining perkembangan (KPSP) di posyandu/puskesmas dapat menjadi langkah awal yang mudah diakses." },
      ],
    },
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
    scientific: {
      title: "Detail ilmiah, TODO",
      sections: [
        { judul: "Kapan menghubungi dokter", isi: "Berat badan tidak naik, tanda gigi berlubang (bercak putih/cokelat), atau pilih-pilih hingga berisiko kurang gizi perlu diperiksakan. Manfaatkan juga penimbangan rutin di posyandu, pencatatan pertumbuhan di Buku KIA, dan pemeriksaan perkembangan (KPSP) di posyandu/puskesmas. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter/ahli gizi." },
      ],
      references: [
        { n: 1, text: "Kementerian Kesehatan RI — Buku KIA; SDIDTK/KPSP (pemantauan pertumbuhan & perkembangan).", url: "https://www.kemkes.go.id" },
      ],
    },
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
    scientific: {
      title: "Detail ilmiah, TODO",
      sections: [
        { judul: "Kapan skrining bicara", isi: "Pertimbangkan skrining bila di usia 3 tahun anak belum berbicara dengan kalimat, ucapannya tidak dimengerti keluarga, tidak bertanya, atau kehilangan bahasa. Skrining perkembangan (KPSP) di posyandu/puskesmas dapat menjadi langkah awal yang mudah diakses." },
      ],
    },
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
    scientific: {
      title: "Detail ilmiah, TODO",
      stats: [
        { value: "10–14 jam", label: "kebutuhan tidur per 24 jam (usia 2: 11–14 jam; usia 3: 10–13 jam)", ref: 2 },
        { value: "Beras → kacang polong", label: "takaran pasta fluoride: sebutir beras (<3 thn), sebutir kacang polong (≥3 thn)", ref: 3 },
      ],
      sections: [
        { judul: "Tidur & kesehatan gigi", isi: "Anak usia 2 tahun membutuhkan sekitar 11–14 jam tidur per 24 jam, dan sekitar 10–13 jam saat memasuki usia 3 tahun [2]. Sikat gigi dua kali sehari dengan pasta berfluoride — seukuran sebutir beras untuk anak di bawah 3 tahun, dan sebutir kacang polong sejak usia 3 tahun [3] — dan batasi minuman manis." },
        { judul: "Kapan menghubungi dokter", isi: "Berat badan tidak naik, pilih-pilih hingga berisiko kurang gizi, atau tanda infeksi saluran kemih perlu diperiksakan. Manfaatkan juga penimbangan rutin di posyandu, pencatatan pertumbuhan di Buku KIA, dan pemeriksaan perkembangan (KPSP) di posyandu/puskesmas. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter/ahli gizi." },
      ],
      references: [
        { n: 1, text: "WHO; IDAI, gizi dan tumbuh kembang anak usia prasekolah.", url: "https://www.who.int" },
        { n: 2, text: "American Academy of Pediatrics / AASM, rekomendasi durasi tidur anak.", url: "https://www.healthychildren.org" },
        { n: 3, text: "American Academy of Pediatric Dentistry (AAPD) / ADA — panduan pasta fluoride.", url: "https://www.aapd.org" },
        { n: 4, text: "Kementerian Kesehatan RI — Buku KIA; SDIDTK/KPSP (pemantauan pertumbuhan & perkembangan).", url: "https://www.kemkes.go.id" },
      ],
    },
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

  // ===================== 3–4 TAHUN =====================
  {
    id: "RL-3-4y-FM", ageKey: "3-4y", domain: "FM", title: "Berlari, melompat & motorik halus menuju pra-menulis",
    photo: P("3-4y-fm", "Anak berlari dan melompat di taman"), readMinutes: 2,
    summary: {
      terjadi: "Anak berdiri satu kaki beberapa detik, melompat dengan dua kaki, menaiki tangga bergantian, menangkap bola besar, mengayuh sepeda roda tiga, dan menggunting mengikuti garis.",
      penting: "WHO menganjurkan 180 menit aktivitas fisik sehari untuk usia di bawah 5 tahun. Gerak aktif menopang tulang, tidur, dan perkembangan otak.",
      lakukan: ["Sediakan waktu dan ruang untuk berlari, melompat, dan memanjat.", "Berikan gunting aman dan krayon untuk melatih motorik halus.", "Ajak bersepeda roda tiga, bermain bola, dan menari."],
      perhatian: "Di usia 4 tahun anak sering jatuh, tidak bisa melompat dua kaki, tidak bisa memegang krayon, atau kehilangan keterampilan."
    },
    scientific: {
      title: "Gerak aktif dan motorik halus di usia 3–4 tahun",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "own", value: "180 menit", label: "aktivitas fisik per hari yang dianjurkan WHO untuk anak di bawah 5 tahun", sourceId: "who-activity-u5-2019" },
        { type: "own", value: "≥60 menit", label: "bagian aktivitas yang sebaiknya berintensitas sedang–berat (usia 3–4 thn)", sourceId: "who-activity-u5-2019" },
      ],
      figure: { id: "motor-sequence", caption: "Keseimbangan dan koordinasi yang makin matang", afterSectionIndex: 0 },
      sections: [
        { type: "own", judul: "Keseimbangan satu kaki", isi: "Anak mulai berdiri dengan satu kaki beberapa detik, melompat dengan dua kaki, dan menaiki tangga dengan kaki bergantian. Keseimbangan yang matang ini membuka gerakan-gerakan yang lebih kompleks." },
        { type: "own", judul: "Menangkap, melempar, mengayuh", isi: "Menangkap bola besar dengan dua tangan dan melempar ke arah sasaran melatih koordinasi seluruh tubuh. Sepeda roda tiga kini dikayuh dengan lancar dan mulai bisa dikendalikan arahnya." },
        { type: "own", judul: "Gerak aktif 180 menit", isi: "WHO menganjurkan anak usia 3–4 tahun aktif bergerak total sekitar 180 menit sehari, dengan setidaknya 60 menit di antaranya cukup membuat terengah (berlari, memanjat, menari) [ref:who-activity-u5-2019]. Gerak sebanyak ini menopang tulang, tidur, dan perkembangan otak." },
        { type: "own", judul: "Motorik halus menuju pra-menulis", isi: "Menggunting mengikuti garis, menggambar lingkaran dan sosok orang sederhana, serta mengancingkan baju melatih otot-otot kecil tangan yang kelak dipakai menulis. Sediakan gunting aman dan banyak kertas bekas." },
        { type: "module", moduleId: "urutan-motorik-kasar", sectionKey: "rentang-normal",
          isiOverride: "Variasi antar anak tetap lebar di usia 3–4 tahun: sebagian sudah mahir melompat satu kaki lebih awal, sebagian belum. Yang penting bukan mengejar tanggal milestone, melainkan memberi kesempatan bergerak setiap hari [ref:aap-healthychildren]." },
      ],
    },
    sources: ["WHO (aktivitas fisik <5 tahun)", "CDC Learn the Signs. Act Early.", "AAP"]
  },
  {
    id: "RL-3-4y-KG", ageKey: "3-4y", domain: "KG", title: "Fungsi eksekutif: menara kontrol yang sedang dibangun",
    photo: P("3-4y-kg", "Anak bermain peran dengan aturan"), readMinutes: 2,
    summary: {
      terjadi: "Anak mulai menahan dorongan, mengikuti aturan main, berpindah perspektif, dan menghitung benda kecil. Bermain peran makin panjang dan berskenario.",
      penting: "Usia 3–5 tahun adalah jendela perkembangan fungsi eksekutif yang paling pesat. Fungsi eksekutif lebih menentukan kesiapan sekolah daripada hafalan huruf atau angka.",
      lakukan: ["Mainkan permainan beraturan sederhana (lampu merah–hijau, Simon says).", "Biarkan bermain peran panjang tanpa interupsi.", "Beri latihan menunggu giliran."],
      perhatian: "Di usia 4 tahun anak tidak bisa mengikuti aturan dua langkah, sangat impulsif, atau tidak bisa bermain bersama sama sekali."
    },
    scientific: {
      title: "Fungsi eksekutif: menara kontrol lalu lintas otak",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "fungsi-eksekutif", statKey: "jendela-3-5" },
        { type: "own", value: "Pura-pura", label: "bermain peran = latihan perencanaan dan kontrol diri", sourceId: "vygotsky-piaget-play" },
      ],
      figure: { id: "executive-function", caption: "Menara kontrol otak: memori kerja, kontrol diri, fleksibilitas", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "fungsi-eksekutif", sectionKey: "tiga-inti" },
        { type: "module", moduleId: "fungsi-eksekutif", sectionKey: "berkembang-3-5" },
        { type: "own", judul: "Bermain peran yang makin panjang", isi: "Skenario pura-pura anak kini bersambung: ada peran, alur, dan 'aturan main'. Menahan diri agar sesuai peran ('aku dokternya, kamu pasiennya') adalah latihan kontrol diri kelas berat yang menyamar sebagai kesenangan [ref:vygotsky-piaget-play]." },
        { type: "own", judul: "Konsep awal berhitung", isi: "Anak mulai menghitung benda kecil satu per satu dan memahami perbandingan sederhana seperti 'lebih banyak' dan 'lebih sedikit'. Hitung hal nyata — anak tangga, potongan buah — bukan lembar latihan." },
        { type: "module", moduleId: "fungsi-eksekutif", sectionKey: "dilatih-bermain" },
      ],
    },
    sources: ["Harvard Center on the Developing Child", "Vygotsky & Piaget", "CDC Learn the Signs. Act Early."]
  },
  {
    id: "RL-3-4y-BH", ageKey: "3-4y", domain: "BH", title: "Kalimat utuh, cerita, dan pra-literasi",
    photo: P("3-4y-bh", "Ibu membacakan buku interaktif untuk anak"), readMinutes: 2,
    summary: {
      terjadi: "Anak berbicara dalam kalimat yang makin lengkap, menceritakan pengalamannya, dan menjelang 4 tahun ucapannya umumnya dipahami orang di luar keluarga.",
      penting: "Bahasa lisan adalah fondasi literasi. Membaca dialogis, lagu, dan rima lebih efektif membangun pra-literasi daripada les membaca dini.",
      lakukan: ["Ajak bercerita tentang pengalamannya sehari-hari.", "Bacakan buku dengan pertanyaan ('menurutmu kenapa?').", "Nyanyikan lagu dan sajak secara rutin."],
      perhatian: "Di usia 4 tahun anak belum berbicara dalam kalimat, ucapannya sulit dipahami keluarga, sangat frustrasi saat berkomunikasi, atau kehilangan kemampuan yang pernah ada."
    },
    scientific: {
      title: "Bahasa lisan sebagai fondasi literasi",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "own", value: "±4 thn", label: "ucapan anak umumnya sudah dipahami orang di luar keluarga", sourceId: "asha" },
        { type: "module", moduleId: "pra-literasi", statKey: "sejak-lahir" },
      ],
      figure: { id: "pre-literacy-path", caption: "Jalur pra-literasi: dari bunyi dan rima menuju coretan", afterSectionIndex: 2 },
      sections: [
        { type: "own", judul: "Kalimat utuh dan cerita pertama", isi: "Anak berbicara dalam kalimat yang makin lengkap, menceritakan pengalamannya, dan menjawab pertanyaan 'siapa', 'apa', dan 'di mana'. Bahasa kini menjadi alat berpikir, bukan sekadar meminta." },
        { type: "own", judul: "Dipahami orang di luar rumah", isi: "Menjelang usia 4 tahun, ucapan anak umumnya sudah dipahami orang di luar keluarganya [ref:asha]. Kesalahan pelafalan pada bunyi sulit (r, s) masih wajar dan biasanya membaik sendiri." },
        { type: "module", moduleId: "pra-literasi", sectionKey: "dari-lisan" },
        { type: "module", moduleId: "pra-literasi", sectionKey: "membaca-dialogis" },
        { type: "own", judul: "Kapan skrining bicara", isi: "Bila anak belum berbicara dalam kalimat, ucapannya sulit dipahami keluarga sendiri, tampak sangat frustrasi saat berkomunikasi, atau kehilangan kemampuan yang pernah ada, lakukan skrining bicara dan pendengaran [ref:asha]. Skrining perkembangan (KPSP) di posyandu/puskesmas dapat menjadi langkah awal yang mudah diakses [ref:kemenkes-kia-kpsp]." },
      ],
    },
    sources: ["ASHA", "American Academy of Pediatrics", "Kemenkes RI, Buku KIA"]
  },
  {
    id: "RL-3-4y-SE", ageKey: "3-4y", domain: "SE", title: "Bermain bersama, temperamen & mengelola emosi",
    photo: P("3-4y-se", "Anak-anak bermain peran bersama"), readMinutes: 2,
    summary: {
      terjadi: "Permainan bergeser dari berdampingan menjadi benar-benar bersama: berbagi peran dan mulai punya teman favorit. Teman imajiner umum dan sehat.",
      penting: "Setiap anak lahir dengan temperamen berbeda; yang menentukan perkembangan bukan temperamennya, melainkan kecocokan pengasuhan dengan 'setelan' bawaan anak (goodness of fit).",
      lakukan: ["Izinkan konflik kecil bermain sebagai latihan negosiasi.", "Sesuaikan cara pengasuhan dengan temperamen anak.", "Namai emosi anak untuk membangun kosakata perasaannya."],
      perhatian: "Di usia 4 tahun anak tidak tertarik bermain dengan anak lain, tidak bisa bermain giliran, atau mengalami kemunduran sosial."
    },
    scientific: {
      title: "Temperamen, goodness of fit, dan permainan kooperatif",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "temperamen", statKey: "9-dimensi" },
        { type: "own", value: "3–4 thn", label: "usia berkembangnya permainan bersama (cooperative play)", sourceId: "cdc-act-early" },
      ],
      figure: { id: "temperament-fit", caption: "Goodness of fit: pengasuhan yang menyesuaikan 'setelan' bawaan anak", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Dari main berdampingan ke main bersama", isi: "Permainan bergeser dari sekadar berdampingan menjadi benar-benar bersama: berbagi peran, bergiliran, dan mulai punya teman favorit [ref:cdc-act-early]. Konflik kecil justru arena latihan bernegosiasi — jangan buru-buru ditengahi." },
        { type: "module", moduleId: "temperamen", sectionKey: "tidak-ada-buruk" },
        { type: "module", moduleId: "temperamen", sectionKey: "goodness-of-fit" },
        { type: "own", judul: "Teman imajiner itu sehat", isi: "Teman imajiner umum dan sehat di usia prasekolah — ia menandakan imajinasi yang kaya dan sering menjadi sarana anak melatih percakapan serta mengolah emosinya. Tidak perlu dibantah, tidak perlu dikhawatirkan." },
        { type: "module", moduleId: "ko-regulasi", sectionKey: "menamai-emosi",
          isiOverride: "Menamai emosi anak — 'kamu kecewa karena mau lebih lama bermain', 'kamu takut dengan suara itu' — membantu anak membangun kosakata emosi dan perlahan belajar mengenali perasaannya sendiri. Di usia 3–4 tahun, anak mulai bisa mengidentifikasi emosi dasar; memberi nama lebih dulu dari Anda membuatnya lebih mudah." },
      ],
    },
    sources: ["Thomas & Chess (temperamen)", "CDC Learn the Signs. Act Early.", "AAP"]
  },
  {
    id: "RL-3-4y-KS", ageKey: "3-4y", domain: "KS", title: "Pertumbuhan, tidur & gizi usia prasekolah",
    photo: P("3-4y-ks", "Anak ditimbang di posyandu"), readMinutes: 7, isMedical: true,
    summary: {
      terjadi: "Pertumbuhan melambat tapi menetap. Anak tidur 10–13 jam per 24 jam dan mulai bertransisi menghentikan tidur siang. Pola makan makin beragam, kesehatan gigi perlu dijaga.",
      penting: "Kurva pertumbuhan lebih bermakna daripada satu angka berat. Buku KIA & posyandu adalah alat pantau utama. (Edukatif, bukan pengganti nasihat dokter.)",
      lakukan: ["Timbang rutin di posyandu; bawa Buku KIA tiap kunjungan.", "Jaga rutinitas tidur yang konsisten.", "Sajikan makanan beragam tanpa memaksa; sikat gigi 2x/hari."],
      perhatian: "Berat tidak naik 2 kali penimbangan berturut-turut, kurva mendatar/menurun, pucat, mudah lelah, atau tanda gigi berlubang, konsultasikan."
    },
    scientific: {
      title: "Memantau pertumbuhan, tidur, dan gizi di usia 3–4 tahun",
      readMinutes: 7,
      reviewedBy: { name: "Apoteker Raisha", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "pemantauan-pertumbuhan", statKey: "1x-bulan" },
        { type: "module", moduleId: "kebutuhan-tidur", statKey: "tidur-3-5y" },
        { type: "module", moduleId: "kesehatan-gigi", statKey: "fluoride" },
      ],
      figure: { id: "growth-curve", caption: "Deretan titik di Buku KIA bercerita lebih banyak daripada satu angka", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "pemantauan-pertumbuhan", sectionKey: "kurva-bukan-angka" },
        { type: "module", moduleId: "pemantauan-pertumbuhan", sectionKey: "kia-posyandu" },
        { type: "module", moduleId: "kebutuhan-tidur", sectionKey: "transisi-nap" },
        { type: "own", judul: "Gizi dan gigi: kebiasaan yang menetap", isi: "Pembagian tanggung jawab makan tetap berlaku: Anda menentukan apa, kapan, dan di mana; anak menentukan apakah dan berapa banyak [ref:satter-dor]. Sikat gigi dua kali sehari kini dengan pasta berfluoride seukuran sebutir kacang polong, dan jadwalkan kontrol gigi berkala [ref:aap-aapd-dental]." },
        { type: "own", judul: "Kapan menghubungi dokter", isi: "Berat tidak naik dua kali penimbangan berturut-turut (2T), kurva yang mendatar atau menurun, anak tampak pucat dan mudah lelah, atau tanda gigi berlubang perlu diperiksakan [ref:kemenkes-kia-kpsp]. Manfaatkan juga penimbangan rutin di posyandu, pencatatan pertumbuhan di Buku KIA, dan pemeriksaan perkembangan (KPSP) di posyandu/puskesmas. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter." },
      ],
    },
    sources: ["WHO (kurva pertumbuhan)", "Kemenkes RI, Buku KIA", "AAP / AASM (tidur)", "AAPD (gigi)", "Ellyn Satter"]
  },
  {
    id: "RL-3-4y-PS", ageKey: "3-4y", domain: "PS", title: "Pujian proses, kemandirian & layar yang terjaga",
    photo: P("3-4y-ps", "Anak mencoba berpakaian sendiri"), readMinutes: 2,
    summary: {
      terjadi: "Anak mulai bisa melakukan banyak hal sendiri (memakai sepatu, menuang air) dan sangat ingin mencoba. Cara kita memuji memengaruhi keberanian ia mencoba hal sulit.",
      penting: "Pujian proses ('kamu mencoba terus') lebih efektif daripada pujian label ('kamu memang pintar'). Layar tetap maksimal 1 jam/hari untuk usia 2–5 tahun.",
      lakukan: ["Puji usaha dan strategi, bukan bakat.", "Libatkan dalam pekerjaan rumah sungguhan.", "Damping saat menonton; pilih konten berkualitas."],
      perhatian: "Anak sangat menghindari tantangan baru atau sangat bergantung pada layar; evaluasi pola pujian dan waktu layar."
    },
    scientific: {
      title: "Pujian proses, kemandirian, dan keamanan sehari-hari",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "pujian-proses", statKey: "proses-bukan-label" },
        { type: "module", moduleId: "screen-time", statKey: "max-1h" },
      ],
      figure: { id: "praise-process", caption: "Pujian proses menumbuhkan keberanian mencoba", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "pujian-proses", sectionKey: "dua-jenis" },
        { type: "module", moduleId: "pujian-proses", sectionKey: "contoh-kalimat" },
        { type: "module", moduleId: "pencegahan-cedera", sectionKey: "bergeser-usia" },
        { type: "module", moduleId: "pencegahan-cedera", sectionKey: "tenggelam" },
        { type: "own", judul: "Kemandirian nyata dan layar yang terjaga", isi: "Libatkan anak dalam pekerjaan rumah sungguhan — menuang air minumnya sendiri, memasangkan kaus kaki, membantu menata meja. Sejalan dengan prinsip Montessori, kemandirian kecil yang nyata membangun rasa mampu [ref:montessori]. Batas layar tetap maksimal satu jam sehari dengan konten berkualitas dan didampingi [ref:aap-media]." },
      ],
    },
    sources: ["Carol Dweck (growth mindset)", "WHO (pencegahan cedera)", "AAP (screen time)", "Montessori"]
  },

  // ===================== 4–5 TAHUN =====================
  // REVIEW: peralihan pedoman aktivitas WHO (<5 thn → 5–17 thn) dalam seksi FM & KS — pastikan penjelasan dua pedoman ini akurat (Fitri/Raisha).
  {
    id: "RL-4-5y-FM", ageKey: "4-5y", domain: "FM", title: "Melompat satu kaki, menangkap bola & tangan pra-menulis",
    photo: P("4-5y-fm", "Anak melompat satu kaki di halaman"), readMinutes: 2,
    summary: {
      terjadi: "Anak melompat dengan satu kaki (hop), mulai mencoba skipping, menangkap bola yang memantul, menggambar orang dengan bagian tubuh lengkap, dan menulis beberapa huruf — sering kali huruf namanya.",
      penting: "Koordinasi dua sisi tubuh dan keseimbangan dinamis matang pesat. Memasuki usia 5 tahun, panduan WHO beralih ke minimal 60 menit aktivitas intensitas sedang–berat per hari.",
      lakukan: ["Sediakan ruang lompat, bola, dan permainan berirama.", "Sediakan gunting, krayon, dan playdough untuk motorik halus.", "Pastikan ada sesi gerak sampai terengah setiap hari."],
      perhatian: "Di usia 5 tahun anak tidak bisa melompat dengan dua kaki, tidak bisa memegang pensil/krayon, atau kehilangan keterampilan."
    },
    scientific: {
      title: "Gerak makin kompleks: melompat satu kaki, menangkap, menulis huruf pertama",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "own", value: "±5 thn", label: "banyak anak mampu melompat dengan satu kaki beberapa kali berturut-turut", sourceId: "cdc-act-early" },
        { type: "own", value: "60 menit", label: "aktivitas fisik intensitas sedang–berat per hari yang dianjurkan WHO sejak usia 5 tahun", sourceId: "who-activity-5-17" },
      ],
      figure: { id: "motor-sequence", caption: "Gerak makin kompleks: melompat satu kaki, menangkap, menulis huruf pertama", afterSectionIndex: 0 },
      sections: [
        { type: "own", judul: "Melompat satu kaki dan gerak berirama", isi: "Anak melompat dengan satu kaki (hop), mulai mencoba skipping, dan bergerak mengikuti irama. Gerakan-gerakan ini menuntut keseimbangan dinamis dan koordinasi dua sisi tubuh yang makin matang." },
        { type: "own", judul: "Menangkap bola yang memantul", isi: "Menangkap bola yang memantul atau dilempar pelan menuntut mata memperkirakan lintasan dan tangan bersiap tepat waktu — kerja sama mata-tangan yang jauh lebih rumit daripada kelihatannya." },
        { type: "own", judul: "Pedoman gerak: masa peralihan", isi: "Hingga usia 4 tahun, panduan WHO untuk balita berlaku: total sekitar 180 menit gerak aktif sehari [ref:who-activity-u5-2019]. Memasuki usia 5 tahun, panduannya beralih: minimal 60 menit aktivitas intensitas sedang–berat setiap hari [ref:who-activity-5-17]. Praktisnya sama saja — pastikan ada bagian hari saat anak bergerak sampai terengah dan gembira." },
        { type: "own", judul: "Tangan siap pra-menulis", isi: "Menggambar orang dengan lebih banyak bagian tubuh, menggunting mengikuti bentuk, dan menulis beberapa huruf — sering kali huruf namanya — menandai otot tangan yang siap menulis. Pegangan pensil akan terus menghalus dengan latihan yang menyenangkan, tanpa perlu drilling." },
        { type: "module", moduleId: "urutan-motorik-kasar", sectionKey: "rentang-normal",
          isiOverride: "Kemampuan motorik anak usia 4–5 tahun sangat bervariasi: sebagian sudah bisa melompat satu kaki puluhan kali, sebagian baru bisa beberapa kali. Yang penting bukan mengejar angka milestone tertentu, melainkan memberi kesempatan bergerak aktif setiap hari [ref:aap-healthychildren]." },
      ],
    },
    sources: ["CDC Learn the Signs. Act Early.", "WHO (aktivitas fisik 5–17 thn)", "WHO (aktivitas fisik <5 thn)", "AAP"]
  },
  {
    id: "RL-4-5y-KG", ageKey: "4-5y", domain: "KG", title: "Berpikir makin teratur & kesiapan belajar",
    photo: P("4-5y-kg", "Anak menanam biji dan mengamati pertumbuhannya"), readMinutes: 2,
    summary: {
      terjadi: "Anak menghitung dengan urutan benar, mengenali beberapa huruf dan angka, memahami 'kemarin' dan 'besok', serta mulai bertanya 'bagaimana' dan 'bagaimana kalau'.",
      penting: "Kesiapan sekolah mencakup lima ranah, bukan calistung semata. Fungsi eksekutif yang dilatih lewat bermain lebih menentukan daripada hafalan angka dan huruf.",
      lakukan: ["Ajak 'meneliti' hal yang ia gemari: menanam, memasak, mengamati.", "Mainkan permainan memori, kartu, dan puzzle.", "Jangan memaksa calistung — bangun rasa ingin tahu."],
      perhatian: "Di usia 5 tahun anak tidak mengenali satu huruf pun, tidak bisa menghitung 1–5, tidak bisa mengikuti perintah tiga langkah, atau sangat sulit berpisah dari pengasuh."
    },
    scientific: {
      title: "Siap sekolah = lima ranah, bukan calistung semata",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "kesiapan-sekolah", statKey: "lima-ranah" },
        { type: "module", moduleId: "fungsi-eksekutif", statKey: "jendela-3-5" },
      ],
      figure: { id: "school-readiness-domains", caption: "Siap sekolah = lima ranah, bukan calistung semata", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Berpikir yang makin teratur", isi: "Anak menghitung benda dengan urutan yang benar, mengenali beberapa huruf dan angka, memahami konsep waktu sederhana ('kemarin', 'besok'), dan mengikuti cerita yang lebih panjang. Pertanyaannya pun berubah: dari 'apa ini' menjadi 'bagaimana' dan 'bagaimana kalau'." },
        { type: "module", moduleId: "kesiapan-sekolah", sectionKey: "lima-ranah" },
        { type: "module", moduleId: "kesiapan-sekolah", sectionKey: "calistung-bukan-syarat" },
        { type: "module", moduleId: "fungsi-eksekutif", sectionKey: "fondasi-sekolah" },
        { type: "own", judul: "Belajar lewat proyek kecil", isi: "Ajak anak 'meneliti' hal yang ia gemari: menanam biji dan mengamatinya, memilah benda tenggelam-terapung, memasak resep sederhana. Proyek kecil melatih bertanya, menduga, mencoba, dan menyimpulkan — cara belajar yang akan ia pakai seumur hidup." },
      ],
    },
    sources: ["AAP HealthyChildren.org", "Harvard Center on the Developing Child", "CDC Learn the Signs. Act Early."]
  },
  {
    id: "RL-4-5y-BH", ageKey: "4-5y", domain: "BH", title: "Bercerita runtut, kosakata meluas & bahasa lisan sebagai fondasi",
    photo: P("4-5y-bh", "Anak menceritakan ulang buku kepada orang tua"), readMinutes: 2,
    summary: {
      terjadi: "Anak menceritakan kejadian dengan urutan awal-tengah-akhir, menikmati humor kata dan teka-teki, serta tata bahasanya mendekati bahasa orang dewasa.",
      penting: "Bahasa lisan yang kaya adalah landasan membaca dan menulis. Print awareness — tahu arah baca, kenal buku — tumbuh dari paparan menyenangkan, bukan les membaca dini.",
      lakukan: ["Minta anak menceritakan ulang buku atau harinya.", "Nikmati teka-teki dan permainan kata bersama.", "Teruskan membaca dialogis dengan pertanyaan terbuka."],
      perhatian: "Di usia 5 tahun ucapan anak masih sulit dipahami orang asing, kalimatnya sangat pendek, gagap menetap dan membuat frustrasi, atau ada kemunduran kemampuan bicara."
    },
    scientific: {
      title: "Bahasa lisan yang kaya adalah landasan membaca",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "own", value: "4–5 kalimat", label: "panjang cerita runtut yang mulai mampu disampaikan anak tentang pengalamannya", sourceId: "asha" },
        { type: "module", moduleId: "pra-literasi", statKey: "sejak-lahir" },
      ],
      figure: { id: "pre-literacy-path", caption: "Bahasa lisan yang kaya adalah landasan membaca", afterSectionIndex: 2 },
      sections: [
        { type: "own", judul: "Bercerita dengan runtut", isi: "Anak menceritakan kejadian dengan urutan awal-tengah-akhir dalam beberapa kalimat, dan tata bahasanya mendekati bahasa orang dewasa [ref:asha]. Minta ia menceritakan ulang buku atau harinya — menyusun cerita adalah latihan berpikir, bukan hanya berbahasa." },
        { type: "own", judul: "Kosakata yang meluas cepat", isi: "Kosakata bertumbuh pesat lewat percakapan, buku, dan pengalaman baru. Anak mulai menikmati humor kata, tebak-tebakan, dan bertanya arti kata — tanda kesadaran bahasanya menajam." },
        { type: "module", moduleId: "pra-literasi", sectionKey: "print-awareness" },
        { type: "module", moduleId: "pra-literasi", sectionKey: "coretan" },
        { type: "own", judul: "Kapan skrining bicara", isi: "Bila ucapan anak masih sulit dipahami orang di luar keluarga, kalimatnya sangat pendek untuk usianya, gagap menetap dan membuatnya tertekan, atau ada kemunduran kemampuan, lakukan skrining bicara dan pendengaran [ref:asha]. Skrining perkembangan (KPSP) di posyandu/puskesmas dapat menjadi langkah awal yang mudah diakses [ref:kemenkes-kia-kpsp]." },
      ],
    },
    sources: ["ASHA", "American Academy of Pediatrics", "Kemenkes RI, Buku KIA"]
  },
  {
    id: "RL-4-5y-SE", ageKey: "4-5y", domain: "SE", title: "Theory of mind: memahami isi kepala orang lain",
    photo: P("4-5y-se", "Anak-anak bermain bersama dengan aturan"), readMinutes: 2,
    summary: {
      terjadi: "Anak mulai memahami bahwa orang lain punya pikiran berbeda (theory of mind), empatinya lebih tepat sasaran, dan ia mulai punya sahabat.",
      penting: "Theory of mind adalah fondasi empati, kerja sama, dan memahami cerita. Permainan beraturan adalah 'kurikulum sosial' utama usia ini.",
      lakukan: ["Suarakan perspektif: 'kira-kira temannya sedih kenapa, ya?'", "Biarkan konflik bermain diselesaikan sendiri dulu.", "Tanggapi bohong kecil dengan tenang dan ajarkan dampaknya."],
      perhatian: "Di usia 5 tahun anak tidak tertarik bermain dengan anak lain, tidak menunjukkan empati, sangat kesulitan mengikuti aturan sederhana, atau ada kemunduran sosial."
    },
    scientific: {
      title: "Theory of mind: memahami bahwa isi kepala orang lain berbeda",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "keterampilan-sosial-empati", statKey: "false-belief" },
        { type: "own", value: "Aturan main", label: "permainan beraturan menjadi arena utama latihan sosial usia ini", sourceId: "cdc-act-early" },
      ],
      figure: { id: "theory-of-mind", caption: "Theory of mind: memahami bahwa isi kepala orang lain berbeda", afterSectionIndex: 0 },
      sections: [
        { type: "module", moduleId: "keterampilan-sosial-empati", sectionKey: "teori-pikiran" },
        { type: "module", moduleId: "keterampilan-sosial-empati", sectionKey: "empati-akurat" },
        { type: "module", moduleId: "keterampilan-sosial-empati", sectionKey: "main-beraturan" },
        { type: "module", moduleId: "keterampilan-sosial-empati", sectionKey: "bohong-kecil" },
        { type: "own", judul: "Persahabatan pertama", isi: "Anak mulai punya sahabat dan bisa sangat terluka oleh penolakan teman. Anggap serius perasaannya tanpa mendramatisasi: dengarkan, namai emosinya, lalu bantu memikirkan langkah kecil ('besok mau ajak main apa?'). Keterampilan berteman dibangun, bukan bawaan." },
      ],
    },
    sources: ["Wimmer & Perner; Wellman dkk. (theory of mind)", "CDC Learn the Signs. Act Early."]
  },
  // REVIEW: frasa imunisasi lanjutan — cocokkan dengan jadwal IDAI terbaru (Apoteker Raisha). REVIEW: peralihan pedoman WHO aktivitas — pastikan penjelasan dua pedoman ini akurat (Fitri/Raisha).
  {
    id: "RL-4-5y-KS", ageKey: "4-5y", domain: "KS", title: "Pertumbuhan, tidur, higiene & imunisasi lanjutan",
    photo: P("4-5y-ks", "Anak cuci tangan sebelum makan"), readMinutes: 7, isMedical: true,
    summary: {
      terjadi: "Pertumbuhan stabil; tinggi badan sekarang sama pentingnya dipantau. Tidur 10–13 jam. Gigi susu mulai tanggal menjelang usia 6 tahun. Imunisasi lanjutan perlu dilengkapi.",
      penting: "Kurva tinggi badan dan berat bersama mendeteksi stunting lebih awal. Higiene mandiri (cuci tangan, sikat gigi) mulai bisa dilatih menjadi kebiasaan otomatis. (Edukatif, bukan pengganti nasihat dokter.)",
      lakukan: ["Timbang dan ukur tinggi rutin; bawa Buku KIA.", "Latih cuci tangan yang benar sampai otomatis.", "Pastikan imunisasi lanjutan sesuai jadwal IDAI/Kemenkes."],
      perhatian: "Berat tidak naik 2 kali berturut-turut, tinggi jauh di bawah jalur, sering sakit berulang, pucat mudah lelah, atau gigi berlubang, konsultasikan."
    },
    scientific: {
      title: "Kurva tetap dipantau: berat dan tinggi bercerita bersama",
      readMinutes: 7,
      reviewedBy: { name: "Apoteker Raisha", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "kebutuhan-tidur", statKey: "tidur-3-5y" },
        { type: "module", moduleId: "kesehatan-gigi", statKey: "fluoride" },
        { type: "own", value: "60 menit", label: "aktivitas fisik intensitas sedang–berat per hari sejak usia 5 tahun", sourceId: "who-activity-5-17" },
      ],
      figure: { id: "growth-curve", caption: "Kurva tetap dipantau: berat dan tinggi bercerita bersama", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "pemantauan-pertumbuhan", sectionKey: "kurva-bukan-angka" },
        { type: "module", moduleId: "pemantauan-pertumbuhan", sectionKey: "tinggi-stunting" },
        { type: "module", moduleId: "kebutuhan-tidur", sectionKey: "higiene" },
        { type: "own", judul: "Higiene mandiri dan gigi menjelang tanggal", isi: "Latih cuci tangan pakai sabun yang benar (sebelum makan, setelah dari toilet dan bermain) sampai jadi otomatis — ini pencegah infeksi paling murah. Sikat gigi tetap dua kali sehari dengan pasta berfluoride seukuran kacang polong, masih diawasi orang dewasa [ref:aap-aapd-dental]. Gigi susu yang sehat menjaga tempat bagi gigi tetap yang akan tumbuh mulai sekitar usia 6 tahun." },
        { type: "own", judul: "Kapan menghubungi dokter", isi: "Berat tidak naik dua kali penimbangan berturut-turut (2T), kurva mendatar atau menurun, anak sering sakit berulang, tampak pucat mudah lelah, atau ada gigi berlubang perlu diperiksakan [ref:kemenkes-kia-kpsp]. Pastikan juga imunisasi lanjutan lengkap sesuai jadwal IDAI/Kemenkes [ref:idai]. Manfaatkan penimbangan rutin di posyandu, pencatatan di Buku KIA, dan pemeriksaan perkembangan (KPSP) di posyandu/puskesmas. Informasi ini bersifat edukatif dan tidak menggantikan nasihat dokter." },
      ],
    },
    sources: ["WHO (kurva pertumbuhan)", "Kemenkes RI, Buku KIA", "AAP / AASM (tidur)", "AAPD (gigi)", "IDAI (imunisasi)", "WHO (aktivitas fisik 5–17 thn)"]
  },
  {
    id: "RL-4-5y-PS", ageKey: "4-5y", domain: "PS", title: "Kemandirian praktis, konsekuensi logis & growth mindset",
    photo: P("4-5y-ps", "Anak merapikan tas sekolah sendiri"), readMinutes: 2,
    summary: {
      terjadi: "Anak sangat ingin mampu melakukan hal sendiri dan peka terhadap penilaian orang lain. Cara kita merespons usahanya membentuk apakah ia berani mencoba hal baru.",
      penting: "Pekerjaan rumah nyata membangun rasa mampu lebih kuat daripada pujian kosong. Konsekuensi yang logis lebih mengajarkan daripada hukuman. Layar tetap maksimal 1 jam/hari.",
      lakukan: ["Libatkan dalam tugas rumah sungguhan sesuai usia.", "Terapkan konsekuensi logis yang diketahui di muka.", "Puji usaha dan strategi, bukan hasil atau bakat."],
      perhatian: "Anak sangat menghindari tantangan baru, mudah menyerah saat menghadapi kesulitan kecil, atau bergantung penuh pada layar; evaluasi pola pujian dan rutinitas."
    },
    scientific: {
      title: "Kemandirian kecil yang nyata membangun rasa mampu",
      readMinutes: 6,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "kemandirian-praktis", statKey: "tugas-nyata" },
        { type: "module", moduleId: "screen-time", statKey: "max-1h" },
      ],
      figure: { id: "practical-life", caption: "Kemandirian kecil yang nyata membangun rasa mampu", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "kemandirian-praktis", sectionKey: "bantu-sendiri" },
        { type: "module", moduleId: "kemandirian-praktis", sectionKey: "tugas-usia" },
        { type: "module", moduleId: "kemandirian-praktis", sectionKey: "terima-tidak-sempurna" },
        { type: "own", judul: "Konsekuensi logis, bukan hukuman", isi: "Di usia ini disiplin bisa naik kelas: dari mengalihkan menjadi konsekuensi yang logis dan diketahui di muka ('mainan yang dilempar disimpan dulu sampai besok'). Konsekuensi yang berhubungan langsung dengan perbuatannya mengajarkan sebab-akibat; hukuman yang tak berhubungan hanya mengajarkan takut." },
        { type: "module", moduleId: "pujian-proses", sectionKey: "growth-mindset" },
      ],
    },
    sources: ["Maria Montessori", "Carol Dweck (growth mindset)", "AAP (screen time)"]
  },

  // ===================== 5–6 TAHUN, TODO =====================
  // TODO: RL-5-6y-FM (Koordinasi lebih halus, olahraga, menulis)
  // TODO: RL-5-6y-KG (Membaca permulaan, logika, memori kerja)
  // TODO: RL-5-6y-BH (Membaca, bercerita kompleks, bahasa kedua)
  // TODO: RL-5-6y-SE (Persahabatan, aturan, regulasi diri)
  // TODO: RL-5-6y-KS (Gizi usia sekolah, tidur, kesehatan gigi isMedical:true)
  // TODO: RL-5-6y-PS (Transisi ke sekolah, disiplin positif, layar)

  // ===================== DOMAIN DK — 10 KARTU PLACEHOLDER ====================
  // Konten diisi dua batch berikutnya. Status = "segera-hadir" (derivasi otomatis
  // dari absennya field `summary`). Jangan menambah summary/scientific di sini
  // sebelum konten divalidasi; isi batch DK-2 dan DK-3.
  {
    id: "RL-0-3m-DK", ageKey: "0-3m", domain: "DK",
    title: "Mengawali dengan mata terbuka",
    photo: P("0-3m-dk", "Orang tua menatap bayi baru lahir dengan penuh perhatian"),
    readMinutes: 7,
    summary: {
      terjadi: "Semua bayi baru lahir menjalani skrining awal; sebagian keluarga sudah mengetahui kondisi tertentu sejak lahir — prematur, Down syndrome, atau kondisi lain. Ini bukan akhir; ini awal dari jalur dukungan yang bisa dimulai dari hari ini.",
      penting: "Tahun-tahun pertama adalah masa otak paling responsif — lebih dari sejuta koneksi saraf terbentuk tiap detik. Dukungan yang datang paling awal bekerja paling efektif.",
      lakukan: [
        "Pastikan skrining pendengaran bayi baru lahir dilakukan; tanyakan hasilnya ke tenaga kesehatan.",
        "Untuk bayi prematur, gunakan 'usia koreksi' — milestone dinilai dari tanggal seharusnya lahir, bukan tanggal lahir.",
        "Mulai stimulasi sederhana sejak minggu pertama: suara Anda, sentuhan, tatapan wajah ke wajah.",
        "Catat perkembangan di Buku KIA.",
      ],
      perhatian: "Tanyakan hasil skrining ke tenaga kesehatan; bila ada tanda yang dianjurkan tindak lanjut, minta KPSP di posyandu; bila dianjurkan, minta rujukan ke jenjang berikutnya. Evaluasi dini tidak pernah merugikan anak yang baik-baik saja.",
    },
    scientific: {
      title: "Mengawali dengan mata terbuka: skrining, dukungan, dan jendela emas",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "deteksi-intervensi-dini", statKey: "jendela-0-3" },
        { type: "module", moduleId: "jalur-layanan-abk", statKey: "kpsp-gratis" },
      ],
      figure: { id: "jalur-layanan", caption: "Kenali jalurnya sejak awal — dimulai dari pintu terdekat", afterSectionIndex: 4 },
      sections: [
        { type: "module", moduleId: "deteksi-intervensi-dini", sectionKey: "jendela-emas" },
        { type: "own", judul: "Skrining bayi baru lahir & usia koreksi", isi: "Skrining pendengaran bayi baru lahir memastikan pintu bahasa terbuka sejak awal — tanyakan hasilnya bila belum disampaikan. Skrining bukan diagnosis: ia adalah penyaring yang memastikan anak yang membutuhkan sampai ke evaluasi yang tepat; hasilnya memberi ketenangan atau membuka pintu bantuan. Untuk bayi prematur, milestone dinilai dengan usia koreksi (dihitung dari tanggal seharusnya lahir), bukan tanggal lahir [ref:idai]. Membandingkan bayi prematur dengan usia kalender hanya menghasilkan kecemasan yang tidak perlu." },
        { type: "module", moduleId: "down-syndrome-stimulasi", sectionKey: "peluang-awal" },
        { type: "own", judul: "Untuk orang tua yang baru menerima kabar", isi: "Bila Anda baru mengetahui kondisi anak — apa pun itu — perasaan campur aduk yang datang adalah wajar dan sah. Beri diri Anda waktu, cari informasi dari sumber tepercaya (bukan pencarian tengah malam yang menakutkan), dan temukan orang tua lain yang pernah di titik yang sama. Bayi Anda tetap bayi Anda: yang paling ia butuhkan hari ini adalah dekapan, susu, dan suara Anda — dan itu sudah Anda miliki." },
        { type: "module", moduleId: "jalur-layanan-abk", sectionKey: "empat-pintu" },
      ],
    },
    sources: ["CDC (deteksi dini)", "IDAI", "Kemenkes RI, Buku KIA / KPSP", "AAP (Down syndrome)"],
  },
  {
    id: "RL-3-6m-DK", ageKey: "3-6m", domain: "DK",
    title: "Jendela pengamatan: senyum, tatapan, dan tubuh bayi",
    photo: P("3-6m-dk", "Ibu dan bayi saling bertatapan dan tersenyum"),
    readMinutes: 7,
    summary: {
      terjadi: "Senyum sosial dan kontak mata menjadi bahasa utama bayi; tubuhnya makin terkendali. Interaksi sehari-hari adalah 'alat skrining' alami — di sanalah tanda paling awal bisa terlihat.",
      penting: "Interaksi wajah-ke-wajah bukan hanya stimulasi — ia juga jendela amati terbaik. Bayi yang merespons senyum dan tatapan Anda sedang menunjukkan bahwa sistem sosialnya berkembang.",
      lakukan: [
        "Perbanyak interaksi wajah-ke-wajah: berbicara, menyanyi, dan tersenyum pada bayi.",
        "Amati respons senyum, tatapan, dan suara — apakah ia membalas?",
        "Perhatikan tonus tubuh saat menggendong: apakah terasa sangat lunglai atau kaku tidak wajar?",
        "Rekam video singkat interaksi sehari-hari sebagai referensi.",
      ],
      perhatian: "Bila senyum sosial atau kontak mata sangat jarang menjelang akhir periode ini, atau tubuh terasa sangat lunglai/kaku terus-menerus — catat, rekam video singkat, dan diskusikan di posyandu atau dengan dokter. Jangan tunggu.",
    },
    scientific: {
      title: "Senyum, tatapan, dan tonus: jendela pengamatan paling awal",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "own", value: "6–8 mgg", label: "usia umum senyum sosial pertama muncul", sourceId: "cdc-act-early" },
        { type: "module", moduleId: "deteksi-intervensi-dini", statKey: "jendela-0-3" },
      ],
      figure: { id: "serve-return", caption: "Interaksi bolak-balik adalah jendela pengamatan terbaik", afterSectionIndex: 2 },
      sections: [
        { type: "own", judul: "Senyum sosial dan tatapan: percakapan pertama", isi: "Senyum yang membalas senyum Anda (bukan senyum acak saat tidur) umumnya muncul sekitar usia 6–8 minggu, dan bersama kontak mata menjadi 'percakapan' pertama bayi [ref:cdc-act-early]. Bila menjelang akhir periode ini bayi hampir tidak pernah menatap wajah atau membalas senyum, itu bukan alasan panik — itu alasan berdiskusi dengan tenaga kesehatan." },
        { type: "module", moduleId: "variasi-vs-red-flag", sectionKey: "pola-bukan-satu" },
        { type: "own", judul: "Tonus tubuh: terlalu lunglai atau terlalu kaku", isi: "Rasakan tubuh bayi saat digendong dan ditarik perlahan ke posisi duduk: kepala yang masih sangat tertinggal jauh melewati usia 4 bulan, tubuh yang terasa lunglai seperti tanpa tenaga, atau sebaliknya kaku melengkung terus-menerus, layak diperiksakan [ref:idai]. Tonus otot adalah jendela awal kesehatan saraf dan otot — dan fisioterapi dini sangat membantu bila memang dibutuhkan." },
        { type: "module", moduleId: "deteksi-intervensi-dini", sectionKey: "tunggu-dulu-mahal" },
        { type: "module", moduleId: "jalur-layanan-abk", sectionKey: "datang-dengan-catatan" },
      ],
    },
    sources: ["CDC (deteksi dini)", "IDAI"],
  },
  {
    id: "RL-6-9m-DK", ageKey: "6-9m", domain: "DK",
    title: "Suara dan nama: memastikan pintu pendengaran terbuka",
    photo: P("6-9m-dk", "Bayi menoleh ke arah suara orang tua yang memanggilnya"),
    readMinutes: 7,
    summary: {
      terjadi: "Ocehan berantai (ba-ba, ma-ma) dan menoleh ke arah nama/suara menjadi tanda perkembangan yang ditunggu. Pendengaran adalah syarat bicara — dan periode ini jendela terbaik untuk memastikannya.",
      penting: "Babbling adalah 'laporan kemajuan' sistem dengar-bicara. Bila ocehan dan respons terhadap nama kurang, itu alasan untuk memeriksa — bukan menunggu.",
      lakukan: [
        "Ajak bercakap dan amati respons terhadap suara dari luar pandangan.",
        "Panggil namanya dari samping — apakah ia menoleh secara konsisten?",
        "Kurangi kebisingan latar (TV, musik keras) saat berinteraksi.",
      ],
      perhatian: "Variasi antarbayi itu luas, tapi babbling yang tak kunjung muncul atau tidak konsisten menoleh ke nama/suara menjelang 9 bulan → minta pemeriksaan pendengaran + KPSP. Evaluasi dini tidak pernah merugikan: ia memberi ketenangan atau membuka pintu bantuan lebih awal.",
    },
    scientific: {
      title: "Babbling, nama, dan pendengaran: memastikan pintu bahasa terbuka",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "keterlambatan-bicara", statKey: "pendengaran-dulu" },
        { type: "own", value: "±9 bln", label: "bayi umumnya menoleh secara konsisten saat namanya dipanggil", sourceId: "cdc-act-early" },
      ],
      figure: { id: "skrining-bukan-vonis", caption: "Skrining menyaring, evaluasi memastikan — keduanya bukan vonis", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Babbling yang tak kunjung datang", isi: "Ocehan berantai adalah 'laporan kemajuan' sistem dengar-bicara. Bila menjelang 9 bulan ocehan hampir tidak ada, dua hal perlu dipastikan lebih dulu: pendengarannya dan kesempatan interaksinya [ref:asha]. Keduanya bisa diperiksa — dan keduanya bisa dibantu." },
        { type: "module", moduleId: "keterlambatan-bicara", sectionKey: "pendengaran-dulu" },
        { type: "own", judul: "Respons terhadap nama", isi: "Menoleh saat dipanggil adalah pertemuan dua kemampuan: mendengar dan ketertarikan sosial. Bila bayi jarang menoleh ke namanya padahal menoleh ke bunyi lain, atau tidak menoleh ke keduanya, itu tanda yang layak dievaluasi — penyebabnya bisa sesederhana pendengaran, dan hanya pemeriksaan yang bisa memastikan [ref:cdc-act-early]." },
        { type: "module", moduleId: "variasi-vs-red-flag", sectionKey: "percayai-naluri" },
        { type: "module", moduleId: "deteksi-intervensi-dini", sectionKey: "tanpa-menunggu-label" },
      ],
    },
    sources: ["ASHA", "CDC (deteksi dini)", "IDAI"],
  },
  {
    id: "RL-9-12m-DK", ageKey: "9-12m", domain: "DK",
    title: "Menunjuk dan berbagi dunia",
    photo: P("9-12m-dk", "Bayi menunjuk ke arah benda saat bermain bersama orang tua"),
    readMinutes: 7,
    summary: {
      terjadi: "Menunjuk, melambai, menunjukkan benda kepada Anda — bayi mulai 'berbagi dunia'. Gestur ini adalah fondasi bahasa dan hubungan sosial.",
      penting: "Berbagi perhatian adalah pencapaian paling bermakna di usia ini. Ketiadaan gestur menunjuk menjelang 12 bulan termasuk tanda yang paling layak didiskusikan dengan tenaga kesehatan.",
      lakukan: [
        "Tanggapi setiap tunjukan atau gestur bayi — ikuti arah pandangnya dan beri nama benda.",
        "Main ciluk-ba dan tunjuk-menunjuk secara bergantian.",
        "Amati dan catat gestur yang muncul: menunjuk, melambai, mengangkat tangan.",
      ],
      perhatian: "Variasi normal itu luas — gestur bisa datang lebih awal atau lebih lambat. Tapi menjelang 12 bulan bila belum ada menunjuk atau gestur komunikatif lain, tidak merespons nama, atau ada kemampuan yang pernah muncul lalu menghilang → KPSP + diskusikan evaluasi lebih lanjut. Evaluasi dini tidak pernah merugikan anak yang baik-baik saja.",
    },
    scientific: {
      title: "Menunjuk dan berbagi perhatian: fondasi bahasa dan sosial",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "own", value: "9–12 bln", label: "usia munculnya menunjuk dan berbagi perhatian", sourceId: "cdc-act-early" },
        { type: "module", moduleId: "variasi-vs-red-flag", statKey: "regresi" },
      ],
      figure: { id: "joint-attention", caption: "Menunjuk untuk berbagi: penanda terpenting menjelang satu tahun", afterSectionIndex: 0 },
      sections: [
        { type: "own", judul: "Mengapa menunjuk sepenting itu", isi: "Menunjuk sambil menatap Anda tampak sepele, padahal ia adalah puncak dari banyak kemampuan sekaligus: perhatian bersama, niat berkomunikasi, dan pemahaman bahwa pikiran bisa dibagi. Karena itu ketiadaan gestur menunjuk menjelang 12 bulan termasuk tanda yang paling layak didiskusikan dengan tenaga kesehatan [ref:cdc-act-early]." },
        { type: "own", judul: "Gestur lain yang dinanti", isi: "Melambai, menggeleng, mengangkat tangan minta digendong, menunjukkan mainan — semuanya bahasa sebelum bahasa. Bayi yang kaya gestur sedang membangun jembatan menuju kata; bayi yang nyaris tanpa gestur perlu jembatannya diperiksa." },
        { type: "module", moduleId: "variasi-vs-red-flag", sectionKey: "regresi" },
        { type: "module", moduleId: "spektrum-autisme", sectionKey: "tanda-awal" },
        { type: "module", moduleId: "deteksi-intervensi-dini", sectionKey: "ortu-intervensionis" },
      ],
    },
    sources: ["CDC (deteksi dini)", "Kemenkes RI, Buku KIA / KPSP"],
  },
  {
    id: "RL-12-18m-DK", ageKey: "12-18m", domain: "DK",
    title: "Kata pertama, skrining pertama",
    photo: P("12-18m-dk", "Anak balita bermain sambil menunjuk buku bergambar"),
    readMinutes: 7,
    summary: {
      terjadi: "Kata-kata pertama dan ledakan pemahaman menjadi penanda usia ini. Jendela skrining M-CHAT-R dimulai di 16 bulan — inilah usia ketika skrining terstruktur mulai bisa menangkap yang pengamatan biasa lewatkan.",
      penting: "Skrining bukan vonis. Hasil positif berarti satu hal: anak sebaiknya dievaluasi lebih lanjut. Dua kesalahan yang sama-sama merugikan: panik dan menunda.",
      lakukan: [
        "Isi KPSP sesuai jadwal posyandu.",
        "Kenali M-CHAT-R (skrining autisme usia 16–30 bulan, gratis, tersedia daring).",
        "Teruskan percakapan bolak-balik, membaca bersama, dan bermain pura-pura.",
      ],
      perhatian: "Belum ada kata bermakna menjelang 16–18 bulan, tidak menunjuk, tidak merespons nama, atau ada kemampuan yang menghilang → skrining + evaluasi. Hasil skrining positif = evaluasi lanjut, bukan diagnosis.",
    },
    scientific: {
      title: "Kata pertama dan skrining pertama: mengisi jendela kesempatan",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "spektrum-autisme", statKey: "mchat-window" },
        { type: "module", moduleId: "keterlambatan-bicara", statKey: "pendengaran-dulu" },
      ],
      figure: { id: "spektrum", caption: "Satu spektrum, tampilan yang sangat beragam", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "spektrum-autisme", sectionKey: "apa-itu" },
        { type: "module", moduleId: "spektrum-autisme", sectionKey: "mchat" },
        { type: "module", moduleId: "keterlambatan-bicara", sectionKey: "late-talker" },
        { type: "own", judul: "Bermain sebagai jendela", isi: "Cara anak bermain ikut bercerita: memakai benda sesuai fungsinya (sisir ke rambut, gelas ke mulut) dan pura-pura sederhana yang mulai muncul adalah tanda perkembangan simbolik yang sehat. Permainan yang nyaris hanya menderetkan atau memutar benda dengan cara yang sama berulang-ulang, tanpa variasi, layak masuk catatan pengamatan Anda." },
        { type: "own", judul: "Bila hasil skrining 'berisiko'", isi: "Tarik napas: hasil skrining positif artinya satu hal saja — anak sebaiknya dievaluasi lebih lanjut. Ia bukan diagnosis, bukan ramalan, bukan kesimpulan. Dua kesalahan yang sama-sama merugikan: panik, dan menunda tindak lanjut karena takut. Jalan tengahnya sederhana: jadwalkan evaluasi, bawa catatan dan video Anda, dan teruskan stimulasi di rumah seperti biasa." },
      ],
    },
    sources: ["CDC (autisme & skrining)", "M-CHAT-R (Robins, Fein & Barton)", "ASHA"],
  },
  {
    id: "RL-18-24m-DK", ageKey: "18-24m", domain: "DK",
    title: "Bertindak tanpa menunggu label",
    photo: P("18-24m-dk", "Anak bermain bersama terapis di klinik tumbuh kembang"),
    readMinutes: 7,
    summary: {
      terjadi: "Perbedaan antaranak makin terlihat — sebagian keluarga mulai bertanya-tanya. Mitos 'tunggu sampai 3 tahun' membuang jendela intervensi paling berharga.",
      penting: "Intervensi dapat dimulai atas dasar keterlambatan yang teramati — tanpa harus menunggu kepastian label. Bulan-bulan ini tidak bisa diulang.",
      lakukan: [
        "Tuntaskan skrining M-CHAT-R dalam jendelanya (16–30 bulan) — skrining bukan diagnosis; hasil 'berisiko' hanya berarti evaluasi lanjut dianjurkan.",
        "Bila ada keterlambatan, mulai stimulasi terarah dan konsultasikan pilihan terapi; jangan menunggu label.",
        "Rawat diri Anda juga — orang tua yang kelelahan dan cemas tidak bisa membantu anaknya sebaik yang mereka inginkan.",
      ],
      perhatian: "Kosakata jauh di bawah patokan 24 bulan, belum menggabungkan dua kata, interaksi sosial sangat terbatas, atau ada kemampuan yang menghilang → evaluasi sekarang; tanyakan pilihan terapi dan pembiayaannya di puskesmas atau RS.",
    },
    scientific: {
      title: "Bertindak tanpa menunggu label: jendela intervensi paling berharga",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "deteksi-intervensi-dini", statKey: "jendela-0-3" },
        { type: "module", moduleId: "spektrum-autisme", statKey: "vaksin-aman" },
      ],
      figure: { id: "skrining-bukan-vonis", caption: "Yang membutuhkan mendapat dukungan dini — itulah tujuan seluruh jalurnya", afterSectionIndex: 1 },
      sections: [
        { type: "own", judul: "Mitos 'tunggu sampai 3 tahun'", isi: "Nasihat 'nanti umur 3 tahun juga bisa sendiri' masih sering terdengar — kadang dari orang terdekat. Sebagian anak memang mengejar sendiri; masalahnya, tidak ada cara memastikan dari rumah anak mana yang akan mengejar, dan bulan-bulan menunggu adalah bulan-bulan ketika otak paling responsif terhadap bantuan [ref:harvard-brain]. Evaluasi dini tidak pernah merugikan anak yang baik-baik saja; menunda merugikan anak yang membutuhkan." },
        { type: "module", moduleId: "deteksi-intervensi-dini", sectionKey: "tanpa-menunggu-label" },
        { type: "module", moduleId: "keterlambatan-bicara", sectionKey: "kapan-terapi" },
        { type: "module", moduleId: "spektrum-autisme", sectionKey: "vaksin" },
        { type: "module", moduleId: "jalur-layanan-abk", sectionKey: "pembiayaan" },
      ],
    },
    sources: ["Harvard Center on the Developing Child", "CDC (autisme)", "ASHA", "Kemenkes RI, Buku KIA / KPSP"],
  },
  {
    id: "RL-2-3y-DK", ageKey: "2-3y", domain: "DK",
    title: "Bicara, sensorik, dan tantrum",
    photo: P("2-3y-dk", "Anak balita bermain tekstur pasir bersama orang tua di luar ruangan"),
    readMinutes: 7,
    summary: {
      terjadi: "Ledakan kosakata usia 2–3 tahun berlangsung bersama meningkatnya kepekaan sensorik dan tantrum regulasi emosi. Keduanya normal — tapi beberapa pola perlu diamati lebih dekat.",
      penting: "Variasi sensorik antaranak sangat luas dan bukan otomatis tanda masalah. Yang penting: apakah kesulitan itu mengganggu keseharian? Pendengaran adalah hal pertama yang perlu diperiksa bila bicara terlambat.",
      lakukan: [
        "Cek pendengaran bila anak belum menggabungkan 2 kata di usia 24 bulan.",
        "Perhatikan pola sensorik: apakah ada rangsangan tertentu yang selalu memicu meltdown berlebihan?",
        "Sediakan aktivitas sensorik aman: playdough, pasir, air, kain bertekstur berbeda.",
      ],
      perhatian: "Belum menggabungkan dua kata di 24 bulan, sangat menghindari sentuhan sehari-hari hingga makan/tidur terganggu, atau meltdown ekstrem yang tidak membaik → konsultasikan ke dokter anak. Skrining bukan diagnosis — langkah pertama selalu evaluasi, bukan pelabelan.",
    },
    scientific: {
      title: "Bicara, sensorik, dan tantrum: membedakan variasi dari tanda yang perlu ditindak",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "keterlambatan-bicara", statKey: "pendengaran-dulu" },
        { type: "module", moduleId: "sensorik-regulasi", statKey: "hiper-hipo" },
      ],
      figure: { id: "sensorik-hiper-hipo", caption: "Hiper vs hipo-reaktif: dua arah berbeda, keduanya bukan kenakalan", afterSectionIndex: 2 },
      sections: [
        { type: "own", judul: "Milestone bicara 2–3 tahun dan red flag-nya", isi: "Usia 24 bulan: setidaknya 50 kata dan mulai menggabungkan dua kata ('mau minum', 'bola jatuh'). Usia 36 bulan: kalimat tiga kata dan orang asing bisa memahami setidaknya 75% ucapannya. Bila belum menggabungkan dua kata di 24 bulan atau belum berbicara kalimat di 36 bulan → langkah pertama adalah cek pendengaran, bukan asumsi keterlambatan berbicara." },
        { type: "module", moduleId: "keterlambatan-bicara", sectionKey: "late-talker" },
        { type: "module", moduleId: "sensorik-regulasi", sectionKey: "apa-itu-sensorik" },
        { type: "module", moduleId: "sensorik-regulasi", sectionKey: "hiper-reaktif" },
        { type: "module", moduleId: "sensorik-regulasi", sectionKey: "hipo-reaktif" },
        { type: "module", moduleId: "sensorik-regulasi", sectionKey: "kapan-konsultasi" },
      ],
    },
    sources: ["ASHA (keterlambatan bicara)", "Ayres Sensory Integration (integrasi sensorik)"],
  },
  {
    id: "RL-3-4y-DK", ageKey: "3-4y", domain: "DK",
    title: "'Anakku aktif sekali — ADHD-kah?'",
    photo: P("3-4y-dk", "Anak prasekolah berlari dan melompat di taman bersama teman-temannya"),
    readMinutes: 7,
    summary: {
      terjadi: "Usia 3–4 tahun adalah puncak energi fisik dan impuls. Sebagian besar anak yang 'tidak bisa diam' sedang berkembang normal — otak prasekolah memang belum punya rem yang matang.",
      penting: "Anak di bawah 4 tahun umumnya terlalu muda untuk diagnosis ADHD yang dapat diandalkan. Yang tampak seperti ADHD sering adalah variasi normal, lingkungan yang kurang sesuai, atau kebutuhan stimulasi yang belum terpenuhi.",
      lakukan: [
        "Pastikan anak cukup bergerak — setidaknya 3 jam aktivitas fisik sehari.",
        "Berikan instruksi satu langkah pendek dan rutinitas yang bisa diprediksi.",
        "Catat: apakah gejala muncul di rumah DAN di sekolah/TPA, atau hanya di satu tempat?",
      ],
      perhatian: "Bila kesulitan atensi sangat berat, terjadi di lebih dari satu situasi, berlangsung lebih dari 6 bulan, dan jauh di luar rentang teman sebaya → bicarakan dengan dokter anak atau psikolog untuk evaluasi terstruktur. Evaluasi ≠ diagnosis; ia adalah langkah awal untuk memahami.",
    },
    scientific: {
      title: "'Anakku aktif sekali': membedakan impuls normal dari kebutuhan evaluasi",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "adhd-atensi-regulasi", statKey: "usia-4" },
        { type: "module", moduleId: "adhd-atensi-regulasi", statKey: "berbagai-tempat" },
      ],
      figure: { id: "executive-function", caption: "Fungsi eksekutif dibangun melalui bermain — bukan duduk diam", afterSectionIndex: 2 },
      sections: [
        { type: "own", judul: "Otak prasekolah dan rem yang sedang dibangun", isi: "Korteks prefrontal — bagian otak yang mengatur impuls, atensi, dan fleksibilitas — tidak matang hingga usia 20-an. Usia 3–4 tahun adalah tahap awal pembangunannya. Anak yang 'tidak bisa diam', mengambil mainan teman tanpa izin, atau meledak karena hal sepele sedang menggunakan otak yang memang belum punya rem yang siap. Konteks ini penting sebelum menarik kesimpulan apa pun." },
        { type: "module", moduleId: "adhd-atensi-regulasi", sectionKey: "apa-itu-adhd" },
        { type: "module", moduleId: "adhd-atensi-regulasi", sectionKey: "kapan-evaluasi" },
        { type: "module", moduleId: "adhd-atensi-regulasi", sectionKey: "yang-bisa-sekarang" },
        { type: "module", moduleId: "adhd-atensi-regulasi", sectionKey: "stigma-bukan-kelemahan" },
      ],
    },
    sources: ["AAP — Pedoman ADHD (2019)", "Harvard Center on the Developing Child"],
  },
  {
    id: "RL-4-5y-DK", ageKey: "4-5y", domain: "DK",
    title: "Memilih lingkungan belajar yang tepat",
    photo: P("4-5y-dk", "Anak prasekolah dengan kebutuhan khusus bermain bersama guru di kelas inklusif"),
    readMinutes: 7,
    summary: {
      terjadi: "Menjelang SD, pertanyaan tentang pilihan sekolah menjadi nyata — terutama bagi keluarga anak berkebutuhan khusus. Kesiapan sekolah jauh lebih luas dari kemampuan baca-tulis-hitung.",
      penting: "Tidak ada satu format sekolah yang cocok untuk semua anak. Yang paling menentukan adalah kesesuaian antara kebutuhan anak, kapasitas sekolah, dan dukungan yang bisa disediakan — bukan nama sekolahnya.",
      lakukan: [
        "Kunjungi calon sekolah dan tanyakan langsung: bagaimana mereka mengakomodasi anak dengan kebutuhan belajar berbeda?",
        "Diskusikan dengan psikolog atau terapis anak tentang lingkungan belajar yang paling mendukung.",
        "Persiapkan kemandirian keseharian: berpakaian sendiri, ke toilet, makan tanpa bantuan penuh.",
      ],
      perhatian: "Bila anak mengalami kemunduran signifikan setelah masuk sekolah — dalam keseharian, regulasi emosi, atau kemandirian — evaluasi ulang kesesuaian lingkungan belajarnya bersama psikolog. Evaluasi anak bukan pelabelan; tujuannya memahami kebutuhan spesifik agar dukungan yang diberikan tepat sasaran. Perjalanan ini bisa bergelombang — yang tidak cocok di awal adalah informasi, bukan kegagalan.",
    },
    scientific: {
      title: "Memilih lingkungan belajar: kesiapan sekolah untuk semua anak, termasuk ABK",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "module", moduleId: "penerimaan-dukungan-ortu", statKey: "bergelombang" },
        { type: "module", moduleId: "kesiapan-sekolah", statKey: "lima-ranah" },
      ],
      figure: { id: "school-readiness-domains", caption: "Lima ranah kesiapan sekolah — berlaku untuk semua anak dengan segala kemampuan", afterSectionIndex: 1 },
      sections: [
        { type: "module", moduleId: "kesiapan-sekolah", sectionKey: "lima-ranah" },
        { type: "module", moduleId: "kesiapan-sekolah", sectionKey: "sosem-menentukan" },
        { type: "own", judul: "Inklusi, SLB, atau homeschooling: membaca kebutuhannya", isi: "Sekolah inklusi yang baik memiliki guru pendamping, rencana pembelajaran individual (IEP/PPI), dan komunitas yang terbuka. SLB menawarkan spesialisasi dan rasio guru-murid lebih kecil. Homeschooling memberi fleksibilitas penuh tapi membutuhkan jaringan sosial yang sengaja dibangun. Kuncinya bukan nama format — tapi apakah sekolah tersebut memiliki kapasitas dan komitmen untuk mendampingi anak Anda secara konkret." },
        { type: "module", moduleId: "penerimaan-dukungan-ortu", sectionKey: "ortu-sebagai-ahli" },
        { type: "module", moduleId: "penerimaan-dukungan-ortu", sectionKey: "jaringan-dukungan" },
      ],
    },
    sources: ["AAP — HealthyChildren.org (kesiapan sekolah)", "Harvard Center on the Developing Child", "Riset sistem keluarga ABK"],
  },
  {
    id: "RL-5-6y-DK", ageKey: "5-6y", domain: "DK",
    title: "Transisi ke SD",
    photo: P("5-6y-dk", "Anak berseragam SD berdiri di depan gerbang sekolah bersama orang tuanya"),
    readMinutes: 7,
    summary: {
      terjadi: "Transisi ke SD adalah lompatan besar: lingkungan baru, guru baru, aturan baru, dan tuntutan kemandirian yang jauh lebih tinggi. Bagi anak berkebutuhan khusus, transisi ini membutuhkan persiapan yang lebih terencana.",
      penting: "Kesiapan transisi bukan hanya tentang kemampuan akademik — tapi tentang regulasi emosi, kemandirian fungsional, dan jaringan dukungan yang sudah terpasang sebelum hari pertama.",
      lakukan: [
        "Kunjungi sekolah dan kenalkan lingkungannya sebelum hari pertama.",
        "Diskusikan kebutuhan anak secara tertulis dengan pihak sekolah — minta rencana konkret.",
        "Pastikan layanan terapi (bila ada) sudah diatur jadwalnya agar tidak bertabrakan dengan jam sekolah.",
      ],
      perhatian: "Bila transisi terasa sangat berat setelah beberapa minggu (menolak sekolah, meltdown setiap pagi, kemunduran signifikan dalam kemandirian) → konsultasikan ke psikolog. Adaptasi butuh waktu, tapi kesulitan ekstrem yang tidak membaik adalah sinyal yang perlu ditindak.",
    },
    scientific: {
      title: "Transisi ke SD: persiapan, advokasi, dan jaga diri untuk orang tua",
      readMinutes: 7,
      reviewedBy: { name: "Psikolog Fitri Effendy", date: "2026-07" },
      stats: [
        { type: "own", value: "Sebelum hari-H", label: "kunjungi sekolah, kenali lingkungannya, dan sampaikan kebutuhan anak secara tertulis kepada guru kelas sebelum hari pertama masuk SD", sourceId: "aap-healthychildren" },
        { type: "module", moduleId: "penerimaan-dukungan-ortu", statKey: "bergelombang" },
      ],
      figure: { id: "jalur-layanan", caption: "Jalur layanan tetap terbuka selama transisi — mulai dari yang terdekat", afterSectionIndex: 3 },
      sections: [
        { type: "own", judul: "Apa yang berubah saat masuk SD", isi: "Di SD, hari lebih panjang, guru berganti setiap tahun, harapan kemandirian melonjak, dan teman sekelas bisa 30 orang atau lebih. Bagi anak berkebutuhan khusus, setiap perubahan ini bisa menjadi sumber stres yang tidak terlihat dari luar — tapi sangat nyata di dalam. Persiapan yang baik dimulai jauh sebelum hari pertama: kunjungi sekolah, kenali ruang kelas, dan jika memungkinkan temui guru kelasnya." },
        { type: "own", judul: "Advokasi aktif di tahun pertama", isi: "Orang tua anak berkebutuhan khusus sering harus menjadi advokat aktif: memastikan sekolah memahami kebutuhan anak, meminta rencana pembelajaran individual (jika tersedia), dan membangun komunikasi rutin dengan guru kelas. Anda tidak harus menunggu masalah muncul — sampaikan kebutuhan anak di awal, secara konkret dan tertulis bila perlu." },
        { type: "module", moduleId: "adhd-atensi-regulasi", sectionKey: "yang-bisa-sekarang",
          isiOverride: "Di tahun pertama SD, rutinitas yang bisa diprediksi menjadi jangkar stabilitas — terutama untuk anak yang masih membangun fungsi eksekutifnya. Ritual pagi yang konsisten (bangun, sarapan, siapkan tas dengan urutan sama), instruksi satu langkah dari guru, dan waktu gerak terjadwal adalah strategi yang terbukti membantu [ref:harvard-executive]. Lingkungan yang terstruktur longgar — bukan kaku — memberi otak yang aktif ruang untuk berkembang tanpa terlalu banyak gesekan." },
        { type: "module", moduleId: "penerimaan-dukungan-ortu", sectionKey: "jaga-diri-sendiri" },
        { type: "module", moduleId: "jalur-layanan-abk", sectionKey: "empat-pintu" },
      ],
    },
    sources: ["AAP — HealthyChildren.org", "Harvard Center on the Developing Child", "Riset sistem keluarga ABK", "Kemenkes RI, Buku KIA / KPSP"],
  },
];
