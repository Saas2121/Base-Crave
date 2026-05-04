import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reservationsAPI } from '../api/client'
import { Reservation } from '../types'
import styles from './ViewQRCode.module.css'

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>
  if (!reservation) return <div className={styles.container}>Reservation not found</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backButton}>←</button>
        <h1>Pickup Code</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.qrCard}>
          <div className={styles.qrPlaceholder}>
            <div className={styles.qrCode}>{reservation.pickup_code}</div>
          </div>
          <h2>{reservation.packs?.title}</h2>
          <p>Quantity: {reservation.quantity}</p>
          <p className={styles.storeName}>{reservation.packs?.stores?.name}</p>
          <div className={styles.instructions}>
            <p>🏪 Show this code at the store</p>
            <p>📍 {reservation.packs?.stores?.address}</p>
          </div>
          <button
            className={styles.doneButton}
            onClick={() => navigate('/')}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
