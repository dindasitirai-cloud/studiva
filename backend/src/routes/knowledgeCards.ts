import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import {
  createKnowledgeCard,
  findKnowledgeCardById,
  findAllKnowledgeCards,
  findPublishedKnowledgeCards,
  updateKnowledgeCard,
  updateKnowledgeCardStatus,
  deleteKnowledgeCard,
} from '../models/KnowledgeCard';

const router = Router();

const VALID_STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED'];
const VALID_DOMAINS = ['FM', 'KG', 'BH', 'SE', 'KS', 'PS'];
const VALID_AGE_KEYS = ['0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y', '5-6y'];

// ─── PUBLIC ROUTES ─────────────────────────────────────────────────────────────

// GET /api/knowledge-cards — all PUBLISHED cards, filter by ?ageKey=&domain=
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const ageKey = req.query.ageKey as string | undefined;
    const domain = req.query.domain as string | undefined;

    if (ageKey && !VALID_AGE_KEYS.includes(ageKey)) {
      throw new ApiError(400, 'Invalid ageKey');
    }
    if (domain && !VALID_DOMAINS.includes(domain)) {
      throw new ApiError(400, 'Invalid domain');
    }

    const cards = await findPublishedKnowledgeCards(ageKey, domain);
    res.json({ cards });
  })
);

// GET /api/knowledge-cards/:id — single PUBLISHED card by id
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ApiError(400, 'Invalid id');

    const card = await findKnowledgeCardById(id);
    if (!card) throw new ApiError(404, 'Knowledge card not found');
    if (card.status !== 'PUBLISHED') throw new ApiError(404, 'Knowledge card not found');

    res.json({ card });
  })
);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/knowledge-cards/admin/all — all cards with all statuses
router.get(
  '/admin/all',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const ageKey = req.query.ageKey as string | undefined;
    const domain = req.query.domain as string | undefined;

    if (status && !VALID_STATUSES.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }
    if (ageKey && !VALID_AGE_KEYS.includes(ageKey)) {
      throw new ApiError(400, 'Invalid ageKey');
    }
    if (domain && !VALID_DOMAINS.includes(domain)) {
      throw new ApiError(400, 'Invalid domain');
    }

    const cards = await findAllKnowledgeCards({ status, ageKey, domain });
    res.json({ cards });
  })
);

// POST /api/knowledge-cards/admin — create card (status=DRAFT)
router.post(
  '/admin',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      slug, age_key, domain, title, photo_src, photo_alt, photo_credit,
      read_minutes, is_medical, terjadi, penting, lakukan, perhatian,
      sci_title, sci_read_minutes, sci_paragraphs, sources,
    } = req.body as Record<string, unknown>;

    if (!slug || typeof slug !== 'string') throw new ApiError(400, 'slug is required');
    if (!age_key || !VALID_AGE_KEYS.includes(age_key as string)) throw new ApiError(400, 'Valid age_key is required');
    if (!domain || !VALID_DOMAINS.includes(domain as string)) throw new ApiError(400, 'Valid domain is required');
    if (!title || typeof title !== 'string') throw new ApiError(400, 'title is required');

    const card = await createKnowledgeCard({
      slug: slug as string,
      age_key: age_key as string,
      domain: domain as string,
      title: title as string,
      photo_src: (photo_src as string | null) ?? null,
      photo_alt: (photo_alt as string | null) ?? null,
      photo_credit: (photo_credit as string | null) ?? null,
      read_minutes: typeof read_minutes === 'number' ? read_minutes : 2,
      is_medical: is_medical === true || is_medical === 1,
      terjadi: typeof terjadi === 'string' ? terjadi : '',
      penting: typeof penting === 'string' ? penting : '',
      lakukan: Array.isArray(lakukan) ? lakukan as string[] : [],
      perhatian: typeof perhatian === 'string' ? perhatian : '',
      sci_title: (sci_title as string | null) ?? null,
      sci_read_minutes: typeof sci_read_minutes === 'number' ? sci_read_minutes : null,
      sci_paragraphs: Array.isArray(sci_paragraphs) ? sci_paragraphs as string[] : [],
      sources: Array.isArray(sources) ? sources as string[] : [],
      status: 'DRAFT',
      created_by: req.user?.id,
    });

    res.status(201).json({ card });
  })
);

