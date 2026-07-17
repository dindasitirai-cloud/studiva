import React, { useState } from 'react';
import FitriProfileCard from '../components/FitriProfileCard';

export default function AboutPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <div>
      <section className="bg-navy px-4 py-16 text-center text-white md:px-8">
        <h1 className="text-h1 font-bold">Tentang Studiva</h1>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <h2 className="text-h2 font-bold text-navy">Kisah Kami</h2>
        <p className="mt-4 text-textdark">
          Studiva didirikan oleh Psikolog Fitri Effendy di Bukittinggi, lahir dari pengalaman
          pribadinya mendampingi anak dengan kebutuhan belajar berbeda. Psikolog Fitri menyadari
          bahwa banyak orang tua merasa sendirian dalam perjalanan ini, kurangnya akses ke pendidik
          yang memahami kebutuhan unik anak mereka, serta minimnya kolaborasi antara sekolah dan
          rumah. Dari situ, Studiva lahir sebagai jawaban: sebuah sekolah yang merayakan
          keberagaman cara belajar, sekaligus platform digital yang menjangkau orang tua di
          seluruh Indonesia.
        </p>
      </section>

      <section className="bg-background px-4 py-16 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-h2 font-bold text-navy">Pendekatan Kami</h2>
          <p className="mt-4 text-textdark">
            Kami percaya setiap anak memiliki cara belajar yang unik. Pendekatan inklusif kami
            menggabungkan personalized learning plan, terapi profesional (speech, occupational,
            behavioral), dan komunikasi harian antara guru dan orang tua. Di Tier 2, kami
            memperluas pendekatan ini melalui panduan berbasis riset, kursus self-paced, dan
            komunitas yang saling mendukung, sehingga setiap orang tua di Indonesia dapat
            menerapkan prinsip pendidikan inklusif di rumah.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-h2 font-bold text-navy">Tim Kami</h2>
          <div className="mt-8">
            <FitriProfileCard />
          </div>
          <p className="mt-8 text-textdark">
            Psikolog Fitri didukung oleh tim guru bersertifikat, terapis speech &amp; occupational
            therapy, serta konselor behavioral yang berdedikasi penuh pada perkembangan anak.
          </p>
        </div>
      </section>

      <section id="contact" className="bg-background px-4 py-16 md:px-8">
        <div className="mx-auto max-w-xl">
          <h2 className="text-h2 font-bold text-navy">Kontak</h2>
          {submitted ? (
            <p className="mt-4 rounded-md bg-success/10 p-4 text-success">
              Terima kasih! Pesan Anda telah kami terima dan akan segera kami balas.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <input
                type="text"
                name="name"
                placeholder="Nama"
                value={form.name}
                onChange={handleChange}
                required
                className="min-h-[48px] rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="min-h-[48px] rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
              />
              <textarea
                name="message"
                placeholder="Pesan Anda"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="min-h-[48px] rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90"
              >
                Kirim Pesan
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
