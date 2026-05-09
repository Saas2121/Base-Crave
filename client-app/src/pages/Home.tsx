import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { storesAPI, Store, Pack } from '../api/client'
import styles from './Home.module.css'
import BottomNav from '../components/BottomNav'

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const SearchIcon = () => (
  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const categories = [
  { id: 'Meals', emoji: '🍗' },
  { id: 'Coffee', emoji: '☕' },
  { id: 'Fast Food', emoji: '🍔' },
  { id: 'Desserts', emoji: '🍰' },
  { id: 'Healthy', emoji: '🥗' },
] as const

type Category = typeof categories[number]['id']

function formatTimeRange(startStr: string, endStr: string) {
  if (!startStr || !endStr) return '2-7 PM'
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
    return '2-7 PM'
  }
}

function formatPrice(price: number) {
  return `$${price.toLocaleString('es-CO')}`
}

function getTagForStore(storeName: string) {
  const lower = storeName.toLowerCase()
  if (lower.includes('crepes') || lower.includes('wok')) return 'Meals'
  if (lower.includes('bakery') || lower.includes('postre') || lower.includes('if')) return 'Desserts'
  if (lower.includes('salad') || lower.includes('bowl')) return 'Healthy'
  return 'Fast Food'
}

function getCategoryForStore(storeName: string) {
  const lower = storeName.toLowerCase()
  if (lower.includes('crepes') || lower.includes('wok')) return 'Meals'
  if (lower.includes('bakery') || lower.includes('postre') || lower.includes('if')) return 'Desserts'
  if (lower.includes('salad') || lower.includes('bowl')) return 'Healthy'
  if (lower.includes('coffee') || lower.includes('café')) return 'Coffee'
  return 'Fast Food'
}

