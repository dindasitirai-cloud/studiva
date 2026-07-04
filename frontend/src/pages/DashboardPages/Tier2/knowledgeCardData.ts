import { Activity, Lightbulb, MessageCircle, Heart, Stethoscope, Puzzle, LucideIcon } from 'lucide-react';

export type DomainCode = "FM" | "KG" | "BH" | "SE" | "KS" | "PS";
export type AgeKey = "0-3m" | "3-6m" | "6-9m" | "9-12m" | "12-18m" | "18-24m" | "2-3y" | "3-4y" | "4-5y" | "5-6y";

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
    readMinutes: number;
    paragraphs: string[];
  };
  sources: string[];
}

export const AGE_RANGES: { key: AgeKey; label: string; fill: string; ink: string }[] = [
  { key: "0-3m",  label: "0–3 bulan",  fill: "#FAEEDA", ink: "#633806" },
  { key: "3-6m",  label: "3–6 bulan",  fill: "#E1F5EE", ink: "#085041" },
  { key: "6-9m",  label: "6–9 bulan",  fill: "#E6F1FB", ink: "#0C447C" },
  { key: "9-12m", label: "9–12 bulan", fill: "#FBEAF0", ink: "#72243E" },
  { key: "12-18m",label: "12–18 bulan",fill: "#EEEDFE", ink: "#3C3489" },
  { key: "18-24m",label: "18–24 bulan",fill: "#EAF3DE", ink: "#27500A" },
  { key: "2-3y",  label: "2–3 tahun",  fill: "#F1EFE8", ink: "#444441" },
  { key: "3-4y",  label: "3–4 tahun",  fill: "#FAECE7", ink: "#712B13" },
  { key: "4-5y",  label: "4–5 tahun",  fill: "#FCEBEB", ink: "#791F1F" },
  { key: "5-6y",  label: "5–6 tahun",  fill: "#CECBF6", ink: "#26215C" },
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

export const CARDS: KnowledgeCard[] = [
  {
    id: "RL-0-3m-FM", ageKey: "0-3m", domain: "FM",
    title: "Tummy time: menegakkan kepala",
    photo: { src: "/images/rl/tummy-time.jpg", alt: "Bayi tummy time mengangkat kepala", credit: "Unsplash" },
    readMinutes: 2,
    summary: {
      terjadi: "Otot leher dan bahu bayi menguat. Saat tengkurap dalam keadaan bangun, ia mulai mengangkat kepala; tangannya sering dibawa ke mulut.",
      penting: "Tummy time membangun kekuatan untuk berguling, duduk, dan merangkak, sekaligus mencegah kepala peyang. Prinsipnya: \"back to sleep, tummy to play\".",
      lakukan: [
        "Mulai 3–5 menit, 2–3 kali sehari saat bayi bangun & diawasi.",
        "Turun ke lantai; ajak bicara sejajar matanya.",
        "Pakai mainan kontras atau cermin bayi.",
        "Jika menolak, coba di dada Anda sambil berbaring."
      ],
      perhatian: "Menjelang 3 bulan kepala belum terangkat sama sekali, atau tubuh sangat kaku/lemas."
    },
    scientific: {
      title: "Mengapa gerakan membangun otak, bukan hanya otot",
      readMinutes: 6,
      paragraphs: [
        "Perkembangan gerak bayi mengikuti pola yang dapat diprediksi. Kendali tubuh berkembang dari atas ke bawah — bayi menguasai kepala lebih dulu, lalu bahu, badan, dan kaki. Gerak juga berkembang dari tengah tubuh ke arah luar: bahu dulu, baru jari-jari halus. Itulah sebabnya menegakkan kepala saat tummy time adalah anak tangga pertama menuju berguling, duduk, dan berjalan.",
        "Tummy time makin penting sejak kampanye \"tidur telentang\" pada 1990-an berhasil menurunkan angka kematian bayi mendadak (SIDS) secara drastis. Efek sampingnya, bayi kini lebih banyak telentang, sehingga sebagian mengalami kepala peyang dan otot leher yang lebih lambat menguat. Waktu tengkurap saat bangun mengimbangi hal ini.",
        "Manfaatnya melampaui otot. Menurut Piaget, bayi di tahun pertama berada pada tahap sensorimotor: ia membangun pemahaman tentang dunia lewat indra dan gerak. Saat mengangkat kepala atau meraih mainan, bayi sedang mengumpulkan informasi tentang jarak, keseimbangan, dan tubuhnya sendiri.",
        "Karena itu, beri bayi banyak waktu bergerak bebas di alas aman, dan jangan terlalu lama menaruhnya di kursi pantul atau ayunan. Baby walker bahkan tidak dianjurkan karena berisiko cedera dan tidak membantu bayi belajar berjalan.",
        "Ingat, rentang normal itu lebar. Sebagian bayi berguling di usia 4 bulan, sebagian di usia 6 bulan — keduanya normal. Yang penting bukan mengejar tanggal, melainkan memberi kesempatan bergerak setiap hari."
      ]
    },
    sources: ["AAP HealthyChildren.org", "CDC Learn the Signs. Act Early."]
  },
  {
    id: "RL-0-3m-BH", ageKey: "0-3m", domain: "BH",
    title: "Cooing: obrolan pertama sebelum kata",
    photo: { src: "/images/rl/cooing.jpg", alt: "Ibu mengajak bayi bicara", credit: "Pexels" },
    readMinutes: 2,
    summary: {
      terjadi: "Sekitar 6–8 minggu bayi mengeluarkan suara lembut \"ooh/aah\" (cooing), menoleh ke sumber suara, dan tenang mendengar suara familiar.",
      penting: "Otak bahasa dibangun sebelum kata pertama. Menanggapi suara bayi memperkuat jalur bahasa; makin banyak kata yang ia dengar dalam interaksi hangat, makin kaya bahasanya kelak.",
      lakukan: [
        "Ajak bicara sepanjang hari; narasikan aktivitas.",
        "Tirukan cooing-nya lalu beri jeda untuk \"giliran\"-nya.",
        "Gunakan nada \"parentese\" yang lembut & ekspresif.",
        "Nyanyikan lagu dan bacakan buku."
      ],
      perhatian: "Menjelang 3 bulan bayi tidak bereaksi pada suara keras, tidak bersuara, atau tidak menoleh ke suara."
    },
    scientific: {
      title: "Bagaimana bahasa tumbuh jauh sebelum kata pertama",
      readMinutes: 6,
      paragraphs: [
        "Meski belum bisa bicara, otak bayi sudah mempelajari bahasa sejak hari pertama — bahkan sejak dalam kandungan, saat ia mengenali irama suara ibunya. Kemampuan memahami (bahasa reseptif) selalu tumbuh lebih dulu daripada kemampuan bicara. Jadi jauh sebelum bisa mengucap \"mama\", bayi sudah menyerap bunyi dan pola dari percakapan di sekitarnya.",
        "Bayi adalah \"ahli statistik\" alami. Dari lautan suara yang ia dengar, otaknya menghitung pola: bunyi mana yang sering muncul bersama, di mana satu kata berakhir. Semakin sering dan kaya bahasa yang ia dengar dalam interaksi nyata, semakin banyak bahan untuk otaknya mengurai pola itu.",
        "Satu temuan penting: bayi belajar bahasa dari manusia, bukan dari layar. Dalam banyak penelitian, bayi yang mendengar bahasa dari orang sungguhan bisa mempelajarinya, sementara yang mendengar dari video hampir tidak belajar apa pun — fenomena \"video deficit\". Bayi butuh tatapan, giliran bicara, dan tanggapan hangat yang tak bisa diberikan layar.",
        "Cara Anda bicara pun berpengaruh. Nada tinggi, lambat, dan ekspresif (\"parentese\") membantu bayi memisahkan kata dan memperhatikan lebih lama. Menirukan ocehannya lalu memberi jeda mengajarkan pola dasar percakapan: bergantian bicara.",
        "Banyaknya kata yang bayi dengar di tahun awal berkaitan dengan kosakata dan kesiapan sekolahnya kelak. Terakhir, mendengar dengan baik adalah syarat bicara; bila bayi tampak tak merespons suara, pemeriksaan pendengaran dini sangat membantu."
      ]
    },
    sources: ["ASHA (American Speech-Language-Hearing Association)", "CDC Learn the Signs. Act Early."]
  },
  {
    id: "RL-0-3m-SE", ageKey: "0-3m", domain: "SE",
    title: "Senyum sosial & rasa aman",
    photo: { src: "/images/rl/social-smile.jpg", alt: "Ibu dan bayi saling tersenyum", credit: "Unsplash" },
    readMinutes: 2,
    summary: {
      terjadi: "Antara minggu ke-6 hingga ke-8 muncul senyum sosial — senyuman yang membalas wajah dan suara Anda, bukan refleks. Bayi menatap mata lebih lama dan tenang saat digendong.",
      penting: "Interaksi bolak-balik (\"serve & return\") membentuk fondasi otak sosial dan emosi bayi. Menanggapi kebutuhannya secara konsisten membangun rasa aman — dan ingat, bayi baru lahir tidak bisa \"dimanja\".",
      lakukan: [
        "Tanggapi tangis dengan cepat dan tenang.",
        "Balas senyum dan lakukan kontak mata.",
        "Tirukan suaranya, beri jeda untuk \"giliran\"-nya.",
        "Perbanyak kontak kulit (skin-to-skin)."
      ],
      perhatian: "Menjelang 3 bulan tidak ada senyum sosial, tidak ada kontak mata, atau bayi sangat sulit ditenangkan."
    },
    scientific: {
      title: "Bagaimana rasa aman membentuk otak bayi",
      readMinutes: 8,
      paragraphs: [
        "Saat lahir, otak bayi baru memiliki sebagian kecil dari koneksi yang kelak ia miliki. Sebagian besar \"kabel\" otak dibangun setelah lahir — dan yang paling menentukan susunannya adalah pengalaman sehari-hari bersama orang yang merawatnya.",
        "Ilmuwan Harvard menggambarkan proses ini seperti lempar-tangkap. Bayi \"melempar\" sinyal — menatap, mengoceh, menangis. Ketika orang dewasa \"menangkap\" dan membalas, otak bayi menerima sinyal bahwa dunia menanggapinya. Pertukaran bolak-balik ini (serve and return) memperkuat sirkuit saraf dasar bahasa, emosi, dan hubungan.",
        "Mengapa konsistensi penting? Bowlby dan Ainsworth menunjukkan bahwa bayi yang kebutuhannya ditanggapi secara hangat dan dapat diprediksi cenderung mengembangkan kelekatan aman. Anak ini merasa punya \"basis aman\" — tempat kembali saat takut, yang justru membuatnya lebih berani menjelajah dan belajar.",
        "Di sinilah jawaban atas kekhawatiran umum: apakah sering menggendong memanjakan bayi? Ilmu perkembangan menjawab tidak, setidaknya di tahun pertama. Bagi bayi, menangis bukan manipulasi; itu satu-satunya caranya berkata \"aku butuh sesuatu\". Saat dijawab, ia belajar dunia bisa diandalkan — rasa percaya yang oleh Erikson disebut tugas psikologis pertama manusia.",
        "Ada sisi biologisnya. Sentuhan dan kontak kulit memicu oksitosin, hormon penumbuh rasa tenang dan ikatan. Sebaliknya, bila bayi berulang kali dibiarkan tertekan tanpa penghiburan, tubuhnya melepaskan hormon stres berkepanjangan (toxic stress) yang dapat mengganggu pembentukan otak. Pelindung paling ampuhnya justru kehadiran orang dewasa yang responsif.",
        "Kabar baiknya, Anda tak perlu sempurna. Yang penting bukan menanggapi tepat 100% dari waktu, melainkan cukup sering dan cukup hangat. Bahkan saat Anda salah lalu memperbaikinya, bayi belajar hal berharga: hubungan bisa retak lalu diperbaiki.",
        "Ringkasnya: rasa aman bukan lawan kemandirian. Justru dari fondasi rasa aman itulah kemandirian tumbuh."
      ]
    },
    sources: ["Harvard Center on the Developing Child", "Erik Erikson (trust vs mistrust)", "Bowlby & Ainsworth (attachment)", "AAP HealthyChildren.org"]
  },
  // TODO: RL-0-3m-KG — Kognitif 0-3 bulan
  // TODO: RL-0-3m-KS (isMedical:true) — Kesehatan & Gizi 0-3 bulan
  // TODO: RL-0-3m-PS — Pengasuhan & Stimulasi 0-3 bulan
  // TODO: RL-3-6m-FM, RL-3-6m-KG, RL-3-6m-BH, RL-3-6m-SE, RL-3-6m-KS (isMedical:true), RL-3-6m-PS
  // TODO: RL-6-9m-FM, RL-6-9m-KG, RL-6-9m-BH, RL-6-9m-SE, RL-6-9m-KS (isMedical:true), RL-6-9m-PS
  // TODO: RL-9-12m-* (6 cards)
  // TODO: RL-12-18m-* (6 cards)
  // TODO: RL-18-24m-* (6 cards)
  // TODO: RL-2-3y-* (6 cards)
  // TODO: RL-3-4y-* (6 cards)
  // TODO: RL-4-5y-* (6 cards)
  // TODO: RL-5-6y-* (6 cards)
];
