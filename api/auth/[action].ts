import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '30d';

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

function getJwtSecret() {
  return process.env.JWT_SECRET!;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract the action from the URL path
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const segments = url.pathname.split('/').filter(Boolean);
  // segments: ['api', 'auth', 'signup'] or ['api', 'auth', 'login'] or ['api', 'auth', 'me']
  const action = segments[segments.length - 1];

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getDb();

    if (action === 'signup' && req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existing = await db`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
      if (existing.length > 0) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const result = await db`
        INSERT INTO users (email, password_hash)
        VALUES (${email.toLowerCase()}, ${passwordHash})
        RETURNING id, email
      `;

      const user = result[0];

      await db`INSERT INTO user_data (user_id) VALUES (${user.id})`;

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        getJwtSecret(),
        { expiresIn: TOKEN_EXPIRY }
      );

      return res.status(201).json({ user: { id: user.id, email: user.email }, token });

    } else if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await db`SELECT id, email, password_hash FROM users WHERE email = ${email.toLowerCase()}`;
      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        getJwtSecret(),
        { expiresIn: TOKEN_EXPIRY }
      );

      return res.json({ user: { id: user.id, email: user.email }, token });

    } else if (action === 'me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      try {
        const payload = jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
        return res.json({ user: { id: payload.userId, email: payload.email } });
      } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

    } else {
      return res.status(404).json({ error: 'Not found' });
    }
  } catch (err: any) {
    console.error('Auth API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
