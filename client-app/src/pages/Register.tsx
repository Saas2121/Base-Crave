import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types'
import styles from './Register.module.css'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(name, email, password, UserRole.CONSUMER)
      navigate('/')
    } catch (err) {
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.gradientBg} />
      <div className={styles.content}>
        <img src="/images/group-1.svg" alt="" className={styles.assetGroup} />

        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join and discover great food deals</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Name</label>
            <div className={styles.inputWrapper}>
              <img src="/images/icon.svg" alt="" className={styles.icon} />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <img src="/images/icon3.svg" alt="" className={styles.icon} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <img src="/images/icon2.svg" alt="" className={styles.icon} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="location" className={styles.label}>Location</label>
            <div className={styles.inputWrapper}>
              <img src="/images/icon.svg" alt="" className={styles.icon} />
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your city or area"
                className={styles.input}
              />
            </div>
            <span className={styles.hint}>We'll use this to show you nearby restaurants</span>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className={styles.switch}>
            Already have an account? <Link to="/signin" className={styles.signInLink}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
