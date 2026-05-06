import { useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.css'

type Tab = 'home' | 'search' | 'favorites' | 'profile'

function NavIcon({ name, active }: { name: Tab; active: boolean }) {
  const stroke = active ? '#f95519' : '#99a1af'
  switch (name) {
    case 'home':
      return (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 'search':
      return (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    case 'favorites':
      return (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
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
            <NavIcon name="home" active={active === 'home'} />
            <div className={styles.bottomnav2}>
              <div className={styles.home}>Home</div>
            </div>
          </button>
          <button className={styles.link2} onClick={() => navigate('/search/list')}>
            <NavIcon name="search" active={active === 'search'} />
            <div className={styles.bottomnav3}>
              <div className={styles.search}>Search</div>
            </div>
          </button>
          <button className={styles.link3} onClick={() => navigate('/favorites')}>
            <NavIcon name="favorites" active={active === 'favorites'} />
            <div className={styles.bottomnav4}>
              <div className={styles.favorites}>Favorites</div>
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