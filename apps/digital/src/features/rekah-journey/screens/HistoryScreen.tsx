// Rekah Journey — History (S10). Phase 10E-6: READ-ONLY, derived from the real append-only Journey
// event stream (via the Application Service). No fabricated entries, no progress %, no gamification.
// Honest empty state when there are no events yet (e.g. a fresh session before any action).
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../useJourney';
import { JourneyShell, Card, EmptyState } from '../ui/brand';

// Map a stored event to calm Rekah-native copy. Detail is parsed from the immutable payload only.
function describe(kind: string, payload: any): { label: string; when: string } | null {
  const when = payload?.occurredAt ?? payload?.createdAt ?? '';
  switch (kind) {
    case 'TRANSITION': {
      const t = payload?.trigger;
      const map: Record<string, string> = {
        FOUNDATION_SET: 'Memulai hari', OBSERVED: 'Menimbang fokus', FOCUS_SELECTED: 'Memilih fokus',
        PREPARED: 'Bersiap', ACTED: 'Menjalani langkah kecil', SKIP: 'Menunda langkah',
        REFLECTED: 'Mencatat refleksi', PAUSE: 'Menjeda', RESUME: 'Melanjutkan',
      };
      return { label: map[t] ?? 'Melangkah', when };
    }
    case 'PARENT_ACTION': {
      const a = payload?.actionType;
      const map: Record<string, string> = { ACCEPT: 'Menyetujui fokus', REJECT: 'Menunda fokus', SKIP: 'Melewati', PAUSE: 'Menjeda', RESUME: 'Melanjutkan', CHANGE_FOCUS: 'Mengganti fokus' };
      return { label: map[a] ?? 'Pilihan orang tua', when };
    }
    case 'EXPOSURE': return { label: 'Melihat satu ajakan', when };
    case 'ADAPTATION': {
      const o = payload?.outcome;
      const map: Record<string, string> = { CONTINUE: 'Melanjutkan arah', REPEAT: 'Mengulang dengan lembut', SIMPLIFY: 'Menyederhanakan', CHANGE_APPROACH: 'Mengganti cara', CHANGE_FOCUS: 'Mengganti fokus', EXIT: 'Beristirahat', PAUSE: 'Menjeda' };
      return { label: map[o] ?? 'Menyesuaikan langkah', when };
    }
    default: return null;
  }
}

export default function HistoryScreen() {
  const { childName, listEvents } = useJourney();
  const nav = useNavigate();
  const items = useMemo(() => {
    const raw = (listEvents?.() ?? []) as ReadonlyArray<{ kind: string; occurredAt: string; payloadJson: string }>;
    return raw.map((e) => {
      let payload: any = {};
      try { payload = JSON.parse(e.payloadJson); } catch { payload = {}; }
      const d = describe(e.kind, { ...payload, occurredAt: payload?.occurredAt ?? e.occurredAt });
      return d ? { ...d, when: d.when || e.occurredAt } : null;
    }).filter(Boolean) as Array<{ label: string; when: string }>;
  }, [listEvents]);

  const fmt = (iso: string) => { try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); } catch { return ''; } };

  return (
    <JourneyShell child={childName} eyebrow="riwayat perjalanan" botanical="leaf">
      {items.length === 0 ? (
        <EmptyState botanical="leaf" title="Belum ada jejak" body="Setiap langkah kecil akan tersimpan aman di sini — hanya untuk dilihat, tidak pernah dinilai." cta="Kembali ke hari ini" onCta={() => nav('/dashboard/tier2/journey')} />
      ) : (
        <>
          <Card className="mt-3">
            <ul className="divide-y divide-rose-soft/50">
              {items.map((it, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <span className="font-nunito text-pekat">{it.label}</span>
                  <span className="font-nunito text-xs text-pekat/50">{fmt(it.when)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <p className="mt-3 font-nunito text-xs text-pekat/50 text-center">Hanya untuk dilihat — tidak pernah dinilai.</p>
        </>
      )}
    </JourneyShell>
  );
}
