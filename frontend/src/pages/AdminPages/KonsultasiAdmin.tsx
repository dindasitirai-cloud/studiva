import React, { useState } from 'react';
import {
  CalendarPlus, Trash2, CalendarDays, Clock, User, CheckCircle2, XCircle,
  RefreshCw, FileText, Star, Save, Video, MapPin,
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

function RescheduleForm({ booking, onSave, onCancel }: { booking: ConsultationBooking; onSave: (date: string, time: string) => void; onCancel: () => void }) {
  const [date, setDate] = useState(booking.date ?? '');
  const [time, setTime] = useState(booking.time ?? '');
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl bg-teal-50 p-3">
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Tanggal</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-lg border border-stv-border px-2.5 py-1.5 text-[13px]" />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Jam</label>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="rounded-lg border border-stv-border px-2.5 py-1.5 text-[13px]" />
      </div>
      <button type="button" onClick={() => date && time && onSave(date, time)} className="rounded-lg bg-teal-600 px-3 py-1.5 text-[12px] font-semibold text-white">Simpan</button>
      <button type="button" onClick={onCancel} className="rounded-lg bg-white px-3 py-1.5 text-[12px] font-semibold text-stv-muted">Batal</button>
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
    bookings, updateBookingStatus, updateBooking, children,
    slots, addSlot, removeSlot, psychologist, updatePsychologistProfile,
  } = useDashboardTier2();

  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | ConsultationBooking['status']>('semua');
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [notesId, setNotesId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState(psychologist);
  const [profileSaved, setProfileSaved] = useState(false);

  const filteredBookings = bookings.filter(b => statusFilter === 'semua' || b.status === statusFilter);
  const sortedSlots = [...slots].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!slotDate || !slotTime) return;
    addSlot({ date: slotDate, time: slotTime });
    setSlotDate('');
    setSlotTime('');
  }

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
        <p className="text-[14px] text-stv-muted">Kelola slot jadwal, booking masuk, dan profil psikolog yang tersambung ke dashboard Tier 1 & Tier 2.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kelola Slot */}
        <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
            <CalendarPlus className="h-4 w-4 text-teal-600" />
            Slot Jadwal Tersedia
          </h3>

          <form onSubmit={handleAddSlot} className="mt-3 flex flex-wrap items-end gap-2">
            <input type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} required className="rounded-xl border border-stv-border px-3 py-2 text-[13px]" />
            <input type="time" value={slotTime} onChange={e => setSlotTime(e.target.value)} required className="rounded-xl border border-stv-border px-3 py-2 text-[13px]" />
            <button type="submit" className="rounded-xl bg-teal-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-teal-600">Tambah Slot</button>
          </form>

          {sortedSlots.length === 0 ? (
            <p className="mt-4 text-[13px] text-stv-muted">Belum ada slot tersedia.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-1.5">
              {sortedSlots.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-teal-50 px-3.5 py-2">
                  <span className="flex items-center gap-2 text-[13px] text-stv-navy">
                    <CalendarDays className="h-3.5 w-3.5 text-teal-600" />
                    {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    <Clock className="h-3.5 w-3.5 text-teal-600" />
                    {s.time}
                  </span>
                  <button type="button" onClick={() => removeSlot(s.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
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
                      {child && <span className="flex items-center gap-1"><User className="h-3 w-3" />{child.name}</span>}
                      {b.date && b.time ? (
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(b.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {b.time}</span>
                      ) : (
                        <span className="text-amber-600">Belum dijadwalkan</span>
                      )}
                    </div>
                    {b.notes && <p className="mt-1.5 flex items-start gap-1 text-[12px] text-stv-body"><FileText className="mt-0.5 h-3 w-3 shrink-0" />{b.notes}</p>}
                    {b.resultNotes && <p className="mt-1.5 rounded-lg bg-stv-badge-navy-tint px-2.5 py-1.5 text-[12px] text-stv-navy">Catatan hasil: {b.resultNotes}</p>}
                  </div>

                  {reschedulingId === b.id && (
                    <RescheduleForm
                      booking={b}
                      onSave={(date, time) => { updateBooking(b.id, { date, time }); setReschedulingId(null); }}
                      onCancel={() => setReschedulingId(null)}
                    />
                  )}
                  {notesId === b.id && (
                    <ResultNotesForm
                      booking={b}
                      onSave={notes => { updateBooking(b.id, { resultNotes: notes }); setNotesId(null); }}
                      onCancel={() => setNotesId(null)}
                    />
                  )}

                  <div className="flex flex-wrap items-center gap-2 border-t border-stv-border pt-3">
                    {b.status === 'pending' && (
                      <button type="button" onClick={() => updateBookingStatus(b.id, 'confirmed')} className="flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1.5 text-[12px] font-semibold text-teal-700 hover:opacity-80">
                        <CheckCircle2 className="h-3.5 w-3.5" />Konfirmasi
                      </button>
                    )}
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <button type="button" onClick={() => setReschedulingId(b.id)} className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-700 hover:opacity-80">
                        <RefreshCw className="h-3.5 w-3.5" />Jadwalkan Ulang
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
    </div>
  );
}
