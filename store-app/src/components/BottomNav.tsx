import { useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.css'

type Tab = 'dashboard' | 'packs' | 'orders' | 'profile'

function NavIcon({ name, active }: { name: Tab; active: boolean }) {
  const stroke = active ? '#f95519' : '#99a1af'
  switch (name) {
    case 'dashboard':
      return (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    case 'packs':
      return (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.5 9.4l-9-5.19" />
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    case 'orders':
      return (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      )
    case 'profile':
      return (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
  }
}

export default function BottomNav({ active }: { active: Tab }) {
  const navigate = useNavigate()
  return (
    <div className={styles.navStore}>
      <div className={styles.navStoreChild} />
      <div className={styles.bottomnav}>
        <div className={styles.container}>
          <button className={styles.link} onClick={() => navigate('/')}>
            <NavIcon name="dashboard" active={active === 'dashboard'} />
            <div className={styles.bottomnav2}>
              <div className={styles.home}>Home</div>
            </div>
          </button>
          <button className={styles.link2} onClick={() => navigate('/packs')}>
            <NavIcon name="packs" active={active === 'packs'} />
            <div className={styles.bottomnav3}>
              <div className={styles.packs}>Packs</div>
            </div>
          </button>
          <button className={styles.link3} onClick={() => navigate('/orders')}>
            <NavIcon name="orders" active={active === 'orders'} />
            <div className={styles.bottomnav4}>
              <div className={styles.orders}>Orders</div>
            </div>
          </button>
          <button className={styles.link4} onClick={() => navigate('/profile')}>
            <NavIcon name="profile" active={active === 'profile'} />
            <div className={styles.bottomnav5}>
              <div className={styles.profile}>Profile</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
