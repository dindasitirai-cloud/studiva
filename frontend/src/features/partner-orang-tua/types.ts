export type MessageSender = 'orang_tua' | 'pendamping' | 'sistem';

export interface PartnerMessage {
  id: string;
  threadId: string;
  sender: MessageSender;
  /** Nama pendamping untuk sender 'pendamping', mis. "Kak Sari" */
  senderName?: string;
  body: string;
  createdAt: string; // ISO string
  readByParent: boolean;
  readByPendamping: boolean;
}

export type ThreadStatus = 'menunggu_balasan' | 'dibalas' | 'selesai';

// TODO: PartnerThread akan berelasi ke entity `child` yang sudah ada di
// sistem (tabel children / profil anak) — childId merujuk ke entitas tersebut.
export interface PartnerThread {
  id: string;
  childId: string;
  childName: string;
  parentName: string;
  status: ThreadStatus;
  lastMessageAt: string; // ISO string
  messages: PartnerMessage[];
}

// TODO: Fase 2 — CatatanPendamping akan tampil sebagai layer tambahan di
// Jurnal Perkembangan dan ikut dalam ekspor Rekam Tumbuh Kembang PDF.
export interface CatatanPendamping {
  id: string;
  childId: string;
  authorName: string;
  /** Observasi perilaku terstruktur — BUKAN diagnosa */
  body: string;
  createdAt: string; // ISO string
}
