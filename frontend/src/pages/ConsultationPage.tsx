import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Child, ConsultationConfig, ConsultationType } from '../types';
import Card from '../components/Card';
import ConsultationTypeCard from '../components/ConsultationTypeCard';
import ConsultationForm from '../components/ConsultationForm';
import FitriProfileCard from '../components/FitriProfileCard';

const benefitCards = [
  {
    title: 'Personalized Guidance',
    description: 'Konsultasi 1-on-1 dengan psikolog berpengalaman',
  },
  {
    title: 'Flexible Schedule',
    description: 'Pilih jadwal sesuai dengan keinginan Anda (online/offline)',
  },
  {
    title: 'Expert Support',
    description: 'Led by Psikolog Fitri Effendy, S.Psi - Founder Studiva',
  },
];

export default function ConsultationPage() {
  const navigate = useNavigate();

  const [children, setChildren] = useState<Child[]>([]);
  const [config, setConfig] = useState<ConsultationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [childId, setChildId] = useState<number | ''>('');
  const [consultationType, setConsultationType] = useState<ConsultationType | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [childrenRes, configRes] = await Promise.all([
          api.get('/children'),
          api.get('/consultations/config'),
        ]);
        setChildren(childrenRes.data.children);
        setConfig(configRes.data);
      } catch {
        setError('Gagal memuat data konsultasi.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!childId || !consultationType) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await api.post('/consultations/request', {
        childId,
        consultationType,
        notes: notes || undefined,
      });
      setSuccessMessage(
        'Terima kasih! Permintaan konsultasi Anda telah dikirim ke Psikolog Fitri Effendy. Beliau akan merespons melalui WhatsApp dalam waktu 24 jam.'
      );
      window.open(data.whatsappLink, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Gagal mengirim permintaan konsultasi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <section className="bg-navy px-4 py-16 text-center text-white md:px-8">
        <div className="text-5xl">📞</div>
        <h1 className="mt-4 text-h1 font-bold">Book Consultation with Psikolog Fitri Effendy, S.Psi</h1>
        <p className="mt-4 text-white/85">
          Dapatkan panduan personal untuk perkembangan anak Anda
        </p>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-[1000px]">
          <FitriProfileCard />
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-center text-h2 font-bold text-navy">Mengapa Konsultasi?</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-3">
            {benefitCards.map((b) => (
              <Card key={b.title}>
                <h3 className="text-h3 font-semibold text-navy">{b.title}</h3>
                <p className="mt-2 text-textdark">{b.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {error && <p className="px-4 text-center text-red-600 md:px-8">{error}</p>}

      {!loading && !error && config && (
        <>
          <section className="bg-background px-4 py-16 md:px-8">
            <div className="mx-auto max-w-[1200px]">
              <h2 className="text-center text-h2 font-bold text-navy">Tipe Konsultasi</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                <ConsultationTypeCard
                  icon="💻"
                  title="Konsultasi Online"
                  description="Video call via Zoom/Google Meet dari mana saja"
                  benefits={[
                    'Fleksibel - tidak perlu datang ke lokasi',
                    'Bisa dilakukan dari rumah',
                    'Hemat waktu perjalanan',
                  ]}
                  duration={config.onlineDuration}
                  price={config.onlinePrice}
                  selected={consultationType === 'online'}
                  onSelect={() => setConsultationType('online')}
                />
                <ConsultationTypeCard
                  icon="🏢"
                  title="Konsultasi Offline"
                  description="Kunjungan langsung ke kantor Studiva di Bukittinggi"
                  benefits={[
                    'Face-to-face interaction dengan psikolog',
                    'Lokasi: Jl. Mandiangin no. 65, Bukittinggi',
                    'Bisa membawa dokumen/portofolio anak',
                  ]}
                  duration={config.offlineDuration}
                  price={config.offlinePrice}
                  selected={consultationType === 'offline'}
                  onSelect={() => setConsultationType('offline')}
                />
              </div>
            </div>
          </section>

          <section className="px-4 py-16 md:px-8">
            <div className="mx-auto max-w-xl">
              <h2 className="text-h2 font-bold text-navy">Booking Form</h2>

              {successMessage ? (
                <div className="mt-6 rounded-md bg-success/10 p-4 text-success">
                  <p>{successMessage}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      to="/consultations/my-bookings"
                      className="min-h-[48px] rounded-md bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90"
                    >
                      Lihat Booking Saya
                    </Link>
                    <button
                      onClick={() => navigate('/dashboard/parent')}
                      className="min-h-[48px] rounded-md border border-bordergray px-6 py-3 font-semibold text-textdark transition hover:bg-background"
                    >
                      Kembali ke Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  {children.length === 0 ? (
                    <p className="text-textlight">
                      Belum ada profil anak yang terhubung dengan akun Anda.
                    </p>
                  ) : (
                    <>
                      {submitError && (
                        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{submitError}</p>
                      )}
                      <ConsultationForm
                        childrenList={children}
                        childId={childId}
                        onChildIdChange={setChildId}
                        consultationType={consultationType}
                        onConsultationTypeChange={setConsultationType}
                        notes={notes}
                        onNotesChange={setNotes}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
