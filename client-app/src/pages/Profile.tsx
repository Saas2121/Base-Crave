import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { reservationsAPI, Reservation } from '../api/client'
import styles from './Profile.module.css'
import BottomNav from '../components/BottomNav'

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
)

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const BoxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

function formatPrice(price: number) {
  return `$${price.toLocaleString('es-CO')}`
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'April 2, 2026'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return 'April 2, 2026'
  }
}

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

  // Filter only active reservations
  const activeReservations = reservations.filter((res: Reservation) => 
    ['reserved', 'in_process', 'ready'].includes(res.status)
  )

  // Calculate stats based on real data
  const resCount = activeReservations.length
  const favsCount = 0
  const savedAmount = '$0'

  const displayReservations = activeReservations.length > 0 ? activeReservations : []

  return (
    <div className={styles.appContainer}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Profile</h1>
        </header>

        <div className={styles.content}>
          
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileTop}>
              <div className={styles.avatarWrapper}>
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user?.name || 'Profile'}
                    className={styles.avatarImg}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) parent.classList.add(styles.avatarFallback);
                    }}
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {(user?.name || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.profileInfo}>
                <h2>{user?.name || 'Sarah Hinestroza'}</h2>
                <div className={styles.infoRow}>
                  <MailIcon />
                  <span>{user?.email || 'sarah.Hines@gmail.com'}</span>
                </div>
                <div className={styles.infoRow}>
                  <PinIcon />
                  <span>Cali, Colombia</span>
                </div>
              </div>
            </div>
            
            <div className={styles.divider}></div>
            
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{resCount}</span>
                <span className={styles.statLabel}>Reservations</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{favsCount}</span>
                <span className={styles.statLabel}>Favorites</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{savedAmount}</span>
                <span className={styles.statLabel}>Saved</span>
              </div>
            </div>
          </div>

          {/* Recent Reservations */}
          <div className={styles.sectionHeader}>
            <BoxIcon />
            <h3>Recent Reservations</h3>
          </div>

          <div className={styles.reservationsList}>
            {loading && reservations.length === 0 ? (
              <p className={styles.loadingText}>Loading...</p>
            ) : (
              displayReservations.map((res, index) => (
                <div key={res.id || index} className={styles.resCard} onClick={() => navigate(`/reservation/${res.id}`)}>
                  <div className={styles.resLeft}>
                    <h4>{res.packs?.stores?.name || 'Store'}</h4>
                    <p>{formatDate(res.packs?.pickup_start)}</p>
                  </div>
                  <div className={styles.resRight}>
                    <span className={styles.resPrice}>{formatPrice(res.packs?.price || 15000)}</span>
                    <span className={styles[`status_${res.status}`]}>
                      {res.status === 'reserved' ? 'Pending' : 
                       res.status === 'in_process' ? 'In Progress' : 
                       res.status === 'ready' ? 'Ready' : 
                       res.status === 'picked_up' ? 'Completed' : 
                       res.status.charAt(0).toUpperCase() + res.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronRightIcon />
                </div>
              ))
            )}
          </div>

          <button onClick={handleLogout} className={styles.logoutButton}>
            Log Out
          </button>
        </div>
        <BottomNav active="profile" />
      </div>
    </div>
  )
}
