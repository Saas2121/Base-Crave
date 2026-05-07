import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { storesAPI, Store, Pack } from '../api/client'
import styles from './Home.module.css'
import BottomNav from '../components/BottomNav'

const categories = [
  { id: 'Meals', emoji: '🍗' },
  { id: 'Coffee', emoji: '☕' },
  { id: 'Fast Food', emoji: '🍔' },
  { id: 'Desserts', emoji: '🍰' },
  { id: 'Healthy', emoji: '🥗' },
] as const
type Category = typeof categories[number]['id']

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stores, setStores] = useState<Store[]>([])
  const [favoritePackIds, setFavoritePackIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [showAllTrending, setShowAllTrending] = useState(false)

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      setError('')
      const { data } = await storesAPI.getAll()
      setStores(data)
      const favPackIds = JSON.parse(localStorage.getItem('favorite_pack_ids') || '[]')
      setFavoritePackIds(Array.isArray(favPackIds) ? favPackIds : [])
    } catch (error) {
      setError('No pudimos cargar tiendas ahora. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (packId: string) => {
    const isFav = favoritePackIds.includes(packId)
    const next = isFav ? favoritePackIds.filter((id) => id !== packId) : [...favoritePackIds, packId]
    setFavoritePackIds(next)
    localStorage.setItem('favorite_pack_ids', JSON.stringify(next))
  }

  const getCategory = (text: string): Category => {
    const value = text.toLowerCase()
    if (value.includes('coffee') || value.includes('cafe')) return 'Coffee'
    if (value.includes('burger') || value.includes('pizza') || value.includes('fast')) return 'Fast Food'
    if (value.includes('dessert') || value.includes('cake') || value.includes('sweet')) return 'Desserts'
    if (value.includes('healthy') || value.includes('salad') || value.includes('vegan')) return 'Healthy'
    return 'Meals'
  }

  const packs = stores
    .filter((store: Store) => store.is_open)
    .flatMap((store: Store) =>
      (store.packs || []).map((pack: Pack) => ({ ...pack, store }))
    )

  const filteredPacks = selectedCategory
    ? packs.filter((pack) => {
        const source = `${pack.title} ${pack.description || ''} ${pack.store?.name || ''}`
        return getCategory(source) === selectedCategory
      })
    : packs

  const now = new Date()
  const todayStr = now.toDateString()
  const trendingPacks = [...filteredPacks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const topSpots = [...stores]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const fixedNewToday = filteredPacks.filter((pack) =>
    pack.pack_type === 'fixed' && new Date(pack.created_at).toDateString() === todayStr
  )

  const surpriseAvailableNow = filteredPacks
    .filter((pack) =>
      pack.pack_type === 'surprise' &&
      pack.status === 'active' &&
      new Date(pack.pickup_start) <= now &&
      new Date(pack.pickup_end) >= now &&
      pack.remaining_quantity > 0
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeWrapper}>
          <img src="/images/Logo-home.png" alt="" className={styles.welcomeLogo} />
          <div className={styles.welcomeContainer}>
            <p className={styles.welcome}>Hey, {user?.name}!</p>
            <p className={styles.subtitle}>Discover amazing food deals nearby</p>
          </div>
        </div>
        <div className={styles.searchBar} onClick={() => navigate('/search/list')}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="#99A1AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search restaurants or food..." className={styles.searchInput} readOnly />
        </div>
      </header>

      <div className={styles.categoryRow}>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryChip} ${selectedCategory === category.id ? styles.categoryChipActive : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
          >
            <span className={styles.categoryCircle}>
              <span className={styles.categoryEmoji}>{category.emoji}</span>
              <span className={styles.categoryLabel}>{category.id}</span>
            </span>
          </button>
        ))}
      </div>

      <section className={styles.storesSection}>
        {loading ? (
          <p className={styles.message}>Loading...</p>
        ) : error ? (
          <div className={styles.errorBox}>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={loadStores}>Reintentar</button>
          </div>
        ) : packs.length === 0 ? (
          <p className={styles.message}>No packs available right now.</p>
        ) : (
          <>
            <div className={styles.sectionHead}>
              <h2>🔥 Trending Near You</h2>
              <p>Popular food packs close to you</p>
            </div>
            <div className={styles.storesList}>
              {(showAllTrending ? trendingPacks : trendingPacks.slice(0, 3)).map((pack) => (
                <div key={pack.id} className={styles.storeCard} onClick={() => navigate(`/product/${pack.id}`)}>
                  <div className={styles.cardImage}>
                    <span className={styles.cardImagePlaceholder}>
                      {pack.pack_type === 'surprise' ? '🎁' : '🍽️'}
                    </span>
                    <span className={styles.cardCategory}>
                      {getCategory(pack.title + ' ' + (pack.description || ''))}
                    </span>
                  </div>
                  <div className={styles.cardStoreAvatar}>
                    {pack.store?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className={styles.cardContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className={styles.cardTitle}>{pack.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pack.pack_type === 'surprise' && (
                          <span className={`${styles.smallStar} ${favoritePackIds.includes(pack.id) ? styles.active : ''}`}>
                            <svg className={styles.starIcon} viewBox="0 0 24 24" fill="none" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          </span>
                        )}
                        <button className={`${styles.favButton} ${favoritePackIds.includes(pack.id) ? styles.active : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(pack.id) }}>
                          <svg className={styles.favIcon} viewBox="0 0 24 24" fill="none" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className={styles.cardPriceRow}>
                      <span className={styles.cardPrice}>${pack.price.toLocaleString()}</span>
                      {pack.original_price && (
                        <span className={styles.cardOriginalPrice}>${pack.original_price.toLocaleString()}</span>
                      )}
                    </div>
                    <div className={styles.cardMeta}>
                      <div className={styles.cardMetaLeft}>
                        <span className={styles.cardMetaItem}>
                          <svg className={styles.cardMetaIcon} viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {getDistance(pack.store?.latitude, pack.store?.longitude)}
                        </span>
                        <div className={styles.cardMetaDivider} />
                        <span className={styles.cardMetaItem}>
                          <svg className={styles.cardMetaIcon} viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2">
                            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                          </svg>
                          {pack.remaining_quantity} left
                        </span>
                      </div>
                      <span className={styles.cardMetaItem}>
                        <svg className={styles.cardMetaIcon} viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {formatTime(pack.pickup_end)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {trendingPacks.length > 3 && (
              <button className={styles.expandButton} onClick={() => setShowAllTrending((prev) => !prev)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.expandIcon}>
                  {showAllTrending ? (
                    <path d="M6 15l6-6 6 6" />
                  ) : (
                    <path d="M6 9l6 6 6-6" />
                  )}
                </svg>
              </button>
            )}

            <div className={styles.sectionHead}>
              <h2>📍 Top Spots</h2>
              <p>Try popular restaurants everyone loves</p>
            </div>
            <div className={styles.spotsGrid}>
              {topSpots.map((spot) => (
                <div key={spot.id} className={styles.spotCard} onClick={() => navigate('/search/list')}>
                  <div className={styles.spotPhoto}>{spot.name.slice(0, 1).toUpperCase()}</div>
                </div>
              ))}
            </div>

            <div className={styles.newTodaySection}>
              <div className={styles.sectionHead}>
                <h2>✨ New Today</h2>
                <p>Restaurants that posted packs today</p>
              </div>
            </div>
            <div className={styles.carousel}>
              {fixedNewToday.map((pack) => (
                <div key={pack.id} className={styles.carouselCard} onClick={() => navigate(`/product/${pack.id}`)}>
                  <h4>{pack.title}</h4>
                  <p>{pack.store?.name}</p>
                  <span>${pack.price}</span>
                </div>
              ))}
            </div>
            {fixedNewToday.length === 0 && <p className={styles.emptyMessage}>No fixed packs new today.</p>}

            <div className={styles.sectionHead}>
              <h2>⏰ Available Now</h2>
              <p>Packs you can pick up right now</p>
            </div>
<div className={styles.storesList}>
              {surpriseAvailableNow.map((pack) => (
                <div key={pack.id} className={`${styles.storeCard} ${styles.surpriseCard}`} onClick={() => navigate(`/product/${pack.id}`)}>
                  <div className={styles.surpriseImage}>S</div>
                  <button className={styles.favButton} onClick={(e) => { e.stopPropagation(); toggleFavorite(pack.id) }}>
                    <svg className={styles.favIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <span className={styles.smallStar}>⭐</span>
                  <div className={styles.storeMiniIcon}>🏪</div>
                  <h3>{pack.store?.name}</h3>
                  <span className={styles.priceTag}>${pack.price}</span>
                  <div className={styles.metaRow}>
                    <span>{getDistance(pack.store?.latitude, pack.store?.longitude)}</span>
                    <span>{pack.remaining_quantity} left</span>
                    <span>{getTimeLeft(pack.pickup_end)}</span>
                  </div>
                </div>
              ))}
</div>
            {surpriseAvailableNow.length === 0 && <p className={styles.emptyMessage}>No surprise packs available now.</p>}
          </>
        )}
      </section>
      <BottomNav active="home" />
    </div>
  )
}
  const getDistance = (lat?: number, lng?: number) => {
    if (lat === undefined || lng === undefined) return '1.2 km'
    return `${(((Math.abs(lat) + Math.abs(lng)) % 5) + 0.5).toFixed(1)} km`
  }

  const formatTime = (pickupEnd: string) => {
    const date = new Date(pickupEnd)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const getTimeLeft = (pickupEnd: string) => {
    const diff = new Date(pickupEnd).getTime() - Date.now()
    const mins = Math.max(0, Math.floor(diff / 60000))
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    return `${h} h`
  }
