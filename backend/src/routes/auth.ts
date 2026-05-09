import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { UserRole, AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password_hash: passwordHash, role })
      .select('id, name, email, role, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password_hash, role, profile_image, created_at')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        created_at: user.created_at
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  (async () => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, profile_image, created_at')
        .eq('id', req.user.id)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  })();
});

router.post('/upload-profile-image', upload.single('image'), authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const { data: user, error } = await supabase
      .from('users')
      .update({ profile_image: imageUrl })
      .eq('id', req.user!.id)
      .select('id, name, email, role, profile_image, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ user, imageUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
