import { ConsultationType } from '../types';

export function generateWhatsAppLink(childName: string, consultationType: ConsultationType, notes?: string | null): string {
  const number = process.env.PSIKOLOG_WHATSAPP_NUMBER || '6281211470407';

  let message = `Saya ingin konsultasi terkait anak saya ${childName} secara ${consultationType}, kapan jadwal yang available?`;
  if (notes && notes.trim()) {
    message += ` Topik: ${notes.trim()}.`;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
