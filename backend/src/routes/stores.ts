import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { open_only } = req.query;

    let query = supabase
      .from('stores')
      .select('*, packs(*)')
      .order('created_at', { ascending: false });

    if (open_only === 'true') {
      query = query.eq('is_open', true);
    }

    const { data: stores, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: store, error } = await supabase
      .from('stores')
      .select('*, packs(*)')
      .eq('id', id)
      .single();

    if (error || !store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, address, latitude, longitude } = req.body;

    if (!name || !address || latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(store);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/my/toggle', authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { data: store, error: findError } = await supabase
      .from('stores')
      .select('id, is_open')
      .eq('owner_id', req.user!.id)
      .single();

    if (findError || !store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const { data: updatedStore, error } = await supabase
      .from('stores')
      .update({ is_open: !store.is_open })
      .eq('id', store.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(updatedStore);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my/store', authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('*, packs(*)')
      .eq('owner_id', req.user!.id)
      .single();

    if (error || !store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/packs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: packs, error } = await supabase
      .from('packs')
      .select('*')
      .eq('store_id', id)
      .eq('status', 'active');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(packs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
