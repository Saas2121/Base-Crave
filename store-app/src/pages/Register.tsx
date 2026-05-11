import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { storesAPI } from '../api/client'
import { UserRole } from '../types'
import styles from './Register.module.css'
import MapPicker from '../components/MapPicker'

const CUISINE_OPTIONS = [
  { value: '', label: 'Select cuisine type' },
  { value: 'Meals', label: '🍗 Meals' },
  { value: 'Coffee', label: '☕ Coffee' },
  { value: 'Fast Food', label: '🍔 Fast Food' },
  { value: 'Desserts', label: '🍰 Desserts' },
  { value: 'Healthy', label: '🥗 Healthy' },
]

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [address, setAddress] = useState('')
  const [cuisineType, setCuisineType] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [latitude, setLatitude] = useState(3.4516)
  const [longitude, setLongitude] = useState(-76.532)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLatitude(lat)
    setLongitude(lng)
    setAddress(addr)
    setShowMap(false)
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(email.split('@')[0], email, password, UserRole.STORE_ADMIN)
      await storesAPI.create({
        name: storeName,
        address,
        description: cuisineType || 'Nueva tienda en CRAVE',
        latitude,
        longitude,
      })
      navigate('/')
    } catch (err) {
    }
  }, [email, password, storeName, address, cuisineType, register, navigate, latitude, longitude])

  return (
    <div className={styles.register}>
      <div className={styles.registerChild} />
      <div className={styles.container}>
        <div className={styles.heading1}>
          <div className={styles.createRestaurant}>Create Restaurant</div>
        </div>
        <div className={styles.paragraph}>
          <div className={styles.startSellingSurplus}>Start selling surplus food</div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.container2}>
          <div className={styles.label}>
            <div className={styles.restaurantName}>Restaurant Name</div>
          </div>
          <div className={styles.container3}>
            <input
              className={styles.textInput}
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Your restaurant name"
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
            <div className={styles.restaurantName}>Business Email</div>
          </div>
          <div className={styles.container5}>
            <input
              className={styles.emailInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="restaurant@email.com"
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
        <div className={styles.container10}>
          <div className={styles.label}>
            <div className={styles.restaurantName}>Location</div>
          </div>
          <div className={styles.container11} onClick={() => setShowMap(true)}>
            <input
              className={styles.textInput2}
              type="text"
              value={address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
              readOnly
              placeholder="Click to select location"
              required
            />
            <svg className={styles.icon4} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18C10 18 3 13 3 8C3 3 10 0 10 0C10 0 17 3 17 8C17 13 10 18 10 18ZM10 8C11.1 8 12 7.1 12 6C12 4.9 11.1 4 10 4C8.9 4 8 4.9 8 6C8 7.1 8.9 8 10 8Z" stroke="#99a1af" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className={styles.paragraph2}>
            <div className={styles.wellUseThis}>We'll use this to help nearby customers discover your restaurant</div>
          </div>
        </div>
        <div className={styles.container8}>
          <div className={styles.label}>
            <div className={styles.restaurantName}>Cuisine Type</div>
          </div>
          <div className={styles.selectWrapper} ref={dropdownRef}>
            <button
              type="button"
              className={`${styles.selectButton} ${cuisineType ? styles.selectButtonSelected : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <svg className={styles.selectIcon} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2H5C4.448 2 4 2.448 4 3V5C4 5.552 4.448 6 5 6H8C8.552 6 9 5.552 9 5V3C9 2.448 8.552 2 8 2Z" stroke="#99a1af" strokeWidth="1.5"/>
                <path d="M15 2H12C11.448 2 11 2.448 11 3V5C11 5.552 11.448 6 12 6H15C15.552 6 16 5.552 16 5V3C16 2.448 15.552 2 15 2Z" stroke="#99a1af" strokeWidth="1.5"/>
                <path d="M8 9H5C4.448 9 4 9.448 4 10V12C4 12.552 4.448 13 5 13H8C8.552 13 9 12.552 9 12V10C9 9.448 8.552 9 8 9Z" stroke="#99a1af" strokeWidth="1.5"/>
                <path d="M15 9H12C11.448 9 11 9.448 11 10V12C11 12.552 11.448 13 12 13H15C15.552 13 16 12.552 16 12V10C16 9.448 15.552 9 15 9Z" stroke="#99a1af" strokeWidth="1.5"/>
              </svg>
              <span className={styles.selectText}>{cuisineType || 'Select cuisine type'}</span>
              <svg className={styles.selectArrow} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5L6 8L9 5" stroke="#99a1af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {dropdownOpen && (
              <div className={styles.dropdownList}>
                {CUISINE_OPTIONS.filter(o => o.value !== '').map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.dropdownItem} ${cuisineType === opt.value ? styles.dropdownItemActive : ''}`}
                    onClick={() => {
                      setCuisineType(opt.value)
                      setDropdownOpen(false)
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
      <img src="/images/group-1.svg" alt="" className={styles.registerItem} />
    </div>
  )
}
