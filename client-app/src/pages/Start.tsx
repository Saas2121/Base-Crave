import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import styles from './Start.module.css'

export default function Start() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>CRAVE</h1>
          <p className={styles.subtitle}>Eco-friendly food discovery</p>
        </div>
        <div className={styles.buttons}>
          <button
            className={styles.primaryButton}
            onClick={() => navigate('/signin')}
          >
            Sign In
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}
