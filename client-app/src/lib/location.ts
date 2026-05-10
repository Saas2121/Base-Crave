const FALLBACK = { lat: 3.4516, lng: -76.532 }

let cachedLocation: { lat: number; lng: number } | null = null
let pendingPromise: Promise<{ lat: number; lng: number }> | null = null

export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  if (cachedLocation) return Promise.resolve(cachedLocation)
  if (pendingPromise) return pendingPromise

  pendingPromise = new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          cachedLocation = { lat: position.coords.latitude, lng: position.coords.longitude }
          pendingPromise = null
          resolve(cachedLocation)
        },
        () => {
          cachedLocation = FALLBACK
          pendingPromise = null
          resolve(FALLBACK)
        }
      )
    } else {
      cachedLocation = FALLBACK
      pendingPromise = null
      resolve(FALLBACK)
    }
  })

  return pendingPromise
}
