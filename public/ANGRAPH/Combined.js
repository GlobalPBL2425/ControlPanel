// Store sensor colors
const sensorColors = {};


async function loadRobotIds(initflag) {
    try {
        const response = await fetch("http://localhost:3000/getRobotId");
        if (!response.ok) throw new Error(`Failed to fetch robot IDs: ${response.status}`);
        const robotIds = await response.json();

        const dynamicTable = document.getElementById("dynamicTable");
        if (initflag) {
            dynamicTable.innerHTML = ""; // Clear existing rows
        }

        robotIds.sort((a, b) => {
            if (a.robotId === "Rpi__1") return -1;
            if (b.robotId === "Rpi__1") return 1;
            return 0;
        });

        for (const item of robotIds) {
            if (initflag) {
                createGraphRow(item.robotId, dynamicTable);
                InitGraphData(item.robotId, 'temperature');
                InitGraphData(item.robotId, 'humidity');
            }
            const sensorData  =await fetchSensorID(item.robotId);
            //console.log(sensorData)

            //Displaying part
            displayGraphData(item.robotId, 'temperature', sensorData)
            displayGraphData(item.robotId, 'humidity', sensorData)
        }
    } catch (error) {
        console.error("Error loading robot IDs:", error);
    }
}

async function fetchSensorID(robotId) {
    try {
        const response = await fetch(`http://localhost:3000/getSensorId?robotId=${robotId}`);
        if (!response.ok) throw new Error(`Failed to fetch sensor IDs for ${robotId}: ${response.status}`);

        const sensorIds = await response.json();
        const sensorData = {};

        for (const sensor of sensorIds) {
            const readingData = await loadGraphData(robotId, sensor.sensorId);
            sensorData[sensor.sensorId] = {
                readingData
            };

            // Assign a random color to the sensor if it doesn't already have one
            if (!sensorColors[sensor.sensorId]) {
                sensorColors[sensor.sensorId] = getRandomColor();
            }
        }

        //console.log(sensorData); // For testing
        return sensorData;
    } catch (error) {
        console.error(`Error fetching sensor IDs for robotId ${robotId}:`, error);
        return null;
    }
}

window.onload = async function () {
    try {
        const initflag = true;
        await loadRobotIds(initflag);
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};

function createGraphRow(robotId, dynamicTable) {
    const row = document.createElement("tr");
    const row2 = document.createElement("tr");
    row.innerHTML = `
        <td rowspan="2">${robotId}</td>
        <td id="temperature-${robotId}">--</td>
        <td rowspan="2">--</td>
    `;
    dynamicTable.appendChild(row);
    row2.innerHTML = `
        <td id="humidity-${robotId}">--</td>
    `;
    dynamicTable.appendChild(row2);
}

setInterval(async function () {
    try {
        const initflag = false;
        await loadRobotIds(initflag);
    } catch (error) {
        console.error("Error updating readings:", error);
    }
}, 10000);

function loadGraphData(robotId, sensorId) {
    const savedStartTime = new Date(0);
    const savedEndTime = new Date();

    savedStartTime.setHours(savedStartTime.getHours() + 9);
    savedEndTime.setHours(savedEndTime.getHours() + 9);

    const startFormatted = savedStartTime.toISOString();
    const endFormatted = savedEndTime.toISOString();

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `http://localhost:3000/getFROMTO?robotID=${robotId}&sensorId=${sensorId}&starttime=${startFormatted}&endtime=${endFormatted}`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data);
                } else {
                    reject(new Error(`Failed to fetch data: ${xhr.status}`));
                }
            }
        };
        xhr.send();
    });
}

function displayGraphData(robotId, type, data) {
    const elementId = `${type}-${robotId}`;
    const canvasId = `chart-${elementId}`;
    const canvas = document.getElementById(canvasId);

    if (!canvas) return; // Ensure the canvas exists
    const ctx = canvas.getContext('2d');

    // Prepare datasets for each sensor
    const datasets = [];
    const firstSensor = Object.values(data)[0];

    let currentDate = null;
    let hourlyLabels = [];
    let dataLabels = [];
    const labels = firstSensor.readingData.map(entry => entry.timestamp);
    // Prepare the hourly labels for the x-axis
    // firstSensor.readingData.forEach(entry => {
    //     const adjustedDate = new Date(entry.timestamp);
    //     adjustedDate.setHours(adjustedDate.getHours());

    //     const dateStr = adjustedDate.toLocaleDateString('en-GB'); // Date in DD/MM/YYYY format
    //     const timeStr = adjustedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Time in HH:mm format

    //     // Add the date only if it's different from the previous date
    //     if (currentDate !== dateStr) {
    //         hourlyLabels.push(dateStr); // Push the date
    //         currentDate = dateStr; // Update currentDate
    //     }
    //     hourlyLabels.push(timeStr); // Always push the time
    // });

    // Loop through the data to prepare the datasets for each sensor
    for (const sensorId in data) {
        const sensorData = data[sensorId];
        const formattedData = sensorData.readingData.map(entry => entry[type]);

        const label = {
            label: `${sensorId} (${type})`,
            data: formattedData,
            borderColor:sensorColors[sensorId] || getRandomColor(),
            fill: false,
            yAxisID: type === 'temperature' ? 'y-axis-temp' : 'y-axis-humidity',
        };

        datasets.push(label);
    }

    // Check if the chart already exists, and update it if necessary
    if (!canvas.chart) {
        // If the chart doesn't exist, create a new one
        canvas.chart = createChart(ctx, 'line', labels, datasets);
    } else {
        // Update the chart with new labels and datasets
        updateChart(canvas.chart, labels, datasets);
    }
}

function createChart(ctx, type, labels = [], datasets = []) {
    let lastDateDisplayed = null; // Track the last displayed date

    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    title: {
                        display: true,
                        text: 'Date & Time'
                    },
                    time: {
                        unit: 'minute',  // Adjust as needed
                        tooltipFormat: 'dd/MM/yyyy HH:mm',  // Format for tooltips
                        displayFormats: {
                            minute: 'dd/MM/yyyy  HH:mm'  // Format for x-axis labels (only show time)
                        }
                    },
                    ticks: {
                        
                        maxTicksLimit: 24000000,
                        autoSkip: false  // Adjust this to control tick skipping
                    },
                    grid: {
                        drawOnChartArea: true,
                        drawTicks: true,
                        tickMarkLength: 5,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        color: (context) => {
                            let index = context.tickIndex;
                            return index % 1 === 0 ? '#ddd' : 'rgba(0,0,0,0)';  // Adjust grid line appearance
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: type === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)'
                    }
                }
            }
        }
    });
}




function updateChart(chart, newLabels, newDatasets) {
    chart.data.labels = newLabels;
    chart.data.datasets = [];

    newDatasets.forEach(dataset => {
        chart.data.datasets.push({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.borderColor || getRandomColor(),
            backgroundColor: dataset.backgroundColor || 'rgba(0, 0, 0, 0)',
            fill: dataset.fill || false,
            tension: dataset.tension || 0.4
        });
    });

    chart.update();
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function InitGraphData(robotId, type) {
    // Construct the element ID
    const elementId = `${type}-${robotId}`;
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
