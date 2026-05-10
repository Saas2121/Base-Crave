import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect } from 'react'
import styles from './Start.module.css'

export default function Start() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/signin'), 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  return (
    <div className={styles.page}>
      <div className={styles.viewport}>
        <div className={styles.gradientBg} />

        <div className={styles.heroContainer}>
          <img src="/images/group-1.svg" alt="logo" className={styles.bagLogo} />
          <span className={styles.craveText}>crave</span>

          <div className={`${styles.bubble} ${styles.bubbleLg} ${styles.bubbleCoffee}`}>
            ☕
          </div>
          <div className={`${styles.bubble} ${styles.bubbleSm} ${styles.bubbleDrumstick}`}>
            🍗
          </div>
          <div className={`${styles.bubble} ${styles.bubbleSm} ${styles.bubbleSalad}`}>
            🥗
          </div>
          <div className={`${styles.bubble} ${styles.bubbleLg} ${styles.bubbleBurger}`}>
            🍔
          </div>
          <div className={`${styles.bubble} ${styles.bubbleSm} ${styles.bubbleCake}`}>
            🍰
          </div>
        </div>

        <div className={styles.bottomBar1} />
        <div className={styles.bottomBar2} />
        <div className={styles.bottomBar3} />

        <div className={styles.loaderWrap}>
          <div className={styles.loaderDot} style={{ animationDelay: '0s' }} />
          <div className={styles.loaderDot} style={{ animationDelay: '0.2s' }} />
          <div className={styles.loaderDot} style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}
