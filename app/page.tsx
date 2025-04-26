import WeatherLaundryApp from "@/components/weather-laundry-app"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-sky-700">¿Puedo lavar mi ropa hoy?</h1>
        <WeatherLaundryApp />
      </div>
    </main>
  )
}
