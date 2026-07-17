import { PartnerThread, CatatanPendamping } from './types';

// Data mock pilot — 10-15 keluarga terpilih.
// Semua nama dan isi pesan adalah fiktif dan mengikuti voice guide:
// tidak ada label diagnostik, tidak ada bahasa defisit, tidak ada diagnosa.
// TODO: Ganti dengan data dari API backend saat pilot selesai.

export const mockThreads: PartnerThread[] = [
  // Thread 1 — menunggu_balasan (baru masuk, belum ada balasan pendamping)
  {
    id: 'thread-001',
    childId: 'child-001',
    childName: 'Raka',
    parentName: 'Ibu Dewi',
    status: 'menunggu_balasan',
    lastMessageAt: '2026-07-12T08:30:00.000Z',
    messages: [
      {
        id: 'msg-001-1',
        threadId: 'thread-001',
        sender: 'orang_tua',
        body: 'Kak, mau cerita soal Raka. Belakangan ini kalau lagi kegiatan makan bersama, dia sering sekali berdiri dari kursi sebelum makanan habis. Saya sudah coba berbagai cara — duduk di sebelahnya, beri pengingat pelan-pelan — tapi belum banyak berubah. Kira-kira ada pendekatan lain yang bisa kami coba di rumah?',
        createdAt: '2026-07-12T08:30:00.000Z',
        readByParent: true,
        readByPendamping: false,
      },
      {
        id: 'msg-001-2',
        threadId: 'thread-001',
        sender: 'sistem',
        body: 'Cerita Bunda sudah kami terima ya 😊 Kak pendamping akan membalas di hari kerja, paling lambat 1×24 jam.',
        createdAt: '2026-07-12T08:30:30.000Z',
        readByParent: true,
        readByPendamping: true,
      },
    ],
  },

  // Thread 2 — dibalas (orang tua berbagi kabar baik, sudah dibalas pendamping)
  {
    id: 'thread-002',
    childId: 'child-002',
    childName: 'Naura',
    parentName: 'Ibu Sari',
    status: 'dibalas',
    lastMessageAt: '2026-07-11T15:20:00.000Z',
    messages: [
      {
        id: 'msg-002-1',
        threadId: 'thread-002',
        sender: 'orang_tua',
        body: 'Kak mau share kabar baik! Naura tadi pagi mau pakai sepatu sendiri dari awal sampai akhir, padahal biasanya minta bantuan Bunda. Senang banget melihat dia semangat dan bangga setelah berhasil!',
        createdAt: '2026-07-11T10:05:00.000Z',
        readByParent: true,
        readByPendamping: true,
      },
      {
        id: 'msg-002-2',
        threadId: 'thread-002',
        sender: 'sistem',
        body: 'Cerita Bunda sudah kami terima ya 😊 Kak pendamping akan membalas di hari kerja, paling lambat 1×24 jam.',
        createdAt: '2026-07-11T10:05:30.000Z',
        readByParent: true,
        readByPendamping: true,
      },
      {
        id: 'msg-002-3',
        threadId: 'thread-002',
        sender: 'pendamping',
        senderName: 'Kak Sari',
        body: 'Wah, alhamdulillah! Ini kabar yang menyenangkan sekali, Bunda 🌸 Kemampuan Naura untuk menyelesaikan sesuatu secara mandiri, apalagi sampai tuntas seperti ini, adalah pencapaian yang patut dirayakan bersama. Terus dukung semangat dan kepercayaan dirinya ya — moments seperti ini sangat berarti bagi perkembangannya.',
        createdAt: '2026-07-11T15:20:00.000Z',
        readByParent: true,
        readByPendamping: true,
      },
    ],
  },

  // Thread 3 — selesai (percakapan lengkap beberapa hari lalu, sudah ditutup)
  {
    id: 'thread-003',
    childId: 'child-003',
    childName: 'Zafran',
    parentName: 'Bapak Adi',
    status: 'selesai',
    lastMessageAt: '2026-07-09T11:00:00.000Z',
    messages: [
      {
        id: 'msg-003-1',
        threadId: 'thread-003',
        sender: 'orang_tua',
        body: 'Kak, kami ingin tanya soal rutinitas tidur Zafran. Sekarang dia sulit sekali mau ke kamar tidur sebelum pukul 22.00 malam. Kalau kami ajak lebih awal, dia menangis dan protes lama. Apa yang bisa kami lakukan?',
        createdAt: '2026-07-07T19:30:00.000Z',
        readByParent: true,
        readByPendamping: true,
      },
      {
        id: 'msg-003-2',
        threadId: 'thread-003',
        sender: 'sistem',
        body: 'Cerita Ayah sudah kami terima ya 😊 Kak pendamping akan membalas di hari kerja, paling lambat 1×24 jam.',
        createdAt: '2026-07-07T19:30:30.000Z',
        readByParent: true,
        readByPendamping: true,
      },
      {
        id: 'msg-003-3',
        threadId: 'thread-003',
        sender: 'pendamping',
        senderName: 'Kak Rini',
        body: 'Terima kasih sudah berbagi, Ayah. Transisi menuju waktu tidur memang sering menjadi tantangan tersendiri. Beberapa hal yang bisa dicoba: buat rutinitas konsisten 30–45 menit sebelum tidur (misalnya mandi hangat → baju tidur → cerita pendek), kurangi cahaya terang dan suara keras secara bertahap, serta tetap tenang dan konsisten meski ada protes. Kami sarankan mencoba 5–7 hari dulu dan lihat perubahannya. Kalau ada pertanyaan lanjutan, kami siap membantu ya.',
        createdAt: '2026-07-08T10:15:00.000Z',
        readByParent: true,
        readByPendamping: true,
      },
      {
        id: 'msg-003-4',
        threadId: 'thread-003',
        sender: 'orang_tua',
        body: 'Terima kasih banyak Kak Rini, kami akan coba tips-nya. Senang ada yang menemani kami berpikir soal ini.',
        createdAt: '2026-07-09T08:45:00.000Z',
        readByParent: true,
        readByPendamping: true,
      },
      {
        id: 'msg-003-5',
        threadId: 'thread-003',
        sender: 'pendamping',
        senderName: 'Kak Rini',
        body: 'Sama-sama, Ayah! Semangat ya, dan jangan ragu cerita lagi kalau ada update atau pertanyaan baru. Kami di sini 🌷',
        createdAt: '2026-07-09T11:00:00.000Z',
        readByParent: true,
        readByPendamping: true,
      },
    ],
  },

  // Thread 4 — menunggu_balasan (bolak-balik pesan + 1 jembatan otomatis, masih menunggu)
  {
    id: 'thread-004',
    childId: 'child-004',
    childName: 'Alisha',
    parentName: 'Ibu Maya',
    status: 'menunggu_balasan',
    lastMessageAt: '2026-07-11T20:10:00.000Z',
    messages: [
      {
        id: 'msg-004-1',
        threadId: 'thread-004',
        sender: 'orang_tua',
        body: 'Kak, mau cerita. Alisha belakangan ini kalau diajak ke tempat ramai seperti mal atau pasar, dia sering menutup telinga dan minta segera pulang. Kami jadi ragu apakah perlu membatasi kunjungan ke tempat ramai atau justru perlu dibiasakan pelan-pelan?',
        createdAt: '2026-07-10T09:00:00.000Z',
        readByParent: true,
        readByPendamping: true,
      },
      {
        id: 'msg-004-2',
        threadId: 'thread-004',
        sender: 'sistem',
        body: 'Cerita Bunda sudah kami terima ya 😊 Kak pendamping akan membalas di hari kerja, paling lambat 1×24 jam.',
        createdAt: '2026-07-10T09:00:30.000Z',
        readByParent: true,
        readByPendamping: true,
      },
      {
        id: 'msg-004-3',
        threadId: 'thread-004',
        sender: 'pendamping',
        senderName: 'Kak Sari',
        body: 'Terima kasih sudah berbagi, Bunda. Respons Alisha menutup telinga di tempat ramai bisa jadi caranya memberitahu bahwa suasana terasa terlalu intens saat itu. Untuk sementara, tidak ada salahnya lebih memilih waktu yang lebih tenang — misalnya ke mal di pagi hari saat lebih sepi. Yang paling penting, perhatikan sinyal dari Alisha dan tidak perlu memaksanya bertahan lebih lama dari yang ia mampu. Kalau Bunda ingin eksplorasi strategi lebih lanjut, kami siap diskusi ya 🌷',
        createdAt: '2026-07-10T14:30:00.000Z',
        readByParent: true,
        readByPendamping: true,
      },
      {
        id: 'msg-004-4',
        threadId: 'thread-004',
        sender: 'orang_tua',
        body: 'Makasih banyak Kak Sari, itu sangat membantu! Satu lagi pertanyaan — kalau di rumah, Alisha juga sering tiba-tiba marah kalau ada suara TV yang keras. Apa ini masih berhubungan dengan yang tadi? Dan bagaimana kami bisa merespons saat dia mulai marah?',
        createdAt: '2026-07-11T20:05:00.000Z',
        readByParent: true,
        readByPendamping: false,
      },
      {
        id: 'msg-004-5',
        threadId: 'thread-004',
        sender: 'sistem',
        body: 'Cerita Bunda sudah kami terima ya 😊 Kak pendamping akan membalas di hari kerja, paling lambat 1×24 jam.',
        createdAt: '2026-07-11T20:10:00.000Z',
        readByParent: true,
        readByPendamping: true,
      },
    ],
  },
];