// PUT /api/knowledge-cards/admin/:id — update card fields
router.put(
  '/admin/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ApiError(400, 'Invalid id');

    const existing = await findKnowledgeCardById(id);
    if (!existing) throw new ApiError(404, 'Knowledge card not found');

    const {
      slug, age_key, domain, title, photo_src, photo_alt, photo_credit,
      read_minutes, is_medical, terjadi, penting, lakukan, perhatian,
      sci_title, sci_read_minutes, sci_paragraphs, sources,
    } = req.body as Record<string, unknown>;

    if (age_key !== undefined && !VALID_AGE_KEYS.includes(age_key as string)) {
      throw new ApiError(400, 'Invalid age_key');
    }
    if (domain !== undefined && !VALID_DOMAINS.includes(domain as string)) {
      throw new ApiError(400, 'Invalid domain');
    }

    const card = await updateKnowledgeCard(id, {
      slug: typeof slug === 'string' ? slug : undefined,
      age_key: typeof age_key === 'string' ? age_key : undefined,
      domain: typeof domain === 'string' ? domain : undefined,
      title: typeof title === 'string' ? title : undefined,
      photo_src: photo_src !== undefined ? (photo_src as string | null) : undefined,
      photo_alt: photo_alt !== undefined ? (photo_alt as string | null) : undefined,
      photo_credit: photo_credit !== undefined ? (photo_credit as string | null) : undefined,
      read_minutes: typeof read_minutes === 'number' ? read_minutes : undefined,
      is_medical: is_medical !== undefined ? (is_medical === true || is_medical === 1) : undefined,
      terjadi: typeof terjadi === 'string' ? terjadi : undefined,
      penting: typeof penting === 'string' ? penting : undefined,
      lakukan: Array.isArray(lakukan) ? lakukan as string[] : undefined,
      perhatian: typeof perhatian === 'string' ? perhatian : undefined,
      sci_title: sci_title !== undefined ? (sci_title as string | null) : undefined,
      sci_read_minutes: sci_read_minutes !== undefined ? (sci_read_minutes as number | null) : undefined,
      sci_paragraphs: Array.isArray(sci_paragraphs) ? sci_paragraphs as string[] : undefined,
      sources: Array.isArray(sources) ? sources as string[] : undefined,
      updated_by: req.user?.id,
    });

    res.json({ card });
  })
);

// PUT /api/knowledge-cards/admin/:id/status — change status
router.put(
  '/admin/:id/status',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ApiError(400, 'Invalid id');

    const { status, reviewerNotes } = req.body as { status?: string; reviewerNotes?: string };

    if (!status || !VALID_STATUSES.includes(status)) {
      throw new ApiError(400, 'Valid status is required');
    }

    const existing = await findKnowledgeCardById(id);
    if (!existing) throw new ApiError(404, 'Knowledge card not found');

    const card = await updateKnowledgeCardStatus(
      id,
      status,
      req.user?.id,
      reviewerNotes
    );

    res.json({ card });
  })
);

// DELETE /api/knowledge-cards/admin/:id — delete card
router.delete(
  '/admin/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ApiError(400, 'Invalid id');

    const existing = await findKnowledgeCardById(id);
    if (!existing) throw new ApiError(404, 'Knowledge card not found');

    await deleteKnowledgeCard(id);
    res.json({ success: true });
  })
);

