import { run, get, all } from '../database';
import { EnrollmentRequest, EnrollmentRequestStatus, EnrollmentRequestWithDetails } from '../types';

export async function createEnrollmentRequest(
  userId: number,
  childId: number,
  message: string | null
): Promise<EnrollmentRequest> {
  const result = await run(
    'INSERT INTO enrollment_requests (user_id, child_id, message) VALUES (?, ?, ?)',
    [userId, childId, message]
  );
  const request = await get<EnrollmentRequest>('SELECT * FROM enrollment_requests WHERE id = ?', [result.lastID]);
  if (!request) throw new Error('Failed to create enrollment request');
  return request;
}

export function findEnrollmentRequestById(id: number): Promise<EnrollmentRequest | undefined> {
  return get<EnrollmentRequest>('SELECT * FROM enrollment_requests WHERE id = ?', [id]);
}

export function findEnrollmentRequestsByUserId(userId: number): Promise<EnrollmentRequest[]> {
  return all<EnrollmentRequest>(
    'SELECT * FROM enrollment_requests WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
}

export function findAllEnrollmentRequests(status?: EnrollmentRequestStatus): Promise<EnrollmentRequestWithDetails[]> {
  if (status) {
    return all<EnrollmentRequestWithDetails>(
      `SELECT enrollment_requests.*, children.name AS child_name, users.name AS requester_name
       FROM enrollment_requests
       JOIN children ON children.id = enrollment_requests.child_id
       JOIN users ON users.id = enrollment_requests.user_id
       WHERE enrollment_requests.status = ?
       ORDER BY enrollment_requests.created_at DESC`,
      [status]
    );
  }
  return all<EnrollmentRequestWithDetails>(
    `SELECT enrollment_requests.*, children.name AS child_name, users.name AS requester_name
     FROM enrollment_requests
     JOIN children ON children.id = enrollment_requests.child_id
     JOIN users ON users.id = enrollment_requests.user_id
     ORDER BY enrollment_requests.created_at DESC`
  );
}

export async function updateEnrollmentRequestStatus(id: number, status: EnrollmentRequestStatus): Promise<void> {
  await run('UPDATE enrollment_requests SET status = ? WHERE id = ?', [status, id]);
}