export const mockCatatan: CatatanPendamping[] = [
  {
    id: 'cat-001',
    childId: 'child-001',
    authorName: 'Kak Sari',
    body: 'Saat kegiatan makan bersama, Raka terlihat berdiri dari kursi setelah kurang lebih 5 menit dan mulai mengelilingi meja, lalu kembali duduk sendiri setelah beberapa saat. Pola ini konsisten dilaporkan orang tua dalam 3 minggu terakhir.',
    createdAt: '2026-07-12T09:00:00.000Z',
  },
  {
    id: 'cat-002',
    childId: 'child-002',
    authorName: 'Kak Sari',
    body: 'Naura menunjukkan kemajuan dalam keterampilan bantu diri — berhasil memakai sepatu sendiri tanpa diminta hari ini. Ekspresi wajah terlihat puas setelah berhasil. Perlu diobservasi konsistensinya di sesi berikutnya.',
    createdAt: '2026-07-11T16:00:00.000Z',
  },
  {
    id: 'cat-003',
    childId: 'child-004',
    authorName: 'Kak Sari',
    body: 'Alisha merespons dengan menutup telinga di lingkungan dengan suara keras (mal, TV volume tinggi). Orang tua melaporkan respons ini sudah berlangsung beberapa bulan. Perlu koordinasi lebih lanjut dengan Psikolog untuk rekomendasi pendekatan — tidak dijawab mandiri oleh pendamping.',
    createdAt: '2026-07-10T15:00:00.000Z',
  },
];

// Thread default untuk tampilan demo sisi orang tua (thread dengan sejarah percakapan)
// TODO: Ganti dengan thread milik user yang sedang login (query by parentId)
export const mockParentThread = mockThreads[3]; // Thread 4 — Alisha, multi-pesan
