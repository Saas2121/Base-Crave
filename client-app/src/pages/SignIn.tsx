import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import styles from './SignIn.module.css'

export default function SignIn() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
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
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to discover great deals</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
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

          <div className={styles.field2}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <img src="/images/icon2.svg" alt="" className={styles.icon} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={styles.input}
                required
              />
            </div>
          </div>

          <Link to="/forgot-password" className={styles.forgotPassword}>Forgot password?</Link>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.switch}>
          Don't have an account? <Link to="/register" className={styles.createAccount}>Create account</Link>
        </p>
      </div>
    </div>
  )
}
