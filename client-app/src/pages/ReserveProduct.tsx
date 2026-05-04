import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { packsAPI, reservationsAPI } from '../api/client'
import { Pack } from '../types'
import styles from './ReserveProduct.module.css'

export default function ReserveProduct() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pack, setPack] = useState<Pack | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)

  useEffect(() => {
    if (id) {
      loadPack(id)
    }
  }, [id])

  const loadPack = async (packId: string) => {
    try {
      const { data } = await packsAPI.getById(packId)
      setPack(data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async () => {
    if (!pack) return
    
    setReserving(true)
    try {
      const reservationQty = pack.pack_type === 'surprise' ? 1 : quantity
      const { data } = await reservationsAPI.create({ pack_id: pack.id, quantity: reservationQty })
      navigate(`/qr/${data.id}`)
    } catch (error) {
    } finally {
      setReserving(false)
    }
  }

  if (loading) return <div className={styles.container}>Loading...</div>
  if (!pack) return <div className={styles.container}>Pack not found</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>←</button>
        <h1>Reserve Pack</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.packInfo}>
          <h2>{pack.pack_type === 'surprise' ? 'Surprise pack' : pack.title}</h2>
          <p className={styles.price}>${pack.price} each</p>
          {pack.pack_type !== 'surprise' && <p className={styles.remaining}>{pack.remaining_quantity} remaining</p>}
        </div>

        {pack.pack_type !== 'surprise' && (
          <div className={styles.quantitySelector}>
            <p>Quantity:</p>
            <div className={styles.quantityControls}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(pack.remaining_quantity, quantity + 1))}
                disabled={quantity >= pack.remaining_quantity}
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className={styles.total}>
          <span>Total:</span>
          <span className={styles.totalPrice}>${pack.price * (pack.pack_type === 'surprise' ? 1 : quantity)}</span>
        </div>

        <button
          className={styles.reserveButton}
          onClick={handleReserve}
          disabled={reserving || pack.remaining_quantity === 0}
        >
            {reserving ? 'Reserving...' : `Reserve for $${pack.price * (pack.pack_type === 'surprise' ? 1 : quantity)}`}
        </button>
      </div>
    </div>
  )
}
