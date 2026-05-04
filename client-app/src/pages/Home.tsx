import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { storesAPI, Store } from '../api/client'
import styles from './Home.module.css'
import BottomNav from '../components/BottomNav'

const categories = ['Meals', 'Coffee', 'Fast Food', 'Desserts', 'Healthy'] as const
type Category = (typeof categories)[number]

export default function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [stores, setStores] = useState<Store[]>([])
  const [favoritePackIds, setFavoritePackIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('Meals')
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

  const handleLogout = () => {
    logout()
    navigate('/start')
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

  const packs = stores.flatMap((store) =>
    (store.packs || []).map((pack) => ({ ...pack, store }))
  )

  const filteredPacks = packs.filter((pack) => {
    const source = `${pack.title} ${pack.description || ''} ${pack.store?.name || ''}`
    return getCategory(source) === selectedCategory
  })

  const now = new Date()
  const todayStr = now.toDateString()
  const trendingPacks = [...filteredPacks]
    .sort((a, b) => (b.total_quantity - b.remaining_quantity) - (a.total_quantity - a.remaining_quantity))

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
        <div className={styles.headerTop}>
          <h1 className={styles.logo}>CRAVE</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
        <p className={styles.welcome}>Hey {user?.name}</p>
        <p className={styles.subtitle}>Discover amazing food deals nearby</p>
      </header>

      <div className={styles.categoryRow}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.categoryChip} ${selectedCategory === category ? styles.categoryChipActive : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
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
          <p className={styles.message}>No hay packs disponibles por ahora.</p>
        ) : (
          <>
            <div className={styles.sectionHead}>
              <h2>🔥 Trending Near You</h2>
              <p>Popular food packs close to you</p>
            </div>
            <div className={styles.storesList}>
              {(showAllTrending ? trendingPacks : trendingPacks.slice(0, 3)).map((pack) => (
                <div key={pack.id} className={styles.storeCard} onClick={() => navigate(`/product/${pack.id}`)}>
                  <button className={styles.favButton} onClick={(e) => { e.stopPropagation(); toggleFavorite(pack.id) }}>
                    {favoritePackIds.includes(pack.id) ? '❤️' : '🤍'}
                  </button>
                  {pack.pack_type === 'surprise' && <span className={styles.smallStar}>⭐</span>}
                  <h3>{pack.title}</h3>
                  <p>{pack.description || 'Sin descripcion'}</p>
                  <p className={styles.address}>{pack.store?.name}</p>
                  <span className={styles.priceTag}>${pack.price}</span>
                </div>
              ))}
            </div>
            {trendingPacks.length > 3 && (
              <button className={styles.expandButton} onClick={() => setShowAllTrending((prev) => !prev)}>
                {showAllTrending ? 'Ver menos' : 'Desplegar mas'}
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
                  <span>{spot.name}</span>
                </div>
              ))}
            </div>

            <div className={styles.sectionHead}>
              <h2>✨ New Today</h2>
              <p>Restaurants that posted packs today</p>
            </div>
            <div className={styles.carousel}>
              {fixedNewToday.map((pack) => (
                <div key={pack.id} className={styles.carouselCard} onClick={() => navigate(`/product/${pack.id}`)}>
                  <h4>{pack.title}</h4>
                  <p>{pack.store?.name}</p>
                  <span>${pack.price}</span>
                </div>
              ))}
              {fixedNewToday.length === 0 && <p className={styles.message}>No hay packs fijos nuevos hoy.</p>}
            </div>

            <div className={styles.sectionHead}>
              <h2>⏰ Available Now</h2>
              <p>Packs you can pick up right now</p>
            </div>
            <div className={styles.storesList}>
              {surpriseAvailableNow.map((pack) => (
                <div key={pack.id} className={`${styles.storeCard} ${styles.surpriseCard}`} onClick={() => navigate(`/product/${pack.id}`)}>
                  <div className={styles.surpriseImage}>S</div>
                  <button className={styles.favButton} onClick={(e) => { e.stopPropagation(); toggleFavorite(pack.id) }}>
                    {favoritePackIds.includes(pack.id) ? '❤️' : '🤍'}
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
              {surpriseAvailableNow.length === 0 && <p className={styles.message}>No hay packs sorpresa disponibles ahora.</p>}
            </div>
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

  const getTimeLeft = (pickupEnd: string) => {
    const diff = new Date(pickupEnd).getTime() - Date.now()
    const mins = Math.max(0, Math.floor(diff / 60000))
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    return `${h} h`
  }
