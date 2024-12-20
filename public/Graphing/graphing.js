

async function loadRobotIds(initflag) {
    try {
        const response = await fetch("http://localhost:3000/getRobotId");
        if (!response.ok) throw new Error(`Failed to fetch robot IDs: ${response.status}`);
        const robotIds = await response.json();

        const compostTable = document.getElementById("compostTable");
        compostTable.innerHTML = ""; // Clear existing rows

        robotIds.sort((a, b) => {
            if (a.robotId === "Rpi__1") return -1;
            if (b.robotId === "Rpi__1") return 1;
            return 0;
        });

        for (const item of robotIds) {
            await fetchSensorID(item.robotId, compostTable, initflag);
        }
    } catch (error) {
        console.error("Error loading robot IDs:", error);
    }
}

async function fetchSensorID(robotId, compostTable, initflag) {
    try {
        const response = await fetch(`http://localhost:3000/getSensorId?robotId=${robotId}`);
        if (!response.ok) throw new Error(`Failed to fetch sensor IDs for ${robotId}: ${response.status}`);
        const sensorIds = await response.json();

        sensorIds.forEach(sensor => {
            if (initflag) {
                // const storageKey = `sliderValues-${robotId}-${sensor.sensorId}`;
                // localStorage.setItem(storageKey, 50);
            }

            const row = createGraphRow(robotId, sensor);
            compostTable.appendChild(row);
            loadGrouping(robotId, sensor.sensorId);
        });
    } catch (error) {
        console.error(`Error fetching sensor IDs for robotId ${robotId}:`, error);
    }
}

window.onload = async function () {
    try {
        const initflag = true;
        await loadRobotIds(initflag);
        const myLineChart = createChart('myChart', 'line', ['Jan', 'Feb', 'Mar'], [10, 20, 15]);
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};

setInterval(async function () {
    try {
        const initflag = false;
        await updateReadings(initflag);
    } catch (error) {
        console.error("Error updating readings:", error);
    }
}, 1000);




function createGraphRow(robotId, sensor) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${robotId}</td>
        <td>${sensor.sensorId}</td>
        <td id="Temp-${robotId}-${sensor.sensorId}">--</td>
        <td id="Humd-${robotId}-${sensor.sensorId}">--</td>
        <td id="PowerUsage-${robotId}-${sensor.sensorId}">--</td>
        <td id="Duration-${robotId}-${sensor.sensorId}">--</td>
    `;
    return row;
};

function loadGrouping(robotId ,sensorId){
    timeSlider(robotId, sensorId);
};

function loadGraphData(robotId ,sensorId){
    
};

function loadPowerGauge(robotId ,sensorId)
{

};

function timeSlider(robotId, sensorId) {
    const storageKey = `sliderValue-${robotId}-${sensorId}`;
    const savedValue = localStorage.getItem(storageKey) || 50;
    document.getElementById(`Duration-${robotId}-${sensorId}`).innerHTML = `
        <div class="slidecontainer">
            <input 
                type="range" 
                min="1" 
                max="100" 
                value="${savedValue}" 
                class="slider" 
                oninput="updateSliderValue('${robotId}', '${sensorId}', this.value)"
            >
        </div>
    `;
}
function updateSliderValue(robotId, sensorId, value) {
    const storageKey = `sliderValue-${robotId}-${sensorId}`;
    localStorage.setItem(storageKey, value);
    console.log(`Saved ${value} for ${storageKey}`);
}