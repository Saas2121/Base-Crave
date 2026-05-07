import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { reservationsAPI } from '../api/client'
import { Reservation } from '../types'
import BottomNav from '../components/BottomNav'
import styles from './Orders.module.css'

export default function OrdersInProgress() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReservations()
    const interval = setInterval(loadReservations, 12000)
    return () => clearInterval(interval)
  }, [])

  const loadReservations = async () => {
    try {
      const { data } = await reservationsAPI.getStore()
      setReservations(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const inProgress = reservations.filter(r => r.status === 'in_process')

  const handleMarkReady = useCallback(async (id: string) => {
    try {
      await reservationsAPI.updateStatus(id, 'ready')
      loadReservations()
    } catch {
      // silently fail
    }
  }, [])

  const formatTime = (iso: string) => {
    if (!iso) return '12-5 PM'
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

  const renderOrderCard = (res: Reservation) => {
    const packTitle = res.packs?.title || 'Pack'
    const customerName = res.users?.name || 'Customer'
    const price = res.packs?.price || 0
    const pickupTime = formatTime(res.packs?.pickup_start || '')

    return (
      <div key={res.id} className={styles.card}>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <div className={styles.packageName}>{packTitle}</div>
            <div className={styles.price}>{formatPrice(price)}</div>
          </div>
          <div className={styles.orderId}>Order {res.id.slice(0, 8)}</div>
          <div className={styles.customerInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Customer</span>
              <span className={styles.infoValue}>{customerName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Pickup Time</span>
              <span className={styles.infoValue}>{pickupTime}</span>
            </div>
          </div>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.readyBtn} onClick={() => handleMarkReady(res.id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Mark as Ready
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.orders}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>Orders</div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.containerFilter}>
          <div className={styles.filterBtn} onClick={() => navigate('/orders')}>
            <span>Pending</span>
          </div>
          <div className={`${styles.filterBtn} ${styles.filterBtnActive}`}>
            <span>In Progress</span>
          </div>
          <div className={styles.filterBtn} onClick={() => navigate('/orders/ready')}>
            <span>Ready</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : inProgress.length === 0 ? (
        <div className={styles.empty}>
          <p>No orders in progress</p>
        </div>
      ) : (
        <div className={styles.cardsContainer}>
          {inProgress.map(res => renderOrderCard(res))}
        </div>
      )}

      <BottomNav active="orders" />
    </div>
  )
}
