import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import styles from './SignIn.module.css'

export default function SignIn() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
    }
  }, [email, password, login, navigate])

  return (
    <div className={styles.signIn}>
      <div className={styles.signInChild} />
      <div className={styles.container}>
        <div className={styles.container2}>
          <div className={styles.heading1}>
            <div className={styles.welcomeBack}>Welcome Back</div>
          </div>
          <div className={styles.paragraph}>
            <div className={styles.signInTo}>Sign in to discover great deals</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className={styles.container3}>
          <div className={styles.container4}>
            <div className={styles.label}>
              <div className={styles.businessEmail}>Email</div>
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
              <div className={styles.businessEmail}>Password</div>
            </div>
            <div className={styles.container5}>
              <input
                className={styles.passwordInput}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <svg className={styles.icon2} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="9" width="12" height="8" rx="2" stroke="#99a1af" strokeWidth="1.5"/>
                <path d="M7 9V6C7 4.343 8.343 3 10 3C11.657 3 13 4.343 13 6V9" stroke="#99a1af" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <button type="submit" className={styles.button2} disabled={isLoading}>
            <div className={styles.signIn2}>{isLoading ? 'Signing in...' : 'Sign In'}</div>
          </button>
          {error && <div style={{ color: '#e94549', padding: '10px', textAlign: 'center' }}>{error}</div>}
          <div className={styles.container8} />
        </form>
        <Link to="/register" className={styles.dontHaveAContainer}>
          <span>Don't have an account? </span>
          <span className={styles.createOne}>Create one</span>
        </Link>
        <svg className={styles.containerChild} viewBox="0 0 250 274" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M196.967 198.843C198.015 198.504 198.885 197.815 199.395 196.919C199.905 196.024 200.014 194.993 199.699 194.044C196.777 185.335 194.261 174.293 181.887 173.581C175.197 173.196 168.828 176.617 165.835 181.875C162.842 187.133 163.518 193.712 167.837 198.263C175.815 206.668 187.348 201.947 196.967 198.843Z" fill="#5BB0FF"/>
          <path d="M97.8524 197.613C99.0925 196.123 101.401 196.322 102.069 197.978L109.629 216.705C110.316 218.407 108.762 220.362 106.853 220.197L85.2656 218.332C83.3561 218.167 82.5498 216.009 83.825 214.476L97.8524 197.613Z" fill="#FF7E7E"/>
          <path d="M108.731 152.976C102.823 144.552 106.83 135.703 112.918 132.627C119.253 129.426 128.62 131.741 131.698 140.854C132.286 140.476 132.253 139.861 132.385 139.344C134.767 130.19 146.437 126.405 153.39 132.551C156.768 135.536 157.618 139.499 157.143 143.717C155.333 159.788 147.397 171.794 132.187 177.992C118.771 183.458 105.739 181.624 93.8539 173.48C89.0551 170.191 87.6495 165.093 89.4379 160.139C91.3485 154.851 96.3514 151.32 101.821 151.271C104.142 151.249 106.238 151.999 108.731 152.976Z" fill="#9DFE00"/>
          <g filter="url(#filter0_d_339_573)">
            <path d="M139.259 26.3947C139.285 24.5016 137.055 23.4734 135.633 24.7224L115.7 42.2212C114.106 43.6204 115.24 46.2412 117.351 46.0379L127.862 45.0261C128.254 44.9883 128.636 45.1645 128.861 45.4871L134.916 54.1385C136.132 55.876 138.861 55.0366 138.891 52.916L139.259 26.3947Z" fill="#F95519"/>
          </g>
          <g filter="url(#filter1_d_339_573)">
            <path d="M108.059 70.0437C108.656 69.8511 109.152 69.4584 109.442 68.9485C109.732 68.4385 109.794 67.8514 109.615 67.3109C107.951 62.3514 106.518 56.0624 99.4715 55.6571C95.6613 55.438 92.0344 57.3861 90.3298 60.3806C88.6251 63.3751 89.0102 67.1218 91.4699 69.7133C96.0133 74.5003 102.581 71.8118 108.059 70.0437Z" fill="#93FF8B"/>
            <path d="M108.059 70.0437C108.656 69.8511 109.152 69.4584 109.442 68.9485C109.732 68.4385 109.794 67.8514 109.615 67.3109C107.951 62.3514 106.518 56.0624 99.4715 55.6571C95.6613 55.438 92.0344 57.3861 90.3298 60.3806C88.6251 63.3751 89.0102 67.1218 91.4699 69.7133C96.0133 74.5003 102.581 71.8118 108.059 70.0437Z" stroke="#9BFF93" strokeWidth="3.10762"/>
          </g>
          <path d="M187.92 217.808C173.643 220.95 159.297 223.759 144.981 226.716C130.732 229.66 116.51 232.776 102.218 235.492C91.1398 237.599 82.1734 234.236 75.5752 226.152C71.8021 221.531 70.3056 216.12 70.9166 210.286C73.2078 188.514 75.6151 166.752 77.9764 144.984C79.9495 126.798 81.9056 108.608 83.9115 90.4231C84.5042 85.0521 88.8643 81.3175 94.3623 81.3166C99.7995 81.3172 103.906 85.0868 104.072 90.4456C104.352 99.3529 104.489 108.271 104.734 117.186C104.981 126.13 109.766 130.66 119.512 131.054C125.073 131.281 130.163 129.699 134.579 126.413C139.776 122.55 141.429 117.305 139.198 111.612C135.745 102.804 132.164 94.0447 128.643 85.2617C126.714 80.4599 128.934 75.3537 133.883 73.1702C138.84 70.9815 144.475 72.6104 147.04 77.1212C156.87 94.4041 166.645 111.713 176.442 129.014C186.392 146.577 196.315 164.152 206.297 181.697C214.47 196.062 205.497 213.939 187.92 217.808Z" fill="white" fillOpacity="0.4"/>
          <defs>
            <filter id="filter0_d_339_573" x="90.7759" y="0.000450134" width="72.6575" height="79.2481" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="12.0872"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0.976471 0 0 0 0 0.333333 0 0 0 0 0.0980392 0 0 0 1 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_339_573"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_339_573" result="shape"/>
            </filter>
            <filter id="filter1_d_339_573" x="70.8988" y="37.3734" width="57.2037" height="53.3039" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="8.38702"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0.607822 0 0 0 0 1 0 0 0 0 0.576923 0 0 0 1 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_339_573"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_339_573" result="shape"/>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  )
}
