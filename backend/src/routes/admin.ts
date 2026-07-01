import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate, requireRole } from '../middleware/auth';
import {
  findAllConsultations,
  findConsultationById,
  confirmConsultationSchedule,
  updateConsultationStatus,
  setOutcomeNotes,
} from '../models/Consultation';
import {
  findAllEnrollmentRequests,
  findEnrollmentRequestById,
  updateEnrollmentRequestStatus,
} from '../models/EnrollmentRequest';
import { enrollChildInTier1 } from '../models/Child';
import { createSubscription, findActiveSubscriptionByUserId } from '../models/Subscription';
import { getPlanInfo, computeEndDate } from '../lib/pricing';
import { findTeachers, toPublicUser, findAllUsers, countAllUsers, findUserByEmail } from '../models/User';
import {
  findDiscussionById,
  togglePin,
  softDeleteDiscussion,
  countDiscussions,
  countDiscussionsSince,
} from '../models/Discussion';
import { softDeleteComment, countCommentsSince } from '../models/Comment';
import { findAllReports, findReportById, updateReportStatus, countPendingReports } from '../models/CommunityReport';
import { setChampion, setExpert, countActiveUsersSince } from '../models/CommunityProfile';
import { sumCompletedPayments } from '../models/Payment';
import { ConsultationStatus, EnrollmentRequestStatus, ReportStatus } from '../types';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get(
  '/teachers',
  asyncHandler(async (_req: Request, res: Response) => {
    const teachers = await findTeachers();
    res.json({ teachers: teachers.map(toPublicUser) });
  })
);

const VALID_STATUSES: ConsultationStatus[] = ['pending', 'confirmed', 'completed', 'canceled'];

router.get(
  '/consultations',
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as ConsultationStatus | undefined;
    if (status && !VALID_STATUSES.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }
    const consultations = await findAllConsultations(status);
    res.json({ consultations });
  })
);

router.post(
  '/consultations/:id/confirm',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { date, time } = req.body as { date?: string; time?: string };
    if (!date || !time) throw new ApiError(400, 'date and time are required');

    const consultation = await findConsultationById(id);
    if (!consultation) throw new ApiError(404, 'Consultation not found');

    await confirmConsultationSchedule(id, date, time);
    res.json({ message: 'Consultation confirmed' });
  })
);

router.post(
  '/consultations/:id/complete',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { outcomeNotes } = req.body as { outcomeNotes?: string };
    const consultation = await findConsultationById(id);
    if (!consultation) throw new ApiError(404, 'Consultation not found');

    await updateConsultationStatus(id, 'completed');
    if (outcomeNotes) await setOutcomeNotes(id, outcomeNotes);
    res.json({ message: 'Consultation marked as completed' });
  })
);

const VALID_ENROLLMENT_STATUSES: EnrollmentRequestStatus[] = ['pending', 'approved', 'rejected'];

router.get(
  '/enrollment-requests',
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as EnrollmentRequestStatus | undefined;
    if (status && !VALID_ENROLLMENT_STATUSES.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }
    const requests = await findAllEnrollmentRequests(status);
    res.json({ requests });
  })
);

router.post(
  '/enrollment-requests/:id/approve',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { teacherId, schoolClass, startDate } = req.body as {
      teacherId?: number;
      schoolClass?: string;
      startDate?: string;
    };
    if (!teacherId || !schoolClass || !startDate) {
      throw new ApiError(400, 'teacherId, schoolClass, and startDate are required');
    }

    const request = await findEnrollmentRequestById(id);
    if (!request) throw new ApiError(404, 'Enrollment request not found');
    if (request.status !== 'pending') throw new ApiError(400, 'This request has already been processed');

    // Don't create a duplicate Tier 1 subscription if the parent already has one
    // (e.g. enrolling a second child under the same family account).
    const existingSubscription = await findActiveSubscriptionByUserId(request.user_id);
    if (!existingSubscription || existingSubscription.tier !== 'tier1') {
      const planInfo = getPlanInfo('tier1', 'monthly');
      await createSubscription(
        request.user_id,
        'tier1',
        'monthly',
        'active',
        startDate,
        computeEndDate('monthly', new Date(startDate)),
        'manual',
        null,
        planInfo.amount
      );
    }

    await enrollChildInTier1(request.child_id, teacherId, schoolClass, startDate);
    await updateEnrollmentRequestStatus(id, 'approved');

    res.json({ message: 'Enrollment request approved' });
  })
);

