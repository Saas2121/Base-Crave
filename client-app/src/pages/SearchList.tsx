import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { storesAPI, Store } from '../api/client'
import styles from './SearchList.module.css'
import BottomNav from '../components/BottomNav'

export default function SearchList() {
  const navigate = useNavigate()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [onlyOpen, setOnlyOpen] = useState(false)

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const { data } = await storesAPI.getAll()
      setStores(data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const filtered = stores.filter((store) => {
    const matchesQuery = `${store.name} ${store.address} ${store.description || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())
    const matchesOpen = onlyOpen ? store.is_open : true
    return matchesQuery && matchesOpen
  })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Search</h1>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${styles.activeTab}`}>List</button>
          <button className={styles.tab} onClick={() => navigate('/search/map')}>Map</button>
        </div>
        <input
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por tienda o direccion"
        />
        <label className={styles.filterRow}>
          <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
          Solo tiendas abiertas
        </label>
      </header>

      <div className={styles.content}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className={styles.storesList}>
            {filtered.map((store) => (
              <div
                key={store.id}
                className={styles.storeCard}
                onClick={() => store.packs?.[0] && navigate(`/product/${store.packs[0].id}`)}
              >
                {store.packs?.[0]?.image_url && (
                  <div className={styles.storeImageContainer}>
                    <img
                      src={store.packs[0].image_url}
                      alt={store.name}
                      className={styles.storeImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className={styles.storeInfo}>
                  <div className={styles.storeHeader}>
                    {store.users?.profile_image && (
                      <img
                        src={store.users.profile_image}
                        alt={store.name}
                        className={styles.storeAvatar}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h3>{store.name}</h3>
                      <p>{store.description}</p>
                    </div>
                  </div>
                  <p className={styles.address}>{store.address}</p>
                </div>
                <div className={styles.storeMeta}>
                  <span className={`${styles.status} ${store.is_open ? styles.open : styles.closed}`}>
                    {store.is_open ? 'Open' : 'Closed'}
                  </span>
                  {store.packs && store.packs.length > 0 && (
                    <span className={styles.packCount}>
                      {store.packs.length} pack(s)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="search" />
    </div>
  )
}
