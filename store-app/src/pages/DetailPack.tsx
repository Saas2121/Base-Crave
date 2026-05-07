import { FunctionComponent, useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { packsAPI } from '../api/client'
import { Pack } from '../types'
import styles from './DetailPack.module.css'

const DetailPack: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pack, setPack] = useState<Pack | null>(null)
  const [quantity, setQuantity] = useState(3)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      loadPack()
    }
  }, [id])

  const loadPack = async () => {
    try {
      const response = await packsAPI.getOne(id!)
      setPack(response)
      setQuantity(response.remaining_quantity)
    } catch {
      // silently fail
    }
  }

  const handleBack = useCallback(() => {
    navigate('/packs')
  }, [navigate])

  const handleDecrease = () => {
    if (quantity > 0) setQuantity(quantity - 1)
  }

  const handleIncrease = () => {
    setQuantity(quantity + 1)
  }

  const handleSave = async () => {
    if (!pack) return
    setSaving(true)
    try {
      const data = await packsAPI.update(pack.id, { remaining_quantity: quantity })
      setPack(data)
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!pack) return
    if (window.confirm('Are you sure you want to delete this pack?')) {
      try {
        await packsAPI.delete(pack.id)
        navigate('/packs')
      } catch {
        // silently fail
      }
    }
  }

  if (!pack) return <div className={styles.greetingUser}>Loading...</div>
  
  const availabilityPercentage = (pack.remaining_quantity / pack.total_quantity) * 100

  return (
    <div className={styles.greetingUser}>
      <div className={styles.app}>
        <div className={styles.container}>
          <div className={styles.container2}>
            <div className={styles.heading3}>
              <div className={styles.crunchyChickenPack}>{pack.title}</div>
            </div>
            <div className={styles.paragraph}>
              <div className={styles.div}>${pack.price.toLocaleString('es-CO')}</div>
            </div>
            <div className={styles.iconGroup}>
              <img className={styles.icon3} alt="" src="/images/clock.svg" />
              <div className={styles.text4}>
                <div className={styles.pm}>12-5 PM</div>
              </div>
            </div>
            <div className={styles.groupParent}>
              <div className={styles.iconParent}>
                <img className={styles.icon3} alt="" src="/images/icon.svg" />
                <div className={styles.text}>
                  <div className={styles.availability8}>Availability {pack.remaining_quantity} / {pack.total_quantity}</div>
                </div>
              </div>
              <div className={styles.container7}>
                <div className={styles.container8} style={{ width: `${availabilityPercentage}%` }} />
              </div>
            </div>
            <div className={styles.container3}>
              <div className={styles.paragraph2}>
                <div className={styles.stock}>Stock</div>
              </div>
              <div className={styles.container4}>
                <div className={styles.button} onClick={handleDecrease}>
                  <img className={styles.icon} alt="Decrease" src="/images/vector.svg" />
                </div>
                <div className={styles.container5}>
                  <div className={styles.paragraph3}>
                    <div className={styles.div2}>{quantity}</div>
                  </div>
                </div>
                <div className={styles.button} onClick={handleIncrease}>
                  <img className={styles.icon} alt="Increase" src="/images/union.svg" />
                </div>
              </div>
            </div>
            <div className={styles.container6}>
              <div className={styles.paragraph4} />
              <div className={styles.paragraph4}>
                <div className={styles.ltimaActualizacinHoy}>Última actualización: Hoy, 10:30 AM</div>
              </div>
            </div>
            <div className={styles.button4} onClick={handleDelete}>
              <div className={styles.text3}>
                <div className={styles.deletePack}>Delete Pack</div>
              </div>
            </div>
            <div className={styles.button3} onClick={handleSave}>
              <div className={styles.text2}>
                <div className={styles.save}>{saving ? 'Saving...' : 'Save'}</div>
              </div>
            </div>
          </div>
            <div className={styles.container9}>
            <img className={styles.container9} src={pack.image_url || '/images/image-placeholder.svg'} alt={pack.title} />
            <div className={styles.container10}>
              <div className={styles.meals}>{pack.pack_type === 'fixed' ? 'Fixed Pack' : 'Surprise Pack'}</div>
            </div>
          </div>
        </div>
        <div className={styles.rectangleParent}>
          <div className={styles.frameChild} />
          <div className={styles.parent}>
            <div className={styles.div3}>11:11</div>
            <img className={styles.vectorIcon} alt="" src="/images/signal.svg" />
            <img className={styles.iconstackioWifiMediumRe} alt="" src="/images/wifi.svg" />
            <div className={styles.iconstackioBattery1}>
              <img className={styles.vectorIcon2} alt="" src="/images/battery.svg" />
              <div className={styles.iconstackioBattery1Child} />
            </div>
          </div>
          <div className={styles.detailPack}>Detail Pack</div>
          <div className={styles.button5} onClick={handleBack}>
            <img className={styles.icon5} alt="" src="/images/icon-1.svg" />
            <div className={styles.paragraph6}>
              <div className={styles.volver}>Volver</div>
            </div>
          </div>
        </div>
        <div className={styles.navStore}>
          <div className={styles.navStoreChild} />
          <div className={styles.bottomnav}>
            <div className={styles.container11}>
              <div className={styles.link} onClick={() => navigate('/')}>
                <img className={styles.icon6} alt="" src="/images/home-icon.svg" />
                <div className={styles.bottomnav2}>
                  <div className={styles.home}>Home</div>
                </div>
              </div>
              <div className={styles.link2} onClick={() => navigate('/packs')}>
                <img className={styles.icon6} alt="" src="/images/packs-icon.svg" />
                <div className={styles.bottomnav3}>
                  <div className={styles.packs}>Packs</div>
                </div>
              </div>
              <div className={styles.link3} onClick={() => navigate('/orders')}>
                <img className={styles.icon6} alt="" src="/images/orders-icon.svg" />
                <div className={styles.bottomnav4}>
                  <div className={styles.orders}>Orders</div>
                </div>
              </div>
              <div className={styles.link4} onClick={() => navigate('/profile')}>
                <img className={styles.icon6} alt="" src="/images/profile-icon.svg" />
                <div className={styles.bottomnav5}>
                  <div className={styles.home}>Profile</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailPack