// Rekah Journey — Phase 10D real-data loader (ADDITIVE). Loads EXISTING Rekah signals for the active
// child through the EXISTING repositories and hands them to the pure adapter. No journey decision here;
// it only assembles engine inputs. Empty/failed loads yield empty values (→ honest NO_FOCUS), never a default.
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAnak, useAnakAktif } from '../../context/AnakContext';
import { getNilaiDitanam } from '../../lib/supabase/rekah';
import { getMusimBerjalan } from '../../lib/supabase/rekahMusim';
import {
  toDirectionValues, toFocusChoiceValues, toActiveThreadInput,
} from './adapter/journeyInputAdapter';
import type { FamilyValue, ActiveThreadInput } from '@studiva/shared/journey';

export interface JourneyRealData {
  /** True once the async load has settled (success OR failure) — screens gate their entry advance on this. */
  readonly ready: boolean;
  /** Direction ← active child's planted Nilai Akar (nilai_ditanam). */
  readonly directionValues: FamilyValue[];
  /** The season's chosen focus values (rekah_musim.nilai_fokus) offered as parent choices. */
  readonly focusChoices: FamilyValue[];
  /** Multi-child active-thread input assembled from the EXISTING children list. */
  readonly activeThreadInput: ActiveThreadInput | null;
}

const EMPTY: JourneyRealData = { ready: false, directionValues: [], focusChoices: [], activeThreadInput: null };

export function useJourneyData(): JourneyRealData {
  const { supabaseUser } = useAuth();
  const { daftarAnak } = useAnak();
  const { anak } = useAnakAktif();
  const [state, setState] = useState<JourneyRealData>(EMPTY);
  const childId = anak?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!supabaseUser || !childId) { setState({ ...EMPTY, ready: true }); return; }
    (async () => {
      try {
        const [nilai, musim] = await Promise.all([getNilaiDitanam(childId), getMusimBerjalan(childId)]);
        if (cancelled) return;
        const nowIso = new Date().toISOString();
        const direction = toDirectionValues(nilai);
        // Parent choices = the family's OWN chosen values: season focus (nilai_fokus) ∪ planted (nilai_ditanam).
        // Deduped, canonical only. No invented value — every option is one the parent already chose.
        const choices = [...new Set<FamilyValue>([...toFocusChoiceValues(musim), ...direction])];
        setState({
          ready: true,
          directionValues: direction,
          focusChoices: choices,
          activeThreadInput: toActiveThreadInput({
            familyId: supabaseUser.id,
            familyJourneyId: supabaseUser.id, // UUID valid (dulu `fj-<id>` → ditolak kolom stream_id uuid)
            children: daftarAnak.map((a) => ({ id: a.id, namaAnak: a.namaAnak, tanggalLahir: a.tanggalLahir })),
            activeChildId: childId,
            createdAt: nowIso,
          }),
        });
      } catch {
        if (!cancelled) setState({ ...EMPTY, ready: true }); // failure → honest empty, never a fabricated default
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseUser, childId, daftarAnak]);

  return state;
}
