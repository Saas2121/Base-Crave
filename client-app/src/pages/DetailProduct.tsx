import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { packsAPI, storesAPI } from '../api/client'
import { Pack, Store } from '../types'
import styles from './DetailProduct.module.css'

export default function DetailProduct() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pack, setPack] = useState<Pack | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadData(id)
    }
  }, [id])

  const loadData = async (packId: string) => {
    try {
      const { data: foundPack } = await packsAPI.getById(packId)
      setPack(foundPack)
      const { data: storeData } = await storesAPI.getById(foundPack.store_id)
      setStore(storeData)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.container}>Loading...</div>
  }

  if (!pack) {
    return <div className={styles.container}>Pack not found</div>
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          ← Back
        </button>
        <h1>Product Detail</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.packCard}>
          {pack.image_url && (
            <div className={styles.packImageContainer}>
              <img
                src={pack.image_url}
                alt={pack.title || 'Pack'}
                className={styles.packImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className={styles.packType}>
            {pack.pack_type === 'surprise' ? '🎁 Surprise Pack' : '📦 Fixed Pack'}
          </div>
          <h2>{pack.pack_type === 'surprise' ? store?.name || 'Surprise Pack' : pack.title}</h2>
          {pack.pack_type !== 'surprise' && pack.description && <p className={styles.description}>{pack.description}</p>}
          {pack.pack_type === 'surprise' && <p className={styles.description}>Este es un pack sorpresa. Descubres su contenido al retirarlo.</p>}
          
          <div className={styles.priceSection}>
            <span className={styles.price}>${pack.price}</span>
            {pack.original_price && (
              <span className={styles.originalPrice}>${pack.original_price}</span>
            )}
          </div>

          <div className={styles.pickupInfo}>
            <p>🕒 Pickup: {new Date(pack.pickup_start).toLocaleTimeString()} - {new Date(pack.pickup_end).toLocaleTimeString()}</p>
            {pack.pack_type !== 'surprise' && <p>📦 Remaining: {pack.remaining_quantity}/{pack.total_quantity}</p>}
          </div>
        </div>

        {store && (
          <div className={styles.storeInfo}>
            <h3>{store.name}</h3>
            <p>{store.address}</p>
            <p className={styles.status}>
              {store.is_open ? '✅ Open' : '❌ Closed'}
            </p>
          </div>
        )}

        <button
          className={styles.reserveButton}
          onClick={() => navigate(`/reserve/${pack.id}`)}
          disabled={pack.remaining_quantity === 0 || pack.status !== 'active'}
        >
          {pack.remaining_quantity === 0 ? 'Sold Out' : 'Reserve Now'}
        </button>
      </div>
    </div>
  )
}
