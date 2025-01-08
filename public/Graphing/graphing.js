

async function loadRobotIds(initflag) {
    try {
        const response = await fetch("http://localhost:3000/getRobotId");
        if (!response.ok) throw new Error(`Failed to fetch robot IDs: ${response.status}`);
        const robotIds = await response.json();

        const compostTable = document.getElementById("compostTable");
        if (initflag) {
            compostTable.innerHTML = ""; // Clear existing rows
        }
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
    loadRobotIds(initflag)
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
            <canvas id="chart-${elementId}" width="200" height="100"></canvas>
        </div>
    `;
    
}


function loadGraphData(robotId, sensorId, type) {
    const storageKey = `sliderValue-${robotId}-${sensorId}`;
    const savedValue = localStorage.getItem(storageKey) || 50;

    const elementId = `${type}-${robotId}-${sensorId}`;
    const chartId = `chart-${elementId}`;
    const canvas = document.getElementById(chartId);

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getGraph?robotID=${robotId}&sensorId=${sensorId}&type=${type}&duration=${savedValue}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const ctx = canvas.getContext('2d');
            const labels = data.map(entry => {
                const adjustedDate = new Date(entry.timestamp);
                adjustedDate.setHours(adjustedDate.getHours());
                return adjustedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            });

            let chart;
            if (type === 'temperature') {
                const graphvalue = data.map(entry => entry.temperature);
                if (!canvas.chart) {
                    chart = tempGraph(graphvalue, labels, ctx);
                    canvas.chart = chart;
                } else {
                    updateChart(canvas.chart, labels, graphvalue);
                }
            } else {
                const graphvalue = data.map(entry => entry.humidity);
                if (!canvas.chart) {
                    chart = humdGraph(graphvalue, labels, ctx);
                    canvas.chart = chart;
                    updateChart(canvas.chart, labels, graphvalue);
                }
            }
        }
    };
    xhr.send();
}

function updateChart(chart, newLabels, newData) {
    chart.data.labels = newLabels;
    chart.data.datasets[0].data = newData;
    chart.update();
}

function tempGraph(temperatures, labels, ctx) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function humdGraph(humidities, labels, ctx) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity (%)',
                data: humidities,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    }
                }
            }
        }
    });
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
                min="24" 
                max="2400" 
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