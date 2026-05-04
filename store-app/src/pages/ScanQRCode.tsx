import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reservationsAPI } from '../api/client'
import styles from './ScanQRCode.module.css'
import BottomNav from '../components/BottomNav'

export default function ScanQRCode() {
  const navigate = useNavigate()
  const [pickup_code, setPickupCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: reservations } = await reservationsAPI.getStore()
      const reservation = reservations.find(r => r.pickup_code === pickup_code.toUpperCase())

      if (!reservation) {
        setError('Invalid pickup code')
        setLoading(false)
        return
      }

      await reservationsAPI.verify(reservation.id, pickup_code.toUpperCase())
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.icon}>✅</div>
          <h1>Success!</h1>
          <p>Order has been marked as picked up.</p>
          <button
            className={styles.button}
            onClick={() => navigate('/order-completed')}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}><h1>Scan QR Code</h1></header>

      <div className={styles.content}>
        <p className={styles.instruction}>Enter the pickup code from the customer</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleVerify} className={styles.form}>
          <input
            type="text"
            value={pickup_code}
            onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
            placeholder="Enter pickup code"
            className={styles.codeInput}
            maxLength={6}
            required
          />
          <button type="submit" className={styles.verifyButton} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
      <BottomNav active="orders" />
    </div>
  )
}
