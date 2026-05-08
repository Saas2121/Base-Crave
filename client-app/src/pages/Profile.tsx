import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import styles from './Profile.module.css'
import BottomNav from '../components/BottomNav'

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
)

const LeafIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
  </svg>
)

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
)

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
)

const QuestionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
)

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/start')
  }

  const menuItems = [
    { icon: <UserIcon />, label: 'Personal Info' },
    { icon: <CreditCardIcon />, label: 'Payment Methods' },
    { icon: <BellIcon />, label: 'Notifications' },
    { icon: <GearIcon />, label: 'Settings' },
    { icon: <QuestionIcon />, label: 'Help Center' },
  ]

  return (
    <div className={styles.appContainer}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Profile</h1>
          <button className={styles.editBtn}>
            <EditIcon />
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.userInfoRow}>
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
                  {(user?.name || 'User').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className={styles.userDetails}>
              <h2>{user?.name || 'Mariana'}</h2>
              <p className={styles.userLocation}>Cali, Colombia</p>
              <p className={styles.userMemberSince}>Member since 2024</p>
            </div>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.heroBadge}>
              <LeafIcon />
              Food Hero
            </div>
            
            <div className={styles.statsGrid}>
              <div className={styles.statColumn}>
                <span className={styles.statValue}>6</span>
                <span className={styles.statLabel}>Orders</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statColumn}>
                <span className={styles.statValue}>12</span>
                <span className={styles.statLabel}>Items Saved</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statColumn}>
                <span className={styles.statValue}>4.8</span>
                <span className={styles.statLabel}>CO2 Saved</span>
              </div>
            </div>
          </div>

          <div className={styles.menuList}>
            {menuItems.map((item, index) => (
              <button key={index} className={styles.menuItem}>
                <div className={styles.menuItemLeft}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ChevronRightIcon />
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogoutIcon />
            <span>Log Out</span>
          </button>
        </div>
        <BottomNav active="profile" />
      </div>
    </div>
  )
}
