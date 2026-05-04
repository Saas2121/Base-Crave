import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { reservationsAPI } from '../api/client'
import { Reservation } from '../types'
import styles from './Profile.module.css'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      const { data } = await reservationsAPI.getMy()
      setReservations(data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/start')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Profile</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>👤</div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className={styles.role}>{user?.role}</span>
        </div>

        <section className={styles.reservationsSection}>
          <h3>My Reservations</h3>
          {loading ? (
            <p>Loading...</p>
          ) : reservations.length === 0 ? (
            <p className={styles.empty}>No reservations yet</p>
          ) : (
            <div className={styles.reservationsList}>
              {reservations.map((res) => (
                <div key={res.id} className={styles.reservationCard}>
                  <div className={styles.resInfo}>
                    <h4>{res.packs?.title}</h4>
                    <p>Qty: {res.quantity}</p>
                    <p className={styles.pickupCode}>Code: {res.pickup_code}</p>
                  </div>
                  <span className={`${styles.status} ${styles[res.status]}`}>
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
      <BottomNav active="profile" />
    </div>
  )
}
