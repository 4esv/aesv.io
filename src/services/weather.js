const ITHACA_LAT = 42.4406
const ITHACA_LON = -76.5019

const CONDITION_BY_CODE = {
  0: 'clear',
  1: 'mostly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'freezing drizzle',
  57: 'freezing drizzle',
  61: 'rain',
  63: 'rain',
  65: 'heavy rain',
  66: 'freezing rain',
  67: 'freezing rain',
  71: 'snow',
  73: 'snow',
  75: 'heavy snow',
  77: 'snow grains',
  80: 'showers',
  81: 'showers',
  82: 'showers',
  85: 'snow showers',
  86: 'snow showers',
  95: 'thunder',
  96: 'thunder',
  99: 'thunder',
}

export async function getCurrentWeather(lat = ITHACA_LAT, lon = ITHACA_LON) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,is_day,surface_pressure` +
    `&hourly=precipitation_probability` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=fahrenheit&timezone=America/New_York&forecast_days=1`

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const code = data.current?.weather_code
    const pressureHpa = data.current?.surface_pressure
    // NOTE: Open-Meteo returns hourly arrays aligned to the local TZ.
    //   Pick the slot matching the current hour so the precip chance
    //   reflects "now," not midnight.
    const nowHour = new Date().getHours()
    const precipPct = data.hourly?.precipitation_probability?.[nowHour]
    return {
      tempF: Math.round(data.current?.temperature_2m),
      condition: CONDITION_BY_CODE[code] || 'unknown',
      conditionCode: code,
      isDay: data.current?.is_day === 1,
      highF: Math.round(data.daily?.temperature_2m_max?.[0]),
      lowF: Math.round(data.daily?.temperature_2m_min?.[0]),
      pressureHpa: pressureHpa != null ? Math.round(pressureHpa) : null,
      precipPct: precipPct != null ? Math.round(precipPct) : null,
      city: 'Ithaca',
    }
  } catch {
    return null
  }
}
