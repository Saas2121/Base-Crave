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
  const [role, setRole] = useState<UserRole>(UserRole.CONSUMER)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(name, email, password, role)
      navigate('/')
    } catch (err) {
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register</h1>
        <p className={styles.subtitle}>Create your CRAVE account</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Account Type</label>
            <div className={styles.roleSelector}>
              <button
                type="button"
                className={`${styles.roleButton} ${role === UserRole.CONSUMER ? styles.active : ''}`}
                onClick={() => setRole(UserRole.CONSUMER)}
              >
                Consumer
              </button>
              <button
                type="button"
                className={`${styles.roleButton} ${role === UserRole.STORE_ADMIN ? styles.active : ''}`}
                onClick={() => setRole(UserRole.STORE_ADMIN)}
              >
                Store Admin
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
        <Link to="/start" className={styles.backLink}>← Back</Link>
      </div>
    </div>
  )
}
