import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { storesAPI, Store } from '../api/client'
import styles from './SearchMap.module.css'
import BottomNav from '../components/BottomNav'

export default function SearchMap() {
  const navigate = useNavigate()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          loadStores(position.coords.latitude, position.coords.longitude)
        },
        () => {
          loadStores()
        }
      )
    } else {
      loadStores()
    }
  }, [])

  const loadStores = async (lat?: number, lng?: number) => {
    try {
      const { data } = await storesAPI.getAll(lat, lng)
      setStores(data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Search</h1>
        <div>
          <button className={styles.backButton} onClick={() => navigate('/search/list')}>List</button>
          <button className={styles.backButton}>Map</button>
        </div>
      </header>

      <div className={styles.mapContainer}>
        <div className={styles.mapPlaceholder}>
          <p>🗺️ Map View</p>
          <p className={styles.hint}>Stores near you will appear here</p>
          {userLocation && (
            <p className={styles.coords}>
              Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      <div className={styles.storesList}>
        <h2>Nearby Stores</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          stores.map((store: Store) => (
            <div
              key={store.id}
              className={styles.storeCard}
              onClick={() => store.packs?.[0] && navigate(`/product/${store.packs[0].id}`)}
            >
              <h3>{store.name}</h3>
              <p>{store.address}</p>
            </div>
          ))
        )}
      </div>
      <BottomNav active="search" />
    </div>
  )
}
