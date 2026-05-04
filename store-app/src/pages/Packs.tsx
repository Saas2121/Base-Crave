import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { packsAPI } from '../api/client'
import { Pack } from '../types'
import styles from './Packs.module.css'
import BottomNav from '../components/BottomNav'

export default function Packs() {
  const navigate = useNavigate()
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'active' | 'sold'>('active')

  useEffect(() => {
    loadPacks()
  }, [])

  const loadPacks = async () => {
    try {
      const data = await packsAPI.getByStore()
      setPacks(data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pack?')) return
    try {
      await packsAPI.delete(id)
      setPacks(packs.filter(p => p.id !== id))
    } catch (error) {
    }
  }

  const activePacks = packs.filter((p) => p.status === 'active')
  const soldPacks = packs.filter((p) => (p.total_quantity - p.remaining_quantity) > 0 || p.status === 'sold_out')
  const surpriseActive = activePacks.filter((p) => p.pack_type === 'surprise').length
  const fixedActive = activePacks.filter((p) => p.pack_type === 'fixed').length
  const soldUnits = packs.reduce((acc, p) => acc + (p.total_quantity - p.remaining_quantity), 0)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Packs</h1>
        <button
          onClick={() => navigate('/dashboard/fixed')}
          className={styles.addButton}
        >
          + Add
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.switchRow}>
          <button className={`${styles.switchBtn} ${view === 'active' ? styles.switchActive : ''}`} onClick={() => setView('active')}>Created</button>
          <button className={`${styles.switchBtn} ${view === 'sold' ? styles.switchActive : ''}`} onClick={() => setView('sold')}>Sold</button>
        </div>
        <div className={styles.kpis}>
          <span>Active: {activePacks.length}</span>
          <span>Fixed: {fixedActive}</span>
          <span>Surprise: {surpriseActive}</span>
          <span>Sold: {soldUnits}</span>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : packs.length === 0 ? (
          <div className={styles.empty}>
            <p>No packs yet</p>
            <button onClick={() => navigate('/dashboard/fixed')}>
              Create your first pack
            </button>
          </div>
        ) : (
          <div className={styles.packsList}>
            {(view === 'active' ? activePacks : soldPacks).map((pack) => (
              <div key={pack.id} className={styles.packCard}>
                <div className={styles.packInfo}>
                  <span className={styles.packType}>
                    {pack.pack_type === 'surprise' ? '⭐' : '📦'}
                  </span>
                  <div>
                    <h3>{pack.pack_type === 'surprise' ? 'Surprise pack' : pack.title}</h3>
                    <p>${pack.price} • {pack.remaining_quantity}/{pack.total_quantity} left</p>
                    <span className={`${styles.status} ${styles[pack.status]}`}>
                      {pack.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(pack.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="packs" />
    </div>
  )
}
