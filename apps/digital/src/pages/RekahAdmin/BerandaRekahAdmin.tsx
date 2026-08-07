import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { muatSemuaDraf, KontenDraf, LABEL_STATUS, LABEL_JENIS } from '../../lib/supabase/pipeline';

function KartuStat({ label, nilai, Icon, warna }: {
  label: string; nilai: number;
  Icon: React.ElementType; warna: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-rekah/10 bg-white p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${warna}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[24px] font-bold text-pekat">{nilai}</p>
        <p className="text-[13px] text-pekat/50">{label}</p>
      </div>
    </div>
  );
}

export default function BerandaRekahAdmin() {
  const { peranStaf } = useAuth();
  const navigate = useNavigate();
  const [daftar, setDaftar] = useState<KontenDraf[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    muatSemuaDraf()
      .then(setDaftar)
      .catch(console.error)
      .finally(() => setMemuat(false));
  }, []);

  const menunggu  = daftar.filter(d => d.status === 'diajukan').length;
  const disetujui = daftar.filter(d => d.status === 'disetujui').length;
  const ditolak   = daftar.filter(d => d.status === 'ditolak').length;
  const tayang    = daftar.filter(d => d.status === 'tayang').length;

  const terakhir = [...daftar]
    .sort((a, b) => new Date(b.diperbarui_pada).getTime() - new Date(a.diperbarui_pada).getTime())
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-1 font-bricolage text-[26px] font-extrabold text-pekat">
        Dashboard Konten Rekah
      </h1>
      <p className="mb-8 text-[14px] text-pekat/50">
        {peranStaf === 'peninjau_klinis'
          ? 'Tinjau dan setujui konten sebelum tayang ke orang tua.'
          : 'Kelola dan ajukan konten untuk ditinjau Psikolog Fitri.'}
      </p>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KartuStat label="Menunggu Tinjauan" nilai={menunggu}  Icon={Clock}        warna="bg-madu/15 text-madu" />
        <KartuStat label="Disetujui"          nilai={disetujui} Icon={CheckCircle2} warna="bg-daun/15 text-daun" />
        <KartuStat label="Ditolak"            nilai={ditolak}   Icon={XCircle}      warna="bg-rekah/15 text-rekah" />
        <KartuStat label="Tayang"             nilai={tayang}    Icon={ClipboardList} warna="bg-fajar/60 text-pekat/70" />
      </div>

      {/* CTA Fitri */}
      {peranStaf === 'peninjau_klinis' && menunggu > 0 && (
        <div
          className="mb-8 cursor-pointer rounded-2xl border border-madu/30 bg-madu/10 px-6 py-5 transition hover:border-madu/60"
          onClick={() => navigate('/rekah-admin/antrean')}
          role="button"
        >
          <p className="font-bricolage text-[16px] font-bold text-pekat">
            {menunggu} konten menunggu tinjauan Fitri
          </p>
          <p className="mt-1 text-[13px] text-pekat/60">
            Klik untuk membuka antrean dan mulai meninjau.
          </p>
        </div>
      )}

      {/* Aktivitas terakhir */}
      <div>
        <h2 className="mb-4 font-bricolage text-[16px] font-bold text-pekat">Aktivitas Terakhir</h2>
        {memuat ? (
          <p className="text-[14px] text-pekat/40">Memuat...</p>
        ) : terakhir.length === 0 ? (
          <p className="text-[14px] text-pekat/40">Belum ada draf konten.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-rekah/10 bg-white">
            {terakhir.map((d, i) => (
              <div
                key={d.id}
                onClick={() => navigate(`/rekah-admin/diff/${d.id}`)}
                role="button"
                className={`flex cursor-pointer items-center gap-4 px-5 py-4 transition hover:bg-rekah/5 ${
                  i > 0 ? 'border-t border-rekah/8' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[14px] font-semibold text-pekat">{d.judul}</p>
                  <p className="text-[12px] text-pekat/45">
                    {LABEL_JENIS[d.jenis]} · {new Date(d.diperbarui_pada).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                  d.status === 'diajukan'  ? 'bg-madu/20 text-madu' :
                  d.status === 'disetujui' ? 'bg-daun/20 text-daun' :
                  d.status === 'ditolak'   ? 'bg-rekah/20 text-rekah' :
                  d.status === 'tayang'    ? 'bg-rekah/10 text-rekah-tua' :
                  'bg-pekat/10 text-pekat/60'
                }`}>
                  {LABEL_STATUS[d.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
