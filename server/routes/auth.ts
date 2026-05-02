import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '../db.js';

const router = Router();

const JWT_SECRET = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '30d'; // Long-lived tokens for a meal planning app

// Middleware to extract user from JWT
export async function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET()) as { userId: string; email: string };
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = sql();

    // Check if user already exists
    const existing = await db`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db`
      INSERT INTO users (email, password_hash)
      VALUES (${email.toLowerCase()}, ${passwordHash})
      RETURNING id, email, created_at
    `;

    const user = result[0];

    // Create empty user_data row
    await db`
      INSERT INTO user_data (user_id)
      VALUES (${user.id})
    `;

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET(),
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(201).json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = sql();

    // Find user
    const result = await db`SELECT id, email, password_hash FROM users WHERE email = ${email.toLowerCase()}`;
    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET(),
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me — validate token and return user info
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const { userId, email } = (req as any).user;
  res.json({ user: { id: userId, email } });
});

export default router;
