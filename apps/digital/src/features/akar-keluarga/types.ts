export interface AkarState {
  nilai: string[];
  visi: string;
  /** Alasan opsional per nilai: kenapa nilai ini penting bagi keluarga. TODO: backend. */
  alasan: Record<string, string>;
}

export type AkarAction =
  | { type: 'TANAM_NILAI'; nilai: string }
  | { type: 'CABUT_NILAI'; nilai: string }
  | { type: 'SET_VISI'; visi: string }
  | { type: 'SET_ALASAN'; nilai: string; teks: string }
  | { type: 'HIDRAT_NILAI'; nilai: string[] };
