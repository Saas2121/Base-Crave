import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { ReservationStatus } from '../types';

const router = Router();

function generatePickupCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.post('/', authenticate, requireRole(['consumer']), async (req: AuthRequest, res: Response) => {
  try {
    const { pack_id, quantity } = req.body;

    if (!pack_id || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid pack ID or quantity' });
    }

    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('*')
      .eq('id', pack_id)
      .eq('status', 'active')
      .single();

    if (packError || !pack) {
      return res.status(404).json({ error: 'Pack not found or not available' });
    }

    if (pack.remaining_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }

    const pickupCode = generatePickupCode();

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        user_id: req.user!.id,
        pack_id,
        quantity,
        status: ReservationStatus.RESERVED,
        pickup_code: pickupCode
      })
      .select('*, packs(*), users(id, name, email)')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const newQuantity = pack.remaining_quantity - quantity;
    
    await supabase
      .from('packs')
      .update({ 
        remaining_quantity: newQuantity,
        status: newQuantity <= 0 ? 'sold_out' : 'active'
      })
      .eq('id', pack_id);

    res.status(201).json(reservation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my', authenticate, requireRole(['consumer']), async (req: AuthRequest, res: Response) => {
  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*, packs(*, stores(*))')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(reservations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/store', authenticate, requireRole(['store_admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', req.user!.id)
      .single();

    if (storeError || !store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const { data: packs, error: packsError } = await supabase
      .from('packs')
      .select('id')
      .eq('store_id', store.id);

    if (packsError || !packs || packs.length === 0) {
      return res.json([]);
    }

    const packIds = packs.map(p => p.id);

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*, packs(*), users(id, name, email)')
      .in('pack_id', packIds)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(reservations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('*, packs(*, stores(*))')
      .eq('id', id)
      .single();

    if (error || !reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const isConsumer = reservation.user_id === req.user!.id;
    const isStoreAdmin = req.user!.role === 'store_admin';

    if (isConsumer || isStoreAdmin) {
      return res.json(reservation);
    }

    res.status(403).json({ error: 'Unauthorized' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', authenticate, requireRole(['store_admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('UPDATE STATUS - id:', id, 'status:', status, 'user role:', req.user?.role);

    if (!['in_process', 'ready'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: reservation, error: findError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (findError) {
      console.log('ERROR 1 - findError:', findError);
      return res.status(404).json({ error: 'Reservation not found' });
    }
    if (!reservation) {
      console.log('ERROR 2 - no reservation');
      return res.status(404).json({ error: 'Reservation not found' });
    }

    console.log('Found reservation, status:', reservation.status);

    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('store_id')
      .eq('id', reservation.pack_id)
      .single();

    if (packError) {
      console.log('ERROR 3 - packError:', packError);
      return res.status(500).json({ error: 'Pack not found' });
    }
    if (!pack) {
      console.log('ERROR 4 - no pack');
      return res.status(500).json({ error: 'Pack not found' });
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', pack.store_id)
      .single();

    if (storeError) {
      console.log('ERROR 5 - storeError:', storeError);
      return res.status(500).json({ error: 'Store error' });
    }
    if (!store) {
      console.log('ERROR 6 - no store');
      return res.status(500).json({ error: 'Store not found' });
    }

    console.log('Store owner:', store.owner_id, 'User id:', req.user!.id);

    if (store.owner_id !== req.user!.id) {
      console.log('ERROR 7 - unauthorized');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (status === 'in_process' && reservation.status !== 'reserved') {
      return res.status(400).json({ error: 'Only reserved orders can move to in process' });
    }

    if (status === 'ready' && reservation.status !== 'in_process') {
      return res.status(400).json({ error: 'Only in process orders can move to ready' });
    }

    console.log('Proceeding to update...');

    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select('*, packs(*), users(id, name, email)')
      .single();

    if (error) {
      console.log('ERROR 8 - update error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Success! Updated reservation:', updatedReservation);
    res.json(updatedReservation);
  } catch (error: any) {
    console.error('ERROR 9 - catch:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/verify', authenticate, requireRole(['store_admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { pickup_code } = req.body;

    if (!pickup_code) {
      return res.status(400).json({ error: 'Pickup code required' });
    }

    const { data: reservation, error: findError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('*, stores(*)')
      .eq('id', reservation.pack_id)
      .single();

    if (packError || !pack || pack.stores.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (reservation.pickup_code !== pickup_code) {
      return res.status(400).json({ error: 'Invalid pickup code' });
    }

    if (![ReservationStatus.RESERVED, ReservationStatus.READY].includes(reservation.status)) {
      return res.status(400).json({ error: 'Reservation cannot be verified yet' });
    }

    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update({ status: ReservationStatus.PICKED_UP })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Pickup verified successfully', reservation: updatedReservation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/cancel', authenticate, requireRole(['consumer']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: reservation, error: findError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (findError || !reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status !== ReservationStatus.RESERVED) {
      return res.status(400).json({ error: 'Cannot cancel this reservation' });
    }

    const { error } = await supabase
      .from('reservations')
      .update({ status: ReservationStatus.CANCELLED })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('id, remaining_quantity, total_quantity, status')
      .eq('id', reservation.pack_id)
      .single();

    if (!packError && pack) {
      const nextRemaining = Math.min(pack.total_quantity, pack.remaining_quantity + reservation.quantity);
      const nextStatus = nextRemaining > 0 ? 'active' : pack.status;

      await supabase
        .from('packs')
        .update({ remaining_quantity: nextRemaining, status: nextStatus })
        .eq('id', reservation.pack_id);
    }

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/reject', authenticate, requireRole(['store_admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: reservation, error: findError } = await supabase
      .from('reservations')
      .select('*, packs(*), users(id, name, email)')
      .eq('id', id)
      .single();

    if (findError || !reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('store_id')
      .eq('id', reservation.pack_id)
      .single();

    if (packError || !pack) {
      return res.status(500).json({ error: 'Pack not found' });
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', pack.store_id)
      .single();

    if (storeError || !store || store.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (reservation.status !== 'reserved' && reservation.status !== 'in_process') {
      return res.status(400).json({ error: 'Cannot reject this reservation' });
    }

    await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    const { data: packData, error: packDataError } = await supabase
      .from('packs')
      .select('id, remaining_quantity, total_quantity, status')
      .eq('id', reservation.pack_id)
      .single();

    if (!packDataError && packData) {
      const nextRemaining = Math.min(packData.total_quantity, packData.remaining_quantity + reservation.quantity);
      const nextStatus = nextRemaining > 0 ? 'active' : packData.status;

      await supabase
        .from('packs')
        .update({ remaining_quantity: nextRemaining, status: nextStatus })
        .eq('id', reservation.pack_id);
    }

    res.json({ message: 'Reservation rejected successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
