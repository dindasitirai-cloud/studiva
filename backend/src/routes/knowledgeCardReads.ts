import { Router, Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { run, get, all } from '../database';

const router = Router();
router.use(authenticate);

// GET / — return all cardIds the current user has read
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const rows = await all<{ card_id: string }>(
      'SELECT card_id FROM card_reads WHERE user_id = ?',
      [req.user!.id]
    );
    res.json({ cardIds: rows.map(r => r.card_id) });
  })
);

// POST / — toggle read status for a card
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { cardId } = req.body as { cardId?: string };
    if (!cardId) throw new ApiError(400, 'cardId is required');

    const existing = await get<{ id: number }>(
      'SELECT id FROM card_reads WHERE user_id = ? AND card_id = ?',
      [req.user!.id, cardId]
    );

    if (existing) {
      await run('DELETE FROM card_reads WHERE user_id = ? AND card_id = ?', [req.user!.id, cardId]);
      res.json({ read: false });
    } else {
      await run('INSERT INTO card_reads (user_id, card_id) VALUES (?, ?)', [req.user!.id, cardId]);
      res.json({ read: true });
    }
  })
);

export default router;