function getSpotLogo(name: string) {
  const l = name.toLowerCase()
  if (l.includes('kfc')) return 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/1024px-KFC_logo.svg.png'
  if (l.includes('frisby')) return 'https://pbs.twimg.com/profile_images/1445778848464670724/j-G2J-5W_400x400.jpg'
  if (l.includes('wok')) return 'https://pbs.twimg.com/profile_images/1070384462199721986/Qy13Jz52_400x400.jpg'
  if (l.includes('crepes')) return 'https://pbs.twimg.com/profile_images/1083431616854134784/XGg5G53W_400x400.jpg'
  if (l.includes('mcdonald')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png'
  return null
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stores, setStores] = useState<Store[]>([])
  const [favoritePackIds, setFavoritePackIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [expandedSections, setExpandedSections] = useState<{[key: string]: number}>({
    trending: 3,
    available: 3
  })
  const [carouselIndex, setCarouselIndex] = useState(0)

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

  const toggleFavorite = (e: React.MouseEvent, packId: string) => {
    e.stopPropagation()
    const isFav = favoritePackIds.includes(packId)
    const next = isFav ? favoritePackIds.filter((id) => id !== packId) : [...favoritePackIds, packId]
    setFavoritePackIds(next)
    localStorage.setItem('favorite_pack_ids', JSON.stringify(next))
  }

  const packs = stores
    .filter((store: Store) => store.is_open)
    .flatMap((store: Store) =>
      (store.packs || []).map((pack: Pack) => ({ ...pack, store }))
    )

  const filteredPacks = selectedCategory
    ? packs.filter((pack) => getCategoryForStore(pack.store?.name || '') === selectedCategory)
    : packs

  const topSpots = stores.length > 0 ? stores.slice(0, 5) : [] as Store[]
  const trendingList = filteredPacks.slice(0, 3)
  const newTodayList = filteredPacks.filter(p => p.pack_type === 'fixed')
  const availableList = filteredPacks.slice(0, 3)
  const hasMoreTrending = filteredPacks.length > 3
  const hasMoreAvailable = filteredPacks.length > 3

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const current = prev[section] || 3
      const next = current + 3
      return {
        ...prev,
        [section]: next >= filteredPacks.length ? filteredPacks.length : next
      }
    })
  }

  const renderStoreCard = (pack: any) => {
    const store = pack.store
    const imageUrl = pack.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'
    const isFav = favoritePackIds.includes(pack.id)

    return (
      <div key={pack.id} className={styles.storeCard} onClick={() => navigate(`/product/${pack.id}`)}>
        <div className={styles.imageContainer}>
          <img
            src={imageUrl}
            alt={store?.name}
            className={styles.storeImage}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'
            }}
          />
          <div className={styles.imageOverlay}></div>
          <div className={styles.tag}>{getTagForStore(store?.name || pack.title)}</div>
          <div className={styles.avatarWrapper}>
            {store?.users?.profile_image || getSpotLogo(store?.name || '') ? (
              <img
                src={store?.users?.profile_image || getSpotLogo(store?.name || '')}
                alt={store?.name}
                className={styles.storeAvatar}
              />
            ) : (
              <div className={styles.storeAvatarFallback}>
                {store?.name?.substring(0, 2).toUpperCase() || 'FA'}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <h3>{pack.title || store?.name}</h3>
            <button className={`${styles.heartBtn} ${isFav ? styles.heartBtnActive : ''}`} onClick={(e) => toggleFavorite(e, pack.id)}>
              <HeartIcon filled={isFav} />
            </button>
          </div>
          
          <div className={styles.pricing}>
            <span className={styles.currentPrice}>{formatPrice(pack.price)}</span>
            {pack.original_price && (
              <span className={styles.originalPrice}>{formatPrice(pack.original_price)}</span>
            )}
          </div>
          
          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <LocationIcon />
              <span>0.5 km</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.metaItem}>
              <BoxIcon />
              <span>{pack.remaining_quantity} left</span>
            </div>
            <div className={styles.metaItemRight}>
              <ClockIcon />
              <span>{formatTimeRange(pack.pickup_start, pack.pickup_end)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <p className={styles.emptyTitle}>No packs available</p>
      <p className={styles.emptySubtitle}>Try selecting a different category</p>
    </div>
  )

  return (
    <div className={styles.appContainer}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.welcomeRow}>
            <img src="/images/Logo-home.png" alt="" className={styles.welcomeLogo} onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=L' }} />
            <div className={styles.welcomeText}>
              <h1 className={styles.greeting}>Hey, {user?.name || 'Sarah'}!</h1>
              <p className={styles.subtitle}>Discover amazing food deals nearby</p>
            </div>
          </div>
          <div className={styles.searchBar} onClick={() => navigate('/search/list')}>
            <SearchIcon />
            <span className={styles.searchPlaceholder}>Search restaurants or food...</span>
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
              </span>
              <span className={styles.categoryLabel}>{category.id}</span>
            </button>
          ))}
        </div>

        <div className={styles.body}>
          {loading ? (
            <p className={styles.message}>Loading...</p>
          ) : error ? (
            <div className={styles.errorBox}>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={loadStores}>Reintentar</button>
            </div>
          ) : filteredPacks.length === 0 && selectedCategory ? (
            renderEmptyState()
          ) : (
            <>
              {trendingList.length > 0 && (
                <section className={styles.section}>
                  <div className={styles.sectionHead}>
                    <h2>🔥 Trending Near You</h2>
                    <p>Popular food packs close to you</p>
                  </div>
                  <div className={styles.cardList}>
                    {filteredPacks.slice(0, expandedSections.trending).map(pack => renderStoreCard(pack))}
                  </div>
                  {hasMoreTrending && expandedSections.trending < filteredPacks.length && (
                    <button className={styles.expandBtn} onClick={() => toggleSection('trending')}>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        style={{ transform: 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  )}
                </section>
              )}

              {topSpots.length > 0 && (
                <section className={styles.section}>
                  <div className={styles.sectionHead}>
                    <h2>📍 Top Spots</h2>
                    <p>Try popular restaurants everyone loves</p>
                  </div>
                  <div className={styles.spotsGrid}>
                    {topSpots.map((spot) => {
                      const logo = getSpotLogo(spot.name)
                      return (
                        <div key={spot.id} className={styles.spotCard} onClick={() => navigate(`/search/map?store=${spot.id}`)}>
                          {logo || spot.users?.profile_image ? (
                            <img src={logo || spot.users?.profile_image} alt={spot.name} className={styles.spotAvatar} />
                          ) : (
                            <span className={styles.spotFallback}>{spot.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {newTodayList.length > 0 && (
                <section className={styles.section}>
                  <div className={styles.sectionHead}>
                    <h2>New Today</h2>
                    <p>Restaurants that posted packs today</p>
                  </div>
                  <div className={styles.carousel}>
                    <div className={styles.carouselInner}>
                      {newTodayList.map((pack, idx) => (
                        <div 
                          key={pack.id} 
                          className={`${styles.carouselCard} ${idx === carouselIndex ? styles.carouselCardActive : ''}`}
                          onClick={() => navigate(`/product/${pack.id}`)}
                        >
                          {renderStoreCard(pack)}
                        </div>
                      ))}
                    </div>
                    <div className={styles.dotsRow}>
                      {newTodayList.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`${styles.dot} ${idx === carouselIndex ? styles.dotActive : ''}`}
                          onClick={() => setCarouselIndex(idx)}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {availableList.length > 0 && (
                <section className={styles.section}>
                  <div className={styles.sectionHead}>
                    <h2>⏰ Available Now</h2>
                    <p>Packs you can pick up right now</p>
                  </div>
                  <div className={styles.cardList}>
                    {filteredPacks.slice(0, expandedSections.available).map(pack => renderStoreCard(pack))}
                  </div>
                  {hasMoreAvailable && expandedSections.available < filteredPacks.length && (
                    <button className={styles.expandBtn} onClick={() => toggleSection('available')}>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        style={{ transform: 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  )}
                </section>
              )}
            </>
          )}
        </div>
        <BottomNav active="home" />
      </div>
    </div>
  )
}
