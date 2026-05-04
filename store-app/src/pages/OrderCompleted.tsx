import { useNavigate } from 'react-router-dom'
import styles from './OrderCompleted.module.css'

export default function OrderCompleted() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>✅</div>
        <h1>Order Completed!</h1>
        <p>The customer has picked up their order successfully.</p>

        <button
          className={styles.button}
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
