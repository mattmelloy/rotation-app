import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth.js';
import { sql } from '../db.js';

const router = Router();

// All data routes require authentication
router.use(authenticateToken);

// GET /api/data — Fetch user's meals, week_slots, shopping_list
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const db = sql();

    const result = await db`
      SELECT meals, week_slots, shopping_list 
      FROM user_data 
      WHERE user_id = ${userId}
    `;

    if (result.length === 0) {
      // No data yet — return empty defaults
      return res.json({ meals: [], week_slots: [], shopping_list: [] });
    }

    res.json(result[0]);
  } catch (err: any) {
    console.error('Data fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// PUT /api/data — Save/update user's data (upsert)
router.put('/', async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const { meals, week_slots, shopping_list } = req.body;
    const db = sql();

    await db`
      INSERT INTO user_data (user_id, meals, week_slots, shopping_list, updated_at)
      VALUES (${userId}, ${JSON.stringify(meals)}, ${JSON.stringify(week_slots)}, ${JSON.stringify(shopping_list)}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        meals = ${JSON.stringify(meals)},
        week_slots = ${JSON.stringify(week_slots)},
        shopping_list = ${JSON.stringify(shopping_list)},
        updated_at = NOW()
    `;

    res.json({ success: true });
  } catch (err: any) {
    console.error('Data save error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

export default router;
