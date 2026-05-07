import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { packsAPI } from '../api/client'
import { Pack } from '../types'
import styles from './DashboardFixedProduct.module.css'
import BottomNav from '../components/BottomNav'
import TimePickerModal from '../components/TimePickerModal'

export default function PackDetailEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [pack, setPack] = useState<Pack | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [pickupStart, setPickupStart] = useState('13:00')
  const [pickupEnd, setPickupEnd] = useState('20:00')
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end' | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id) {
      loadPack()
    }
  }, [id])

  const loadPack = async () => {
    try {
      const data = await packsAPI.getOne(id!)
      setPack(data)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setPrice(String(data.price))
      setOriginalPrice(data.original_price ? String(data.original_price) : '')
      setQuantity(String(data.total_quantity))
      const start = new Date(data.pickup_start)
      const end = new Date(data.pickup_end)
      setPickupStart(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`)
      setPickupEnd(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`)
      if (data.image_url) {
        setImagePreview(data.image_url)
      }
    } catch {
      setError('Failed to load pack')
    } finally {
      setLoading(false)
    }
  }

  const openTimePicker = (target: 'start' | 'end') => {
    setTimePickerTarget(target)
    setShowTimePicker(true)
  }

  const handleTimeChange = (value: string) => {
    if (timePickerTarget === 'start') {
      setPickupStart(value)
    } else if (timePickerTarget === 'end') {
      setPickupEnd(value)
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSuccess('')
    setError('')
    setSaving(true)
    try {
      const baseDate = new Date()
      const [startH, startM] = pickupStart.split(':').map(Number)
      const [endH, endM] = pickupEnd.split(':').map(Number)

      const start = new Date(baseDate)
      start.setHours(startH, startM, 0, 0)

      const end = new Date(baseDate)
      end.setHours(endH, endM, 0, 0)

      await packsAPI.update(id, {
        title: pack?.pack_type === 'surprise' ? 'Surprise pack' : title,
        description: pack?.pack_type === 'surprise' ? null : description,
        price: Number(price),
        original_price: originalPrice ? Number(originalPrice) : null,
        total_quantity: Number(quantity),
        pickup_start: start.toISOString(),
        pickup_end: end.toISOString(),
      })

      if (selectedImage) {
        try {
          await packsAPI.uploadImage(id, selectedImage)
        } catch (imgErr) {
          console.error('Error uploading image:', imgErr)
        }
      }

      setSuccess('Pack updated successfully!')
      
      setTimeout(() => {
        navigate('/packs')
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update pack')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardChild} />
        <div style={{ padding: '100px 39px', color: '#fff' }}>
          Loading pack...
        </div>
        <BottomNav active="packs" />
      </div>
    )
  }

  if (!pack) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardChild} />
        <div style={{ padding: '100px 39px', color: '#fff' }}>
          Pack not found
        </div>
        <BottomNav active="packs" />
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardChild} />
      <div className={styles.header}>
        <img 
          className={styles.headerLogo} 
          src="/images/group-1.svg" 
          alt="Crave logo" 
          onClick={() => navigate('/packs')}
          style={{ cursor: 'pointer' }}
        />
        <div className={styles.headerText}>
          <div className={styles.headerTitle}>Edit Pack</div>
          <div className={styles.headerSubtitle}>Update your pack details</div>
        </div>
      </div>

      <div className={styles.createNewPack}>✏️ Edit Pack</div>
      <div className={styles.dashboardInner} />

      <form onSubmit={handleSubmit}>
        <div className={styles.container11}>
          <div className={styles.label}>
            <div className={styles.packImage}>Pack Image</div>
          </div>
          <div className={styles.container12} onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
            {imagePreview ? (
              <img className={styles.unionIcon} src={imagePreview} alt="Preview" />
            ) : (
              <div className={styles.placeholderContent}>
                <img src="/images/image-placeholder.svg" alt="" style={{ width: '48px', height: '48px', opacity: 0.5 }} />
                <p style={{ color: '#99a1af', fontSize: '14px', marginTop: '12px', fontFamily: 'General Sans' }}>
                  Click to upload pack image
                </p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
        </div>

        {pack.pack_type === 'fixed' && (
          <>
            <div className={styles.container13}>
              <div className={styles.label2}>
                <div className={styles.packName}>Pack Name</div>
              </div>
              <div className={styles.textInput}>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Bakery Surprise Box" required style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, fontSize: '16.98px', fontFamily: 'General Sans', color: '#ffffff', outline: 'none' }} />
              </div>
            </div>
          </>
        )}

        {pack.pack_type === 'fixed' && (
          <div className={styles.container22}>
            <div className={styles.label2}>
              <div className={styles.packName}>Description</div>
            </div>
            <div className={styles.container23}>
              <div className={styles.textInput2}>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what's in this pack..." rows={5} style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', padding: 0, fontSize: '16.98px', fontFamily: 'General Sans', color: '#ffffff', outline: 'none', resize: 'none' }} />
              </div>
            </div>
          </div>
        )}

        <div className={styles.container21} style={{ top: pack.pack_type === 'fixed' ? '922px' : '698px' }}>
          <div className={styles.label2}>
            <div className={styles.packName}>Price (COP)</div>
          </div>
          <div className={styles.textInput}>
            <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$12.000" required style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, fontSize: '16.98px', fontFamily: 'General Sans', color: '#ffffff', outline: 'none' }} />
          </div>
        </div>

        <div className={styles.container21} style={{ top: pack.pack_type === 'fixed' ? '1045px' : '821px' }}>
          <div className={styles.label2}>
            <div className={styles.packName}>Original Price (optional)</div>
          </div>
          <div className={styles.textInput}>
            <input type="number" min={1} value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="$15.000" style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, fontSize: '16.98px', fontFamily: 'General Sans', color: '#ffffff', outline: 'none' }} />
          </div>
        </div>

        <div className={styles.container22} style={{ top: pack.pack_type === 'fixed' ? '1236px' : '1012px' }}>
          <div className={styles.label2}>
            <div className={styles.packName}>Quantity Available</div>
          </div>
          <div className={styles.container23}>
            <div className={styles.button3} onClick={() => setQuantity(String(Math.max(1, Number(quantity) - 1)))} style={{ cursor: 'pointer' }}>
              <div className={styles.div6}>-</div>
            </div>
            <div className={styles.container24}>
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', textAlign: 'center', fontSize: '19.11px', fontFamily: 'General Sans', color: '#ffffff', outline: 'none' }} />
            </div>
            <div className={styles.button3} onClick={() => setQuantity(String(Number(quantity) + 1))} style={{ cursor: 'pointer' }}>
              <div className={styles.div8}>+</div>
            </div>
          </div>
        </div>

        <div className={styles.label5} style={{ top: pack.pack_type === 'fixed' ? '1447px' : '1223px' }}>
          <div className={styles.packName}>Pickup Time</div>
        </div>
        <div className={styles.containerContainer} style={{ top: pack.pack_type === 'fixed' ? '1476.7px' : '1252.7px' }}>
          <div className={styles.containerTimeWrapper}>
            <div className={styles.timePicker} onClick={() => openTimePicker('start')} style={{ cursor: 'pointer' }}>
              <div className={styles.pm}>{formatTimeDisplay(pickupStart)}</div>
              <img className={styles.timePickerChild} src="/images/clock.svg" alt="" />
            </div>
            <div className={styles.timePicker2} onClick={() => openTimePicker('end')} style={{ cursor: 'pointer' }}>
              <div className={styles.pm2}>{formatTimeDisplay(pickupEnd)}</div>
              <img className={styles.timePickerChild} src="/images/clock.svg" alt="" />
            </div>
          </div>
        </div>

        {success && <p style={{ position: 'absolute', top: pack.pack_type === 'fixed' ? '1555px' : '1331px', left: '39px', color: '#15703d', background: '#ebfaee', border: '1px solid #bde8c7', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', zIndex: 5 }}>{success}</p>}
        {error && <p style={{ position: 'absolute', top: pack.pack_type === 'fixed' ? '1555px' : '1331px', left: '39px', color: '#a23c31', background: '#fff1f0', border: '1px solid #f5c5bf', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', zIndex: 5 }}>{error}</p>}

        <div className={styles.button5} style={{ top: pack.pack_type === 'fixed' ? '1628px' : '1404px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          <button type="submit" disabled={saving} style={{ position: 'absolute', top: '16.04px', left: 'calc(50% - 46.13px)', lineHeight: '24.05px', fontWeight: 600, background: 'none', border: 'none', color: '#fff', cursor: 'inherit', padding: 0, fontSize: '16.04px' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>

      {showTimePicker && (
        <TimePickerModal
          value={timePickerTarget === 'start' ? pickupStart : pickupEnd}
          onChange={handleTimeChange}
          onClose={() => setShowTimePicker(false)}
        />
      )}

      <div style={{ height: '30px' }} />
      <BottomNav active="packs" />
    </div>
  )
}
