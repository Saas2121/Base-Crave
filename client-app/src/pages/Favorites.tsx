import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { storesAPI } from '../api/client'
import styles from './Favorites.module.css'
import BottomNav from '../components/BottomNav'

export default function Favorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const favPackIds: string[] = JSON.parse(localStorage.getItem('favorite_pack_ids') || '[]')
      const { data: stores } = await storesAPI.getAll()
      const allPacks = stores.flatMap((s: any) => (s.packs || []).map((p: any) => ({ ...p, store: s })))
      setFavorites(allPacks.filter((p: any) => favPackIds.includes(p.id)))
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = (packId: string) => {
    const next = favorites.filter((f) => f.id !== packId)
    setFavorites(next)
    localStorage.setItem('favorite_pack_ids', JSON.stringify(next.map((f) => f.id)))
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Favorites</h1>
      </header>

      <div className={styles.content}>
        {loading ? (
          <p>Loading...</p>
        ) : favorites.length === 0 ? (
          <p className={styles.empty}>No favorites yet</p>
        ) : (
          <div className={styles.favoritesList}>
            {favorites.map((fav) => (
              <div key={fav.id} className={styles.favoriteCard}>
                <div
                  onClick={() => navigate(`/product/${fav.id}`)}
                  className={styles.favInfo}
                >
                  <h3>{fav.pack_type === 'surprise' ? '⭐ Surprise pack' : fav.title}</h3>
                  <p>{fav.store?.name} - ${fav.price}</p>
                </div>
                <button
                  onClick={() => removeFavorite(fav.id)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="favorites" />
    </div>
  )
}
