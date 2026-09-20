export type Cuaca = 'cerah' | 'berawan' | 'mendung' | 'hujan' | 'badai';

export interface SaranItem {
  id: string;
  jenis: 'ajak_main' | 'wawasan_tumbuh';
  judul: string;
  ringkasan: string;
  domain: string;
  nilai: string;
  durasi: string;
  manfaat: string;
}

export interface Kebiasaan {
  id: string;
  judul: string;
  waktu: string;
  domain: string;
  tercatat: boolean;
}

export interface WajarItem {
  id: string;
  pertanyaan: string;
  wajar: string;
  kapanBicara: string;
}

export interface Bacaan {
  id: string;
  judul: string;
  kutipan?: string;
  estimasiBaca: string;
}
