import { run, get, all } from '../database';
import { Consultation, ConsultationType, ConsultationStatus, ConsultationWithDetails } from '../types';

export async function createConsultation(
  userId: number,
  childId: number,
  consultationType: ConsultationType,
  notes: string | null
): Promise<Consultation> {
  const result = await run(
    `INSERT INTO consultations (user_id, child_id, consultation_type, status, notes)
     VALUES (?, ?, ?, 'pending', ?)`,
    [userId, childId, consultationType, notes]
  );
  const consultation = await get<Consultation>('SELECT * FROM consultations WHERE id = ?', [result.lastID]);
  if (!consultation) throw new Error('Failed to create consultation');
  return consultation;
}

export function findConsultationById(id: number): Promise<Consultation | undefined> {
  return get<Consultation>('SELECT * FROM consultations WHERE id = ?', [id]);
}

export function findConsultationsByUserId(userId: number): Promise<ConsultationWithDetails[]> {
  return all<ConsultationWithDetails>(
    `SELECT consultations.*, children.name AS child_name
     FROM consultations
     JOIN children ON children.id = consultations.child_id
     WHERE consultations.user_id = ?
     ORDER BY consultations.created_at DESC`,
    [userId]
  );
}

export function findAllConsultations(status?: ConsultationStatus): Promise<ConsultationWithDetails[]> {
  if (status) {
    return all<ConsultationWithDetails>(
      `SELECT consultations.*, children.name AS child_name, users.name AS requester_name
       FROM consultations
       JOIN children ON children.id = consultations.child_id
       JOIN users ON users.id = consultations.user_id
       WHERE consultations.status = ?
       ORDER BY consultations.created_at DESC`,
      [status]
    );
  }
  return all<ConsultationWithDetails>(
    `SELECT consultations.*, children.name AS child_name, users.name AS requester_name
     FROM consultations
     JOIN children ON children.id = consultations.child_id
     JOIN users ON users.id = consultations.user_id
     ORDER BY consultations.created_at DESC`
  );
}

export async function confirmConsultationSchedule(
  id: number,
  date: string,
  time: string
): Promise<void> {
  await run(
    `UPDATE consultations SET status = 'confirmed', consultation_date = ?, consultation_time = ? WHERE id = ?`,
    [date, time, id]
  );
}

export async function updateConsultationStatus(id: number, status: ConsultationStatus): Promise<void> {
  await run('UPDATE consultations SET status = ? WHERE id = ?', [status, id]);
}

export async function setOutcomeNotes(id: number, outcomeNotes: string): Promise<void> {
  await run('UPDATE consultations SET outcome_notes = ? WHERE id = ?', [outcomeNotes, id]);
}
