import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reservationsAPI } from '../api/client'
import { Reservation } from '../types'
import styles from './ViewQRCode.module.css'

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const MapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

function formatTimeRange(startStr?: string, endStr?: string) {
  if (!startStr || !endStr) return ''
  try {
    const start = new Date(startStr)
    const end = new Date(endStr)
    const formatTime = (d: Date) => {
      let h = d.getHours()
      const ampm = h >= 12 ? 'PM' : 'AM'
      h = h % 12 || 12
      return `${h}:00 ${ampm}`
    }
    return `${formatTime(start)} - ${formatTime(end)}`
  } catch (e) {
    return ''
  }
}

export default function ViewQRCode() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadReservation(id)
    }
  }, [id])

  const loadReservation = async (resId: string) => {
    try {
      const { data } = await reservationsAPI.getMy()
      const found = data.find(r => r.id === resId)
      if (found) {
        setReservation(found)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.appContainer}>
        <div className={styles.container}>
          <div className={styles.loadingText}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className={styles.appContainer}>
        <div className={styles.container}>
          <div className={styles.loadingText}>Reservation not found</div>
        </div>
      </div>
    )
  }

  const storeName = reservation.packs?.stores?.name || 'Store'
  const packTitle = reservation.packs?.pack_type === 'surprise' ? 'Surprise pack' : reservation.packs?.title
  const pickupStart = reservation.packs?.pickup_start
  const pickupEnd = reservation.packs?.pickup_end
  const pickupCode = reservation.pickup_code || '---'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pickupCode}`

  // Format code to insert a dash if it's long enough, e.g. "A4B - 920"
  let formattedCode = pickupCode
  if (pickupCode.length === 6) {
    formattedCode = `${pickupCode.slice(0, 3)} - ${pickupCode.slice(3)}`
  }

  return (
    <div className={styles.appContainer}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerLeft}></div>
          <h1 className={styles.headerTitle}>Pick-up code</h1>
          <button onClick={() => navigate('/')} className={styles.closeButton}>
            <CloseIcon />
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.qrCard}>
            <p className={styles.instructionText}>Show this code to the restaurant</p>
            
            <div className={styles.qrWrapper}>
              <img src={qrUrl} alt="QR Code" className={styles.qrImage} />
            </div>
            
            <div className={styles.codeText}>{formattedCode}</div>
            
            <p className={styles.statusText}>Status: <span className={styles.statusValue}>{reservation.status.replace('_', ' ').charAt(0).toUpperCase() + reservation.status.slice(1).replace('_', ' ')}</span></p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoRowMain}>
              <span className={styles.storeName}>{storeName}</span>
              <button className={styles.mapButton}>
                <MapIcon />
              </button>
            </div>
            <div className={styles.infoRowSub}>
              <span className={styles.packType}>{packTitle}</span>
              <span className={styles.pickupTime}>Pick up today, {formatTimeRange(pickupStart, pickupEnd)}</span>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <button 
            className={styles.cancelButton}
            onClick={() => {
              // API call to cancel could be added here
              navigate('/')
            }}
          >
            Cancel reservation
          </button>
        </div>
      </div>
    </div>
  )
}
