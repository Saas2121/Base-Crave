import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { packsAPI } from '../api/client'
import { Pack } from '../types'
import styles from './DetailPack.module.css'

const DetailPack = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pack, setPack] = useState<Pack | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      loadPack()
    }
  }, [id])

  const loadPack = async () => {
    try {
      const data = await packsAPI.getOne(id!)
      setPack(data)
      setQuantity(data.remaining_quantity)
    } catch {
      // silently fail
    }
  }

  const handleBack = useCallback(() => {
    navigate('/packs')
  }, [navigate])

  const handleDecrease = () => {
    if (quantity > 0) setQuantity(quantity - 1)
  }

  const handleIncrease = () => {
    setQuantity(quantity + 1)
  }

  const handleSave = async () => {
    if (!pack) return
    setSaving(true)
    try {
      const data = await packsAPI.update(pack.id, { remaining_quantity: quantity })
      setPack(data)
      alert('Pack actualizado correctamente')
    } catch {
      alert('Error al actualizar el pack')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!pack) return
    if (window.confirm('¿Eliminar paquete?')) {
      try {
        await packsAPI.delete(pack.id)
        navigate('/packs')
      } catch {
        alert('Error al eliminar el pack')
      }
    }
  }

  if (!pack) return <div className={styles.loading}>Loading...</div>

  const availabilityPercentage = (pack.remaining_quantity / pack.total_quantity) * 100

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.backButton} onClick={handleBack}>
          <img src="/images/icon-1.svg" alt="" className={styles.backIcon} />
          <span className={styles.backText}>Volver</span>
        </div>
        <h1 className={styles.title}>Detail Pack</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <img
            src={pack.image_url || '/images/image-placeholder.svg'}
            alt={pack.title}
            className={styles.packImage}
          />
          <div className={styles.categoryBadge}>
            {pack.pack_type === 'fixed' ? 'Fixed Pack' : 'Surprise Pack'}
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.packName}>{pack.title}</h2>
          <div className={styles.price}>${pack.price.toLocaleString('es-CO')}</div>

          <div className={styles.timeRow}>
            <img src="/images/clock.svg" alt="" className={styles.timeIcon} />
            <span>12-5 PM</span>
          </div>

          <div className={styles.availabilitySection}>
            <div className={styles.availabilityText}>
              Availability {pack.remaining_quantity} / {pack.total_quantity}
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${availabilityPercentage}%` }}
              />
            </div>
          </div>

          <div className={styles.stockSection}>
            <div className={styles.stockLabel}>Stock</div>
            <div className={styles.stockControls}>
              <button className={styles.stockButton} onClick={handleDecrease}>
                <img src="/images/vector.svg" alt="Decrease" className={styles.stockIcon} />
              </button>
              <div className={styles.stockValue}>{quantity}</div>
              <button className={styles.stockButton} onClick={handleIncrease}>
                <img src="/images/union.svg" alt="Increase" className={styles.stockIcon} />
              </button>
            </div>
          </div>

          <div className={styles.updateInfo}>
            Última actualización: Hoy, 10:30 AM
          </div>

          <button className={styles.deleteButton} onClick={handleDelete}>
            Delete Pack
          </button>

          <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ height: '100px' }} />
    </div>
  )
}

export default DetailPack
