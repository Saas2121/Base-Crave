import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.get('/', authenticate, requireRole([UserRole.CONSUMER]), async (req: AuthRequest, res: Response) => {
  try {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*, stores(*)')
      .eq('user_id', req.user!.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(favorites);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireRole([UserRole.CONSUMER]), async (req: AuthRequest, res: Response) => {
  try {
    const { store_id } = req.body;

    if (!store_id) {
      return res.status(400).json({ error: 'Store ID required' });
    }

    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('store_id', store_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Store already in favorites' });
    }

    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({ user_id: req.user!.id, store_id })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(favorite);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:store_id', authenticate, requireRole([UserRole.CONSUMER]), async (req: AuthRequest, res: Response) => {
  try {
    const { store_id } = req.params;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('store_id', store_id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Favorite removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
