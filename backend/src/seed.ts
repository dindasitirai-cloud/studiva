import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase, get } from './database';
import { createUser, findUserByEmail } from './models/User';
import { createChild, assignTeacherToChild, findChildrenByParentId } from './models/Child';
import { createUpdate } from './models/Update';
import { findAllResources, createResource } from './models/Resource';
import { createSubscription, findActiveSubscriptionByUserId } from './models/Subscription';
import { computeEndDate } from './lib/pricing';
import { upsertAdminProfile, findAdminProfileByUserId } from './models/AdminProfile';
import { setExpert, setChampion, updateBio } from './models/CommunityProfile';
import { findAllKnowledgeCards, createKnowledgeCard } from './models/KnowledgeCard';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function seed(): Promise<void> {
  await initDatabase();

  let parent = await findUserByEmail('test@studiva.id');
  if (!parent) {
    parent = await createUser('test@studiva.id', await bcrypt.hash('password123', 10), 'parent', 'Bunda Sari');
    console.log('Created parent user: test@studiva.id');
  }

  let teacher = await findUserByEmail('teacher@studiva.id');
  if (!teacher) {
    teacher = await createUser('teacher@studiva.id', await bcrypt.hash('password123', 10), 'teacher', 'Bu Dewi');
    console.log('Created teacher user: teacher@studiva.id');
  }

  if (!(await findUserByEmail('admin@studiva.id'))) {
    await createUser('admin@studiva.id', await bcrypt.hash('password123', 10), 'admin', 'Admin Studiva');
    console.log('Created admin user: admin@studiva.id');
  }

  let fitri = await findUserByEmail('fitri@studiva.id');
  if (!fitri) {
    fitri = await createUser(
      'fitri@studiva.id',
      await bcrypt.hash('Studiva@Fitri2026!', 10),
      'admin',
      'Psikolog Fitri Effendy'
    );
    console.log('Created admin/expert user: fitri@studiva.id');
  }

  if (!(await findAdminProfileByUserId(fitri.id))) {
    await upsertAdminProfile(
      fitri.id,
      'Founder & Head Psychologist',
      'S.Psi, Certified Child Psychologist, Special Needs Educator',
      'Founder of Studiva. Specializes in inclusive education and special needs support.',
      ['Inclusive Education', 'Child Psychology', 'Special Needs Support', 'Parent Counseling', 'Educational Therapy'],
      '+62 812-1147-0407',
      'https://wa.me/6281211470407',
      'Jl. Mandiangin no. 65, Bukittinggi',
      true
    );
    await setExpert(fitri.id, true, 'Expert - Founder');
    await setChampion(fitri.id, true);
    await updateBio(fitri.id, 'Founder & Head Psychologist at Studiva. S.Psi');
    console.log('Created admin profile + expert/champion community profile for fitri@studiva.id');
  }

  let tier2Parent = await findUserByEmail('tier2@studiva.id');
  if (!tier2Parent) {
    tier2Parent = await createUser('tier2@studiva.id', await bcrypt.hash('password123', 10), 'parent', 'Ibu Rina');
    console.log('Created Tier 2 parent user: tier2@studiva.id');
  }

  let children = await findChildrenByParentId(parent.id);
  let rafa = children.find((c) => c.name === 'Rafa');
  if (!rafa) {
    rafa = await createChild('Rafa', 6, 'Visual learner, sensory sensitive, needs structure', parent.id);
    console.log('Created child: Rafa');
  }

  // Maya belongs to a second parent so the teacher has two distinct students
  let mayaParent = await findUserByEmail('parent2@studiva.id');
  if (!mayaParent) {
    mayaParent = await createUser(
      'parent2@studiva.id',
      await bcrypt.hash('password123', 10),
      'parent',
      'Pak Budi'
    );
  }
  let mayaChildren = await findChildrenByParentId(mayaParent.id);
  let maya = mayaChildren.find((c) => c.name === 'Maya');
  if (!maya) {
    maya = await createChild('Maya', 7, 'Kinesthetic learner, thrives with hands-on activities', mayaParent.id);
    console.log('Created child: Maya');
  }

  await assignTeacherToChild(teacher.id, rafa.id);
  await assignTeacherToChild(teacher.id, maya.id);

  let tier2Children = await findChildrenByParentId(tier2Parent.id);
  let dimas = tier2Children.find((c) => c.name === 'Dimas');
  if (!dimas) {
    dimas = await createChild('Dimas', 5, 'Auditory learner, benefits from routine and clear instructions', tier2Parent.id);
    console.log('Created child: Dimas');
  }

  const existingUpdates = await get('SELECT COUNT(*) as count FROM daily_updates') as { count: number };
  if (existingUpdates.count === 0) {
    const sampleUpdates: Array<[number, string, 'academics' | 'behavior' | 'therapy' | 'social', string]> = [
      [rafa.id, 'Rafa berhasil menyelesaikan puzzle 20 keping hari ini tanpa bantuan!', 'academics', '2026-06-20'],
      [rafa.id, 'Rafa menunjukkan kemajuan dalam mengelola emosi saat transisi antar aktivitas.', 'behavior', '2026-06-21'],
      [rafa.id, 'Sesi terapi okupasi: Rafa semakin nyaman dengan aktivitas sensori taktil.', 'therapy', '2026-06-22'],
      [maya.id, 'Maya aktif berpartisipasi dalam permainan kelompok bersama teman-temannya.', 'social', '2026-06-20'],
      [maya.id, 'Maya menyelesaikan latihan menulis dengan percaya diri hari ini.', 'academics', '2026-06-23'],
    ];
    for (const [childId, content, category, date] of sampleUpdates) {
      await createUpdate(childId, teacher.id, content, null, category, date);
    }
    console.log('Inserted 5 sample daily updates');
  }

  const existingResources = await findAllResources();
  if (existingResources.length === 0) {
    const sampleResources: Array<{
      title: string;
      description: string;
      content: string;
      category: 'Sensory' | 'Social' | 'Behavior' | 'Academic' | 'Therapy';
      format: 'article' | 'video' | 'checklist' | 'template';
      publishedDate: string;
    }> = [
      {
        title: 'Memahami Sensory Processing pada Anak',
        description:
          'Panduan lengkap untuk memahami bagaimana anak dengan kebutuhan belajar berbeda memproses informasi sensorik dari lingkungan sekitar mereka.',
        content:
          'Sensory processing adalah cara otak menerima dan merespons informasi dari indera. Anak dengan sensory processing differences mungkin overreact atau underreact terhadap suara, cahaya, tekstur, atau gerakan. Orang tua dapat membantu dengan menciptakan lingkungan yang predictable, menyediakan sensory breaks, dan mengenali tanda-tanda overload sejak dini.',
        category: 'Sensory',
        format: 'article',
        publishedDate: '2026-01-10',
      },
      {
        title: 'Checklist: Menyiapkan Ruang Belajar Sensory-Friendly',
        description:
          'Checklist praktis untuk menata ruang belajar di rumah agar nyaman bagi anak dengan sensitivitas sensori.',
        content:
          '1. Kurangi pencahayaan yang terlalu terang. 2. Sediakan headphone peredam suara. 3. Gunakan kursi dengan tekstur yang nyaman. 4. Minimalkan clutter visual. 5. Sediakan fidget tools. 6. Buat jadwal visual yang konsisten.',
        category: 'Sensory',
        format: 'checklist',
        publishedDate: '2026-01-15',
      },
      {
        title: 'Membangun Keterampilan Sosial melalui Bermain',
        description:
          'Strategi bermain terstruktur yang dapat membantu anak mengembangkan keterampilan sosial dengan teman sebaya.',
        content:
          'Bermain peran, permainan turn-taking, dan aktivitas kelompok kecil adalah cara efektif melatih keterampilan sosial. Mulai dengan interaksi 1-on-1 sebelum beralih ke kelompok yang lebih besar, dan berikan pujian spesifik saat anak menunjukkan perilaku sosial positif.',
        category: 'Social',
        format: 'article',
        publishedDate: '2026-02-01',
      },
      {
        title: 'Video: Latihan Komunikasi Sosial Sehari-hari',
        description:
          'Video tutorial berisi latihan singkat yang dapat dipraktikkan orang tua bersama anak untuk melatih komunikasi sosial.',
        content:
          'Video ini mendemonstrasikan lima latihan komunikasi sosial: salam, kontak mata, bergiliran bicara, mengekspresikan kebutuhan, dan merespons emosi orang lain. Setiap latihan dilengkapi contoh dialog yang dapat ditiru di rumah.',
        category: 'Social',
        format: 'video',
        publishedDate: '2026-02-10',
      },
      {
        title: 'Strategi Mengelola Tantrum dan Meltdown',
        description:
          'Panduan berbasis riset untuk membedakan tantrum dan meltdown, serta strategi menenangkan anak secara efektif.',
        content:
          'Tantrum biasanya goal-directed, sementara meltdown adalah respons terhadap overload yang tidak dapat dikontrol anak. Strategi meliputi: tetap tenang, kurangi stimulasi, gunakan kalimat singkat, dan beri waktu untuk regulasi diri sebelum membahas masalah.',
        category: 'Behavior',
        format: 'article',
        publishedDate: '2026-02-18',
      },
      {
        title: 'Template: Jadwal Visual Harian Anak',
        description:
          'Template jadwal visual yang dapat dicetak untuk membantu anak memahami rutinitas harian dengan lebih baik.',
        content:
          'Template ini berisi kotak-kotak kegiatan (bangun, sarapan, belajar, bermain, tidur siang) yang dapat diisi dengan gambar atau ikon. Jadwal visual membantu anak memprediksi apa yang akan terjadi dan mengurangi kecemasan terhadap perubahan.',
        category: 'Behavior',
        format: 'template',
        publishedDate: '2026-02-25',
      },
      {
        title: 'Pendekatan Pembelajaran Personal untuk Setiap Gaya Belajar',
        description:
          'Mengenal gaya belajar visual, auditori, dan kinestetik serta cara menyesuaikan metode pengajaran di rumah.',
        content:
          'Setiap anak memiliki kombinasi unik dari gaya belajar visual, auditori, dan kinestetik. Anak visual belajar baik dengan gambar dan diagram, anak auditori dengan penjelasan verbal dan musik, sedangkan anak kinestetik melalui gerakan dan praktik langsung.',
        category: 'Academic',
        format: 'article',
        publishedDate: '2026-03-02',
      },
      {
        title: 'Checklist: Tanda Kesiapan Akademik Anak',
        description:
          'Daftar indikator yang menunjukkan anak siap untuk tantangan akademik baru sesuai tahap perkembangannya.',
        content:
          '1. Dapat mengikuti instruksi 2 langkah. 2. Menunjukkan minat pada huruf/angka. 3. Mampu duduk fokus 10-15 menit. 4. Dapat mengekspresikan kebutuhan dasar. 5. Menunjukkan rasa ingin tahu terhadap aktivitas baru.',
        category: 'Academic',
        format: 'checklist',
        publishedDate: '2026-03-08',
      },
      {
        title: 'Mengenal Terapi Wicara untuk Anak dengan Hambatan Bahasa',
        description:
          'Penjelasan tentang kapan dan mengapa anak memerlukan terapi wicara, serta apa yang diharapkan orang tua dari prosesnya.',
        content:
          'Terapi wicara membantu anak dengan hambatan artikulasi, bahasa ekspresif, atau bahasa reseptif. Terapis bekerja sama dengan orang tua untuk menerapkan latihan di rumah, seperti membaca bersama dan permainan kosakata, agar progres lebih konsisten.',
        category: 'Therapy',
        format: 'article',
        publishedDate: '2026-03-15',
      },
      {
        title: 'Video: Latihan Terapi Okupasi Sederhana di Rumah',
        description:
          'Demonstrasi video latihan terapi okupasi yang aman dipraktikkan orang tua di rumah untuk melatih motorik halus.',
        content:
          'Video ini menunjukkan lima latihan motorik halus sederhana: meremas playdough, menjepit dengan jepitan kertas, menggunting garis lurus, merangkai manik, dan menggambar bentuk dasar. Setiap latihan disertai tips keselamatan dan durasi yang disarankan.',
        category: 'Therapy',
        format: 'video',
        publishedDate: '2026-03-20',
      },
    ];

    for (const r of sampleResources) {
      await createResource(r.title, r.description, r.content, r.category, r.format, 'Psikolog Fitri Effendy', r.publishedDate);
    }
    console.log('Inserted 10 sample resources');
  }

  if (!(await findActiveSubscriptionByUserId(parent.id))) {
    const startDate = new Date().toISOString().slice(0, 10);
    await createSubscription(
      parent.id,
      'tier1',
      'monthly',
      'active',
      startDate,
      computeEndDate('monthly', new Date()),
      'manual',
      null,
      500_000
    );
    console.log('Created active Tier 1 subscription for test@studiva.id');
  }

  if (!(await findActiveSubscriptionByUserId(teacher.id))) {
    const startDate = new Date().toISOString().slice(0, 10);
    await createSubscription(
      teacher.id,
      'tier1',
      'monthly',
      'active',
      startDate,
      computeEndDate('monthly', new Date()),
      'manual',
      null,
      0
    );
    console.log('Created active Tier 1 subscription for teacher@studiva.id');
  }

  if (!(await findActiveSubscriptionByUserId(tier2Parent.id))) {
    const startDate = new Date().toISOString().slice(0, 10);
    await createSubscription(
      tier2Parent.id,
      'tier2',
      'monthly',
      'active',
      startDate,
      computeEndDate('monthly', new Date()),
      'manual',
      null,
      79_000
    );
    console.log('Created active Tier 2 subscription for tier2@studiva.id');
  }

  const existingKnowledgeCards = await findAllKnowledgeCards();
  if (existingKnowledgeCards.length === 0) {
    const knowledgeCardSeeds = [
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
        status: 'PUBLISHED' as const,
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
          'Satu temuan penting: bayi belajar bahasa dari manusia, bukan dari layar.',
          'Cara Anda bicara pun berpengaruh. Nada tinggi, lambat, dan ekspresif ("parentese") membantu bayi memisahkan kata dan memperhatikan lebih lama.',
          'Banyaknya kata yang bayi dengar di tahun awal berkaitan dengan kosakata dan kesiapan sekolahnya kelak.',
        ],
        sources: ['ASHA (American Speech-Language-Hearing Association)', 'CDC Learn the Signs. Act Early.'],
        status: 'PUBLISHED' as const,
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
          'Ilmuwan Harvard menggambarkan proses ini seperti lempar-tangkap. Bayi "melempar" sinyal — menatap, mengoceh, menangis.',
          'Bowlby dan Ainsworth menunjukkan bahwa bayi yang kebutuhannya ditanggapi secara hangat dan dapat diprediksi cenderung mengembangkan kelekatan aman.',
          'Apakah sering menggendong memanjakan bayi? Ilmu perkembangan menjawab tidak, setidaknya di tahun pertama.',
          'Ada sisi biologisnya. Sentuhan dan kontak kulit memicu oksitosin, hormon penumbuh rasa tenang dan ikatan.',
          'Kabar baiknya, Anda tak perlu sempurna. Yang penting bukan menanggapi tepat 100% dari waktu, melainkan cukup sering dan cukup hangat.',
          'Ringkasnya: rasa aman bukan lawan kemandirian. Justru dari fondasi rasa aman itulah kemandirian tumbuh.',
        ],
        sources: ['Harvard Center on the Developing Child', 'Erik Erikson (trust vs mistrust)', 'Bowlby & Ainsworth (attachment)', 'AAP HealthyChildren.org'],
        status: 'PUBLISHED' as const,
      },
    ];

    for (const seedCard of knowledgeCardSeeds) {
      await createKnowledgeCard(seedCard);
    }
    console.log('Inserted 3 seed knowledge cards (0-3m FM, BH, SE)');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
