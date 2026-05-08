import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { storesAPI } from '../api/client'
import styles from './Favorites.module.css'
import BottomNav from '../components/BottomNav'

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
)

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "var(--primary)" : "none"} stroke={filled ? "var(--primary)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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

function getTagForStore(storeName: string) {
  const lower = storeName.toLowerCase()
  if (lower.includes('crepes') || lower.includes('wok')) return 'Meals'
  if (lower.includes('bakery') || lower.includes('postre')) return 'Desserts'
  if (lower.includes('salad') || lower.includes('bowl')) return 'Healthy'
  return 'Meals'
}

export default function Favorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      // In a real app this would be a DB query. We mock it for now using localstorage
      let favPackIds: string[] = []
      try {
        favPackIds = JSON.parse(localStorage.getItem('favorite_pack_ids') || '[]')
      } catch (e) {
        favPackIds = []
      }
      
      const { data: stores } = await storesAPI.getAll()
      
      // If no favorites are explicitly saved yet, mock some to match the design visually if needed, 
      // but it's better to show empty state if actually empty. Let's show empty state if truly empty.
      
      const allPacks = stores.flatMap((s: any) => (s.packs || []).map((p: any) => ({ ...p, store: s })))
      setFavorites(allPacks.filter((p: any) => favPackIds.includes(p.id)))
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

  return (
    <div className={styles.appContainer}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Favorites</h1>
          <button className={styles.filterBtn}>
            <FilterIcon />
          </button>
        </header>

        <div className={styles.content}>
          {loading ? (
            <p className={styles.empty}>Loading...</p>
          ) : favorites.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.empty}>No favorites yet</p>
              <p className={styles.emptySub}>Tap the heart icon on a store to add it here.</p>
            </div>
          ) : (
            <div className={styles.storesList}>
              {favorites.map((fav) => {
                const store = fav.store
                const imageUrl = fav.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'
                
                return (
                  <div
                    key={fav.id}
                    className={styles.storeCard}
                    onClick={() => navigate(`/product/${fav.id}`)}
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
                      <div className={styles.tag}>{getTagForStore(store.name)}</div>
                      <div className={styles.avatarWrapper}>
                        {store.users?.profile_image ? (
                          <img
                            src={store.users.profile_image}
                            alt={store.name}
                            className={styles.storeAvatar}
                          />
                        ) : (
                          <div className={styles.storeAvatarFallback}>
                            {store.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
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
                        {fav.original_price && (
                          <span className={styles.originalPrice}>{formatPrice(fav.original_price)}</span>
                        )}
                      </div>
                      
                      <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                          <LocationIcon />
                          <span>0.6 km</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.metaItem}>
                          <BoxIcon />
                          <span>{fav.remaining_quantity} left</span>
                        </div>
                        <div className={styles.metaItemRight}>
                          <ClockIcon />
                          <span>{formatTimeRange(fav.pickup_start, fav.pickup_end)}</span>
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
