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

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
