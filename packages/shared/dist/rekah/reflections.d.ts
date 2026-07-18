import type { NilaiId } from './values';
export interface RefleksiEntry {
    id: string;
    moduleId: string;
    tanggal: string;
    responsAnak: 'seru' | 'menantang' | 'belum-tertarik';
    moodCaregiver?: 'lega' | 'biasa' | 'lelah';
    catatan?: string;
    nilaiUtama?: NilaiId;
    simpanKeJurnal?: boolean;
}
export interface RefleksiMusim {
    musimId: string;
    syukurCatatan?: string;
    tanggal: string;
}
//# sourceMappingURL=reflections.d.ts.map