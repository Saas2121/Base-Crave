import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { packsAPI } from '../api/client'
import styles from './Packs.module.css'
import BottomNav from '../components/BottomNav'

export default function Packs() {
  const navigate = useNavigate()
  const [packs, setPacks] = useState<any[]>([])
  const [view, setView] = useState<'active' | 'sold'>('active')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPacks()
  }, [])

  const loadPacks = async () => {
    try {
      const data = await packsAPI.getByStore()
      setPacks(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this pack?')) return
    try {
      await packsAPI.delete(id)
      setPacks(packs.filter(p => p.id !== id))
    } catch {
      // silently fail
    }
  }, [packs])

  const handleToggleStatus = useCallback(async (pack: any) => {
    try {
      const newStatus = pack.status === 'active' ? 'sold_out' : 'active'
      await packsAPI.update(pack.id, { status: newStatus })
      setPacks(packs.map(p => p.id === pack.id ? { ...p, status: newStatus } : p))
    } catch {
      // silently fail
    }
  }, [packs])

  const activePacks = packs.filter(p => p.status === 'active')
  const soldPacks = packs.filter(p => p.status === 'sold_out' || (p.total_quantity - p.remaining_quantity) > 0)
  const displayedPacks = view === 'active' ? activePacks : soldPacks

  const formatTime = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const h = d.getHours()
    const m = String(d.getMinutes()).padStart(2, '0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayH = h % 12 === 0 ? 12 : h % 12
    return `${displayH}:${m} ${ampm}`
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO')}`
  }

  const getCategory = (pack: any) => {
    if (pack.pack_type === 'surprise') return 'Surprise'
    if (pack.title?.toLowerCase().includes('chicken') || pack.title?.toLowerCase().includes('meal')) return 'Meals'
    if (pack.title?.toLowerCase().includes('frozen') || pack.title?.toLowerCase().includes('dessert') || pack.title?.toLowerCase().includes('cake')) return 'Desserts'
    return 'Pack'
  }

  const getProgress = (pack: any) => {
    const total = pack.total_quantity || 1
    const remaining = pack.remaining_quantity ?? total
    const sold = total - remaining
    const pct = Math.round((sold / total) * 100)
    return { sold, total, pct }
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardChild} />
      <div className={styles.header}>
        <div className={styles.headerTitle}>Packs</div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.containerFilter}>
          <div className={`${styles.filterBtn} ${view === 'active' ? styles.filterBtnActive : ''}`} onClick={() => setView('active')}>
            <span>Active</span>
          </div>
          <div className={`${styles.filterBtn} ${view === 'sold' ? styles.filterBtnActive : ''}`} onClick={() => setView('sold')}>
            <span>Sold Out</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : displayedPacks.length === 0 ? (
        <div className={styles.empty}>
          <p>No {view === 'active' ? 'active' : 'sold out'} packs</p>
          {view === 'active' && (
            <button onClick={() => navigate('/dashboard/fixed')} className={styles.createBtn}>Create your first pack</button>
          )}
        </div>
      ) : (
        <div className={styles.cardsContainer}>
          {displayedPacks.map((pack) => {
            const { sold, total, pct } = getProgress(pack)
            return (
              <div key={pack.id} className={styles.card}>
                <div className={styles.cardImageContainer}>
                  {pack.image_url ? (
                    <img className={styles.cardImage} src={pack.image_url} alt={pack.title || 'Pack'} />
                  ) : (
                    <img className={styles.cardImage} src="/images/image-placeholder.svg" alt="" />
                  )}
                  <div className={styles.categoryBadge}>{getCategory(pack)}</div>
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} onClick={() => handleToggleStatus(pack)}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleDelete(pack.id)}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>{pack.title || (pack.pack_type === 'surprise' ? 'Surprise pack' : 'Pack')}</div>
                  <div className={styles.cardPrice}>{formatPrice(pack.price)}</div>
                  <div className={styles.cardDetails}>
                    <div className={styles.detailItem}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                      <span>{pack.pickup_start ? formatTime(pack.pickup_start) : '12-5 PM'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                      <span>0.6 km</span>
                    </div>
                  </div>
                  <div className={styles.availabilityRow}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 18H4V4h8v16zm1 0h8V4h-8v16z"/></svg>
                    <span>Availability {sold} / {total}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <BottomNav active="packs" />
    </div>
  )
}
