import { useState, useEffect, useRef } from 'react'
import styles from './MapPicker.module.css'

interface MapPickerProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number, address: string) => void
  onClose: () => void
}

export default function MapPicker({ initialLat = 3.4516, initialLng = -76.532, onLocationSelect, onClose }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS
    if (!(window as any).L) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      initMap()
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [])

  const initMap = () => {
    const L = (window as any).L
    if (!L || !mapRef.current) return

    const map = L.map(mapRef.current).setView([initialLat, initialLng], 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)

    const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map)

    marker.on('dragend', async (e: any) => {
      const { lat, lng } = e.target.getLatLng()
      await reverseGeocode(lat, lng)
    })

    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      await reverseGeocode(lat, lng)
    })

    mapInstanceRef.current = map
    markerRef.current = marker

    reverseGeocode(initialLat, initialLng)
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      let shortAddr = ''
      if (data.address) {
        if (data.address.neighbourhood) {
          shortAddr = data.address.neighbourhood
        } else if (data.address.suburb) {
          shortAddr = data.address.suburb
        } else if (data.address.city_district) {
          shortAddr = data.address.city_district
        } else if (data.address.village) {
          shortAddr = data.address.village
        } else if (data.address.town) {
          shortAddr = data.address.town
        } else if (data.address.city) {
          shortAddr = data.address.city
        } else if (data.address.road) {
          shortAddr = data.address.road
        }
      }
      
      if (!shortAddr) {
        shortAddr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }
      
      setAddress(shortAddr)
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (markerRef.current) {
      const { lat, lng } = markerRef.current.getLatLng()
      onLocationSelect(lat, lng, address)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Select Location</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div ref={mapRef} className={styles.map} />
        <div className={styles.info}>
          {loading ? (
            <span>Loading address...</span>
          ) : (
            <span>{address || 'Click on map to select location'}</span>
          )}
        </div>
        <button className={styles.confirmBtn} onClick={handleConfirm}>
          Confirm Location
        </button>
      </div>
    </div>
  )
}
