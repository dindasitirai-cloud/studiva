import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Child, Tier } from '../types';
import Modal from './Modal';

interface OnboardingModalProps {
  tier: Tier;
  onClose: () => void;
}

interface OnboardingStep {
  title: string;
  content: React.ReactNode;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  hideDefaultNext?: boolean;
}

const QUIZ_QUESTIONS = [
  {
    question: 'Saat belajar hal baru, anak Anda lebih suka...',
    options: [
      { label: 'Melihat gambar atau diagram', style: 'Visual' },
      { label: 'Mendengarkan penjelasan atau cerita', style: 'Auditori' },
      { label: 'Langsung mencoba dan bergerak', style: 'Kinestetik' },
    ],
  },
  {
    question: 'Saat duduk lama, anak Anda biasanya...',
    options: [
      { label: 'Tetap fokus jika ada hal menarik dilihat', style: 'Visual' },
      { label: 'Tetap fokus jika ada suara/musik', style: 'Auditori' },
      { label: 'Sulit duduk diam, ingin bergerak', style: 'Kinestetik' },
    ],
  },
  {
    question: 'Anak Anda paling mudah mengingat sesuatu dengan...',
    options: [
      { label: 'Warna dan bentuk', style: 'Visual' },
      { label: 'Lagu atau pengulangan verbal', style: 'Auditori' },
      { label: 'Mempraktikkannya langsung', style: 'Kinestetik' },
    ],
  },
];

