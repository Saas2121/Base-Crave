import { useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.css'

type Tab = 'dashboard' | 'packs' | 'orders' | 'profile'

export default function BottomNav({ active }: { active: Tab }) {
  const navigate = useNavigate()
  return (
    <nav className={styles.nav}>
      <button className={`${styles.item} ${active === 'dashboard' ? styles.active : ''}`} onClick={() => navigate('/')}>Dashboard</button>
      <button className={`${styles.item} ${active === 'packs' ? styles.active : ''}`} onClick={() => navigate('/packs')}>Packs</button>
      <button className={`${styles.item} ${active === 'orders' ? styles.active : ''}`} onClick={() => navigate('/orders')}>Orders</button>
      <button className={`${styles.item} ${active === 'profile' ? styles.active : ''}`} onClick={() => navigate('/profile')}>Profile</button>
    </nav>
  )
}
