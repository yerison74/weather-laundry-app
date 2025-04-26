"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, CloudRain, Sun, CloudSun, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function WeatherForecast({ forecast, location }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Función para obtener el icono según la condición climática
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "rain":
        return <CloudRain className="h-6 w-6 text-blue-500" />
      case "cloudy":
        return <Cloud className="h-6 w-6 text-gray-500" />
      case "partly-cloudy":
        return <CloudSun className="h-6 w-6 text-orange-400" />
      case "sunny":
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  // Función para mostrar un resumen del pronóstico
  const renderForecastSummary = () => {
    // Contar cuántas horas lloverá
    const rainyHours = forecast.hourly.filter((hour) => hour.condition === "rain").length

    // Obtener temperatura mínima y máxima
    const temperatures = forecast.hourly.map((hour) => hour.temperature)
    const minTemp = Math.min(...temperatures)
    const maxTemp = Math.max(...temperatures)

    return (
      <div className="flex items-center justify-between px-2 py-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {["sunny", "partly-cloudy", "cloudy", "rain"].map((condition) => {
              // Verificar si esta condición existe en el pronóstico
              const exists = forecast.hourly.some((hour) => hour.condition === condition)
              if (!exists) return null

              return (
                <div
                  key={condition}
                  className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
                >
                  {getWeatherIcon(condition)}
                </div>
              )
            })}
          </div>
          <div className="text-sm">
            {rainyHours > 0 ? `Lluvia en ${rainyHours} ${rainyHours === 1 ? "hora" : "horas"}` : "Sin lluvia prevista"}
          </div>
        </div>
        <div className="text-sm font-medium">
          {minTemp}°C - {maxTemp}°C
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Pronóstico para {forecast.location}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Plegar pronóstico" : "Desplegar pronóstico"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground flex justify-between items-center">
          <span>Basado en datos reales de WeatherAPI</span>
          <span className="text-sm font-normal">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Siempre mostramos el resumen */}
        {renderForecastSummary()}

        {/* Si está expandido, mostramos el pronóstico detallado */}
        {isExpanded && (
          <>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-3">
              {forecast.hourly.map((hour) => (
                <div
                  key={hour.time}
                  className={`p-2 rounded-lg text-center ${hour.condition === "rain" ? "bg-blue-50" : ""}`}
                >
                  <div className="text-sm font-medium">{hour.time}</div>
                  <div className="flex justify-center my-1">{getWeatherIcon(hour.condition)}</div>
                  <div className="text-sm">{hour.temperature}°C</div>
                  <div className="text-xs text-muted-foreground">
                    {hour.precipitation > 0 ? `${hour.precipitation}% lluvia` : "Sin lluvia"}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
