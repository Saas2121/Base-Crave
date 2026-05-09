import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { UserRole, PackType, PackStatus } from '../types';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: pack, error } = await supabase
      .from('packs')
      .select('*, stores(*)')
      .eq('id', id)
      .single();

    if (error || !pack) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    res.json(pack);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      pack_type,
      price,
      original_price,
      pickup_start,
      pickup_end,
      total_quantity
    } = req.body;

    const parsedPrice = Number(price);
    const parsedOriginalPrice = original_price === null || original_price === undefined || original_price === ''
      ? null
      : Number(original_price);
    const parsedTotalQuantity = Number(total_quantity);

    if (!title || !pack_type || !pickup_start || !pickup_end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    if (parsedOriginalPrice !== null && (!Number.isFinite(parsedOriginalPrice) || parsedOriginalPrice <= 0)) {
      return res.status(400).json({ error: 'Invalid original price' });
    }

    if (!Number.isFinite(parsedTotalQuantity) || parsedTotalQuantity < 1) {
      return res.status(400).json({ error: 'Invalid total quantity' });
    }

    if (!Object.values(PackType).includes(pack_type)) {
      return res.status(400).json({ error: 'Invalid pack type' });
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', req.user!.id)
      .single();

    if (storeError || !store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const { data: pack, error } = await supabase
      .from('packs')
      .insert({
        store_id: store.id,
        title,
        description,
        pack_type,
        price: parsedPrice,
        original_price: parsedOriginalPrice,
        pickup_start,
        pickup_end,
        total_quantity: parsedTotalQuantity,
        remaining_quantity: parsedTotalQuantity,
        status: PackStatus.ACTIVE
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(pack);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: pack, error: findError } = await supabase
      .from('packs')
      .select('*, stores!inner(owner_id)')
      .eq('id', id)
      .single();

    if (findError || !pack || pack.stores.owner_id !== req.user!.id) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    const allowedFields = ['title', 'description', 'price', 'original_price', 'total_quantity', 'remaining_quantity', 'pickup_start', 'pickup_end', 'status'];
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.price !== undefined) {
      const p = Number(updates.price);
      if (!Number.isFinite(p) || p <= 0) {
        return res.status(400).json({ error: 'Invalid price' });
      }
      updates.price = p;
    }
    if (updates.original_price !== undefined) {
      if (updates.original_price === null || updates.original_price === '') {
        updates.original_price = null;
      } else {
        const op = Number(updates.original_price);
        if (!Number.isFinite(op) || op <= 0) {
          return res.status(400).json({ error: 'Invalid original price' });
        }
        updates.original_price = op;
      }
    }
    if (updates.total_quantity !== undefined) {
      const tq = Number(updates.total_quantity);
      if (!Number.isFinite(tq) || tq < 1) {
        return res.status(400).json({ error: 'Invalid total quantity' });
      }
      updates.total_quantity = tq;
    }
    if (updates.remaining_quantity !== undefined) {
      const rq = Number(updates.remaining_quantity);
      if (!Number.isFinite(rq) || rq < 0) {
        return res.status(400).json({ error: 'Invalid remaining quantity' });
      }
      updates.remaining_quantity = rq;
    }
    if (updates.status !== undefined) {
      if (!Object.values(PackStatus).includes(updates.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
    }

    const { data: updatedPack, error } = await supabase
      .from('packs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(updatedPack);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/upload-image', upload.single('image'), authenticate, requireRole([UserRole.STORE_ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { data: pack, error: findError } = await supabase
      .from('packs')
      .select('*, stores!inner(owner_id)')
      .eq('id', id)
      .single();

    if (findError || !pack || pack.stores.owner_id !== req.user!.id) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const { data: updatedPack, error } = await supabase
      .from('packs')
      .update({ image_url: imageUrl })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ pack: updatedPack, imageUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireRole(['store_admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: pack, error: findError } = await supabase
      .from('packs')
      .select('*, stores!inner(owner_id)')
      .eq('id', id)
      .single();

    if (findError || !pack || pack.stores.owner_id !== req.user!.id) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    const { error } = await supabase
      .from('packs')
      .update({ status: PackStatus.EXPIRED })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Pack deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
