import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, CloudRain, Sun, CloudSun, MapPin } from "lucide-react"

export default function WeatherForecast({ forecast, location }) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Pronóstico para {forecast.location}</span>
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </CardTitle>
        <div className="mt-2 text-sm text-muted-foreground">Basado en datos reales de WeatherAPI</div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
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
      </CardContent>
    </Card>
  )
}
