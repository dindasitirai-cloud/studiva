import type { NilaiId } from './values';
import type { AgeBandId } from './ageBands';
export type ActivityModuleId = string;
export type DurasiMenit = 5 | 10 | 15 | 20 | 30;
export interface ActivityModule {
    id: ActivityModuleId;
    judul: string;
    deskripsi: string;
    kenapaIni?: string;
    ageBands: AgeBandId[];
    nilaiUtama: NilaiId;
    nilaiPendukung?: NilaiId[];
    durasiMenit: DurasiMenit;
    bahan?: string[];
    langkah: string[];
    script?: string;
    avoid?: string;
    amati?: string;
    tipAyahBunda?: string;
    sumberIds?: string[];
    status: 'draft' | 'review' | 'published';
}
export declare const ACTIVITY_MODULES: ActivityModule[];
export type CoverageGap = {
    nilaiId: NilaiId;
    ageBandId: AgeBandId;
};
export declare function findCoverageGaps(modules: ActivityModule[]): CoverageGap[];
//# sourceMappingURL=activityModules.d.ts.map