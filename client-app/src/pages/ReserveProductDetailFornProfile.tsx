import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reservationsAPI } from '../api/client'
import { Reservation } from '../types'
import styles from './ReserveProductDetailFornProfile.module.css'

export default function ReserveProductDetailFornProfile() {
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
        <button onClick={() => navigate('/profile')} className={styles.backButton}>←</button>
        <h1>Reservation Detail</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.detailCard}>
          <h2>{reservation.packs?.title}</h2>
          
          <div className={styles.detailRow}>
            <span>Quantity:</span>
            <span>{reservation.quantity}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span>Total Price:</span>
            <span>${(reservation.packs?.price || 0) * reservation.quantity}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span>Status:</span>
            <span className={`${styles.status} ${styles[reservation.status]}`}>
              {reservation.status}
            </span>
          </div>
          
          <div className={styles.detailRow}>
            <span>Pickup Code:</span>
            <span className={styles.code}>{reservation.pickup_code}</span>
          </div>

          {reservation.packs?.stores && (
            <div className={styles.storeInfo}>
              <h3>Store Info</h3>
              <p>{reservation.packs.stores.name}</p>
              <p>{reservation.packs.stores.address}</p>
            </div>
          )}

          <button
            className={styles.backToProfile}
            onClick={() => navigate('/profile')}
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  )
}
