

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
                const row = createGraphRow(robotId, sensor);
                compostTable.appendChild(row);
                InitGraphData(robotId, sensor.sensorId, 'temperature')
                InitGraphData(robotId, sensor.sensorId, 'humidity');

                
                // const storageKey = `sliderValues-${robotId}-${sensor.sensorId}`;
                // localStorage.setItem(storageKey, 50);
            }

            
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
        // const myLineChart = createChart('myChart', 'line', ['Jan', 'Feb', 'Mar'], [10, 20, 15]);
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


async function updateReadings(initflag) {
    // Your code to update readings
    console.log("Readings updated with initflag:", initflag);
}




function createGraphRow(robotId, sensor) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${robotId}</td>
        <td>${sensor.sensorId}</td>
        <td id="temperature-${robotId}-${sensor.sensorId}">--</td>
        <td id="humidity-${robotId}-${sensor.sensorId}">--</td>
        <td id="PowerUsage-${robotId}-${sensor.sensorId}">--</td>
        <td id="Duration-${robotId}-${sensor.sensorId}">--</td>
    `;
    
    return row;

};

function loadGrouping(robotId ,sensorId){
    timeSlider(robotId, sensorId);
    loadGraphData(robotId ,sensorId,'temperature')
    loadGraphData(robotId ,sensorId,'humidity')
};

function InitGraphData(robotId, sensorId, type) {
    // Construct the element ID
    const elementId = `${type}-${robotId}-${sensorId}`;
    const targetElement = document.getElementById(elementId);

    // Check if the target element exists
    if (!targetElement) {
        console.error(`Element with ID "${elementId}" not found.`);
        return;
    }

    // Dynamically update the element with graph data
    targetElement.innerHTML = `
        <div>
            <canvas id="chart-${elementId}" width="150" height="75"></canvas>
        </div>
    `;
    
}


function loadGraphData(robotId, sensorId, type) {
    const elementId = `${type}-${robotId}-${sensorId}`;
    const chartId = `chart-${elementId}`;
    const canvas = document.getElementById(chartId);

    if (!canvas) {
        console.error(`Canvas with ID "${chartId}" not found.`);
        return;
    }

    // Get the context for Chart.js
    const ctx = canvas.getContext('2d');

    // Create a placeholder graph
    const placeholderChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Loading...'],
            datasets: [{
                label: `${type} Data`,
                data: [0], // Placeholder value
                backgroundColor: 'rgba(192, 192, 192, 0.2)',
                borderColor: 'rgba(192, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    // Simulate loading data with a timeout
    setTimeout(() => {
        // Update the chart with real data after 2 seconds
        placeholderChart.data.labels = ['1', '2', '3', '4', '5'];
        placeholderChart.data.datasets[0].data = [10, 20, 30, 40, 50];
        placeholderChart.update();
    }, 100);
}

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