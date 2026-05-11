from __future__ import annotations

import math
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone


INDIA_LOCATIONS = {
    "Delhi": {
        "New Delhi": {
            "lat": 28.6139,
            "lon": 77.2090,
            "river": "Yamuna",
            "quality": "Moderate",
            "base_level": 1.9,
            "base_flow": 0.82,
        }
    },
    "Maharashtra": {
        "Mumbai": {
            "lat": 19.0760,
            "lon": 72.8777,
            "river": "Mithi",
            "quality": "Stressed",
            "base_level": 1.6,
            "base_flow": 0.68,
        },
        "Pune": {
            "lat": 18.5204,
            "lon": 73.8567,
            "river": "Mula-Mutha",
            "quality": "Moderate",
            "base_level": 1.4,
            "base_flow": 0.61,
        },
    },
    "Gujarat": {
        "Ahmedabad": {
            "lat": 23.0225,
            "lon": 72.5714,
            "river": "Sabarmati",
            "quality": "Moderate",
            "base_level": 1.5,
            "base_flow": 0.58,
        },
        "Surat": {
            "lat": 21.1702,
            "lon": 72.8311,
            "river": "Tapi",
            "quality": "Good",
            "base_level": 1.8,
            "base_flow": 0.76,
        },
    },
    "Karnataka": {
        "Bengaluru": {
            "lat": 12.9716,
            "lon": 77.5946,
            "river": "Vrishabhavathi",
            "quality": "Stressed",
            "base_level": 1.1,
            "base_flow": 0.42,
        }
    },
    "Tamil Nadu": {
        "Chennai": {
            "lat": 13.0827,
            "lon": 80.2707,
            "river": "Cooum",
            "quality": "Stressed",
            "base_level": 1.3,
            "base_flow": 0.51,
        },
        "Coimbatore": {
            "lat": 11.0168,
            "lon": 76.9558,
            "river": "Noyyal",
            "quality": "Moderate",
            "base_level": 1.0,
            "base_flow": 0.44,
        },
    },
    "West Bengal": {
        "Kolkata": {
            "lat": 22.5726,
            "lon": 88.3639,
            "river": "Hooghly",
            "quality": "Moderate",
            "base_level": 2.2,
            "base_flow": 0.92,
        }
    },
    "Bihar": {
        "Patna": {
            "lat": 25.5941,
            "lon": 85.1376,
            "river": "Ganga",
            "quality": "Moderate",
            "base_level": 2.4,
            "base_flow": 1.02,
        }
    },
    "Assam": {
        "Guwahati": {
            "lat": 26.1445,
            "lon": 91.7362,
            "river": "Brahmaputra",
            "quality": "Good",
            "base_level": 3.0,
            "base_flow": 1.24,
        }
    },
    "Uttar Pradesh": {
        "Lucknow": {
            "lat": 26.8467,
            "lon": 80.9462,
            "river": "Gomti",
            "quality": "Moderate",
            "base_level": 1.7,
            "base_flow": 0.67,
        },
        "Varanasi": {
            "lat": 25.3176,
            "lon": 82.9739,
            "river": "Ganga",
            "quality": "Moderate",
            "base_level": 2.1,
            "base_flow": 0.88,
        },
    },
    "Kerala": {
        "Kochi": {
            "lat": 9.9312,
            "lon": 76.2673,
            "river": "Periyar",
            "quality": "Good",
            "base_level": 1.7,
            "base_flow": 0.79,
        }
    },
}


def _openweather_to_report_weather(current_payload: dict, forecast_payload: dict) -> dict:
    current_rain = current_payload.get("rain", {}) or {}
    current_wind = current_payload.get("wind", {}) or {}
    observed_at = datetime.fromtimestamp(
        current_payload.get("dt", datetime.now().timestamp()),
        tz=timezone.utc,
    ).astimezone().isoformat(timespec="minutes")

    probabilities = []
    precipitation = []
    wind_speeds = []
    for item in forecast_payload.get("list", [])[:24]:
        rain = (item.get("rain") or {}).get("3h", 0) or 0
        precipitation.extend([float(rain) / 3] * 3)
        probabilities.extend([float(item.get("pop") or 0) * 100] * 3)
        wind_speeds.extend([float((item.get("wind") or {}).get("speed") or 0) * 3.6] * 3)

    if not probabilities:
        probabilities = [0] * 72
    if not precipitation:
        precipitation = [float(current_rain.get("1h") or current_rain.get("3h") or 0)] * 72
    if not wind_speeds:
        wind_speeds = [float(current_wind.get("speed") or 0) * 3.6] * 72

    return {
        "current": {
            "time": observed_at,
            "rain": float(current_rain.get("1h") or current_rain.get("3h") or 0),
            "precipitation": float(current_rain.get("1h") or current_rain.get("3h") or 0),
            "wind_speed_10m": round(float(current_wind.get("speed") or 0) * 3.6, 1),
        },
        "hourly": {
            "precipitation_probability": probabilities[:72],
            "precipitation": precipitation[:72],
            "wind_speed_10m": wind_speeds[:72],
        },
        "provider": "OpenWeatherMap",
    }


