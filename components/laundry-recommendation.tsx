import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CloudRain, Shirt, AlertTriangle, CheckCircle } from "lucide-react"

export default function LaundryRecommendation({ forecast }) {
  // Analizar el pronóstico para determinar si lloverá en la mañana o en la tarde
  const morningHours = forecast.hourly.filter(
    (hour) => Number.parseInt(hour.time.split(":")[0]) >= 6 && Number.parseInt(hour.time.split(":")[0]) < 12,
  )

  const afternoonHours = forecast.hourly.filter(
    (hour) => Number.parseInt(hour.time.split(":")[0]) >= 12 && Number.parseInt(hour.time.split(":")[0]) < 18,
  )

  const willRainInMorning = morningHours.some((hour) => hour.condition === "rain")
  const willRainInAfternoon = afternoonHours.some((hour) => hour.condition === "rain")

  // Encontrar la hora en que comenzará a llover
  const firstRainHour = forecast.hourly.find((hour) => hour.condition === "rain")
  const rainStartTime = firstRainHour?.time

  // Generar la recomendación
  let recommendation = ""
  let icon = <CheckCircle className="h-6 w-6 text-green-500" />
  let severity = "success"

  if (willRainInMorning && willRainInAfternoon) {
    recommendation = "No es recomendable lavar ropa hoy, ya que lloverá durante todo el día."
    icon = <AlertTriangle className="h-6 w-6 text-red-500" />
    severity = "destructive"
  } else if (willRainInMorning && !willRainInAfternoon) {
    recommendation = "Es mejor lavar la ropa después del mediodía, ya que lloverá durante la mañana."
    icon = <AlertTriangle className="h-6 w-6 text-amber-500" />
    severity = "warning"
  } else if (!willRainInMorning && willRainInAfternoon) {
    const firstAfternoonRain = afternoonHours.find((hour) => hour.condition === "rain")
    recommendation = `Puedes lavar tu ropa por la mañana, pero asegúrate de recogerla antes de las ${firstAfternoonRain?.time || rainStartTime}, cuando comenzará a llover.`
    icon = <CheckCircle className="h-6 w-6 text-green-500" />
    severity = "success"
  } else {
    recommendation = "¡Hoy es un día perfecto para lavar ropa! No se espera lluvia durante todo el día."
    icon = <CheckCircle className="h-6 w-6 text-green-500" />
    severity = "success"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="h-5 w-5" />
          Recomendación para lavar ropa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant={severity} className="flex items-start">
          <div className="mr-2 mt-1">{icon}</div>
          <div>
            <AlertTitle>
              {willRainInMorning || willRainInAfternoon ? "Precaución con la lluvia" : "¡Buen día para lavar!"}
            </AlertTitle>
            <AlertDescription className="mt-2">{recommendation}</AlertDescription>
          </div>
        </Alert>

        {(willRainInMorning || willRainInAfternoon) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <CloudRain className="h-4 w-4" />
            <span>
              Períodos de lluvia esperados: {willRainInMorning ? "Mañana" : ""}{" "}
              {willRainInMorning && willRainInAfternoon ? "y" : ""} {willRainInAfternoon ? "Tarde" : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
