import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { X, Upload, AlertTriangle, Check } from 'lucide-react';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import {
  AGE_RANGES, DOMAIN_META, PILAR_RISET,
  Activity, WeeklyPlan, EduTool, Downloadable, DomainKey, DownloadKategori, ContentStatus,
} from '../../data/learningStrategies';

type ImportType = 'aktivitas' | 'program' | 'alat' | 'unduhan';

interface CsvImportModalProps {
  type: ImportType;
  onClose: () => void;
}

interface RowValidation {
  rowIndex: number;
  data: Record<string, string>;
  errors: string[];
  warnings: string[];
  idConflict: boolean;
  useNewId: boolean;
}

const DOMAIN_KEYS = Object.keys(DOMAIN_META) as DomainKey[];
const VALID_AGE_IDS = new Set(AGE_RANGES.map(r => r.id));
const VALID_STATUSES = new Set<ContentStatus>(['draft', 'review', 'approved', 'published']);
const VALID_KATEGORI = new Set<DownloadKategori>(['Buku Cerita', 'Flashcard', 'Worksheet', 'Checklist', 'Panduan']);

function parseCsvStatus(val: string): ContentStatus {
  if (VALID_STATUSES.has(val as ContentStatus)) return val as ContentStatus;
  return 'draft';
}

function parsePilarId(val: string): string {
  if (!val) return '';
  return PILAR_RISET[val.trim()] ?? val.trim();
}

