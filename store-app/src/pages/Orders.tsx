import { useEffect, useState } from 'react'
import { reservationsAPI, Reservation } from '../api/client'
import styles from './Orders.module.css'
import BottomNav from '../components/BottomNav'

type Tab = 'incoming' | 'in_process' | 'ready'

export default function Orders() {
  const [orders, setOrders] = useState<Reservation[]>([])
  const [tab, setTab] = useState<Tab>('incoming')
  const [loading, setLoading] = useState(true)
  const [pickupCode, setPickupCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 12000)
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async () => {
    try {
      setError('')
      const { data } = await reservationsAPI.getStore()
      setOrders(data)
    } catch (e: any) {
      setError(e.response?.data?.error || 'No pudimos cargar orders.')
    } finally {
      setLoading(false)
    }
  }

  const moveTo = async (id: string, status: 'in_process' | 'ready') => {
    await reservationsAPI.updateStatus(id, status)
    await loadOrders()
  }

  const rejectOrder = async (id: string) => {
    if (!confirm('¿Cancelar este pedido?')) return
    await reservationsAPI.reject(id)
    await loadOrders()
  }

  const verifyReady = async (id: string) => {
    if (!pickupCode.trim()) return
    await reservationsAPI.verify(id, pickupCode.trim().toUpperCase())
    setPickupCode('')
    await loadOrders()
  }

  const incoming = orders.filter((o) => o.status === 'reserved')
  const inProcess = orders.filter((o) => o.status === 'in_process')
  const ready = orders.filter((o) => o.status === 'ready')

  const view = tab === 'incoming' ? incoming : tab === 'in_process' ? inProcess : ready

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Orders</h1>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'incoming' ? styles.active : ''}`} onClick={() => setTab('incoming')}>Incoming</button>
          <button className={`${styles.tab} ${tab === 'in_process' ? styles.active : ''}`} onClick={() => setTab('in_process')}>In Process</button>
          <button className={`${styles.tab} ${tab === 'ready' ? styles.active : ''}`} onClick={() => setTab('ready')}>Ready</button>
        </div>
      </header>

      <main className={styles.content}>
        {error && <p className={styles.error}>{error}</p>}
        {loading ? <p>Loading...</p> : view.length === 0 ? <p className={styles.empty}>No orders in this section.</p> : (
          <div className={styles.list}>
            {view.map((order) => (
              <div key={order.id} className={styles.card}>
                <h3>{order.packs?.title || 'Pack'}</h3>
                <p>{order.users?.name} - Qty {order.quantity}</p>
                {tab === 'incoming' && (
                  <div className={styles.actionRow}>
                    <button className={styles.action} onClick={() => moveTo(order.id, 'in_process')}>Accept</button>
                    <button className={styles.cancelBtn} onClick={() => rejectOrder(order.id)}>Cancel</button>
                  </div>
                )}
                {tab === 'in_process' && <button className={styles.action} onClick={() => moveTo(order.id, 'ready')}>Ready</button>}
                {tab === 'ready' && (
                  <div className={styles.verifyRow}>
                    <input value={pickupCode} onChange={(e) => setPickupCode(e.target.value.toUpperCase())} placeholder="Pickup code" maxLength={6} />
                    <button className={styles.action} onClick={() => verifyReady(order.id)}>Scan</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav active="orders" />
    </div>
  )
}