// POST /api/knowledge-cards/admin/seed — seed from static data (one-time import)
router.post(
  '/admin/seed',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await findAllKnowledgeCards();
    if (existing.length > 0) {
      res.json({ message: 'Knowledge cards already seeded', count: existing.length });
      return;
    }

    const SEED_CARDS = [
      {
        slug: '0-3m-fm',
        age_key: '0-3m',
        domain: 'FM',
        title: 'Tummy time: menegakkan kepala',
        photo_src: '/images/rl/0-3m-fm.jpg',
        photo_alt: 'Bayi tummy time mengangkat kepala',
        photo_credit: 'Unsplash',
        read_minutes: 2,
        is_medical: false,
        terjadi: 'Otot leher dan bahu bayi menguat. Saat tengkurap dalam keadaan bangun, ia mulai mengangkat kepala; tangannya sering dibawa ke mulut.',
        penting: 'Tummy time membangun kekuatan untuk berguling, duduk, dan merangkak, sekaligus mencegah kepala peyang. Prinsipnya: "back to sleep, tummy to play".',
        lakukan: ['Mulai 3–5 menit, 2–3 kali sehari saat bayi bangun & diawasi.', 'Turun ke lantai; ajak bicara sejajar matanya.', 'Pakai mainan kontras atau cermin bayi.', 'Jika menolak, coba di dada Anda sambil berbaring.'],
        perhatian: 'Menjelang 3 bulan kepala belum terangkat sama sekali, atau tubuh sangat kaku/lemas.',
        sci_title: 'Mengapa gerakan membangun otak, bukan hanya otot',
        sci_read_minutes: 6,
        sci_paragraphs: [
          'Perkembangan gerak bayi mengikuti pola yang dapat diprediksi. Kendali tubuh berkembang dari atas ke bawah — bayi menguasai kepala lebih dulu, lalu bahu, badan, dan kaki.',
          'Tummy time makin penting sejak kampanye "tidur telentang" pada 1990-an berhasil menurunkan angka kematian bayi mendadak (SIDS) secara drastis.',
          'Manfaatnya melampaui otot. Menurut Piaget, bayi di tahun pertama berada pada tahap sensorimotor: ia membangun pemahaman tentang dunia lewat indra dan gerak.',
          'Karena itu, beri bayi banyak waktu bergerak bebas di alas aman, dan jangan terlalu lama menaruhnya di kursi pantul atau ayunan.',
          'Ingat, rentang normal itu lebar. Sebagian bayi berguling di usia 4 bulan, sebagian di usia 6 bulan — keduanya normal.',
        ],
        sources: ['AAP HealthyChildren.org', 'CDC Learn the Signs. Act Early.'],
        status: 'PUBLISHED',
      },
      {
        slug: '0-3m-bh',
        age_key: '0-3m',
        domain: 'BH',
        title: 'Cooing: obrolan pertama sebelum kata',
        photo_src: '/images/rl/0-3m-bh.jpg',
        photo_alt: 'Ibu mengajak bayi bicara',
        photo_credit: 'Unsplash',
        read_minutes: 2,
        is_medical: false,
        terjadi: 'Sekitar 6–8 minggu bayi mengeluarkan suara lembut "ooh/aah" (cooing), menoleh ke sumber suara, dan tenang mendengar suara familiar.',
        penting: 'Otak bahasa dibangun sebelum kata pertama. Menanggapi suara bayi memperkuat jalur bahasa; makin banyak kata yang ia dengar dalam interaksi hangat, makin kaya bahasanya kelak.',
        lakukan: ['Ajak bicara sepanjang hari; narasikan aktivitas.', 'Tirukan cooing-nya lalu beri jeda untuk "giliran"-nya.', 'Gunakan nada "parentese" yang lembut & ekspresif.', 'Nyanyikan lagu dan bacakan buku.'],
        perhatian: 'Menjelang 3 bulan bayi tidak bereaksi pada suara keras, tidak bersuara, atau tidak menoleh ke suara.',
        sci_title: 'Bagaimana bahasa tumbuh jauh sebelum kata pertama',
        sci_read_minutes: 6,
        sci_paragraphs: [
          'Meski belum bisa bicara, otak bayi sudah mempelajari bahasa sejak hari pertama — bahkan sejak dalam kandungan, saat ia mengenali irama suara ibunya.',
          'Bayi adalah "ahli statistik" alami. Dari lautan suara yang ia dengar, otaknya menghitung pola: bunyi mana yang sering muncul bersama, di mana satu kata berakhir.',
          'Satu temuan penting: bayi belajar bahasa dari manusia, bukan dari layar. Dalam banyak penelitian, bayi yang mendengar bahasa dari orang sungguhan bisa mempelajarinya.',
          'Cara Anda bicara pun berpengaruh. Nada tinggi, lambat, dan ekspresif ("parentese") membantu bayi memisahkan kata dan memperhatikan lebih lama.',
          'Banyaknya kata yang bayi dengar di tahun awal berkaitan dengan kosakata dan kesiapan sekolahnya kelak.',
        ],
        sources: ['ASHA (American Speech-Language-Hearing Association)', 'CDC Learn the Signs. Act Early.'],
        status: 'PUBLISHED',
      },
      {
        slug: '0-3m-se',
        age_key: '0-3m',
        domain: 'SE',
        title: 'Senyum sosial & rasa aman',
        photo_src: '/images/rl/0-3m-se.jpg',
        photo_alt: 'Ibu dan bayi saling tersenyum',
        photo_credit: 'Unsplash',
        read_minutes: 2,
        is_medical: false,
        terjadi: 'Antara minggu ke-6 hingga ke-8 muncul senyum sosial — senyuman yang membalas wajah dan suara Anda, bukan refleks. Bayi menatap mata lebih lama dan tenang saat digendong.',
        penting: 'Interaksi bolak-balik ("serve & return") membentuk fondasi otak sosial dan emosi bayi. Menanggapi kebutuhannya secara konsisten membangun rasa aman.',
        lakukan: ['Tanggapi tangis dengan cepat dan tenang.', 'Balas senyum dan lakukan kontak mata.', 'Tirukan suaranya, beri jeda untuk "giliran"-nya.', 'Perbanyak kontak kulit (skin-to-skin).'],
        perhatian: 'Menjelang 3 bulan tidak ada senyum sosial, tidak ada kontak mata, atau bayi sangat sulit ditenangkan.',
        sci_title: 'Bagaimana rasa aman membentuk otak bayi',
        sci_read_minutes: 8,
        sci_paragraphs: [
          'Saat lahir, otak bayi baru memiliki sebagian kecil dari koneksi yang kelak ia miliki. Sebagian besar "kabel" otak dibangun setelah lahir.',
          'Ilmuwan Harvard menggambarkan proses ini seperti lempar-tangkap. Bayi "melempar" sinyal — menatap, mengoceh, menangis. Ketika orang dewasa "menangkap" dan membalas, otak bayi menerima sinyal bahwa dunia menanggapinya.',
          'Bowlby dan Ainsworth menunjukkan bahwa bayi yang kebutuhannya ditanggapi secara hangat dan dapat diprediksi cenderung mengembangkan kelekatan aman.',
          'Apakah sering menggendong memanjakan bayi? Ilmu perkembangan menjawab tidak, setidaknya di tahun pertama. Bagi bayi, menangis bukan manipulasi.',
          'Ada sisi biologisnya. Sentuhan dan kontak kulit memicu oksitosin, hormon penumbuh rasa tenang dan ikatan.',
          'Kabar baiknya, Anda tak perlu sempurna. Yang penting bukan menanggapi tepat 100% dari waktu, melainkan cukup sering dan cukup hangat.',
          'Ringkasnya: rasa aman bukan lawan kemandirian. Justru dari fondasi rasa aman itulah kemandirian tumbuh.',
        ],
        sources: ['Harvard Center on the Developing Child', 'Erik Erikson (trust vs mistrust)', 'Bowlby & Ainsworth (attachment)', 'AAP HealthyChildren.org'],
        status: 'PUBLISHED',
      },
    ];

    const created = [];
    for (const seedData of SEED_CARDS) {
      const card = await createKnowledgeCard({ ...seedData, created_by: req.user?.id });
      created.push(card);
    }

    res.status(201).json({ message: 'Seeded successfully', count: created.length, cards: created });
  })
);

export default router;
