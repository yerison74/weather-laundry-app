"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";
import WeatherForecast from "./weather-forecast";
import LaundryRecommendation from "./laundry-recommendation";
import { getWeatherForecast } from "@/lib/weather-service";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ForecastData = {
  location: any;
  date: any;
  hourly: any;
};

export default function WeatherLaundryApp() {
  const [location, setLocation] = useState("");
  const [searchedLocation, setSearchedLocation] = useState("");
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [activeTab, setActiveTab] = useState("search");

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setSearchedLocation(location);
    setError("");

    try {
      const weatherData = await getWeatherForecast(location);
      setForecast(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("No se pudo obtener el pronóstico. Verifica la ubicación e intenta de nuevo.");
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setGeoLoading(true);
    setGeoError("");

    if (!navigator.geolocation) {
      setGeoError("La geolocalización no está soportada en tu navegador.");
      setGeoLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      const locationQuery = `${latitude},${longitude}`;

      setLoading(true);
      const weatherData = await getWeatherForecast(locationQuery);
      setForecast(weatherData);
      setSearchedLocation(weatherData.location);
      setError("");
    } catch (error) {
      console.error("Error getting location:", error);

      const geoError = error as GeolocationPositionError;

      if (geoError.code === 1) {
        setGeoError("Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.");
      } else if (geoError.code === 2) {
        setGeoError("No se pudo determinar tu ubicación. Verifica que el GPS esté activado.");
      } else if (geoError.code === 3) {
        setGeoError("Tiempo de espera agotado. Intenta de nuevo.");
      } else {
        setGeoError("Error al obtener tu ubicación. Intenta de nuevo más tarde.");
      }
    } finally {
      setGeoLoading(false);
      setLoading(false);
    }
  };

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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
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
                  {geoLoading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
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
  );
}
