import type { AgeKey } from './knowledgeCardData';
export type AkarKeluargaKode = 'islam';
export interface IslamicPanel {
    /** Nilai inti yang menjadi akar band ini */
    nilaiInti: string;
    /** Framing sains untuk konteks ini */
    sains: string;
    /** Framing Islam — perspektif pedagogis keislaman */
    islam: string;
    /** Praktik konkret yang bisa dilakukan orang tua */
    praktik: string[];
}
/**
 * Panel Nilai Keislaman per band usia.
 * Satu panel per AgeKey, ditampilkan di semua kartu band tersebut
 * bila akarKeluarga = 'islam' aktif di profil keluarga.
 *
 * DRAFT — belum dirilis. Lihat catatan review di atas file ini.
 */
export declare const ISLAMIC_PANELS: Record<AgeKey, IslamicPanel>;
//# sourceMappingURL=modules-islam.d.ts.map