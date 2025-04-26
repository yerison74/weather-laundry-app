// Servicio de clima usando WeatherAPI
export async function getWeatherForecast(location: string) {
  const apiKey = "04b57e808e6d44a1b29151928252604"

  // Añadir parámetros adicionales para obtener datos más precisos
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=yes&hour=24`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error al obtener el pronóstico: ${response.statusText}`)
    }

    const data = await response.json()

    // Transformar los datos de la API al formato que espera nuestra aplicación
    const hourly = data.forecast.forecastday[0].hour.map((hourData: any) => {
      const date = new Date(hourData.time)

      // Determinar la condición con mayor precisión
      let condition = "sunny"
      const conditionText = hourData.condition.text.toLowerCase()

      if (conditionText.includes("rain") || conditionText.includes("drizzle") || conditionText.includes("shower")) {
        condition = "rain"
      } else if (
        conditionText.includes("overcast") ||
        (conditionText.includes("cloud") && !conditionText.includes("partly"))
      ) {
        condition = "cloudy"
      } else if (
        conditionText.includes("partly") ||
        conditionText.includes("scattered") ||
        conditionText.includes("broken")
      ) {
        condition = "partly-cloudy"
      } else {
        condition = "sunny"
      }

      return {
        time: date.getHours().toString().padStart(2, "0") + ":00",
        temperature: Math.round(hourData.temp_c),
        condition,
        precipitation: hourData.chance_of_rain,
      }
    })

    return {
      location: data.location.name,
      date: data.forecast.forecastday[0].date,
      hourly,
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}
