import type { NilaiId } from './values';
import type { AgeBandId } from './ageBands';
import type { ActivityModuleId } from './activityModules';
import type { RekahProfile } from './profiles';
export declare const SHOW_DRAFT_CONTENT = true;
export interface ComposedStep {
    posisi: number;
    moduleId: ActivityModuleId;
}
export interface ComposedPlan {
    weekNumber: number;
    nilaiFokus: [NilaiId, NilaiId];
    ageBandId: AgeBandId;
    steps: ComposedStep[];
    poolTipis: boolean;
}
export declare function composeWeeklyPlan(profile: RekahProfile, weekNumber: number): ComposedPlan;
//# sourceMappingURL=planComposer.d.ts.map