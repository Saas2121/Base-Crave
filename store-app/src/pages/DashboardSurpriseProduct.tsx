import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { packsAPI } from '../api/client'
import { PackType } from '../types'
import styles from './DashboardSurpriseProduct.module.css'

export default function DashboardSurpriseProduct() {
  const navigate = useNavigate()
  const [price, setPrice] = useState('')
  const [original_price, setOriginalPrice] = useState('')
  const [pickup_start, setPickupStart] = useState('')
  const [pickup_end, setPickupEnd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await packsAPI.create({
        title: 'Surprise pack',
        description: null,
        pack_type: PackType.SURPRISE,
        price: parseInt(price),
        original_price: original_price ? parseInt(original_price) : null,
        total_quantity: 1,
        pickup_start: new Date(pickup_start).toISOString(),
        pickup_end: new Date(pickup_end).toISOString(),
      })
      navigate('/packs')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create pack')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/packs')} className={styles.backButton}>←</button>
        <h1>Surprise Pack</h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <p className={styles.helperText}>Surprise pack: no product details, no description, no custom quantity.</p>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Original Price ($)</label>
            <input
              type="number"
              value={original_price}
              onChange={(e) => setOriginalPrice(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Pickup Start</label>
            <input
              type="datetime-local"
              value={pickup_start}
              onChange={(e) => setPickupStart(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Pickup End</label>
            <input
              type="datetime-local"
              value={pickup_end}
              onChange={(e) => setPickupEnd(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Creating...' : 'Create Surprise Pack'}
        </button>
      </form>
    </div>
  )
}
