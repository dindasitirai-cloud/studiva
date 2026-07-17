import type { AgeBandId } from './ageBands';
import type { ActivityModuleId } from './activityModules';
import type { NilaiId } from './values';
export interface PlanHari {
    hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';
    activityModuleId: ActivityModuleId;
    waktuDisarankan?: string;
    catatan?: string;
}
export interface WeeklyPlanTemplate {
    id: string;
    judul: string;
    ageBand: AgeBandId;
    nilaiTema: NilaiId;
    deskripsi: string;
    hari: PlanHari[];
}
export declare const WEEKLY_PLAN_TEMPLATES: WeeklyPlanTemplate[];
//# sourceMappingURL=weeklyPlanTemplates.d.ts.map