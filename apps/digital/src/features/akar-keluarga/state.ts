import { useReducer, useEffect } from 'react';
import type { AkarState, AkarAction } from './types';
import { useAuth } from '../../context/AuthContext';
import { getNilaiDitanam, tanamNilai, cabutNilai } from '../../lib/supabase/rekah';

const INITIAL: AkarState = {
  nilai: [],
  visi: '',
  alasan: {},
};

function reducer(state: AkarState, action: AkarAction): AkarState {
  switch (action.type) {
    case 'HIDRAT_NILAI':
      return { ...state, nilai: action.nilai };
    case 'TANAM_NILAI':
      if (state.nilai.includes(action.nilai)) return state;
      return { ...state, nilai: [...state.nilai, action.nilai] };
    case 'CABUT_NILAI': {
      const { [action.nilai]: _, ...sisaAlasan } = state.alasan;
      return {
        ...state,
        nilai: state.nilai.filter(n => n !== action.nilai),
        alasan: sisaAlasan,
      };
    }
    case 'SET_VISI':
      return { ...state, visi: action.visi };
    case 'SET_ALASAN':
      return { ...state, alasan: { ...state.alasan, [action.nilai]: action.teks } };
    default:
      return state;
  }
}

export function useAkarState() {
  return useReducer(reducer, INITIAL);
}

/**
 * Seperti useAkarState tetapi sync dua arah dengan tabel nilai_ditanam di Supabase.
 * Gunakan saat idAnak (UUID dari Supabase) tersedia.
 */
export function useAkarStateSync(idAnak: string | null) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const { supabaseUser } = useAuth();

  // Muat nilai yang sudah ditanam dari Supabase saat mount.
  useEffect(() => {
    if (!supabaseUser || !idAnak) return;
    getNilaiDitanam(idAnak)
      .then(baris => {
        const ids = baris.map(b => b.id_nilai);
        dispatch({ type: 'HIDRAT_NILAI', nilai: ids });
      })
      .catch(() => {});
  }, [idAnak, supabaseUser]);

  // Bungkus dispatch agar setiap TANAM/CABUT langsung disinkron ke Supabase.
  function syncDispatch(action: AkarAction) {
    dispatch(action);
    if (!supabaseUser || !idAnak) return;

    if (action.type === 'TANAM_NILAI') {
      tanamNilai(idAnak, action.nilai).catch(() => {});
    } else if (action.type === 'CABUT_NILAI') {
      cabutNilai(idAnak, action.nilai).catch(() => {});
    }
  }

  return [state, syncDispatch] as const;
}
