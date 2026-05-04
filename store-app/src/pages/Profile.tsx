import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { storesAPI } from '../api/client'
import { Store } from '../types'
import styles from './Profile.module.css'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [store, setStore] = useState<Store | null>(null)

  useEffect(() => {
    loadStore()
  }, [])

  const loadStore = async () => {
    try {
      const { data } = await storesAPI.getMyStore()
      setStore(data)
    } catch (error) {
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/start')
  }

  const handleToggleOpen = async () => {
    try {
      const { data } = await storesAPI.toggleOpen()
      setStore(data)
    } catch (error) {
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}><h1>Profile</h1></header>

      <div className={styles.content}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>🏪</div>
          <h2>{store?.name || 'Loading...'}</h2>
          <p>{user?.email}</p>
        </div>

        <div className={styles.storeInfo}>
          <h3>Store Details</h3>
          {store && (
            <>
              <p><strong>Address:</strong> {store.address}</p>
              <p><strong>Status:</strong> 
                <span className={`${styles.status} ${store.is_open ? styles.open : styles.closed}`}>
                  {store.is_open ? 'Open' : 'Closed'}
                </span>
              </p>
              <button
                onClick={handleToggleOpen}
                className={styles.toggleButton}
              >
                {store.is_open ? 'Close Store' : 'Open Store'}
              </button>
            </>
          )}
        </div>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
      <BottomNav active="profile" />
    </div>
  )
}
