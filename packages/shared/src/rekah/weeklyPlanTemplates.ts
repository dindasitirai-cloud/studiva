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

export const WEEKLY_PLAN_TEMPLATES: WeeklyPlanTemplate[] = [
  {
    id: 'wpt-001',
    judul: 'Pekan Pertama Eksplorasi',
    ageBand: '7-12',
    nilaiTema: 'mandiri',
    deskripsi: 'Pekan ringan untuk memulai rutinitas bermain terfokus. Tiga sesi pendek sepanjang pekan untuk membangun kebiasaan tanpa tekanan.',
    hari: [
      {
        hari: 'senin',
        activityModuleId: 'am-001',
        waktuDisarankan: 'Pagi, setelah sarapan',
        catatan: 'Mulai dengan durasi pendek — 5 menit sudah cukup untuk memulai.',
      },
      {
        hari: 'rabu',
        activityModuleId: 'am-003',
        waktuDisarankan: 'Sore, setelah tidur siang',
        catatan: 'Waktu bayi segar dan responsif adalah waktu terbaik.',
      },
      {
        hari: 'sabtu',
        activityModuleId: 'am-002',
        waktuDisarankan: 'Malam, sebelum tidur',
        catatan: 'Jadikan ini ritual malam yang menenangkan.',
      },
    ],
  },
];