export default function CsvImportModal({ type, onClose }: CsvImportModalProps) {
  const {
    managedActivities, managedPlans, managedTools, managedDownloads,
    adminAddActivity, adminUpdateActivity,
    adminAddPlan, adminUpdatePlan,
    adminAddTool, adminUpdateTool,
    adminAddDownload, adminUpdateDownload,
  } = useLearningStrategies();

  const [rows, setRows] = useState<RowValidation[]>([]);
  const [parsed, setParsed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const typeLabel: Record<ImportType, string> = {
    aktivitas: 'Aktivitas',
    program: 'Program Mingguan',
    alat: 'Alat Edukasi',
    unduhan: 'Unduhan',
  };

  function validateActivityRow(data: Record<string, string>): { errors: string[]; warnings: string[]; idConflict: boolean } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.judul?.trim()) errors.push('Judul wajib diisi');

    const ageId = data.ageId?.trim();
    if (ageId && !VALID_AGE_IDS.has(ageId)) errors.push(`ageId tidak dikenal: "${ageId}"`);

    const domainRaw = data.domain?.trim();
    if (domainRaw) {
      domainRaw.split(',').map(s => s.trim()).forEach(d => {
        if (d && !DOMAIN_KEYS.includes(d as DomainKey)) errors.push(`Domain tidak dikenal: "${d}"`);
      });
    }

    const id = Number(data.id);
    const idConflict = !isNaN(id) && id > 0 && managedActivities.some(a => a.id === id);

    return { errors, warnings, idConflict };
  }

  function validatePlanRow(data: Record<string, string>, allActivityIds: Set<number>): { errors: string[]; warnings: string[]; idConflict: boolean } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.judul?.trim()) errors.push('Judul wajib diisi');

    const id = Number(data.id);
    const idConflict = !isNaN(id) && id > 0 && managedPlans.some(p => p.id === id);

    for (let i = 1; i <= 7; i++) {
      const hariRaw = data[`hari${i}`];
      if (hariRaw) {
        const parts = hariRaw.split(' | ');
        const idsRaw = parts[2] ?? '';
        idsRaw.split(',').map(s => s.trim()).filter(Boolean).forEach(idStr => {
          const actId = Number(idStr);
          if (!isNaN(actId) && !allActivityIds.has(actId)) warnings.push(`ID aktivitas ${actId} tidak ditemukan di hari ${i}`);
        });
      }
    }

    return { errors, warnings, idConflict };
  }

  function validateToolRow(data: Record<string, string>): { errors: string[]; warnings: string[]; idConflict: boolean } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.nama?.trim()) errors.push('Nama wajib diisi');

    const id = Number(data.id);
    const idConflict = !isNaN(id) && id > 0 && managedTools.some(t => t.id === id);

    const sl = data.statusLink?.trim();
    if (sl && !['KOSONG', 'TERPASANG', 'PERLU_CEK', 'MATI'].includes(sl)) {
      warnings.push(`statusLink tidak dikenal: "${sl}" - akan diabaikan`);
    }

    return { errors, warnings, idConflict };
  }

  function validateDownloadRow(data: Record<string, string>): { errors: string[]; warnings: string[]; idConflict: boolean } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.nama?.trim()) errors.push('Nama wajib diisi');

    const kat = data.kategori?.trim() as DownloadKategori;
    if (kat && !VALID_KATEGORI.has(kat)) errors.push(`Kategori tidak dikenal: "${kat}"`);

    const id = Number(data.id);
    const idConflict = !isNaN(id) && id > 0 && managedDownloads.some(d => d.id === id);

    return { errors, warnings, idConflict };
  }

  function handleFile(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const allActivityIds = new Set(managedActivities.map(a => a.id));
        const validated: RowValidation[] = (result.data as Record<string, string>[]).map((data, i) => {
          let v: { errors: string[]; warnings: string[]; idConflict: boolean };

          if (type === 'aktivitas') v = validateActivityRow(data);
          else if (type === 'program') v = validatePlanRow(data, allActivityIds);
          else if (type === 'alat') v = validateToolRow(data);
          else v = validateDownloadRow(data);

          return {
            rowIndex: i + 1,
            data,
            errors: v.errors,
            warnings: v.warnings,
            idConflict: v.idConflict,
            useNewId: false,
          };
        });
        setRows(validated);
        setParsed(true);
      },
    });
  }

  function toggleUseNewId(i: number) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, useNewId: !r.useNewId } : r));
  }

  function buildActivity(data: Record<string, string>, finalId: number): Omit<Activity, 'id'> {
    const domainRaw = data.domain?.trim() ?? '';
    const domain: DomainKey[] = domainRaw.split(',').map(s => s.trim()).filter(s => DOMAIN_KEYS.includes(s as DomainKey)) as DomainKey[];
    const langkah: string[] = [data.langkah1, data.langkah2, data.langkah3, data.langkah4].filter(Boolean);

    return {
      icon: data.icon?.trim() || '🎯',
      judul: data.judul?.trim() ?? '',
      ageId: data.ageId?.trim() || 'b03',
      domain: domain.length > 0 ? domain : ['mk'],
      durasiMenit: Number(data.durasiMenit) || 15,
      isDIY: data.isDIY?.trim().toUpperCase() === 'YA',
      deskripsi: data.deskripsi?.trim() ?? '',
      sci: data.sci?.trim() ?? '',
      sumber: parsePilarId(data.pilarID),
      tujuan: data.tujuan?.trim() ?? '',
      bahan: [],
      langkah,
      variasiMudah: data.variasiMudah?.trim() ?? '',
      variasiMenantang: data.variasiMenantang?.trim() ?? '',
      adaptasiABK: data.adaptasiABK?.trim() ?? '',
      catatanReviewer: data.catatanReviewer?.trim() || undefined,
      status: parseCsvStatus(data.status?.trim() ?? 'draft'),
    };
  }

  function buildPlan(data: Record<string, string>): Omit<WeeklyPlan, 'id'> {
    const hari = Array.from({ length: 7 }, (_, i) => {
      const raw = data[`hari${i + 1}`] ?? '';
      const parts = raw.split(' | ');
      const judul = parts[0]?.trim() ?? `Hari ${i + 1}`;
      const deskripsi = parts[1]?.trim() ?? '';
      const idsRaw = parts[2]?.trim() ?? '';
      const activityIds = idsRaw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
      return { judul, deskripsi, activityIds };
    });

    return {
      icon: data.icon?.trim() || '📅',
      judul: data.judul?.trim() ?? '',
      ageLabel: data.ageLabel?.trim() ?? '',
      minBulan: Number(data.minBulan) || 0,
      maxBulan: Number(data.maxBulan) || 12,
      deskripsi: data.deskripsi?.trim() ?? '',
      sci: data.sci?.trim() ?? '',
      sumber: parsePilarId(data.pilarID),
      caraPakai: data.caraPakai?.trim() ?? '',
      hari,
      catatanReviewer: data.catatanReviewer?.trim() || undefined,
      status: parseCsvStatus(data.status?.trim() ?? 'draft'),
    };
  }

  function buildTool(data: Record<string, string>): Omit<EduTool, 'id'> {
    const keunggulan: string[] = [data.keunggulan1, data.keunggulan2, data.keunggulan3].filter(Boolean).map(s => s.trim());
    const slRaw = data.statusLink?.trim();
    const statusLink = ['KOSONG', 'TERPASANG', 'PERLU_CEK', 'MATI'].includes(slRaw ?? '') ? (slRaw as EduTool['statusLink']) : 'KOSONG';

    return {
      icon: data.icon?.trim() || '🧸',
      nama: data.nama?.trim() ?? '',
      hargaEstimasi: data.hargaEstimasi?.trim() ?? '',
      pilihanPsikolog: data.pilihanPsikolog?.trim().toUpperCase() === 'YA',
      minBulan: Number(data.minBulan) || 0,
      maxBulan: Number(data.maxBulan) || 12,
      ageLabel: data.ageLabel?.trim() ?? '',
      deskripsi: data.deskripsi?.trim() ?? '',
      sci: data.sci?.trim() ?? '',
      sumber: parsePilarId(data.pilarID),
      keunggulan,
      affiliateUrl: data.affiliateUrl?.trim() ?? '',
      statusLink,
      tanggalCekLink: data.tanggalCekLink?.trim() || undefined,
      catatanReviewer: data.catatanReviewer?.trim() || undefined,
      status: parseCsvStatus(data.status?.trim() ?? 'draft'),
    };
  }

  function buildDownload(data: Record<string, string>): Omit<Downloadable, 'id'> {
    const katRaw = data.kategori?.trim() as DownloadKategori;
    const kategori: DownloadKategori = VALID_KATEGORI.has(katRaw) ? katRaw : 'Panduan';

    return {
      icon: data.icon?.trim() || '📄',
      nama: data.nama?.trim() ?? '',
      kategori,
      minBulan: Number(data.minBulan) || 0,
      maxBulan: Number(data.maxBulan) || 72,
      deskripsi: data.deskripsi?.trim() ?? '',
      sci: data.sci?.trim() ?? '',
      sumber: parsePilarId(data.pilarID),
      caraPakai: data.caraPakai?.trim() ?? '',
      halaman: data.halaman?.trim() ?? '',
      jumlahUnduhan: 0,
      fileUrl: data.fileUrl?.trim() ?? '',
      catatanReviewer: data.catatanReviewer?.trim() || undefined,
      status: parseCsvStatus(data.status?.trim() ?? 'draft'),
    };
  }

  function doImport() {
    setImporting(true);
    let count = 0;

    rows.forEach((row) => {
      if (row.errors.length > 0) return;
      const rawId = Number(row.data.id);
      const hasExisting = row.idConflict && !row.useNewId;

      if (type === 'aktivitas') {
        const payload = buildActivity(row.data, rawId);
        if (hasExisting) {
          adminUpdateActivity(rawId, payload);
        } else {
          adminAddActivity(payload);
        }
        count++;
      } else if (type === 'program') {
        const payload = buildPlan(row.data);
        if (hasExisting) {
          adminUpdatePlan(rawId, payload);
        } else {
          adminAddPlan(payload);
        }
        count++;
      } else if (type === 'alat') {
        const payload = buildTool(row.data);
        if (hasExisting) {
          adminUpdateTool(rawId, payload);
        } else {
          adminAddTool(payload);
        }
        count++;
      } else {
        const payload = buildDownload(row.data);
        if (hasExisting) {
          adminUpdateDownload(rawId, payload);
        } else {
          adminAddDownload(payload);
        }
        count++;
      }
    });

    setImportCount(count);
    setImporting(false);
    setDone(true);
  }

  const validRows = rows.filter(r => r.errors.length === 0);
  const errorRows = rows.filter(r => r.errors.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[800px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[17px] font-bold text-stv-navy">Impor CSV - {typeLabel[type]}</h2>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-stv-muted hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-[16px] font-bold text-stv-navy">{importCount} baris berhasil diimpor</p>
            {errorRows.length > 0 && (
              <p className="text-[13px] text-stv-muted">{errorRows.length} baris dilewati karena terdapat error</p>
            )}
            <button type="button" onClick={onClose}
              className="mt-2 rounded-full bg-amber-500 px-6 py-2 text-[14px] font-bold text-white hover:bg-amber-600">
              Tutup
            </button>
          </div>
        ) : !parsed ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border-2 border-dashed border-stv-border p-8 text-center">
              <Upload className="mx-auto mb-3 h-10 w-10 text-stv-muted" />
              <p className="mb-1 text-[14px] font-semibold text-stv-navy">Unggah file CSV</p>
              <p className="mb-4 text-[12px] text-stv-muted">Format: .csv dengan header baris pertama</p>
              <button type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-full bg-amber-500 px-5 py-2 text-[13px] font-bold text-white hover:bg-amber-600">
                Pilih File
              </button>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-1 text-[12px] font-bold text-stv-navy">Kolom yang diharapkan ({typeLabel[type]}):</p>
              {type === 'aktivitas' && <p className="text-[11px] text-stv-muted font-mono">id, status, judul, ageId, domain, durasiMenit, isDIY, icon, deskripsi, sci, pilarID, tujuan, langkah1, langkah2, langkah3, langkah4, variasiMudah, variasiMenantang, adaptasiABK, catatanReviewer</p>}
              {type === 'program' && <p className="text-[11px] text-stv-muted font-mono">id, status, judul, ageLabel, minBulan, maxBulan, icon, deskripsi, sci, pilarID, caraPakai, hari1..hari7, catatanReviewer</p>}
              {type === 'alat' && <p className="text-[11px] text-stv-muted font-mono">id, status, nama, ageLabel, minBulan, maxBulan, icon, hargaEstimasi, pilihanPsikolog, deskripsi, sci, pilarID, keunggulan1, keunggulan2, keunggulan3, affiliateUrl, statusLink, tanggalCekLink, catatanReviewer</p>}
              {type === 'unduhan' && <p className="text-[11px] text-stv-muted font-mono">id, status, nama, kategori, minBulan, maxBulan, icon, deskripsi, sci, pilarID, caraPakai, halaman, fileUrl, catatanReviewer</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-stv-navy">
                {rows.length} baris terurai
                <span className="ml-2 text-green-600">{validRows.length} valid</span>
                {errorRows.length > 0 && <span className="ml-2 text-red-500">{errorRows.length} error</span>}
              </p>
              <button type="button" onClick={() => { setParsed(false); setRows([]); }}
                className="text-[12px] text-stv-muted hover:text-stv-body">
                Pilih file lain
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto rounded-xl border border-stv-border">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-stv-muted">Baris</th>
                    <th className="px-3 py-2 text-left font-semibold text-stv-muted">ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-stv-muted">Judul / Nama</th>
                    <th className="px-3 py-2 text-left font-semibold text-stv-muted">Status</th>
                    <th className="px-3 py-2 text-left font-semibold text-stv-muted">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const hasError = row.errors.length > 0;
                    const title = row.data.judul?.trim() || row.data.nama?.trim() || '-';
                    return (
                      <tr key={i} className={`border-t border-slate-50 ${hasError ? 'bg-red-50' : row.warnings.length > 0 ? 'bg-yellow-50' : 'bg-white'}`}>
                        <td className="px-3 py-2 text-stv-muted">{row.rowIndex}</td>
                        <td className="px-3 py-2 font-mono text-stv-body">{row.data.id || '-'}</td>
                        <td className="px-3 py-2 font-medium text-stv-navy max-w-[200px] truncate">{title}</td>
                        <td className="px-3 py-2">
                          {hasError ? (
                            <span className="flex items-center gap-1 text-red-600 font-semibold">
                              <X className="h-3 w-3" /> Error
                            </span>
                          ) : row.idConflict ? (
                            <div className="flex items-center gap-2">
                              <span className="text-amber-600 font-semibold">ID Duplikat</span>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={row.useNewId} onChange={() => toggleUseNewId(i)} />
                                <span className="text-[11px]">ID baru</span>
                              </label>
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 text-green-600 font-semibold">
                              <Check className="h-3 w-3" /> OK
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 max-w-[220px]">
                          {row.errors.map((e, ei) => (
                            <p key={ei} className="text-red-500 text-[11px]">{e}</p>
                          ))}
                          {row.warnings.map((w, wi) => (
                            <p key={wi} className="text-amber-600 text-[11px]">
                              <AlertTriangle className="mr-0.5 inline h-3 w-3" />{w}
                            </p>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button type="button" onClick={onClose}
                className="rounded-full border border-stv-border px-4 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">
                Batal
              </button>
              <button type="button"
                onClick={doImport}
                disabled={validRows.length === 0 || importing}
                className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-[13px] font-bold text-white hover:bg-amber-600 disabled:opacity-50 transition">
                <Upload className="h-3.5 w-3.5" />
                Impor {validRows.length} baris valid
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
