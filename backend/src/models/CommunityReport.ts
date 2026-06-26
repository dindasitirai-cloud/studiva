import { run, get, all } from '../database';
import { CommunityReport, ReportContentType, ReportReason, ReportStatus } from '../types';

export async function createReport(
  contentId: number,
  contentType: ReportContentType,
  reporterId: number,
  reason: ReportReason,
  details: string | null
): Promise<CommunityReport> {
  const result = await run(
    'INSERT INTO community_reports (content_id, content_type, reporter_id, reason, details) VALUES (?, ?, ?, ?, ?)',
    [contentId, contentType, reporterId, reason, details]
  );
  const report = await get<CommunityReport>('SELECT * FROM community_reports WHERE id = ?', [result.lastID]);
  if (!report) throw new Error('Failed to create report');
  return report;
}

export function findReportById(id: number): Promise<CommunityReport | undefined> {
  return get<CommunityReport>('SELECT * FROM community_reports WHERE id = ?', [id]);
}

export function findAllReports(status?: ReportStatus): Promise<CommunityReport[]> {
  if (status) {
    return all<CommunityReport>('SELECT * FROM community_reports WHERE status = ? ORDER BY created_at DESC', [
      status,
    ]);
  }
  return all<CommunityReport>('SELECT * FROM community_reports ORDER BY created_at DESC');
}

export async function updateReportStatus(
  id: number,
  status: ReportStatus,
  adminNotes: string | null,
  reviewedBy: number
): Promise<void> {
  await run(
    'UPDATE community_reports SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, adminNotes, reviewedBy, id]
  );
}

export function countPendingReports(): Promise<{ count: number } | undefined> {
  return get<{ count: number }>("SELECT COUNT(*) as count FROM community_reports WHERE status = 'pending'");
}
