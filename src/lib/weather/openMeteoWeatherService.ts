
export interface WeatherData {
  temp: number;
  wind: number;
  direction: string;
  shortComment: string;
}

const FALLBACK_LAT = 55.7656649;
const FALLBACK_LON = 12.3115583;

export async function getOpenMeteoWeather(lat?: number | null, lon?: number | null): Promise<WeatherData | null> {
  const latitude = lat ?? FALLBACK_LAT;
  const longitude = lon ?? FALLBACK_LON;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,weather_code&timezone=Europe/Copenhagen&forecast_days=1`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      console.error("Failed to fetch weather data from Open-Meteo", response.statusText);
      return null;
    }

    const data = await response.json();
    
    // Find index for current hour
    const now = new Date();
    const currentHourStr = now.toISOString().substring(0, 14) + "00"; // format like 2024-04-30T11:00
    
    // Open-Meteo returns hourly data. Find the index closest to now.
    const timeIndex = data.hourly.time.findIndex((t: string) => t.startsWith(currentHourStr.substring(0, 13)));
    const index = timeIndex !== -1 ? timeIndex : 0;

    const temp = Math.round(data.hourly.temperature_2m[index]);
    const windSpeedKmH = data.hourly.wind_speed_10m[index];
    const windSpeedMs = Math.round((windSpeedKmH / 3.6) * 10) / 10;
    const windDirectionDeg = data.hourly.wind_direction_10m[index];
    const precipitationMm = data.hourly.precipitation[index];

    const direction = getWindDirectionDanish(windDirectionDeg);
    const shortComment = getWeatherComment(windSpeedMs, precipitationMm);

    return {
      temp,
      wind: windSpeedMs,
      direction,
      shortComment
    };
  } catch (error) {
    console.error("Error fetching weather data", error);
    return null;
  }
}

function getWindDirectionDanish(degrees: number): string {
  const directions = [
    "nord", "nordøst", "øst", "sydøst", 
    "syd", "sydvest", "vest", "nordvest", "nord"
  ];
  const index = Math.round(degrees / 45);
  return directions[index];
}

function getWeatherComment(windSpeedMs: number, precipitationMm: number): string {
  if (precipitationMm >= 1) return "Regn i luften";
  if (windSpeedMs >= 10) return "Meget vind";
  if (windSpeedMs >= 6) return "Frisk vind";
  if (windSpeedMs <= 2 && precipitationMm === 0) return "Stille vejr";
  if (precipitationMm === 0) return "Fine forhold";
  return "Tjek vejret";
}
