import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Boom from '@hapi/boom';
import { supabase } from '../config/supabase';
import { UserRole, AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadToSupabaseStorage } from '../services/storage';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      throw Boom.badRequest('Missing required fields');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw Boom.badRequest('Invalid role');
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw Boom.badRequest('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password_hash: passwordHash, role })
      .select('id, name, email, role, created_at')
      .single();

    if (error) {
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw Boom.badRequest('Email and password required');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password_hash, role, profile_image, created_at')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw Boom.unauthorized('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw Boom.unauthorized('Invalid credentials');
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
    next(error);
  }
});

router.get('/me', authenticate, (req: AuthRequest, res: Response, next: NextFunction) => {
  (async () => {
    try {
      if (!req.user) {
        throw Boom.unauthorized('Unauthorized');
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, profile_image, created_at')
        .eq('id', req.user.id)
        .single();

      if (error || !user) {
        throw Boom.notFound('User not found');
      }

      res.json(user);
    } catch (error: any) {
      next(error);
    }
  })();
});

router.post('/upload-profile-image', upload.single('image'), authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw Boom.badRequest('No image file provided');
    }

    const localUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const supabaseUrl = await uploadToSupabaseStorage(req.file.path, req.file.filename, req.file.mimetype);
    const imageUrl = supabaseUrl || localUrl;

    const { data: user, error } = await supabase
      .from('users')
      .update({ profile_image: imageUrl })
      .eq('id', req.user!.id)
      .select('id, name, email, role, profile_image, created_at')
      .single();

    if (error) {
      throw error;
    }

    res.json({ user, imageUrl });
  } catch (error: any) {
    next(error);
  }
});

export default router;
