import { useMemo, useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { packsAPI, reservationsAPI } from '../api/client'
import { PackType } from '../types'
import styles from './Dashboard.module.css'
import BottomNav from '../components/BottomNav'

type PackKind = 'fixed' | 'surprise'

export default function Dashboard() {
  const { logout } = useAuthStore()
  const [packs, setPacks] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [packType, setPackType] = useState<PackKind>('fixed')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [totalQuantity, setTotalQuantity] = useState('')
  const [pickupStart, setPickupStart] = useState('')
  const [pickupEnd, setPickupEnd] = useState('')
  const [imageName, setImageName] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const load = async () => {
    const [packsData, ordersRes] = await Promise.all([
      packsAPI.getByStore(),
      reservationsAPI.getStore(),
    ])
    setPacks(packsData)
    setOrders(ordersRes.data)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 12000)
    return () => clearInterval(interval)
  }, [])

  const activePacks = packs.filter((p) => p.status === 'active').length
  const soldToday = orders.filter((o) => o.status === 'picked_up').length
  const revenue = useMemo(
    () => orders.filter((o) => o.status === 'picked_up').reduce((acc, o) => acc + ((o.packs?.price || 0) * o.quantity), 0),
    [orders]
  )

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPrice('')
    setOriginalPrice('')
    setTotalQuantity('')
    setPickupStart('')
    setPickupEnd('')
    setImageName('')
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    setCreating(true)
    try {
      await packsAPI.create({
        title: packType === 'surprise' ? 'Surprise pack' : title,
        description: packType === 'surprise' ? null : description,
        pack_type: packType === 'surprise' ? PackType.SURPRISE : PackType.FIXED,
        price: Number(price),
        original_price: originalPrice ? Number(originalPrice) : null,
        total_quantity: packType === 'surprise' ? 1 : Number(totalQuantity),
        pickup_start: new Date(pickupStart).toISOString(),
        pickup_end: new Date(pickupEnd).toISOString(),
      })
      setSuccess('Se creo con exito')
      resetForm()
      await load()
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo crear el pack')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Create and manage your packs</p>
          </div>
          <button className={styles.logoutButton} onClick={logout}>Logout</button>
        </div>
      </header>

      <section className={styles.stats}>
        <div className={styles.statCard}><span className={styles.statValue}>{activePacks}</span><span className={styles.statLabel}>Active Packs</span></div>
        <div className={styles.statCard}><span className={styles.statValue}>{soldToday}</span><span className={styles.statLabel}>Sold Today</span></div>
        <div className={styles.statCard}><span className={styles.statValue}>${revenue}</span><span className={styles.statLabel}>Revenue</span></div>
      </section>

      <section className={styles.formSection}>
        <h3>Create Pack</h3>
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.fileLabel}>
            Add image
            <input type="file" accept="image/*" onChange={(e) => setImageName(e.target.files?.[0]?.name || '')} />
          </label>
          {imageName && <p className={styles.fileName}>{imageName}</p>}

          <div className={styles.switchRow}>
            <button type="button" className={`${styles.switchBtn} ${packType === 'fixed' ? styles.switchActive : ''}`} onClick={() => setPackType('fixed')}>Fixed</button>
            <button type="button" className={`${styles.switchBtn} ${packType === 'surprise' ? styles.switchActive : ''}`} onClick={() => setPackType('surprise')}>Surprise</button>
          </div>

          {packType === 'fixed' && (
            <>
              <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pack title" required />
              <textarea className={styles.input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Pack description" rows={3} />
              <input className={styles.input} type="number" min={1} value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} placeholder="Cantidad" required />
            </>
          )}

          <input className={styles.input} type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required />
          <input className={styles.input} type="number" min={1} value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="Original price (optional)" />
          <div className={styles.row}>
            <input className={styles.input} type="datetime-local" value={pickupStart} onChange={(e) => setPickupStart(e.target.value)} required />
            <input className={styles.input} type="datetime-local" value={pickupEnd} onChange={(e) => setPickupEnd(e.target.value)} required />
          </div>

          {success && <p className={styles.success}>{success}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.createBtn} type="submit" disabled={creating}>{creating ? 'Creating...' : 'Crear pack'}</button>
        </form>
      </section>
      <BottomNav active="dashboard" />
    </div>
  )
}
