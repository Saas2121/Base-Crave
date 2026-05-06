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

        <img src="/images/group-1.svg" alt="" className={styles.assetGroup} />

        <div className={styles.ellipseWrap1}>
          <img src="/images/ellipse-3.svg" alt="" />
          <span className={styles.emoji1}>🍗</span>
        </div>
        <div className={styles.ellipseWrap2}>
          <img src="/images/ellipse-17.svg" alt="" />
          <span className={styles.emoji2}>☕</span>
        </div>
        <div className={styles.ellipseWrap3}>
          <img src="/images/ellipse-4.svg" alt="" />
          <span className={styles.emoji3}>🍰</span>
        </div>
        <div className={styles.ellipseWrap4}>
          <img src="/images/ellipse-5.svg" alt="" />
          <span className={styles.emoji4}>🥗</span>
        </div>
        <div className={styles.ellipseWrap5}>
          <img src="/images/ellipse-17.svg" alt="" />
          <span className={styles.emoji5}>🍔</span>
        </div>

        <div className={styles.bottomBar1} />
        <div className={styles.bottomBar2} />
        <div className={styles.bottomBar3} />
      </div>
    </div>
  )
}
