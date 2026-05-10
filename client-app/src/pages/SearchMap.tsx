import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { storesAPI, Store } from '../api/client'
import styles from './SearchMap.module.css'
import BottomNav from '../components/BottomNav'

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const BoxIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

function formatPrice(price: number) {
  return `$${price.toLocaleString('es-CO')}`
}

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

export default function SearchMap() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const autoOpenStoreId = searchParams.get('store')

  useEffect(() => {
    loadStoresAndLocation()
  }, [])

  useEffect(() => {
    if (stores.length > 0 && mapRef.current && !mapInstanceRef.current) {
      initMap()
    }
  }, [stores, userLocation])

  useEffect(() => {
    if (autoOpenStoreId && stores.length > 0 && mapInstanceRef.current) {
      const store = stores.find(s => s.id === autoOpenStoreId)
      if (store) {
        setSelectedStore(store)
        setShowBottomSheet(true)
        const map = mapInstanceRef.current
        map.setView([store.latitude, store.longitude], 16)
      }
    }
  }, [autoOpenStoreId, stores, mapInstanceRef.current])

  const loadStoresAndLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          () => {
            setUserLocation({ lat: 3.4516, lng: -76.532 })
          }
        )
      } else {
        setUserLocation({ lat: 3.4516, lng: -76.532 })
      }

      const { data } = await storesAPI.getAll()
      const openStores = data.filter((s: Store) => s.is_open)
      setStores(openStores)
    } catch (error) {
      console.error(error)
      setUserLocation({ lat: 3.4516, lng: -76.532 })
    } finally {
      setLoading(false)
    }
  }

  const initMap = () => {
    const loadLeaflet = () => {
      if (!(window as any).L) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => setupMap()
        document.head.appendChild(script)
      } else {
        setupMap()
      }
    }

    loadLeaflet()
  }

  const setupMap = () => {
    const L = (window as any).L
    if (!L || !mapRef.current) return

    const mapCenter = userLocation || { lat: 3.4516, lng: -76.532 }
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([mapCenter.lat, mapCenter.lng], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)

    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #3b82f6;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          "></div>
        `,
        className: 'user-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map)
    }

    const openStores = stores.filter(s => s.latitude && s.longitude)

    openStores.forEach((store) => {
      const profileImage = store.users?.profile_image
      const initial = store.name.substring(0, 2).toUpperCase()

      const storeIcon = L.divIcon({
        html: profileImage
          ? `<img src="${profileImage}" style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); object-fit: cover;" />`
          : `<div style="width: 44px; height: 44px; border-radius: 50%; background: #ef4444; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">${initial}</div>`,
        className: 'store-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      })

      const marker = L.marker([store.latitude, store.longitude], { icon: storeIcon }).addTo(map)

      marker.on('click', () => {
        setSelectedStore(store)
        setShowBottomSheet(true)
        map.panTo([store.latitude, store.longitude])
      })

      markersRef.current.push(marker)
    })

    if (openStores.length > 0) {
      const avgLat = openStores.reduce((sum, s) => sum + s.latitude, 0) / openStores.length
      const avgLng = openStores.reduce((sum, s) => sum + s.longitude, 0) / openStores.length
      map.setView([avgLat, avgLng], 14)
    }

    mapInstanceRef.current = map
  }

  const closeBottomSheet = () => {
    setShowBottomSheet(false)
    setSelectedStore(null)
  }

  return (
    <div className={styles.appContainer}>
      <div ref={mapRef} className={styles.fullMap} />

      <div className={styles.headerOverlay}>
        <div className={styles.searchBar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div className={styles.toggleGroup}>
          <button 
            className={styles.toggleBtn}
            onClick={() => navigate('/search/list')}
          >
            <ListIcon />
            List
          </button>
          <button className={`${styles.toggleBtn} ${styles.activeToggle}`}>
            <MapIcon />
            Map
          </button>
        </div>
      </div>

      {loading && (
        <div className={styles.loadingOverlay}>
          <p>Loading map...</p>
        </div>
      )}

      {showBottomSheet && selectedStore && (
        <div className={styles.bottomSheetOverlay} onClick={closeBottomSheet}>
          <div className={styles.bottomSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.bottomSheetHeader}>
              <div className={styles.storeInfo}>
                <div className={styles.storeAvatarLarge}>
                  {selectedStore.users?.profile_image ? (
                    <img src={selectedStore.users.profile_image} alt={selectedStore.name} />
                  ) : (
                    <span>{selectedStore.name.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2>{selectedStore.name}</h2>
                  <p>{selectedStore.address}</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={closeBottomSheet}>
                <XIcon />
              </button>
            </div>

            <div className={styles.packsList}>
              <h3>{selectedStore.packs?.length || 0} packs available</h3>
              {selectedStore.packs?.map((pack) => (
                <div
                  key={pack.id}
                  className={styles.packCard}
                  onClick={() => navigate(`/product/${pack.id}`)}
                >
                  <img
                    src={pack.image_url || (pack.pack_type === 'surprise' 
                      ? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600'
                      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600')}
                    alt={pack.title}
                    className={styles.packImage}
                  />
                  <div className={styles.packInfo}>
                    <h4>{pack.pack_type === 'surprise' ? 'Surprise Pack' : pack.title}</h4>
                    <div className={styles.packMeta}>
                      <div className={styles.packPrice}>
                        <span className={styles.currentPrice}>{formatPrice(pack.price)}</span>


                      </div>
                      <div className={styles.packDetails}>
                        <span><BoxIcon /> {pack.remaining_quantity}</span>
                        <span><ClockIcon /> {formatTimeRange(pack.pickup_start, pack.pickup_end)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav active="search" />
    </div>
  )
}
