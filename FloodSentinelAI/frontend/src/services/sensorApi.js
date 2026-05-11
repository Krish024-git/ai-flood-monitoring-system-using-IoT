export async function getSensorData(signal) {
  const response = await fetch("/sensor-data", {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Sensor API failed with status ${response.status}`);
  }

  return response.json();
}