def _fetch_openweather(latitude: float, longitude: float, api_key: str) -> dict:
    base_params = {
        "lat": latitude,
        "lon": longitude,
        "appid": api_key,
        "units": "metric",
    }
    weather_url = "https://api.openweathermap.org/data/2.5/weather?" + urllib.parse.urlencode(base_params)
    forecast_url = "https://api.openweathermap.org/data/2.5/forecast?" + urllib.parse.urlencode(base_params)
    import json

    with urllib.request.urlopen(weather_url, timeout=8) as response:
        current_payload = json.loads(response.read().decode("utf-8"))
    with urllib.request.urlopen(forecast_url, timeout=8) as response:
        forecast_payload = json.loads(response.read().decode("utf-8"))
    return _openweather_to_report_weather(current_payload, forecast_payload)


async def fetch_weather(latitude: float, longitude: float) -> dict:
    openweather_key = os.getenv("OPENWEATHER_API_KEY") or os.getenv("OPENWEATHERMAP_API_KEY")
    if openweather_key:
        return _fetch_openweather(latitude, longitude, openweather_key)

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m",
        "hourly": "precipitation_probability,precipitation,wind_speed_10m",
        "forecast_days": 3,
        "timezone": "Asia/Kolkata",
    }
    url = "https://api.open-meteo.com/v1/forecast?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=8) as response:
        import json

        return json.loads(response.read().decode("utf-8"))


def fallback_weather(latitude: float, longitude: float) -> dict:
    month = datetime.now().month
    monsoon_factor = 1.0 if month in (6, 7, 8, 9) else 0.28
    coastal_factor = 0.35 if longitude < 74 or longitude > 86 else 0.12
    base_probability = min(85, 18 + monsoon_factor * 38 + coastal_factor * 22)
    hourly_probability = [max(5, base_probability - hour * 0.45) for hour in range(72)]
    hourly_rain = [
        round(max(0, (probability - 35) / 28) * monsoon_factor, 2)
        for probability in hourly_probability
    ]
    return {
        "current": {
            "time": datetime.now().isoformat(timespec="minutes"),
            "rain": hourly_rain[0],
            "precipitation": hourly_rain[0],
            "wind_speed_10m": round(9 + coastal_factor * 11 + monsoon_factor * 4, 1),
        },
        "hourly": {
            "precipitation_probability": hourly_probability,
            "precipitation": hourly_rain,
            "wind_speed_10m": [round(9 + coastal_factor * 11 + monsoon_factor * 4, 1)] * 72,
        },
        "fallback": True,
    }


def get_location(state: str, city: str) -> dict:
    state_data = INDIA_LOCATIONS.get(state)
    if not state_data or city not in state_data:
        raise ValueError("Selected city/state is not available in the India-only catalog.")
    return {"state": state, "city": city, **state_data[city]}


def nearest_location(latitude: float, longitude: float) -> dict:
    best = None
    best_distance = float("inf")
    for state, cities in INDIA_LOCATIONS.items():
        for city, data in cities.items():
            distance = math.hypot(latitude - data["lat"], longitude - data["lon"])
            if distance < best_distance:
                best = {"state": state, "city": city, **data}
                best_distance = distance
    return best or get_location("Delhi", "New Delhi")


def build_river_report(location: dict, weather: dict) -> dict:
    current = weather.get("current", {})
    hourly = weather.get("hourly", {})
    rain_now = float(current.get("rain") or current.get("precipitation") or 0)
    wind_speed = float(current.get("wind_speed_10m") or 0)
    probabilities = hourly.get("precipitation_probability") or []
    precipitation = hourly.get("precipitation") or []

    max_probability_24h = max(probabilities[:24] or [0])
    rainfall_24h = sum(float(value or 0) for value in precipitation[:24])
    water_level = location["base_level"] + rain_now * 0.18 + rainfall_24h * 0.035
    flow_speed = location["base_flow"] + rainfall_24h * 0.012 + wind_speed * 0.004
    risk_score = min(100, rainfall_24h * 2.4 + max_probability_24h * 0.42 + max(0, water_level - 2.5) * 18)

    if risk_score < 35:
        status = "Normal / No Risk"
        risk = "No active flood risk indicated by current weather and river baseline."
    elif risk_score < 65:
        status = "Moderate Risk"
        risk = "Rising rainfall probability may increase river level and local drainage stress."
    else:
        status = "High Risk"
        risk = "Heavy rainfall pattern may produce fast river rise, overflow, or urban flooding."

    safe_hours = 0
    for probability, rain in zip(probabilities[:72], precipitation[:72]):
        if float(probability or 0) < 45 and float(rain or 0) < 1.8:
            safe_hours += 1
        else:
            break

    safe_message = (
        f"Current safe conditions are expected to last about {safe_hours} hours."
        if status == "Normal / No Risk"
        else "Safe-condition duration is reduced because forecast rainfall or river stress is elevated."
    )

    provider = weather.get("provider") or "Open-Meteo"
    note = f"Weather is live from {provider}. River values combine city river baselines with live rainfall and wind patterns."
    if weather.get("fallback"):
        note = "Weather service fallback is active. River values use regional seasonal rainfall estimates and city river baselines."

    return {
        "state": location["state"],
        "city": location["city"],
        "latitude": location["lat"],
        "longitude": location["lon"],
        "river": location["river"],
        "flow_speed_mps": round(flow_speed, 2),
        "wind_speed_kmph": round(wind_speed, 1),
        "water_level_m": round(water_level, 2),
        "water_quality": location["quality"],
        "rainfall_next_24h_mm": round(rainfall_24h, 1),
        "max_rain_probability_24h": round(max_probability_24h, 1),
        "risk_score": round(risk_score, 1),
        "status": status,
        "risk_explanation": risk,
        "safe_duration": safe_message,
        "weather_observed_at": current.get("time") or datetime.utcnow().isoformat(),
        "data_note": note,
    }
