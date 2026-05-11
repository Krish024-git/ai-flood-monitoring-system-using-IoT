async function loadSensorData() {
    try {
        const response = await fetch(
            'http://10.33.29.17:5000/sensor-data'
        );

        const data = await response.json();

        console.log(data);

    } catch (error) {

        console.log(error);
    }
}

window.addEventListener("DOMContentLoaded", () => {
  loadSensorData();
});

setInterval(loadSensorData, 2000);
