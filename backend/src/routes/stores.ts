import { Router, Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import { supabase } from '../config/supabase';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../types';
import { upload } from '../middleware/upload';
import { uploadToSupabaseStorage } from '../services/storage';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { open_only } = req.query;

    let query = supabase
      .from('stores')
      .select('*, packs(*), users:owner_id(id, name, email, profile_image)')
      .order('created_at', { ascending: false });

    if (open_only === 'true') {
      query = query.eq('is_open', true);
    }

    const { data: stores, error } = await query;

    if (error) {
      throw error;
    }

    res.json(stores);
  } catch (error: any) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data: store, error } = await supabase
      .from('stores')
      .select('*, packs(*), users:owner_id(id, name, email, profile_image)')
      .eq('id', id)
      .single();

    if (error || !store) {
      throw Boom.notFound('Store not found');
    }

    res.json(store);
  } catch (error: any) {
    next(error);
  }
});

router.post('/', authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, address, latitude, longitude } = req.body;

    if (!name || !address || latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      throw Boom.badRequest('Missing required fields');
    }

    const { data: store, error } = await supabase
      .from('stores')
      .insert({
        name,
        description,
        address,
        latitude,
        longitude,
        owner_id: req.user!.id,
        is_open: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(store);
  } catch (error: any) {
    next(error);
  }
});

router.put('/my/toggle', authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: store, error: findError } = await supabase
      .from('stores')
      .select('id, is_open')
      .eq('owner_id', req.user!.id)
      .single();

    if (findError || !store) {
      throw Boom.notFound('Store not found');
    }

    const { data: updatedStore, error } = await supabase
      .from('stores')
      .update({ is_open: !store.is_open })
      .eq('id', store.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(updatedStore);
  } catch (error: any) {
    next(error);
  }
});

router.put('/:id', authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, address, latitude, longitude } = req.body;

    const { data: store, error } = await supabase
      .from('stores')
      .update({ name, description, address, latitude, longitude })
      .eq('id', id)
      .eq('owner_id', req.user!.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(store);
  } catch (error: any) {
    next(error);
  }
});

router.get('/my/store', authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('*, packs(*), users:owner_id(id, name, email, profile_image)')
      .eq('owner_id', req.user!.id)
      .single();

    if (error || !store) {
      throw Boom.notFound('Store not found');
    }

    res.json(store);
  } catch (error: any) {
    next(error);
  }
});

router.get('/:id/packs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data: packs, error } = await supabase
      .from('packs')
      .select('*')
      .eq('store_id', id)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    res.json(packs);
  } catch (error: any) {
    next(error);
  }
});

router.post('/my/image', authenticate, requireRole([UserRole.STORE_ADMIN]), upload.single('image'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw Boom.badRequest('No image file provided');
    }

    const { data: store, error: findError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', req.user!.id)
      .single();

    if (findError || !store) {
      throw Boom.notFound('Store not found');
    }

    const localUrl = `/uploads/${req.file.filename}`;
    const supabaseUrl = await uploadToSupabaseStorage(req.file.path, req.file.filename, req.file.mimetype);
    const imageUrl = supabaseUrl || localUrl;

    const { data: updatedStore, error } = await supabase
      .from('stores')
      .update({ image_url: imageUrl })
      .eq('id', store.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ store: updatedStore, imageUrl });
  } catch (error: any) {
    next(error);
  }
});

export default router;
