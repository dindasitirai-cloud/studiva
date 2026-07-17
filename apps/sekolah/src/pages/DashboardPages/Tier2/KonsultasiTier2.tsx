import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, CalendarDays, Clock, Video, MapPin, MessageSquare, CheckCircle2,
  XCircle, ShieldCheck, Trash2, User, Hourglass,
} from 'lucide-react';
import { useDashboardTier2, ConsultationBooking } from '../../../context/DashboardTier2Context';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { useAuth } from '../../../context/AuthContext';

// Same number/format used by the Tier-1 consultation flow
// (backend/src/lib/whatsapp.ts) so both paths feel like one consistent
// system to the psychologist on the receiving end.
const PSYCHOLOGIST_WHATSAPP_NUMBER = '6281211470407';

function buildWhatsAppLink(childName: string | undefined, type: 'online' | 'offline', topic: string, notes: string) {
  const childPart = childName ? `anak saya ${childName}` : 'anak saya';
  let message = `Saya ingin konsultasi terkait ${childPart} secara ${type}, kapan jadwal yang available? Topik: ${topic}.`;
  if (notes.trim()) {
    message += ` Catatan tambahan: ${notes.trim()}.`;
  }
  return `https://wa.me/${PSYCHOLOGIST_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const STATUS_LABEL: Record<ConsultationBooking['status'], string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Terkonfirmasi',
  completed: 'Selesai',
  canceled: 'Dibatalkan',
};

const STATUS_STYLE: Record<ConsultationBooking['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-stv-green-tint text-stv-green',
  completed: 'bg-stv-badge-navy-tint text-stv-navy',
  canceled: 'bg-red-100 text-red-600',
};

function formatDateID(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function KonsultasiTier2() {
  const basePath = useDashboardBasePath();
  const { user } = useAuth();
  const { children, bookings, addBooking, updateBookingStatus, psychologist } = useDashboardTier2();

  const [childId, setChildId] = useState('');
  const [type, setType] = useState<'online' | 'offline' | ''>('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);

  function resetForm() {
    setChildId('');
    setType('');
    setTopic('');
    setNotes('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (children.length > 0 && !childId) {
      setError('Pilih anak yang akan dikonsultasikan terlebih dahulu.');
      return;
    }
    if (!type) {
      setError('Pilih jenis konsultasi (online/offline).');
      return;
    }
    if (!topic.trim()) {
      setError('Topik konsultasi wajib diisi.');
      return;
    }
    setError('');
    const id = addBooking({
      type,
      topic: topic.trim(),
      parentName: user?.name ?? 'Orang Tua',
      childId: childId || undefined,
      notes: notes.trim() || undefined,
      status: 'pending',
      psychologistName: psychologist.name,
    });
    setSuccessId(id);

    const childName = children.find(c => c.id === childId)?.name;
    window.open(buildWhatsAppLink(childName, type, topic.trim(), notes), '_blank', 'noopener,noreferrer');

    resetForm();
  }

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Konsultasi</h2>
        <p className="text-[14px] text-stv-muted">Pesan sesi konsultasi 1-on-1 dengan psikolog untuk membahas perkembangan anak Anda.</p>
      </div>

      {/* Psychologist banner */}
      <div
        className="flex flex-col items-start gap-4 overflow-hidden rounded-2xl p-6 sm:flex-row sm:items-center"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' }}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Star className="h-7 w-7 text-white" fill="currentColor" strokeWidth={0} />
        </div>
        <div>
          <p className="font-baloo text-[17px] font-bold text-white">{psychologist.name}</p>
          <p className="mt-0.5 text-[13px] text-white/90">{psychologist.bio}</p>
        </div>
      </div>

      {/* Booking form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Ajukan Booking Baru</h3>

        {children.length === 0 ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-stv-body">
            Anda belum menambahkan profil anak. Tambahkan dulu di{' '}
            <Link to={`${basePath}/profil-anak`} className="font-semibold text-amber-600 hover:underline">Profil Anak</Link>{' '}
            agar sesi konsultasi bisa dikaitkan dengan anak yang tepat.
          </p>
        ) : (
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Untuk anak:</label>
            <div className="flex flex-wrap gap-2">
              {children.map(child => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setChildId(child.id)}
                  aria-pressed={childId === child.id}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    childId === child.id
                      ? 'bg-amber-500 text-white'
                      : 'border border-amber-300 bg-white text-stv-body hover:border-amber-500'
                  }`}
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                    childId === child.id ? 'bg-white/30 text-white' : 'bg-amber-200 text-amber-700'
                  }`}>
                    {child.name.charAt(0).toUpperCase()}
                  </span>
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Jenis konsultasi:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('online')}
              aria-pressed={type === 'online'}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left text-[13px] font-semibold transition ${
                type === 'online' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-amber-100 text-stv-body hover:border-amber-300'
              }`}
            >
              <Video className="h-4 w-4 shrink-0" />
              Online (Video Call)
            </button>
            <button
              type="button"
              onClick={() => setType('offline')}
              aria-pressed={type === 'offline'}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left text-[13px] font-semibold transition ${
                type === 'offline' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-amber-100 text-stv-body hover:border-amber-300'
              }`}
            >
              <MapPin className="h-4 w-4 shrink-0" />
              Offline (Tatap Muka)
            </button>
          </div>
        </div>

        <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] text-stv-body">
          <Hourglass className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Tanggal dan jam sesi akan ditentukan oleh Tim Studiva setelah menyesuaikan dengan jadwal psikolog yang tersedia.
        </p>

        <div>
          <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Topik konsultasi</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="mis. Kesulitan fokus saat belajar di rumah"
            className="w-full rounded-xl border border-amber-200 px-4 py-2.5 text-[15px] focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Catatan tambahan (opsional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Ceritakan lebih detail agar psikolog bisa mempersiapkan sesi..."
            className="w-full resize-none rounded-xl border border-amber-200 px-4 py-2.5 text-[15px] focus:border-amber-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}
        {successId && (
          <p className="flex items-center gap-1.5 rounded-xl bg-stv-green-tint px-4 py-3 text-[13px] text-stv-green">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Booking berhasil diajukan! Anda akan diarahkan ke WhatsApp untuk konfirmasi langsung dengan Tim Studiva. Status booking bisa dipantau di daftar riwayat di bawah.
          </p>
        )}

        <button
          type="submit"
          className="self-end rounded-full bg-amber-500 px-6 py-2.5 font-baloo text-[14px] font-bold text-white transition hover:bg-amber-600"
        >
          Ajukan Booking
        </button>
      </form>

      {/* Booking history */}
      <div>
        <h3 className="mb-3 font-baloo text-[17px] font-bold text-stv-navy">Riwayat & Jadwal Konsultasi</h3>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-14 text-center">
            <CalendarDays className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
            <p className="mt-3 font-semibold text-stv-navy">Belum ada booking konsultasi</p>
            <p className="mt-1 text-[13px] text-stv-muted">Ajukan booking pertama Anda lewat form di atas.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map(booking => {
              const child = children.find(c => c.id === booking.childId);
              return (
                <div key={booking.id} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[booking.status]}`}>
                      {booking.status === 'confirmed' && <ShieldCheck className="h-3 w-3" />}
                      {booking.status === 'canceled' && <XCircle className="h-3 w-3" />}
                      {STATUS_LABEL[booking.status]}
                    </span>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(booking.id, 'canceled')}
                        className="flex items-center gap-1 text-[12px] font-semibold text-red-500 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Batalkan
                      </button>
                    )}
                  </div>

                  <p className="font-baloo text-[16px] font-bold text-stv-navy">{booking.topic}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[13px] text-stv-muted">
                    {child && (
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {child.name}
                      </span>
                    )}
                    {booking.date && booking.time ? (
                      <>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDateID(booking.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {booking.time} WIB{booking.durationMinutes && ` (${booking.durationMinutes} menit)`}
                        </span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Hourglass className="h-3.5 w-3.5" />
                        Menunggu jadwal dari Tim Studiva
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      {booking.type === 'online' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                      {booking.type === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  {booking.notes && (
                    <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] text-stv-body">
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {booking.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
