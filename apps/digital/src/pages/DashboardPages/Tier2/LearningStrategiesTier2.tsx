// PARKIR: diparkir di Rekah build 1. Preview components akan dikembalikan saat Learning Strategies
// diintegrasikan kembali (build 4). Admin StrategiesAdmin menggunakan ini untuk preview kartu.
import React from 'react';

const Stub: React.FC<Record<string, unknown>> = ({ children }) => (
  <div className="p-4 text-pekat/50 text-sm">
    {(children as React.ReactNode) ?? 'Preview diparkir (build 4)'}
  </div>
);

export const ActivityCard = Stub;
export const ActivityModal = Stub;
export const PlanCard = Stub;
export const PlanModal = Stub;
export const ToolCard = Stub;
export const ToolModal = Stub;
export const DownloadCard = Stub;
export const DownloadModal = Stub;
