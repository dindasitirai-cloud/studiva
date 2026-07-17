export type AgeBandId = '0-6' | '7-12' | '13-18' | '19-24' | '25-36';
export interface AgeBand {
    id: AgeBandId;
    label: string;
    minBulan: number;
    maxBulan: number;
    deskripsi: string;
}
export declare const AGE_BANDS: AgeBand[];
export declare function getAgeBand(bulan: number): AgeBand | undefined;
//# sourceMappingURL=ageBands.d.ts.map