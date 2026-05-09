import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePackStore } from '../store/packStore'
import { packsAPI } from '../api/client'
import { Pack } from '../types'
import BottomNav from '../components/BottomNav'
import styles from './GreetingUser.module.css'

export default function PackDetailEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { saving, deleting, error, deletePack, updatePack, uploadImage, clearError } = usePackStore()
  const [pack, setPack] = useState<Pack | null>(null)
  const [newTotal, setNewTotal] = useState(0)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState(0)
  const [pickupStart, setPickupStart] = useState('13:00')
  const [pickupEnd, setPickupEnd] = useState('20:00')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id) loadPack()
  }, [id])

  const loadPack = async () => {
    try {
      const data = await packsAPI.getOne(id!)
      setPack(data)
      setTitle(data.title || '')
      setPrice(data.price)
      setNewTotal(data.total_quantity)
      const start = new Date(data.pickup_start)
      const end = new Date(data.pickup_end)
      setPickupStart(
        `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
      )
      setPickupEnd(
        `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
      )
      if (data.image_url) setImagePreview(data.image_url)
    } catch {
      setLoadError('Failed to load pack')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayH = h % 12 === 0 ? 12 : h % 12
    return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
      setLastUpdate(Date.now())
    }
  }

  const handleSave = async () => {
    if (!id || !pack) return
    try {
      const baseDate = new Date()
      const [startH, startM] = pickupStart.split(':').map(Number)
      const [endH, endM] = pickupEnd.split(':').map(Number)
      const start = new Date(baseDate)
      start.setHours(startH, startM, 0, 0)
      start.setDate(start.getDate() + 1)
      const end = new Date(baseDate)
      end.setHours(endH, endM, 0, 0)
      end.setDate(end.getDate() + 1)

      const sold = pack.total_quantity - pack.remaining_quantity
      const newRemaining = Math.max(0, newTotal - sold)

      await updatePack(id, {
        title: pack.pack_type === 'surprise' ? 'Surprise pack' : title,
        price: Number(price),
        total_quantity: Number(newTotal),
        remaining_quantity: newRemaining,
        pickup_start: start.toISOString(),
        pickup_end: end.toISOString(),
      })

      if (selectedImage) {
        try {
          await uploadImage(id, selectedImage)
        } catch {
          // error stored in store
        }
      }
      navigate('/packs')
    } catch {
      // error stored in store
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to delete this pack?')) return
    try {
      await deletePack(id)
      navigate('/packs')
    } catch {
      // error stored in store
    }
  }

  const handleDecrease = () => {
    if (newTotal > 0) { setNewTotal(newTotal - 1); setLastUpdate(Date.now()) }
  }

  const handleIncrease = () => {
    setNewTotal(newTotal + 1); setLastUpdate(Date.now())
  }

  if (loading) {
    return (
      <div className={styles.greetingUser}>
        <div className={styles.app}>
          <div style={{ padding: '100px 39px', color: '#fff' }}>Loading pack...</div>
        </div>
      </div>
    )
  }

  if (loadError || !pack) {
    return (
      <div className={styles.greetingUser}>
        <div className={styles.app}>
          <div style={{ padding: '100px 39px', color: '#fff' }}>{loadError || 'Pack not found'}</div>
        </div>
      </div>
    )
  }

  const sold = pack.total_quantity - pack.remaining_quantity
  const availabilityPercentage = newTotal > 0 ? (sold / newTotal) * 100 : 0

  return (
    <div className={styles.greetingUser}>
      <div className={styles.app}>
        <div className={styles.container}>
          {error && (
            <div style={{ padding: '8px 16px', background: '#ff4444', color: '#fff', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }} onClick={clearError}>
              {error}
            </div>
          )}
          <div className={styles.container2}>
            <div className={styles.heading3}>
              <div className={styles.crunchyChickenPack}>{title}</div>
            </div>
            <div className={styles.paragraph}>
              <div className={styles.div}>${price.toLocaleString('es-CO')}</div>
            </div>
            <div className={styles.groupParent}>
              <div className={styles.iconParent}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="15.1" height="15.1" style={{ position: 'absolute', top: '1.88px', left: '0px' }}>
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 18H4V4h8v16zm1 0h8V4h-8v16z"/>
                </svg>
                <div className={styles.text}>
                  <div className={styles.availability8}>
                    Availability {sold} / {newTotal}
                  </div>
                </div>
              </div>
              <div className={styles.container7}>
                <div
                  className={styles.container8}
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
            </div>
            <div className={styles.container3}>
              <div className={styles.paragraph2}>
                <div className={styles.stock}>Stock</div>
              </div>
              <div className={styles.container4}>
                <div className={styles.button} onClick={handleDecrease}>
                  <span style={{ fontSize: '24px', color: '#fff' }}>−</span>
                </div>
                <div className={styles.container5}>
                  <div className={styles.paragraph3}>
                    <div className={styles.div2}>{newTotal}</div>
                  </div>
                </div>
                <div className={styles.button} onClick={handleIncrease}>
                  <span style={{ fontSize: '24px', color: '#fff' }}>+</span>
                </div>
              </div>
            </div>
            <div className={styles.container6}>
              <div className={styles.paragraph4} />
              <div className={styles.paragraph4}>
                <div className={styles.ltimaActualizacinHoy}>
                  Last updated: {new Date(lastUpdate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
              </div>
            </div>
            <div className={styles.button4} onClick={handleDelete}>
              <div className={styles.text3}>
                <div className={styles.deletePack}>
                  {deleting ? 'Deleting...' : 'Delete Pack'}
                </div>
              </div>
            </div>
            <div className={styles.button3} onClick={handleSave}>
              <div className={styles.text2}>
                <div className={styles.save}>{saving ? 'Saving...' : 'Save'}</div>
              </div>
            </div>
          </div>
          <div
            className={styles.container9}
            style={{ cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#99a1af',
                  fontSize: '14px',
                }}
              >
                Click to add photo
              </div>
            )}
            <div className={styles.container10} style={{ width: '70px' }}>
              <div className={styles.meals}>
                {pack.pack_type === 'fixed' ? 'Fixed' : 'Surprise'}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          <div className={styles.iconGroup}>
            <img className={styles.icon3} alt="" src="/images/clock.svg" />
            <div className={styles.text4}>
              <div className={styles.pm}>
                {formatTimeDisplay(pickupStart)} - {formatTimeDisplay(pickupEnd)}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rectangleParent}>
          <div className={styles.frameChild} />
          <div className={styles.detailPack}>Detail Pack</div>
          <div className={styles.button5} onClick={() => navigate('/packs')}>
            <span style={{ fontSize: '24px', lineHeight: '26.8px' }}>←</span>
            <div className={styles.paragraph6}>
              <div className={styles.volver}>Volver</div>
            </div>
          </div>
        </div>

        <div style={{ height: '120px' }} />
        <BottomNav active="packs" />
      </div>
    </div>
  )
}