router.post(
  '/enrollment-requests/:id/reject',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const request = await findEnrollmentRequestById(id);
    if (!request) throw new ApiError(404, 'Enrollment request not found');

    await updateEnrollmentRequestStatus(id, 'rejected');
    res.json({ message: 'Enrollment request rejected' });
  })
);

// ---------- Community moderation ----------

router.post(
  '/community/discussions/:id/pin',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const discussion = await findDiscussionById(id);
    if (!discussion) throw new ApiError(404, 'Discussion not found');

    const pinned = await togglePin(id);
    res.json({ pinned });
  })
);

router.delete(
  '/community/discussions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const discussion = await findDiscussionById(id);
    if (!discussion) throw new ApiError(404, 'Discussion not found');

    await softDeleteDiscussion(id);
    res.json({ message: 'Discussion deleted' });
  })
);

router.delete(
  '/community/comments/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const discussionId = Number(req.body.discussionId);
    if (!discussionId) throw new ApiError(400, 'discussionId is required');

    await softDeleteComment(id, discussionId);
    res.json({ message: 'Comment deleted' });
  })
);

const VALID_REPORT_STATUSES: ReportStatus[] = ['pending', 'reviewed', 'resolved', 'dismissed'];

router.get(
  '/community/reports',
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as ReportStatus | undefined;
    if (status && !VALID_REPORT_STATUSES.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }
    const reports = await findAllReports(status);
    res.json({ reports });
  })
);

router.patch(
  '/community/reports/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status, adminNotes } = req.body as { status?: ReportStatus; adminNotes?: string };
    if (!status || !VALID_REPORT_STATUSES.includes(status)) {
      throw new ApiError(400, 'A valid status is required');
    }

    const report = await findReportById(id);
    if (!report) throw new ApiError(404, 'Report not found');

    await updateReportStatus(id, status, adminNotes ?? null, req.user!.id);
    res.json({ message: 'Report updated' });
  })
);

router.post(
  '/community/champions/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const { isChampion } = req.body as { isChampion?: boolean };
    await setChampion(userId, Boolean(isChampion));
    res.json({ message: 'Champion status updated' });
  })
);

router.post(
  '/community/experts/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const { isExpert, expertBadge } = req.body as { isExpert?: boolean; expertBadge?: string };
    await setExpert(userId, Boolean(isExpert), expertBadge ?? null);
    res.json({ message: 'Expert status updated' });
  })
);

// ---------- User management ----------

router.get(
  '/users',
  asyncHandler(async (_req: Request, res: Response) => {
    const users = await findAllUsers();
    res.json({ users: users.map(toPublicUser) });
  })
);

// ---------- Dashboard ----------

router.get(
  '/dashboard-stats',
  asyncHandler(async (_req: Request, res: Response) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalUsers,
      totalDiscussions,
      postsThisWeek,
      commentsThisWeek,
      activeUsersThisWeek,
      pendingReports,
      revenue,
      upcomingConsultations,
    ] = await Promise.all([
      countAllUsers(),
      countDiscussions(),
      countDiscussionsSince(sevenDaysAgo),
      countCommentsSince(sevenDaysAgo),
      countActiveUsersSince(sevenDaysAgo),
      countPendingReports(),
      sumCompletedPayments(),
      findAllConsultations('confirmed'),
    ]);

    res.json({
      totalUsers: totalUsers?.count ?? 0,
      totalDiscussions: totalDiscussions?.count ?? 0,
      postsThisWeek: (postsThisWeek?.count ?? 0) + (commentsThisWeek?.count ?? 0),
      activeUsersThisWeek: activeUsersThisWeek?.count ?? 0,
      pendingReports: pendingReports?.count ?? 0,
      totalRevenue: revenue?.total ?? 0,
      upcomingConsultations: upcomingConsultations.length,
    });
  })
);

// Admin creates a Tier 1 parent account (offline registration) — assigns an
// active Tier 1 subscription so the parent lands on /dashboard/tier1 instead
// of the pricing page when they first log in.
router.post(
  '/assign-tier1-subscription',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as { email?: string };
    if (!email) throw new ApiError(400, 'email is required');

    const user = await findUserByEmail(email);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role !== 'parent') throw new ApiError(400, 'User is not a parent');

    const existing = await findActiveSubscriptionByUserId(user.id);
    if (existing && existing.tier === 'tier1') {
      res.json({ message: 'Tier 1 subscription already active' });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    await createSubscription(
      user.id,
      'tier1',
      'monthly',
      'active',
      today,
      computeEndDate('monthly', new Date(today)),
      'manual',
      null,
      0,
    );

    res.json({ message: 'Tier 1 subscription assigned' });
  })
);

export default router;
