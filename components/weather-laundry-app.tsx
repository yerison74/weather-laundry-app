"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Loader2 } from "lucide-react"
import WeatherForecast from "./weather-forecast"
import LaundryRecommendation from "./laundry-recommendation"
import { getWeatherForecast } from "@/lib/weather-service"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WeatherLaundryApp() {
  const [location, setLocation] = useState("")
  const [searchedLocation, setSearchedLocation] = useState("")
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState("")
  const [activeTab, setActiveTab] = useState("search")

  // Referencias para el seguimiento de ubicación
  const watchPositionId = useRef(null)
  const positionSamples = useRef([])
  const positionTimer = useRef(null)

  // Limpiar el watcher de posición cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (watchPositionId.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchPositionId.current)
      }
      if (positionTimer.current) {
        clearTimeout(positionTimer.current)
      }
    }
  }, [])

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!location.trim()) return

    setLoading(true)
    setSearchedLocation(location)
    setError("")

    try {
      const weatherData = await getWeatherForecast(location)
      setForecast(weatherData)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError("No se pudo obtener el pronóstico. Verifica la ubicación e intenta de nuevo.")
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener la posición más precisa de las muestras recolectadas
  const getMostAccuratePosition = (positions) => {
    if (!positions.length) return null

    // Ordenar por precisión (accuracy más baja = más precisa)
    return positions.sort((a, b) => a.coords.accuracy - b.coords.accuracy)[0]
  }

  const handleGetCurrentLocation = async () => {
    setGeoLoading(true)
    setGeoError("")
    positionSamples.current = []

    if (!navigator.geolocation) {
      setGeoError("La geolocalización no está soportada en tu navegador.")
      setGeoLoading(false)
      return
    }

    // Opciones para máxima precisión
    const geoOptions = {
      enableHighAccuracy: true, // Solicitar la mayor precisión posible
      timeout: 20000, // Tiempo de espera más largo para obtener mejor señal
      maximumAge: 0, // Siempre obtener una posición nueva
    }

    try {
      // Primero obtenemos una posición inicial
      const initialPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, geoOptions)
      })

      // Guardamos la primera muestra
      positionSamples.current.push(initialPosition)

      // Iniciamos el seguimiento continuo para mejorar la precisión
      if (watchPositionId.current) {
        navigator.geolocation.clearWatch(watchPositionId.current)
      }

      // Configuramos un temporizador para finalizar la recolección de muestras después de 5 segundos
      positionTimer.current = setTimeout(() => {
        if (watchPositionId.current) {
          navigator.geolocation.clearWatch(watchPositionId.current)
          watchPositionId.current = null
        }

        // Obtenemos la posición más precisa
        const bestPosition = getMostAccuratePosition(positionSamples.current)
        if (bestPosition) {
          fetchWeatherWithPosition(bestPosition)
        }
      }, 5000)

      // Iniciamos el seguimiento para recolectar múltiples muestras
      watchPositionId.current = navigator.geolocation.watchPosition(
        (position) => {
          // Añadimos cada nueva posición a nuestras muestras
          positionSamples.current.push(position)

          // Si obtenemos una posición muy precisa (menos de 10 metros), la usamos inmediatamente
          if (position.coords.accuracy < 10) {
            clearTimeout(positionTimer.current)
            navigator.geolocation.clearWatch(watchPositionId.current)
            watchPositionId.current = null
            fetchWeatherWithPosition(position)
          }
        },
        (error) => {
          console.error("Error watching position:", error)
          // Si hay un error en el seguimiento pero tenemos al menos una posición,
          // usamos la mejor que tengamos
          if (positionSamples.current.length > 0) {
            const bestPosition = getMostAccuratePosition(positionSamples.current)
            fetchWeatherWithPosition(bestPosition)
          } else {
            handleGeolocationError(error)
            setGeoLoading(false)
          }
        },
        geoOptions,
      )
    } catch (error) {
      console.error("Error getting location:", error)
      handleGeolocationError(error)
      setGeoLoading(false)
    }
  }

  const fetchWeatherWithPosition = async (position) => {
    try {
      const { latitude, longitude, accuracy } = position.coords
      console.log(`Ubicación obtenida con precisión de ±${accuracy.toFixed(1)} metros`)

      // Usar coordenadas precisas con 6 decimales para mayor exactitud
      // 6 decimales proporcionan precisión de aproximadamente 11 cm
      const locationQuery = `${latitude.toFixed(6)},${longitude.toFixed(6)}`

      setLoading(true)
      const weatherData = await getWeatherForecast(locationQuery)
      setForecast(weatherData)
      setSearchedLocation(weatherData.location)
      setError("")
    } catch (error) {
      console.error("Error fetching weather with position:", error)
      setError("No se pudo obtener el pronóstico para tu ubicación actual.")
    } finally {
      setGeoLoading(false)
      setLoading(false)
    }
  }

  const handleGeolocationError = (error) => {
    if (error.code === 1) {
      setGeoError("Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.")
    } else if (error.code === 2) {
      setGeoError("No se pudo determinar tu ubicación con precisión. Verifica que el GPS esté activado.")
    } else if (error.code === 3) {
      setGeoError("Tiempo de espera agotado. La señal GPS puede ser débil en tu ubicación actual.")
    } else {
      setGeoError("Error al obtener tu ubicación. Intenta de nuevo más tarde.")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="search">Buscar ubicación</TabsTrigger>
              <TabsTrigger value="current">Mi ubicación actual</TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Ingresa tu ubicación"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Buscar
                </Button>
              </form>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="current">
              <div className="flex flex-col items-center gap-4">
                <Button onClick={handleGetCurrentLocation} disabled={geoLoading} className="w-full" variant="outline">
                  {geoLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
                  {geoLoading ? "Obteniendo ubicación precisa..." : "Usar mi ubicación actual"}
                </Button>
                {geoError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error de geolocalización</AlertTitle>
                    <AlertDescription>{geoError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {forecast && !loading && (
        <>
          <WeatherForecast forecast={forecast} location={searchedLocation} />
          <LaundryRecommendation forecast={forecast} />
        </>
      )}
    </div>
  )
}
