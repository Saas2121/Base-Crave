import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types'
import styles from './Register.module.css'
import MapPicker from '../components/MapPicker'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [latitude, setLatitude] = useState(3.4516)
  const [longitude, setLongitude] = useState(-76.532)
  const [address, setAddress] = useState('')

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLatitude(lat)
    setLongitude(lng)
    setAddress(addr)
    setShowMap(false)
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(name, email, password, UserRole.CONSUMER)
      navigate('/')
    } catch (err) {
    }
  }, [name, email, password, register, navigate])

  return (
    <div className={styles.register}>
      <div className={styles.registerChild} />
      <div className={styles.container}>
        <div className={styles.heading1}>
          <div className={styles.createRestaurant}>Create Account</div>
        </div>
        <div className={styles.paragraph}>
          <div className={styles.startSellingSurplus}>Join and discover great food deals</div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.container2}>
          <div className={styles.label}>
            <div className={styles.restaurantName}>Name</div>
          </div>
          <div className={styles.container3}>
            <input
              className={styles.textInput}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
            <svg className={styles.icon} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17V4C3 3.448 3.448 3 4 3H16C16.552 3 17 3.448 17 4V17" stroke="#99a1af" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7 3V17M13 3V17" stroke="#99a1af" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div className={styles.container4}>
          <div className={styles.label}>
            <div className={styles.restaurantName}>Email</div>
          </div>
          <div className={styles.container5}>
            <input
              className={styles.emailInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
            <svg className={styles.icon} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="16" height="12" rx="2" stroke="#99a1af" strokeWidth="1.5"/>
              <path d="M2 6L10 11L18 6" stroke="#99a1af" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div className={styles.container6}>
          <div className={styles.label}>
            <div className={styles.restaurantName}>Password</div>
          </div>
          <div className={styles.container3}>
            <input
              className={styles.passwordInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
            <svg className={styles.icon3} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="9" width="12" height="8" rx="2" stroke="#99a1af" strokeWidth="1.5"/>
              <path d="M7 9V6C7 4.343 8.343 3 10 3C11.657 3 13 4.343 13 6V9" stroke="#99a1af" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div className={styles.container8}>
          <div className={styles.label}>
            <div className={styles.restaurantName}>Location</div>
          </div>
          <div className={styles.container3} onClick={() => setShowMap(true)}>
            <input
              className={styles.textInput}
              type="text"
              value={address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
              readOnly
              placeholder="Click to select location"
              required
            />
            <svg className={styles.icon} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18C10 18 3 13 3 8C3 3 10 0 10 0C10 0 17 3 17 8C17 13 10 18 10 18ZM10 8C11.1 8 12 7.1 12 6C12 4.9 11.1 4 10 4C8.9 4 8 4.9 8 6C8 7.1 8.9 8 10 8Z" stroke="#99a1af" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
        <div className={styles.paragraph2}>
          <div className={styles.wellUseThis}>We'll use this to show you nearby restaurants</div>
        </div>
        {showMap && (
          <MapPicker
            initialLat={latitude}
            initialLng={longitude}
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowMap(false)}
          />
        )}
        <button type="submit" className={styles.button} disabled={isLoading}>
          <div className={styles.createAccount}>{isLoading ? 'Creating account...' : 'Create Account'}</div>
        </button>
      </form>
      <div className={styles.container12}>
        <Link to="/signin" className={styles.alreadyHaveAnContainer}>
          <span>Already have an account? </span>
          <span className={styles.signIn}>Sign in</span>
        </Link>
      </div>
      <svg className={styles.registerItem} viewBox="0 0 250 274" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
    </div>
  )
}
