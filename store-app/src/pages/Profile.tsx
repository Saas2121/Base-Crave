import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { storesAPI, packsAPI, reservationsAPI } from '../api/client'
import { Store } from '../types'
import styles from './Profile.module.css'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [store, setStore] = useState<Store | null>(null)
  const [totalPacks, setTotalPacks] = useState(0)
  const [saved, setSaved] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [storeRes, packsData, ordersRes] = await Promise.all([
        storesAPI.getMyStore(),
        packsAPI.getByStore(),
        reservationsAPI.getStore(),
      ])
      setStore(storeRes.data)
      setTotalPacks(packsData.length)
      const totalRevenue = ordersRes.data
        .filter((o: any) => o.status === 'picked_up')
        .reduce((acc: number, o: any) => acc + ((o.packs?.price || 0) * o.quantity), 0)
      setSaved(totalRevenue)
    } catch {
      // silently fail
    }
  }

  const handleLogout = useCallback(() => {
    logout()
    navigate('/start')
  }, [logout, navigate])

  const handleToggleOpen = async () => {
    try {
      const { data } = await storesAPI.toggleOpen()
      setStore(data)
    } catch {
      // silently fail
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
    }
  }

  const formatRevenue = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`
    }
    return `$${amount.toLocaleString('es-CO')}`
  }

  return (
    <div className={styles.profile}>
      <div className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <div className={styles.profile2}>Profile</div>
      </div>
      <div className={styles.heading1} />
      <div className={styles.container}>
        <div className={styles.container2}>
          <div className={styles.container3} onClick={handleAvatarClick}>
            <div className={styles.image78Parent}>
              {avatarUrl ? (
                <img className={styles.image79Icon} src={avatarUrl} alt="Store avatar" />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="#fff" opacity="0.7"/></svg>
                </div>
              )}
            </div>
          </div>
          <div className={styles.container4}>
            <div className={styles.heading2}>
              <div className={styles.kfc}>{store?.name || 'Store Name'}</div>
            </div>
            <div className={styles.container5}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              <div className={styles.text}>
                <div className={styles.kfcgmailcom}>{user?.email || 'email@example.com'}</div>
              </div>
            </div>
            <div className={styles.container6}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <div className={styles.text2}>
                <div className={styles.kfcgmailcom}>{store?.address || 'Cali, Colombia'}</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.container7}>
          <div className={styles.container8}>
            <div className={styles.kfc}>{totalPacks}</div>
          </div>
          <div className={styles.container9}>
            <div className={styles.totalPacks}>Total Packs</div>
          </div>
        </div>
        <div className={styles.container10}>
          <div className={styles.kfc}>{formatRevenue(saved)}</div>
        </div>
        <div className={styles.container11}>
          <div className={styles.saved}>Saved</div>
        </div>
        <img className={styles.containerChild} src="/images/divider.svg" alt="" />
      </div>
      <div className={styles.heading22}>
        <div className={styles.businessHours}>⏰ Business Hours</div>
      </div>
      <div className={styles.container17}>
        <div className={styles.container18}>
          <div className={styles.paragraph}>
            <div className={styles.openStore}>Open Store</div>
          </div>
          <div className={styles.paragraph2}>
            <div className={styles.customersCanPlace}>Customers can place orders</div>
          </div>
        </div>
        <div className={`${styles.button2} ${store?.is_open ? styles.button2On : ''}`} onClick={handleToggleOpen}>
          <div className={styles.container19} />
        </div>
      </div>
      <div className={styles.heading3}>
        <div className={styles.businessHours}>🍴 Category</div>
      </div>
      <div className={styles.container12}>
        <div className={styles.container13}>
          <div className={styles.container14} />
        </div>
        <div className={styles.container15}>
          <div className={styles.fastFood}>Fast Food</div>
        </div>
        <div className={styles.container16}>
          <div className={styles.fastFood}>Desserts</div>
        </div>
      </div>
      <div className={styles.button} onClick={handleLogout}>
        <div className={styles.iconParent}>
          <svg className={styles.icon3} viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
          <div className={styles.text3}>
            <div className={styles.logOut}>Log Out</div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
      <BottomNav active="profile" />
    </div>
  )
}
