import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { storesAPI } from '../api/client'
import { getUserLocation } from '../lib/location'
import { calculateDistance, formatDistance } from '../lib/distance'
import styles from './Favorites.module.css'
import BottomNav from '../components/BottomNav'

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "var(--primary)" : "none"} stroke={filled ? "var(--primary)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const HeartWatermark = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.05">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const SmileWatermark = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.05">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
)


const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const BoxIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

function formatTimeRange(startStr: string, endStr: string) {
  if (!startStr || !endStr) return ''
  try {
    const start = new Date(startStr)
    const end = new Date(endStr)
    const formatTime = (d: Date) => {
      let h = d.getHours()
      const ampm = h >= 12 ? 'PM' : 'AM'
      h = h % 12 || 12
      return `${h} ${ampm}`
    }
    return `${formatTime(start).replace(' AM', '').replace(' PM', '')}-${formatTime(end)}`
  } catch (e) {
    return ''
  }
}

function formatPrice(price: number) {
  return `$${price.toLocaleString('es-CO')}`
}

const CATEGORIES = ['Meals', 'Coffee', 'Fast Food', 'Desserts', 'Healthy']

function getCategoryFromStore(store?: { description?: string | null } | null): string {
  if (!store?.description) return ''
  return CATEGORIES.includes(store.description) ? store.description : ''
}

export default function Favorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    getUserLocation().then(setUserLocation)
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      let favPackIds: string[] = []
      try {
        favPackIds = JSON.parse(localStorage.getItem('favorite_pack_ids') || '[]')
      } catch (e) {
        favPackIds = []
      }
      
      const { data: stores } = await storesAPI.getAll()
      
      const allPacks = stores.flatMap((s: any) => (s.packs || []).map((p: any) => ({ ...p, store: s })))
      const matched = allPacks.filter((p: any) => favPackIds.includes(p.id))
      setFavorites(matched)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = (e: React.MouseEvent, packId: string) => {
    e.stopPropagation()
    const next = favorites.filter((f) => f.id !== packId)
    setFavorites(next)
    localStorage.setItem('favorite_pack_ids', JSON.stringify(next.map((f) => f.id)))
  }

  const NEARBY_KM = 5

  const filteredFavorites = favorites.filter((fav) => {
    if (activeFilter === 'Available Now') {
      return fav.remaining_quantity > 0 && fav.status !== 'sold_out' && fav.status !== 'expired' && fav.store?.is_open !== false
    }
    if (activeFilter === 'Nearby') {
      if (!userLocation || !fav.store?.latitude) return false
      const dist = calculateDistance(userLocation.lat, userLocation.lng, fav.store.latitude, fav.store.longitude)
      return dist <= NEARBY_KM
    }
    return true
  })

  const hasRealFavorites = favorites.length > 0

  const stats = {
    favorites: favorites.length,
    available: favorites.filter((f) => f.remaining_quantity > 0 && f.status !== 'sold_out' && f.status !== 'expired' && f.store?.is_open !== false).length,
    avgPrice: favorites.length > 0 ? Math.round(favorites.reduce((sum, f) => sum + (f.price || 0), 0) / favorites.length) : 0
  }

  return (
    <div className={styles.appContainer}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Favorites</h1>
          <p className={styles.subtitle}>Your saved restaurants and their latest deals</p>
        </header>

        <div className={styles.content}>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statNum}>{stats.favorites}</div>
              <div className={styles.statLabel}>Favorites</div>
              <div className={styles.watermark}><HeartWatermark /></div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum}>{stats.available}</div>
              <div className={styles.statLabel}>Available</div>
              <div className={styles.watermark}><SmileWatermark /></div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum}>{stats.avgPrice >= 1000 ? `$${(stats.avgPrice / 1000).toFixed(0)}K` : `$${stats.avgPrice.toLocaleString('es-CO')}`}</div>
              <div className={styles.statLabel}>Avg price</div>
              <div className={styles.watermark}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.05">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={styles.filterRow}>
            {['All', 'Available Now', 'Nearby'].map(f => (
              <button 
                key={f} 
                className={`${styles.filterPill} ${activeFilter === f ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          {activeFilter === 'Nearby' && (
            <p className={styles.nearbyHint}>📍 Near you — within 5 km</p>
          )}

          {loading && favorites.length === 0 ? (
            <p className={styles.empty}>Loading...</p>
          ) : !hasRealFavorites ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3>No favorites yet</h3>
              <p>Start exploring and save your favorite food packs!</p>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {activeFilter === 'Nearby' ? (
                    <><circle cx="12" cy="12" r="10"></circle><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"></path><circle cx="12" cy="9" r="1.5"></circle></>
                  ) : (
                    <><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></>
                  )}
                </svg>
              </div>
              <h3>{activeFilter === 'Nearby' ? 'Nothing nearby' : 'No available packs'}</h3>
              <p>{activeFilter === 'Nearby' ? 'No favorites within 5 km of your location.' : 'All your favorites are sold out or expired.'}</p>
            </div>
          ) : (
            <div className={styles.storesList}>
              {filteredFavorites.map((fav) => {
                const store = fav.store
                const getImageUrl = (fav: any) => {
    if (fav.image_url) return fav.image_url
    if (fav.pack_type === 'surprise') {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop'
    }
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'
  }

  const imageUrl = getImageUrl(fav)
                const isSoldOut = fav.remaining_quantity === 0 || fav.status === 'sold_out' || fav.status === 'expired' || !store?.is_open
                
                return (
                  <div
                    key={fav.id}
                    className={`${styles.storeCard} ${isSoldOut ? styles.soldOutCard : ''}`}
                    onClick={() => !isSoldOut && navigate(`/product/${fav.id}`)}
                  >
                    <div className={styles.imageContainer}>
                      <img
                        src={imageUrl}
                        alt={store.name}
                        className={styles.storeImage}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'
                        }}
                      />
                      <div className={styles.packTypeTag}>{fav.pack_type === 'surprise' ? 'Surprise' : 'Fixed'}</div>
                      <div className={styles.tag}>{getCategoryFromStore(store)}</div>
                      <div className={styles.avatarWrapper}>
                        {store.image_url || store.users?.profile_image ? (
                          <img
                            src={store.image_url || store.users?.profile_image}
                            alt={store.name}
                            className={styles.storeAvatar}
                          />
                        ) : (
                          <div className={styles.storeAvatarFallback}>
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=random`} alt={store.name} className={styles.storeAvatar} />
                          </div>
                        )}
                      </div>
                      
                      {isSoldOut && (
                        <div className={styles.soldOutOverlay}>
                          <span className={styles.soldOutTitle}>No packs available</span>
                          <span className={styles.soldOutSub}>Check back tomorrow</span>
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <h3>{store.name}</h3>
                        <button className={styles.heartBtn} onClick={(e) => removeFavorite(e, fav.id)}>
                          <HeartIcon filled={true} />
                        </button>
                      </div>
                      
                      <div className={styles.pricing}>
                        <span className={styles.currentPrice}>{formatPrice(fav.price)}</span>
                      </div>
                      
                      <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                          <LocationIcon />
                          <span>{userLocation && store?.latitude ? formatDistance(calculateDistance(userLocation.lat, userLocation.lng, store.latitude, store.longitude)) : ''}</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.metaItem}>
                          <BoxIcon />
                          <span>{fav.remaining_quantity} left</span>
                        </div>
                        <div className={styles.metaItemRight}>
                          <ClockIcon />
                          <span>{formatTimeRange(fav.pickup_start, fav.pickup_end) || '2-7 PM'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <BottomNav active="favorites" />
      </div>
    </div>
  )
}
