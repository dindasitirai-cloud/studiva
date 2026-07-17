import React, { useMemo, useState } from 'react';
import {
  CalendarDays, User, Baby, CheckCircle2, XCircle, Clock,
  FileText, Star, Save, Video, MapPin, ChevronLeft, ChevronRight, X, CalendarCheck,
} from 'lucide-react';
import { useDashboardTier2, ConsultationBooking } from '../../context/DashboardTier2Context';
import ThumbnailUpload from './ThumbnailUpload';

const STATUS_LABEL: Record<ConsultationBooking['status'], string> = {
  pending: 'Baru', confirmed: 'Dikonfirmasi', completed: 'Selesai', canceled: 'Dibatalkan',
};
const STATUS_STYLE: Record<ConsultationBooking['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-teal-100 text-teal-700',
  completed: 'bg-stv-badge-navy-tint text-stv-navy',
  canceled: 'bg-red-100 text-red-600',
};

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function toLocalISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Manual scheduling, on purpose - the psychologist's real availability can
// only be confirmed by the admin team after coordinating with the parent via
// WhatsApp, so there's no automatic slot-matching here. Picks a calendar
// date plus hour/minute/duration, then confirms the booking with that
// schedule in one step.
function ScheduleModal({ booking, onClose, onSave }: {
  booking: ConsultationBooking;
  onClose: () => void;
  onSave: (date: string, time: string, durationMinutes: number) => void;
}) {
  const initialDate = booking.date ? new Date(booking.date) : new Date();
  const [viewMonth, setViewMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(booking.date ?? '');
  const [hour, setHour] = useState(booking.time ? Number(booking.time.split(':')[0]) : 9);
  const [minute, setMinute] = useState(booking.time ? Number(booking.time.split(':')[1]) : 0);
  const [duration, setDuration] = useState(booking.durationMinutes ?? 60);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function handleSubmit() {
    if (!selectedDate) return;
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onSave(selectedDate, time, duration);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Jadwalkan Konsultasi</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-[13px] text-stv-muted">{booking.topic}</p>

        {/* Calendar */}
        <div className="rounded-xl bg-teal-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-stv-navy hover:bg-teal-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-baloo text-[14px] font-bold capitalize text-stv-navy">
              {viewMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </p>
            <button type="button" onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-stv-navy hover:bg-teal-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_LABELS.map(w => <div key={w} className="text-[10px] font-bold text-stv-muted-2">{w}</div>)}
            {cells.map((day, idx) => {
              if (day === null) return <div key={idx} />;
              const cellDate = new Date(year, month, day);
              const iso = toLocalISODate(cellDate);
              const isPast = cellDate < today;
              const isSelected = iso === selectedDate;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isPast}
                  onClick={() => setSelectedDate(iso)}
                  className={`flex h-8 items-center justify-center rounded-lg text-[12px] font-semibold transition ${
                    isSelected ? 'bg-teal-600 text-white' : isPast ? 'text-stv-muted-2/50' : 'text-stv-navy hover:bg-teal-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time + duration */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Jam</label>
            <select value={hour} onChange={e => setHour(Number(e.target.value))} className="w-full rounded-xl border border-stv-border px-2 py-2 text-[13px] focus:border-teal-400 focus:outline-none">
              {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Menit</label>
            <select value={minute} onChange={e => setMinute(Number(e.target.value))} className="w-full rounded-xl border border-stv-border px-2 py-2 text-[13px] focus:border-teal-400 focus:outline-none">
              {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Durasi (menit)</label>
            <input
              type="number"
              min={15}
              step={15}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full rounded-xl border border-stv-border px-2 py-2 text-[13px] focus:border-teal-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedDate}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-teal-600 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
        >
          <CalendarCheck className="h-4 w-4" />
          Konfirmasi Jadwal
        </button>
      </div>
    </div>
  );
}

const TYPE_LABEL: Record<ConsultationBooking['type'], string> = { online: 'Online', offline: 'Offline' };

function BookingDetailModal({ booking, childName, onClose }: {
  booking: ConsultationBooking;
  childName?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Detail Booking</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        <span className={`mt-2 inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[booking.status]}`}>
          {STATUS_LABEL[booking.status]}
        </span>

        <p className="mt-3 font-baloo text-[16px] font-bold text-stv-navy">{booking.topic}</p>

        <div className="mt-4 flex flex-col gap-2.5 text-[13px]">
          <p className="flex items-center gap-2 text-stv-body">
            <User className="h-4 w-4 shrink-0 text-teal-600" />
            Dibooking oleh <strong className="text-stv-navy">{booking.parentName ?? 'Tidak diketahui'}</strong>
          </p>
          {childName && (
            <p className="flex items-center gap-2 text-stv-body">
              <Baby className="h-4 w-4 shrink-0 text-teal-600" />
              Untuk anak <strong className="text-stv-navy">{childName}</strong>
            </p>
          )}
          {booking.date && booking.time && (
            <p className="flex items-center gap-2 text-stv-body">
              <CalendarDays className="h-4 w-4 shrink-0 text-teal-600" />
              {new Date(booking.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          {booking.time && (
            <p className="flex items-center gap-2 text-stv-body">
              <Clock className="h-4 w-4 shrink-0 text-teal-600" />
              {booking.time} WIB{booking.durationMinutes && ` · ${booking.durationMinutes} menit`}
            </p>
          )}
          <p className="flex items-center gap-2 text-stv-body">
            {booking.type === 'online' ? <Video className="h-4 w-4 shrink-0 text-teal-600" /> : <MapPin className="h-4 w-4 shrink-0 text-teal-600" />}
            Konsultasi {TYPE_LABEL[booking.type]}
          </p>
          {booking.notes && (
            <p className="flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-stv-body">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              {booking.notes}
            </p>
          )}
          {booking.resultNotes && (
            <p className="flex items-start gap-2 rounded-xl bg-stv-badge-navy-tint p-3 text-stv-navy">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-stv-navy" />
              Catatan hasil: {booking.resultNotes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Replaces the old "available slots" concept - since the psychologist's real
// availability can't be known automatically, there's nothing to pre-open.
// This instead gives the admin visibility into what's already confirmed, to
// spot conflicts before manually scheduling a new pending booking.
function ConfirmedScheduleCalendar({ bookings, onSelectBooking, onShowMore }: {
  bookings: ConsultationBooking[];
  onSelectBooking: (booking: ConsultationBooking) => void;
  onShowMore: (date: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  const byDate = useMemo(() => {
    const map = new Map<string, ConsultationBooking[]>();
    bookings.forEach(b => {
      if (b.status !== 'confirmed' || !b.date) return;
      const key = b.date.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), b]);
    });
    return map;
  }, [bookings]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <CalendarCheck className="h-4 w-4 text-teal-600" />
          Jadwal Terkonfirmasi
        </h3>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-stv-navy hover:bg-teal-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="font-baloo text-[14px] font-bold capitalize text-stv-navy">{viewMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
          <button type="button" onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-stv-navy hover:bg-teal-100">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map(w => <div key={w} className="text-center text-[11px] font-bold text-stv-muted-2">{w}</div>)}
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayBookings = byDate.get(iso) ?? [];
          return (
            <div
              key={idx}
              className={`flex min-h-[80px] flex-col items-start gap-1 rounded-lg p-1.5 text-left sm:min-h-[100px] ${
                dayBookings.length > 0 ? 'bg-teal-50' : 'bg-slate-50/60'
              }`}
            >
              <span className="text-[11px] font-bold text-stv-navy">{day}</span>
              {dayBookings.slice(0, 2).map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBooking(b)}
                  title="Klik untuk lihat detail"
                  className="w-full truncate rounded bg-teal-600 px-1 py-0.5 text-left text-[10px] font-semibold text-white transition hover:bg-teal-700"
                >
                  {b.time} {b.topic}
                </button>
              ))}
              {dayBookings.length > 2 && (
                <button
                  type="button"
                  onClick={() => onShowMore(iso)}
                  className="text-[10px] font-semibold text-teal-700 underline hover:text-teal-800"
                >
                  +{dayBookings.length - 2} lainnya
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultNotesForm({ booking, onSave, onCancel }: { booking: ConsultationBooking; onSave: (notes: string) => void; onCancel: () => void }) {
  const [notes, setNotes] = useState(booking.resultNotes ?? '');
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-stv-badge-navy-tint p-3">
      <label className="text-[11px] font-semibold text-stv-navy">Catatan Hasil Konsultasi</label>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-stv-border px-2.5 py-1.5 text-[13px]"
      />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave(notes)} className="rounded-lg bg-stv-navy px-3 py-1.5 text-[12px] font-semibold text-white">Simpan</button>
        <button type="button" onClick={onCancel} className="rounded-lg bg-white px-3 py-1.5 text-[12px] font-semibold text-stv-muted">Batal</button>
      </div>
    </div>
  );
}

export default function KonsultasiAdmin() {
  const {
    bookings, updateBookingStatus, updateBooking, confirmBookingSchedule, children,
    psychologist, updatePsychologistProfile,
  } = useDashboardTier2();

  const [statusFilter, setStatusFilter] = useState<'semua' | ConsultationBooking['status']>('semua');
  const [schedulingBooking, setSchedulingBooking] = useState<ConsultationBooking | null>(null);
  const [detailBooking, setDetailBooking] = useState<ConsultationBooking | null>(null);
  const [notesId, setNotesId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState(psychologist);
  const [profileSaved, setProfileSaved] = useState(false);

  const filteredBookings = bookings.filter(b => statusFilter === 'semua' || b.status === statusFilter);
  const selectedDayBookings = selectedDay ? bookings.filter(b => b.status === 'confirmed' && b.date?.slice(0, 10) === selectedDay) : [];

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updatePsychologistProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Konsultasi</h2>
        <p className="text-[14px] text-stv-muted">Jadwal konsultasi ditentukan manual oleh admin setelah koordinasi via WhatsApp - tersambung ke dashboard Tier 1 & Tier 2.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Jadwal Terkonfirmasi */}
        <div className="flex flex-col gap-3">
          <ConfirmedScheduleCalendar bookings={bookings} onSelectBooking={setDetailBooking} onShowMore={setSelectedDay} />

          {selectedDay && (
            <div className="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-bold text-stv-navy">
                  {new Date(selectedDay).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <button type="button" onClick={() => setSelectedDay(null)} className="text-stv-muted hover:text-stv-navy">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {selectedDayBookings.length === 0 ? (
                <p className="text-[12px] text-stv-muted">Tidak ada jadwal terkonfirmasi pada tanggal ini.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedDayBookings.map(b => {
                    const child = children.find(c => c.id === b.childId);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setDetailBooking(b)}
                        className="rounded-xl bg-teal-50 p-3 text-left text-[12px] transition hover:bg-teal-100"
                      >
                        <p className="font-semibold text-stv-navy">{b.time} WIB {b.durationMinutes && `(${b.durationMinutes} menit)`}</p>
                        <p className="mt-0.5 text-stv-body">{b.topic}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-stv-muted">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{b.parentName ?? 'Tidak diketahui'}</span>
                          {child && <span className="flex items-center gap-1"><Baby className="h-3 w-3" />{child.name}</span>}
                          <span className="flex items-center gap-1">
                            {b.type === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                            {TYPE_LABEL[b.type]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profil Psikolog */}
        <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
            <Star className="h-4 w-4 text-teal-600" />
            Profil Psikolog
          </h3>
          <form onSubmit={handleSaveProfile} className="mt-3 flex flex-col gap-3">
            <ThumbnailUpload value={profileForm.photoUrl} onChange={url => setProfileForm(f => ({ ...f, photoUrl: url }))} label="Foto" />
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-stv-navy">Nama</label>
              <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl border border-stv-border px-3.5 py-2 text-[14px]" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-stv-navy">Spesialisasi</label>
              <input value={profileForm.specialization} onChange={e => setProfileForm(f => ({ ...f, specialization: e.target.value }))} className="w-full rounded-xl border border-stv-border px-3.5 py-2 text-[14px]" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-stv-navy">Bio Singkat</label>
              <textarea value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} rows={2} className="w-full resize-none rounded-xl border border-stv-border px-3.5 py-2 text-[14px]" />
            </div>
            {profileSaved && <p className="text-[12px] text-stv-green">Profil tersimpan.</p>}
            <button type="submit" className="flex w-fit items-center gap-1.5 self-end rounded-full bg-teal-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-teal-600">
              <Save className="h-3.5 w-3.5" />
              Simpan Profil
            </button>
          </form>
        </div>
      </div>

      {/* Daftar Booking */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Booking Masuk</h3>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'semua' | ConsultationBooking['status'])}
            className="rounded-full border border-stv-border bg-white px-4 py-2 text-[13px] focus:border-teal-400 focus:outline-none"
          >
            <option value="semua">Semua Status</option>
            <option value="pending">Baru</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="completed">Selesai</option>
            <option value="canceled">Dibatalkan</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-teal-200 py-14 text-center">
            <CalendarDays className="h-10 w-10 text-teal-300" strokeWidth={1.5} />
            <p className="mt-3 font-semibold text-stv-navy">Belum ada booking</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredBookings.map(b => {
              const child = children.find(c => c.id === b.childId);
              return (
                <div key={b.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                    <span className="flex items-center gap-1 text-[12px] text-stv-muted">
                      {b.type === 'online' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                      {b.type === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  <div>
                    <p className="font-baloo text-[15px] font-bold text-stv-navy">{b.topic}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-stv-muted">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{b.parentName ?? 'Tidak diketahui'}</span>
                      {child && <span className="flex items-center gap-1"><Baby className="h-3 w-3" />{child.name}</span>}
                      {b.date && b.time ? (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(b.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {b.time} WIB
                          {b.durationMinutes && ` (${b.durationMinutes} menit)`}
                        </span>
                      ) : (
                        <span className="font-semibold text-amber-600">Belum dijadwalkan - diskusikan via WhatsApp lalu atur jadwal manual</span>
                      )}
                    </div>
                    {b.notes && <p className="mt-1.5 flex items-start gap-1 text-[12px] text-stv-body"><FileText className="mt-0.5 h-3 w-3 shrink-0" />{b.notes}</p>}
                    {b.resultNotes && <p className="mt-1.5 rounded-lg bg-stv-badge-navy-tint px-2.5 py-1.5 text-[12px] text-stv-navy">Catatan hasil: {b.resultNotes}</p>}
                  </div>

                  {notesId === b.id && (
                    <ResultNotesForm
                      booking={b}
                      onSave={notes => { updateBooking(b.id, { resultNotes: notes }); setNotesId(null); }}
                      onCancel={() => setNotesId(null)}
                    />
                  )}

                  <div className="flex flex-wrap items-center gap-2 border-t border-stv-border pt-3">
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <button type="button" onClick={() => setSchedulingBooking(b)} className="flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1.5 text-[12px] font-semibold text-teal-700 hover:opacity-80">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        {b.date ? 'Ubah Jadwal' : 'Jadwalkan'}
                      </button>
                    )}
                    {b.status === 'confirmed' && (
                      <button type="button" onClick={() => updateBookingStatus(b.id, 'completed')} className="flex items-center gap-1.5 rounded-full bg-stv-badge-navy-tint px-3 py-1.5 text-[12px] font-semibold text-stv-navy hover:opacity-80">
                        <CheckCircle2 className="h-3.5 w-3.5" />Tandai Selesai
                      </button>
                    )}
                    {(b.status === 'confirmed' || b.status === 'completed') && (
                      <button type="button" onClick={() => setNotesId(b.id)} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:opacity-80">
                        <FileText className="h-3.5 w-3.5" />Catatan Hasil
                      </button>
                    )}
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <button type="button" onClick={() => updateBookingStatus(b.id, 'canceled')} className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:opacity-80">
                        <XCircle className="h-3.5 w-3.5" />Batalkan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {schedulingBooking && (
        <ScheduleModal
          booking={schedulingBooking}
          onClose={() => setSchedulingBooking(null)}
          onSave={(date, time, durationMinutes) => {
            confirmBookingSchedule(schedulingBooking.id, date, time, durationMinutes);
            setSchedulingBooking(null);
          }}
        />
      )}

      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          childName={children.find(c => c.id === detailBooking.childId)?.name}
          onClose={() => setDetailBooking(null)}
        />
      )}
    </div>
  );
}
