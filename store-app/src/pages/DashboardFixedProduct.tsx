import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { packsAPI } from '../api/client'
import { PackType } from '../types'
import styles from './DashboardFixedProduct.module.css'

export default function DashboardFixedProduct() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [original_price, setOriginalPrice] = useState('')
  const [total_quantity, setTotalQuantity] = useState('')
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
        title,
        description,
        pack_type: PackType.FIXED,
        price: parseInt(price),
        original_price: original_price ? parseInt(original_price) : null,
        total_quantity: parseInt(total_quantity),
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
        <h1>Fixed Product Pack</h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Bakery Fixed Pack"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what's in this pack"
            rows={3}
          />
        </div>

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

        <div className={styles.field}>
          <label>Total Quantity</label>
          <input
            type="number"
            value={total_quantity}
            onChange={(e) => setTotalQuantity(e.target.value)}
            required
          />
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
          {loading ? 'Creating...' : 'Create Fixed Pack'}
        </button>
      </form>
    </div>
  )
}
