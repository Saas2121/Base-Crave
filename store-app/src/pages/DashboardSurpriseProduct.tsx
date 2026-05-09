import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { packsAPI, reservationsAPI } from '../api/client'
import { PackType } from '../types'
import styles from './DashboardSurpriseProduct.module.css'
import BottomNav from '../components/BottomNav'
import TimePickerModal from '../components/TimePickerModal'

export default function DashboardSurpriseProduct() {
  const navigate = useNavigate()
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [pickupStart, setPickupStart] = useState('13:00')
  const [pickupEnd, setPickupEnd] = useState('20:00')
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end' | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [activePacks, setActivePacks] = useState(0)
  const [soldToday, setSoldToday] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadStats = useCallback(async () => {
    try {
      const [packsData, ordersRes] = await Promise.all([
        packsAPI.getByStore(),
        reservationsAPI.getStore(),
      ])
      const active = packsData.filter((p: any) => p.status === 'active').length
      const orders = ordersRes.data
      const sold = orders.filter((o: any) => o.status === 'picked_up').length
      const rev = orders.filter((o: any) => o.status === 'picked_up').reduce((acc: number, o: any) => acc + ((o.packs?.price || 0) * o.quantity), 0)
      setActivePacks(active)
      setSoldToday(sold)
      setRevenue(rev)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 12000)
    return () => clearInterval(interval)
  }, [loadStats])

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => String(Math.max(1, Number(prev) + delta)))
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
    setSuccess('')
    setError('')
    setCreating(true)
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

      const pack = await packsAPI.create({
        pack_type: PackType.SURPRISE,
        price: Number(price),
        total_quantity: Number(quantity),
        pickup_start: start.toISOString(),
        pickup_end: end.toISOString(),
      })

      if (selectedImage && pack?.id) {
        try {
          const { data: updatedPack } = await packsAPI.uploadImage(pack.id, selectedImage)
          console.log('Pack image uploaded:', updatedPack)
          if (updatedPack?.pack?.image_url) {
            console.log('Image URL saved:', updatedPack.pack.image_url)
          }
        } catch (imgErr) {
          console.error('Error uploading image:', imgErr)
        }
      }

      setSuccess('Se creo con exito')
      setPrice('')
      setQuantity('1')
      setSelectedImage(null)
      setImagePreview(null)
      setPickupStart('13:00')
      setPickupEnd('20:00')
      await loadStats()
      
      setTimeout(() => {
        navigate('/packs')
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo crear el pack')
    } finally {
      setCreating(false)
    }
  }
  
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardChild} />
      <div className={styles.groupParent}>
        <img className={styles.groupChild} src="/images/group-1.svg" alt="Crave logo" />
        <div className={styles.heading1}>
          <div className={styles.dashboard2}>Dashboard</div>
        </div>
        <div className={styles.paragraph}>
          <div className={styles.createAndManage}>Create and manage your packs</div>
        </div>
      </div>
      <div className={styles.containerWrapper}>
        <div className={styles.container}>
          <div className={styles.container2}>
          <div className={styles.container3}>
            <div className={styles.div}>{activePacks}</div>
          </div>
          <div className={styles.container4}>
            <div className={styles.activePacks}>Active Packs</div>
          </div>
          <img className={styles.containerChild} src="/images/group-26.svg" alt="" />
        </div>
        <div className={styles.container5}>
          <div className={styles.container6}>
            <div className={styles.div}>{soldToday}</div>
          </div>
          <div className={styles.container7}>
            <div className={styles.soldToday}>Sold Today</div>
          </div>
          <img className={styles.containerItem} src="/images/group-10.svg" alt="" />
        </div>
        <div className={styles.container8}>
          <div className={styles.container9}>
            <div className={styles.div}>${revenue}</div>
          </div>
          <div className={styles.container10}>
            <div className={styles.activePacks}>Revenue</div>
          </div>
          <img className={styles.iconstackioBoxFill} src="/images/iconstack-io-box-fill.svg" alt="" />
        </div>
      </div>
      </div>
      <div className={styles.createNewPack}>📦 Create New Pack</div>
      <div className={styles.dashboardInner} />
      <form onSubmit={handleSubmit}>
          <div className={styles.container11}>
            <div className={styles.label}>
              <div className={styles.packImage}>Pack Image</div>
            </div>
            <div 
              className={styles.container12} 
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer' }}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    borderRadius: '17.23px'
                  }} 
                />
              ) : (
                <div className={styles.placeholderContent}>
                  <img src="/images/image-placeholder.svg" alt="" style={{ width: '48px', height: '48px', opacity: 0.5 }} />
                  <p style={{ color: '#99a1af', fontSize: '14px', marginTop: '12px', fontFamily: 'General Sans' }}>
                    Click to upload pack image
                  </p>
                </div>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
            </div>
          </div>
        <div className={styles.container13}>
          <div className={styles.label2}>
            <div className={styles.packType}>Pack Type</div>
          </div>
          <div className={styles.container14}>
            <div className={styles.button}>
              <div className={styles.container15}>
                <div className={styles.div3}>🎁</div>
              </div>
              <div className={styles.container16}>
                <div className={styles.packType}>Surprise</div>
              </div>
              <div className={styles.container17}>
                <div className={styles.mysteryItems}>Mystery items</div>
              </div>
            </div>
            <div className={styles.button2} onClick={() => navigate('/dashboard/fixed')} style={{ cursor: 'pointer' }}>
              <div className={styles.container15}>
                <div className={styles.div3}>📦</div>
              </div>
              <div className={styles.container16}>
                <div className={styles.packType}>Fixed</div>
              </div>
              <div className={styles.container17}>
                <div className={styles.setItems}>Set items</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.container21}>
          <div className={styles.label2}>
            <div className={styles.packType}>Price (COP)</div>
          </div>
          <div className={styles.textInput}>
            <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$12.000" required style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, fontSize: '16.98px', fontFamily: 'General Sans', color: '#ffffff', outline: 'none' }} />
          </div>
        </div>
        <div className={styles.container22}>
          <div className={styles.label2}>
            <div className={styles.packType}>Quantity Available</div>
          </div>
          <div className={styles.container23}>
            <div className={styles.button3} onClick={() => handleQuantityChange(-1)} style={{ cursor: 'pointer' }}>
              <div className={styles.div6}>-</div>
            </div>
            <div className={styles.container24}>
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', textAlign: 'center', fontSize: '19.11px', fontFamily: 'General Sans', color: '#ffffff', outline: 'none' }} />
            </div>
            <div className={styles.button3} onClick={() => handleQuantityChange(1)} style={{ cursor: 'pointer' }}>
              <div className={styles.div8}>+</div>
            </div>
          </div>
        </div>
        <div className={styles.label5}>
          <div className={styles.packType}>Pickup Time</div>
        </div>
        <div className={styles.containerContainer}>
          <div className={styles.container25}>
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
        {success && <p style={{ position: 'absolute', top: '1310px', left: '39px', color: '#15703d', background: '#ebfaee', border: '1px solid #bde8c7', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', zIndex: 5 }}>{success}</p>}
        {error && <p style={{ position: 'absolute', top: '1310px', left: '39px', color: '#a23c31', background: '#fff1f0', border: '1px solid #f5c5bf', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', zIndex: 5 }}>{error}</p>}
        <div className={styles.button5} style={{ cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.6 : 1 }}>
          <button type="submit" disabled={creating} style={{ position: 'absolute', top: '16.04px', left: 'calc(50% - 46.13px)', lineHeight: '24.05px', fontWeight: 600, background: 'none', border: 'none', color: '#fff', cursor: 'inherit', padding: 0, fontSize: '16.04px' }}>{creating ? 'Creating...' : 'Create Pack'}</button>
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
        <BottomNav active="dashboard" />
    </div>
  )
}
