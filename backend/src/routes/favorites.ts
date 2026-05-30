import { Router, Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import { supabase } from '../config/supabase';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.get('/', authenticate, requireRole([UserRole.CONSUMER]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*, stores(*)')
      .eq('user_id', req.user!.id);

    if (error) {
      throw error;
    }

    res.json(favorites);
  } catch (error: any) {
    next(error);
  }
});

router.post('/', authenticate, requireRole([UserRole.CONSUMER]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { store_id } = req.body;

    if (!store_id) {
      throw Boom.badRequest('Store ID required');
    }

    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('store_id', store_id)
      .single();

    if (existing) {
      throw Boom.badRequest('Store already in favorites');
    }

    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({ user_id: req.user!.id, store_id })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(favorite);
  } catch (error: any) {
    next(error);
  }
});

router.delete('/:store_id', authenticate, requireRole([UserRole.CONSUMER]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { store_id } = req.params;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('store_id', store_id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Favorite removed successfully' });
  } catch (error: any) {
    next(error);
  }
});

export default router;
