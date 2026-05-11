import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { packsAPI, storesAPI } from '../api/client'
import { Pack, Store } from '../types'
import { getUserLocation } from '../lib/location'
import { calculateDistance, formatDistance } from '../lib/distance'
import styles from './DetailProduct.module.css'

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
)

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "var(--primary)" : "none"} stroke={filled ? "var(--primary)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const BoxIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
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
      return `${h}:00 ${ampm}` // simplified for the mock
    }
    return `${formatTime(start)} - ${formatTime(end)}`
  } catch (e) {
    return ''
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } catch (e) {
    return ''
  }
}

function formatPrice(price: number) {
  return `$${price.toLocaleString('es-CO')}`
}

export default function DetailProduct() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pack, setPack] = useState<Pack | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    getUserLocation().then(setUserLocation)
    if (id) {
      loadData(id)
    }
  }, [id])

  useEffect(() => {
    const favPackIds = JSON.parse(localStorage.getItem('favorite_pack_ids') || '[]')
    setIsFavorite(favPackIds.includes(id))
  }, [id])

  const loadData = async (packId: string) => {
    try {
      const { data: foundPack } = await packsAPI.getById(packId)
      setPack(foundPack)
      const { data: storeData } = await storesAPI.getById(foundPack.store_id)
      setStore(storeData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.appContainer}>
        <div className={styles.container}>
          <div className={styles.loadingText}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!pack || !store) {
    return (
      <div className={styles.appContainer}>
        <div className={styles.container}>
          <div className={styles.loadingText}>Pack not found</div>
        </div>
      </div>
    )
  }

  const isSoldOut = pack.remaining_quantity === 0 || (!!pack.status && pack.status !== 'active')

  const isSurprise = pack.pack_type === 'surprise'
  const imageUrl = pack.image_url || (isSurprise 
    ? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop'
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop')
  const packTitle = isSurprise ? 'Surprise Pack' : pack.title
  const packDescription = pack.description || 'Get a delicious surprise meal at an incredible price. Save food and save money!'

  return (
    <div className={styles.appContainer}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <div className={styles.backIconWrapper}>
              <ChevronLeftIcon />
            </div>
            <span>Back</span>
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.imageWrapper}>
            <img
              src={imageUrl}
              alt={packTitle}
              className={styles.mainImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = isSurprise
                  ? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop'
                  : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'
              }}
            />
            {isSoldOut && (
              <div className={styles.soldOutOverlay}>
                <span className={styles.soldOutTitle}>No packs available</span>
                <span className={styles.soldOutSub}>Check back tomorrow</span>
              </div>
            )}
          </div>

          <div className={styles.storeHeader}>
            <div className={styles.storeHeaderLeft}>
              <h1 className={styles.storeName}>{store.name}</h1>
              <div className={styles.storeAddress}>
                <LocationIcon />
                <span>{store.address}</span>
              </div>
            </div>
            <button className={styles.heartBtn} onClick={() => {
              const packId = id
              const favPackIds = JSON.parse(localStorage.getItem('favorite_pack_ids') || '[]')
              let next: string[]
              if (isFavorite) {
                next = favPackIds.filter((fid: string) => fid !== packId)
              } else {
                next = [...favPackIds, packId]
              }
              localStorage.setItem('favorite_pack_ids', JSON.stringify(next))
              setIsFavorite(!isFavorite)
            }}>
              <HeartIcon filled={isFavorite} />
            </button>
          </div>

          <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.packTitle}>{packTitle}</h2>
              <div className={`${styles.availableBadge} ${isSoldOut ? styles.soldOutBadge : ''}`}>{isSoldOut ? 'Sold out' : `${pack.remaining_quantity} available`}</div>
            </div>
            
            <p className={styles.description}>{packDescription}</p>
            
            <div className={styles.pricingTable}>
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabelMain}>Pack price</span>
                <span className={styles.pricingValueMain}>{formatPrice(pack.price)}</span>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <ClockIcon />
                <span>Pick up: {formatTimeRange(pack.pickup_start, pack.pickup_end)}</span>
              </div>
              <div className={styles.metaItem}>
                <CalendarIcon />
                <span>{formatDate(pack.pickup_start)}</span>
              </div>
              <div className={styles.metaItem}>
                <LocationIcon />
                <span>{userLocation && store?.latitude ? formatDistance(calculateDistance(userLocation.lat, userLocation.lng, store.latitude, store.longitude)) : '2.5 km'}</span>
              </div>
              <div className={styles.metaItem}>
                <BoxIcon />
                <span>{pack.remaining_quantity} left</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <button
            className={styles.reserveButton}
            onClick={() => navigate(`/reserve/${pack.id}`)}
            disabled={pack.remaining_quantity === 0 || (!!pack.status && pack.status !== 'active')}
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  )
}
