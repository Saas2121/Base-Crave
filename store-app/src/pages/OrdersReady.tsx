import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reservationsAPI } from '../api/client'
import { Reservation } from '../types'
import BottomNav from '../components/BottomNav'
import styles from './Orders.module.css'

const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function OrdersReady() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Reservation | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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

  const ready = reservations.filter(r => r.status === 'ready')

  const openCodeInput = (order: Reservation) => {
    setCurrentOrder(order)
    setCodeInput('')
    setCodeError('')
    setShowCodeInput(true)
  }

  const closeCodeInput = () => {
    setShowCodeInput(false)
    setCurrentOrder(null)
    setCodeInput('')
    setCodeError('')
  }

  const handleVerifyCode = async () => {
    if (!currentOrder || !codeInput.trim()) return

    setVerifying(true)
    setCodeError('')

    try {
      await reservationsAPI.verify(currentOrder.id, codeInput.trim().toUpperCase())
      setShowCodeInput(false)
      setShowSuccess(true)
      loadReservations()
    } catch (err: any) {
      setCodeError('Código incorrecto. Intenta de nuevo.')
    } finally {
      setVerifying(false)
    }
  }

  const closeSuccess = () => {
    setShowSuccess(false)
    setCurrentOrder(null)
    setCodeInput('')
  }

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
    const packTitle = res.packs?.title || (res.packs?.pack_type === 'surprise' ? 'Surprise Pack' : 'Pack')
    const customerName = res.users?.name || 'Customer'
    const price = res.packs?.price || 0
    const pickupTime = formatTime(res.packs?.pickup_start || '')

    return (
      <div key={res.id} className={styles.card}>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className={styles.packageName}>{packTitle}</div>
              <span className={styles.quantityBadge}>x{res.quantity}</span>
            </div>
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
          <button className={styles.scanBtn} onClick={() => openCodeInput(res)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Enter Code
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
          <div className={styles.filterBtn} onClick={() => navigate('/orders/in-progress')}>
            <span>In Progress</span>
          </div>
          <div className={`${styles.filterBtn} ${styles.filterBtnActive}`}>
            <span>Ready</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : ready.length === 0 ? (
        <div className={styles.empty}>
          <p>No orders ready for pickup</p>
        </div>
      ) : (
        <div className={styles.cardsContainer}>
          {ready.map(res => renderOrderCard(res))}
        </div>
      )}

      {showCodeInput && currentOrder && (
        <div className={styles.modalOverlay} onClick={closeCodeInput}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Enter Pickup Code</h3>
              <button className={styles.closeBtn} onClick={closeCodeInput}>
                <XIcon />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.modalSubtitle}>
                Ask the customer for their pickup code
              </p>
              <input
                type="text"
                className={styles.codeInput}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                autoFocus
              />
              {codeError && <p className={styles.codeError}>{codeError}</p>}
              <button
                className={styles.verifyBtn}
                onClick={handleVerifyCode}
                disabled={verifying || codeInput.length < 4}
              >
                {verifying ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && currentOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.successIcon}>
                <CheckIcon />
              </div>
              <h3>Order Completed!</h3>
              <p className={styles.successSubtitle}>
                The order has been successfully delivered
              </p>
              <button className={styles.doneBtn} onClick={closeSuccess}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: '60px' }} />
      <BottomNav active="orders" />
    </div>
  )
}