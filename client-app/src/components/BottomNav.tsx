import { useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.css'

type Tab = 'home' | 'search' | 'favorites' | 'profile'

interface BottomNavProps {
  active: Tab
}

export default function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate()

  return (
    <nav className={styles.nav}>
      <button className={`${styles.item} ${active === 'home' ? styles.active : ''}`} onClick={() => navigate('/')}>
        <span>Home</span>
      </button>
      <button className={`${styles.item} ${active === 'search' ? styles.active : ''}`} onClick={() => navigate('/search/list')}>
        <span>Search</span>
      </button>
      <button className={`${styles.item} ${active === 'favorites' ? styles.active : ''}`} onClick={() => navigate('/favorites')}>
        <span>Favorites</span>
      </button>
      <button className={`${styles.item} ${active === 'profile' ? styles.active : ''}`} onClick={() => navigate('/profile')}>
        <span>Profile</span>
      </button>
    </nav>
  )
}