export default function OnboardingModal({ tier, onClose }: OnboardingModalProps) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [child, setChild] = useState<Child | null>(null);

  const [emergencyContact, setEmergencyContact] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<string | null>(null);
  const [savingStyle, setSavingStyle] = useState(false);

  useEffect(() => {
    api
      .get('/children')
      .then(({ data }) => setChild(data.children[0] ?? null))
      .catch(() => setChild(null));
  }, []);

  async function saveEmergencyContact() {
    if (!child || !emergencyContact.trim()) return;
    setSavingContact(true);
    try {
      await api.put(`/children/${child.id}`, {
        name: child.name,
        age: child.age,
        learningStyle: child.learning_style,
        emergencyContact,
      });
    } finally {
      setSavingContact(false);
      setStepIndex((i) => i + 1);
    }
  }

  function answerQuiz(questionIndex: number, style: string) {
    const next = [...quizAnswers];
    next[questionIndex] = style;
    setQuizAnswers(next);
    if (next.filter(Boolean).length === QUIZ_QUESTIONS.length) {
      const counts: Record<string, number> = {};
      next.forEach((s) => (counts[s] = (counts[s] ?? 0) + 1));
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setQuizResult(`${winner} learner`);
    }
  }

  async function saveLearningStyle() {
    if (!child || !quizResult) return;
    setSavingStyle(true);
    try {
      await api.put(`/children/${child.id}`, {
        name: child.name,
        age: child.age,
        learningStyle: quizResult,
      });
    } finally {
      setSavingStyle(false);
      setStepIndex((i) => i + 1);
    }
  }

  const tier1Steps: OnboardingStep[] = [
    {
      title: 'Welcome to Studiva Sekolah',
      content: (
        <p className="text-textdark">
          Selamat bergabung di Studiva Sekolah! Dashboard Anda akan menampilkan update harian dari
          guru, progres belajar, dan jadwal konsultasi anak Anda.
        </p>
      ),
    },
    {
      title: 'Meet your teacher',
      content: child?.assigned_teacher_name ? (
        <p className="text-textdark">
          Guru pendamping {child.name} adalah <strong>{child.assigned_teacher_name}</strong>. Anda
          akan menerima update harian dari beliau melalui dashboard.
        </p>
      ) : (
        <p className="text-textdark">
          Guru pendamping akan ditugaskan oleh tim kami dalam waktu dekat. Anda akan melihat
          namanya di dashboard begitu penugasan selesai.
        </p>
      ),
    },
    {
      title: 'See first week activities',
      content: (
        <ul className="list-disc space-y-1 pl-5 text-textdark">
          <li>
            <strong>Academics</strong> — aktivitas belajar terstruktur sesuai gaya belajar anak
          </li>
          <li>
            <strong>Behavior</strong> — observasi dan dukungan regulasi emosi
          </li>
          <li>
            <strong>Therapy</strong> — sesi terapi (speech/OT/behavioral) sesuai kebutuhan
          </li>
          <li>
            <strong>Social</strong> — interaksi dan permainan kelompok dengan teman sebaya
          </li>
        </ul>
      ),
    },
    {
      title: 'Setup emergency contact',
      content: (
        <div>
          <p className="text-textdark">
            Tambahkan kontak darurat yang dapat dihubungi sekolah jika diperlukan.
          </p>
          <input
            type="text"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Nama & nomor telepon kontak darurat"
            className="mt-3 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
          />
        </div>
      ),
      onNext: saveEmergencyContact,
      nextDisabled: !emergencyContact.trim() || savingContact,
      nextLabel: savingContact ? 'Menyimpan...' : 'Simpan & Lanjut',
    },
  ];

  const tier2Steps: OnboardingStep[] = [
    {
      title: 'Welcome to Studiva Digital',
      content: (
        <p className="text-textdark">
          Selamat bergabung di Studiva Digital! Akses ribuan panduan, ikuti kursus self-paced, dan
          konsultasi dengan psikolog kapan saja.
        </p>
      ),
    },
    {
      title: 'Complete child profile',
      content: (
        <p className="text-textdark">
          Lengkapi gaya belajar anak Anda di langkah berikutnya melalui kuis singkat, atau
          perbarui kapan saja dari halaman dashboard.
        </p>
      ),
    },
    {
      title: 'Take learning style quiz',
      content: (
        <div className="space-y-4">
          {QUIZ_QUESTIONS.map((q, qIndex) => (
            <div key={q.question}>
              <p className="font-medium text-textdark">{q.question}</p>
              <div className="mt-2 flex flex-col gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => answerQuiz(qIndex, opt.style)}
                    className={`min-h-[48px] rounded-md border px-4 py-2 text-left transition ${
                      quizAnswers[qIndex] === opt.style
                        ? 'border-gold bg-gold/10'
                        : 'border-bordergray hover:border-gold'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {quizResult && (
            <div className="rounded-md bg-success/10 p-4">
              <p className="text-success">
                Hasil: anak Anda kemungkinan seorang <strong>{quizResult}</strong>.
              </p>
              <button
                onClick={saveLearningStyle}
                disabled={savingStyle}
                className="mt-3 min-h-[48px] rounded-md bg-gold px-4 py-2 font-semibold text-navy transition hover:bg-gold/90 disabled:opacity-60"
              >
                {savingStyle ? 'Menyimpan...' : 'Simpan ke Profil & Lanjut'}
              </button>
            </div>
          )}
        </div>
      ),
      hideDefaultNext: true,
    },
    {
      title: 'Explore resources',
      content: (
        <div>
          <p className="text-textdark">
            Jelajahi resource library kami untuk panduan parenting berbasis riset, checklist, dan
            video.
          </p>
          <button
            onClick={() => {
              onClose();
              navigate('/resources');
            }}
            className="mt-3 min-h-[48px] rounded-md border border-bordergray px-4 py-2 font-semibold text-textdark transition hover:bg-background"
          >
            Buka Resources
          </button>
        </div>
      ),
    },
    {
      title: 'Book your first consultation',
      content: (
        <div>
          <p className="text-textdark">
            Studiva Digital belum memiliki kursus/forum berjalan saat ini — namun Anda dapat
            langsung konsultasi 1-on-1 dengan psikolog kami.
          </p>
          <button
            onClick={() => {
              onClose();
              navigate('/consultation');
            }}
            className="mt-3 min-h-[48px] rounded-md bg-gold px-4 py-2 font-semibold text-navy transition hover:bg-gold/90"
          >
            Book Consultation
          </button>
        </div>
      ),
    },
  ];

  const steps = tier === 'tier1' ? tier1Steps : tier2Steps;
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <Modal title={step.title} onClose={onClose}>
      <div className="min-h-[160px]">{step.content}</div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-textlight">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="text-sm text-textlight hover:underline">
            Skip
          </button>
          {!step.hideDefaultNext && (
            <button
              onClick={() => {
                if (step.onNext) {
                  step.onNext();
                } else if (isLastStep) {
                  onClose();
                } else {
                  setStepIndex((i) => i + 1);
                }
              }}
              disabled={step.nextDisabled}
              className="min-h-[48px] rounded-md bg-navy px-6 py-2 font-semibold text-white transition hover:bg-navy/90 disabled:opacity-60"
            >
              {step.nextLabel ?? (isLastStep ? 'Selesai' : 'Lanjut')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
