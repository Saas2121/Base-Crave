import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { storesAPI, packsAPI, reservationsAPI, authAPI } from '../api/client'
import { Store } from '../types'
import styles from './Profile.module.css'
import BottomNav from '../components/BottomNav'
import MapPicker from '../components/MapPicker'
import Vector1 from './Vector1'

const CACHE_KEY = 'crave_profile_cache'

interface ProfileCache {
  store: Store | null
  totalPacks: number
  saved: number
}

function loadCache(): ProfileCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : { store: null, totalPacks: 0, saved: 0 }
  } catch {
    return { store: null, totalPacks: 0, saved: 0 }
  }
}

function saveCache(data: ProfileCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch { }
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const [store, setStore] = useState<Store | null>(null)
  const [totalPacks, setTotalPacks] = useState(0)
  const [saved, setSaved] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [_uploadingStoreImage, setUploadingStoreImage] = useState(false)
  const [dataReady, setDataReady] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const storeImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const cached = loadCache()
    if (cached.store) {
      setStore(cached.store)
      setTotalPacks(cached.totalPacks)
      setSaved(cached.saved)
      setDataReady(true)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [user?.profile_image])

  const loadData = async () => {
    try {
      const [storeRes, packsData, ordersRes] = await Promise.all([
        storesAPI.getMyStore(),
        packsAPI.getByStore(),
        reservationsAPI.getStore(),
      ])
      const storeData = storeRes.data
      const packCount = packsData.length
      const totalRevenue = ordersRes.data
        .filter((o: any) => o.status === 'picked_up')
        .reduce((acc: number, o: any) => acc + ((o.packs?.price || 0) * o.quantity), 0)
      setStore(storeData)
      setTotalPacks(packCount)
      setSaved(totalRevenue)
      setDataReady(true)
      saveCache({ store: storeData, totalPacks: packCount, saved: totalRevenue })
    } catch {
      setDataReady(true)
    }
  }

  const handleLocationClick = () => {
    setShowMap(true)
  }

  const handleLocationSelect = async (lat: number, lng: number, address: string) => {
    try {
      if (store?.id) {
        const { data } = await storesAPI.update(store.id, { latitude: lat, longitude: lng, address })
        setStore(data)
        saveCache({ store: data, totalPacks, saved })
      }
    } catch { }
    setShowMap(false)
  }

  const handleStoreImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadingStoreImage(true)
      try {
        const { data } = await storesAPI.uploadImage(file)
        if (data.store) {
          setStore(data.store)
          saveCache({ store: data.store, totalPacks, saved })
        }
      } catch (error) {
        alert('Failed to upload store image.')
      } finally {
        setUploadingStoreImage(false)
      }
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
      saveCache({ store: data, totalPacks, saved })
    } catch { }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        const { data } = await authAPI.uploadProfileImage(file)
        if (data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image. Please try again.')
      } finally {
        setUploading(false)
      }
    }
  }

  const formatRevenue = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`
    }
    return `$${amount.toLocaleString('es-CO')}`
  }

  const KNOWN_CATEGORIES = ['Meals', 'Coffee', 'Fast Food', 'Desserts', 'Healthy', 'Surprise']

  const categories = store?.description && KNOWN_CATEGORIES.includes(store.description)
    ? [store.description]
    : []

  return (
    <div className={styles.profile}>
      <div className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <div className={styles.profile2}>Profile</div>
      </div>
      <div className={styles.heading1} />
      <div className={styles.container}>
        <div className={styles.container2}>
          <div className={styles.container3} onClick={!uploading ? handleAvatarClick : undefined}>
            <div className={styles.image78Parent}>
              {uploading ? (
                <div className={styles.avatarPlaceholder}>
                  <div style={{ color: '#666', fontSize: '11px', fontFamily: 'General Sans' }}>Uploading...</div>
                </div>
              ) : user?.profile_image ? (
                <img className={styles.image79Icon} src={user.profile_image} alt="Store avatar" />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="#666" opacity="0.7"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className={styles.container4}>
            {dataReady && user && (
              <>
                <div className={styles.heading2}>
                  <div className={styles.kfc}>{store?.name || user.name}</div>
                </div>
                <div className={styles.container5}>
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <div className={styles.text}>
                    <div className={styles.kfcgmailcom}>{user.email}</div>
                  </div>
                </div>
                <div className={styles.container6} onClick={handleLocationClick}>
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <div className={styles.text2}>
                    <div className={styles.kfcgmailcom}>{store?.address || ''}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Vector1 />
        {dataReady && store && (
          <>
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
          </>
        )}
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
      {dataReady && categories.length > 0 && (
        <div className={styles.heading3}>
          <div className={styles.businessHours}>🍴 Category</div>
        </div>
      )}
      {dataReady && categories.length > 0 && (
        <div className={styles.categoriesContainer}>
          {categories.map((cat, i) => (
            <div key={i} className={styles.categoryTag}>
              <span className={styles.categoryTagText}>{cat}</span>
            </div>
          ))}
        </div>
      )}
      <div className={styles.button} onClick={handleLogout}>
        <div className={styles.iconParent}>
          <svg className={styles.icon3} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          <div className={styles.text3}>
            <div className={styles.logOut}>Log Out</div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
      <input type="file" accept="image/*" ref={storeImageInputRef} onChange={handleStoreImageChange} style={{ display: 'none' }} />
      {showMap && (
        <MapPicker
          initialLat={store?.latitude || 3.4516}
          initialLng={store?.longitude || -76.532}
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMap(false)}
        />
      )}
      <div style={{ height: '30px' }} />
      <BottomNav active="profile" />
    </div>
  )
}
