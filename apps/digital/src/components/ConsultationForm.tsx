import React from 'react';
import { Child, ConsultationType } from '../types';

interface ConsultationFormProps {
  childrenList: Child[];
  childId: number | '';
  onChildIdChange: (id: number | '') => void;
  consultationType: ConsultationType | '';
  onConsultationTypeChange: (type: ConsultationType) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export default function ConsultationForm({
  childrenList,
  childId,
  onChildIdChange,
  consultationType,
  onConsultationTypeChange,
  notes,
  onNotesChange,
  onSubmit,
  submitting,
}: ConsultationFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-textdark">Select Child</label>
        <select
          value={childId}
          onChange={(e) => onChildIdChange(e.target.value ? Number(e.target.value) : '')}
          required
          className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
        >
          <option value="" disabled>
            Pilih anak
          </option>
          {childrenList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="text-sm font-medium text-textdark">Consultation Type</span>
        <div className="mt-2 flex gap-6">
          <label className="flex min-h-[48px] items-center gap-2">
            <input
              type="radio"
              name="consultationType"
              value="online"
              checked={consultationType === 'online'}
              onChange={() => onConsultationTypeChange('online')}
            />
            Online
          </label>
          <label className="flex min-h-[48px] items-center gap-2">
            <input
              type="radio"
              name="consultationType"
              value="offline"
              checked={consultationType === 'offline'}
              onChange={() => onConsultationTypeChange('offline')}
            />
            Offline
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-textdark">Additional Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={4}
          placeholder="Deskripsi singkat topik yang ingin didiskusikan..."
          className="mt-1 w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="min-h-[48px] rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90 disabled:opacity-60"
      >
        {submitting ? 'Memproses...' : 'Book Consultation'}
      </button>
    </form>
  );
}
