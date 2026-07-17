"use strict";
// ============================================================================
// Studiva Digital — canonical reference/source registry.
// Sections and modules cite sources by stable id via [ref:<sourceId>] tokens.
// composeScientific() resolves those tokens into numbered [n] citations.
// TODO: migrate to DB/CMS; add version history.
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOURCES = void 0;
exports.SOURCES = {
    "harvard-brain": { id: "harvard-brain", label: "Center on the Developing Child, Harvard University, Brain Architecture.", url: "https://developingchild.harvard.edu/key-concept/brain-architecture/", type: "institusi" },
    "harvard-serve-return": { id: "harvard-serve-return", label: "Center on the Developing Child, Harvard University, Serve and Return.", url: "https://developingchild.harvard.edu/key-concepts/serve-and-return/", type: "institusi" },
    "cdc-act-early": { id: "cdc-act-early", label: "CDC, Learn the Signs. Act Early.", url: "https://www.cdc.gov/act-early/", type: "pedoman" },
    "cdc-sids": { id: "cdc-sids", label: "CDC, Sudden Infant Death Syndrome.", url: "https://www.cdc.gov/sids/", type: "pedoman" },
    "aap-safe-sleep-2022": { id: "aap-safe-sleep-2022", label: "AAP, Sleep-Related Infant Deaths: Updated 2022 Recommendations.", url: "https://publications.aap.org/pediatrics/article/150/1/e2022057990/188304/", type: "pedoman" },
    "aap-media": { id: "aap-media", label: "American Academy of Pediatrics, Media and Young Minds (screen time).", url: "https://www.healthychildren.org", type: "pedoman" },
    "aap-healthychildren": { id: "aap-healthychildren", label: "American Academy of Pediatrics, HealthyChildren.org.", url: "https://www.healthychildren.org", type: "pedoman" },
    "aap-aasm-sleep": { id: "aap-aasm-sleep", label: "American Academy of Pediatrics / AASM, rekomendasi durasi tidur anak.", url: "https://www.healthychildren.org", type: "pedoman" },
    "aap-aapd-dental": { id: "aap-aapd-dental", label: "American Academy of Pediatric Dentistry (AAPD) / ADA — panduan pasta fluoride.", url: "https://www.aapd.org", type: "pedoman" },
    "who-breastfeeding": { id: "who-breastfeeding", label: "WHO / UNICEF, Breastfeeding.", url: "https://www.who.int/health-topics/breastfeeding", type: "pedoman" },
    "who-complementary-2023": { id: "who-complementary-2023", label: "WHO, Complementary feeding of infants and young children 6-23 months (2023).", url: "https://www.who.int/publications/i/item/9789240081864", type: "pedoman" },
    "who-idai-preschool": { id: "who-idai-preschool", label: "WHO; IDAI, gizi dan tumbuh kembang anak usia prasekolah.", url: "https://www.who.int", type: "pedoman" },
    "asha": { id: "asha", label: "American Speech-Language-Hearing Association (ASHA).", url: "https://www.asha.org", type: "institusi" },
    "idai": { id: "idai", label: "IDAI, jadwal imunisasi.", url: "https://www.idai.or.id", type: "pedoman" },
    "kemenkes-kia-kpsp": { id: "kemenkes-kia-kpsp", label: "Kementerian Kesehatan RI — Buku KIA; SDIDTK/KPSP (pemantauan pertumbuhan & perkembangan).", url: "https://www.kemkes.go.id", type: "pedoman" },
    "piaget": { id: "piaget", label: "Jean Piaget, tahap sensorimotor.", type: "karya-klasik" },
    "ainsworth-1978": { id: "ainsworth-1978", label: "Ainsworth, M. D. S., Blehar, Waters & Wall (1978), Patterns of Attachment.", type: "karya-klasik" },
    "vanijzendoorn-1988": { id: "vanijzendoorn-1988", label: "van IJzendoorn & Kroonenberg (1988), Child Development 59(1).", type: "riset" },
    "bowlby-1969": { id: "bowlby-1969", label: "Bowlby (1969), Attachment and Loss Vol. 1.", type: "karya-klasik" },
    "winnicott-1953": { id: "winnicott-1953", label: "Winnicott (1953), Transitional Objects and Transitional Phenomena.", type: "karya-klasik" },
    "erikson": { id: "erikson", label: "Erikson, E. H. Childhood and Society, trust vs mistrust.", type: "karya-klasik" },
    "vygotsky-play": { id: "vygotsky-play", label: "Piaget & Vygotsky — bermain simbolik.", type: "karya-klasik" },
    "montessori": { id: "montessori", label: "Maria Montessori — prepared environment.", type: "karya-klasik" },
    "kuhl-ids": { id: "kuhl-ids", label: "Riset infant-directed speech & 'video deficit' (mis. Kuhl dkk.).", type: "riset" },
    "aap-toilet": { id: "aap-toilet", label: "American Academy of Pediatrics, kesiapan toilet training.", url: "https://www.healthychildren.org", type: "pedoman" },
    "who-idai-mpasi": { id: "who-idai-mpasi", label: "WHO; IDAI, keamanan makanan bayi dan madu.", url: "https://www.idai.or.id", type: "pedoman" },
    "aap-idai-mpasi": { id: "aap-idai-mpasi", label: "American Academy of Pediatrics; IDAI, keamanan MPASI dan madu.", url: "https://www.healthychildren.org", type: "pedoman" },
    // --- Added while scanning knowledgeCardData.ts: distinct AAP references that
    //     the original per-card reference lists kept separate. Keeping them
    //     distinct preserves the original citation numbering (no citation shift).
    "aap-vision": { id: "aap-vision", label: "American Academy of Pediatrics, perkembangan penglihatan bayi.", url: "https://www.healthychildren.org", type: "pedoman" },
    "aap-responsive": { id: "aap-responsive", label: "American Academy of Pediatrics, Responsive caregiving.", url: "https://www.healthychildren.org", type: "pedoman" },
    "aap-literacy": { id: "aap-literacy", label: "American Academy of Pediatrics, literasi dini (membacakan sejak lahir).", url: "https://www.healthychildren.org", type: "pedoman" },
    "aap-baby-walker": { id: "aap-baby-walker", label: "American Academy of Pediatrics, baby walkers.", url: "https://www.healthychildren.org", type: "pedoman" },
    "aap-cow-milk": { id: "aap-cow-milk", label: "American Academy of Pediatrics, susu sapi pada bayi < 1 tahun.", url: "https://www.healthychildren.org", type: "pedoman" },
    // --- Batch 3-4y (2026-07): 4 sumber eksplisit §1 ---
    "thomas-chess": { id: "thomas-chess", label: "Thomas & Chess — New York Longitudinal Study; temperamen (9 dimensi, goodness of fit).", type: "karya-klasik" },
    "dweck-mindset": { id: "dweck-mindset", label: "Carol Dweck — riset pujian & mindset (Mueller & Dweck 1998; Mindset 2006).", type: "karya-klasik" },
    "who-growth-standards": { id: "who-growth-standards", label: "WHO — Child Growth Standards (kurva pertumbuhan, dipakai pada Buku KIA).", url: "https://www.who.int/tools/child-growth-standards", type: "pedoman" },
    "who-injury": { id: "who-injury", label: "WHO — World Report on Child Injury Prevention; keselamatan anak & pencegahan tenggelam.", url: "https://www.who.int/publications/i/item/9789241563574", type: "pedoman" },
    // --- Batch 3-4y (2026-07): 4 sumber implisit (dibutuhkan modul & kartu baru) ---
    "harvard-executive": { id: "harvard-executive", label: "Center on the Developing Child, Harvard University, Executive Function & Self-Regulation.", url: "https://developingchild.harvard.edu/key-concept/executive-function/", type: "institusi" },
    "vygotsky-piaget-play": { id: "vygotsky-piaget-play", label: "Vygotsky & Piaget — bermain simbolik, bermain peran, dan perkembangan fungsi eksekutif.", type: "karya-klasik" },
    "who-activity-u5-2019": { id: "who-activity-u5-2019", label: "WHO, Guidelines on Physical Activity, Sedentary Behaviour and Sleep for Children Under 5 Years (2019).", url: "https://www.who.int/publications/i/item/9789241550536", type: "pedoman" },
    "satter-dor": { id: "satter-dor", label: "Ellyn Satter — Division of Responsibility in Feeding (sDOR).", url: "https://www.ellynsatterinstitute.org", type: "karya-klasik" },
    // --- Batch 4-5y (2026-07): 2 sumber baru §1 ---
    "theory-of-mind": { id: "theory-of-mind", label: "Riset teori pikiran (theory of mind) — Wimmer & Perner; Wellman dkk.", type: "riset" },
    "who-activity-5-17": { id: "who-activity-5-17", label: "WHO — Guidelines on Physical Activity and Sedentary Behaviour (usia 5–17 tahun).", url: "https://www.who.int/publications/i/item/9789240015128", type: "pedoman" },
    // --- Batch DK-1 (2026-07): domain Deteksi Dini & Kebutuhan Khusus ---
    "mchat-robins": { id: "mchat-robins", label: "M-CHAT-R/F (Robins, Fein & Barton) — skrining autisme usia 16–30 bulan.", url: "https://mchatscreen.com", type: "riset" },
    "cdc-autism": { id: "cdc-autism", label: "CDC — Autism Spectrum Disorder: tanda awal & keamanan vaksin.", url: "https://www.cdc.gov/autism/", type: "institusi" },
    "aap-down-syndrome": { id: "aap-down-syndrome", label: "AAP — Health Supervision for Children and Adolescents With Down Syndrome.", type: "pedoman" },
    // --- Batch DK-2 (2026-07): ADHD, sensorik, dukungan keluarga ---
    "aap-adhd": { id: "aap-adhd", label: "AAP — Clinical Practice Guideline for the Diagnosis, Evaluation, and Treatment of ADHD in Children and Adolescents (2019).", url: "https://www.healthychildren.org/adhd", type: "pedoman" },
    "sensorik-ot": { id: "sensorik-ot", label: "Ayres Sensory Integration — riset integrasi sensorik dalam terapi okupasi (Ayres 1972; Bundy & Lane 2020).", type: "riset" },
    "riset-keluarga-abk": { id: "riset-keluarga-abk", label: "Riset sistem keluarga anak berkebutuhan khusus — Turnbull, Summers & Brotherson; Family Quality of Life.", type: "riset" },
};
//# sourceMappingURL=sources.js.map