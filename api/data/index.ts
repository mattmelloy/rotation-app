import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

function getJwtSecret() {
  return process.env.JWT_SECRET!;
}

function authenticateRequest(req: VercelRequest): { userId: string; email: string } | null {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const db = getDb();

  try {
    if (req.method === 'GET') {
      const result = await db`
        SELECT meals, week_slots, shopping_list 
        FROM user_data 
        WHERE user_id = ${user.userId}
      `;

      if (result.length === 0) {
        return res.json({ meals: [], week_slots: [], shopping_list: [] });
      }

      return res.json(result[0]);

    } else if (req.method === 'PUT') {
      const { meals, week_slots, shopping_list } = req.body;

      await db`
        INSERT INTO user_data (user_id, meals, week_slots, shopping_list, updated_at)
        VALUES (${user.userId}, ${JSON.stringify(meals)}, ${JSON.stringify(week_slots)}, ${JSON.stringify(shopping_list)}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          meals = ${JSON.stringify(meals)},
          week_slots = ${JSON.stringify(week_slots)},
          shopping_list = ${JSON.stringify(shopping_list)},
          updated_at = NOW()
      `;

      return res.json({ success: true });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    console.error('Data API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
