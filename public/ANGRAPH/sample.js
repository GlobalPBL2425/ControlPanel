const sensorColors = {};

// Fake data to simulate API responses
const fakeRobotIds = [
    { robotId: "Rpi__1" },
    { robotId: "Rpi__2" },
    { robotId: "Rpi__3" }
];

const fakeSensorData = {
    Rpi__1: [
        { sensorId: "temp1", type: "temperature", readingData: generateFakeSensorData("temperature") },
        { sensorId: "hum1", type: "humidity", readingData: generateFakeSensorData("humidity") }
    ],
    Rpi__2: [
        { sensorId: "temp2", type: "temperature", readingData: generateFakeSensorData("temperature") },
        { sensorId: "hum2", type: "humidity", readingData: generateFakeSensorData("humidity") }
    ],
    Rpi__3: [
        { sensorId: "temp3", type: "temperature", readingData: generateFakeSensorData("temperature") },
        { sensorId: "hum3", type: "humidity", readingData: generateFakeSensorData("humidity") }
    ]
};

async function loadRobotIds(initflag) {
    try {
        const robotIds = fakeRobotIds; // Using fake robot IDs

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
                renderFilterForm(item.robotId);
                InitGraphData(item.robotId, 'temperature');
                InitGraphData(item.robotId, 'humidity');
            }
            const sensorData = await fetchSensorID(item.robotId);

            // Displaying part
            displayGraphData(item.robotId, 'temperature', sensorData);
            displayGraphData(item.robotId, 'humidity', sensorData);
        }
    } catch (error) {
        console.error("Error loading robot IDs:", error);
    }
}

async function fetchSensorID(robotId) {
    try {
        // Using fake sensor data
        const sensorData = fakeSensorData[robotId];

        // Assign a random color to the sensor if it doesn't already have one
        for (const sensor of sensorData) {
            if (!sensorColors[sensor.sensorId]) {
                sensorColors[sensor.sensorId] = getRandomColor();
            }
        }

        const sensorDataObject = {};
        sensorData.forEach(sensor => {
            sensorDataObject[sensor.sensorId] = { readingData: sensor.readingData };
        });

        return sensorDataObject;
    } catch (error) {
        console.error(`Error fetching sensor IDs for robotId ${robotId}:`, error);
        return null;
    }
}

// Generate fake data for sensor readings (e.g., temperature or humidity)
function generateFakeSensorData(type) {
    const fakeData = [];
    const currentTime = new Date();
    for (let i = 0; i < 50; i++) {
        fakeData.push({
            timestamp: new Date(currentTime - (i * 60 * 1000)).toISOString(),
            [type]: (Math.random() * (type === "temperature" ? 30 : 100)).toFixed(2)
        });
    }
    return fakeData;
}

window.onload = async function () {
    try {
        const initflag = true;
        await loadRobotIds(initflag);
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};

// Functions for creating and updating charts, rendering filter forms, etc.
// These remain unchanged
function createGraphRow(robotId, dynamicTable) {
    const row = document.createElement("tr");
    const row2 = document.createElement("tr");
    const row3 = document.createElement("tr");
    row.innerHTML = `
        <td rowspan="3">${robotId}</td>
        <td id="temperature-${robotId}">--</td>
    `;
    dynamicTable.appendChild(row);
    row2.innerHTML = `
        <td id="humidity-${robotId}">--</td>
    `;
    dynamicTable.appendChild(row2);
    row3.innerHTML = `
        <td id="gauge-${robotId}">--</td>
    `;
    dynamicTable.appendChild(row3);
};

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

    // Loop through the data to prepare the datasets for each sensor
    for (const sensorId in data) {
        const sensorData = data[sensorId];
        const formattedData = sensorData.readingData.map(entry => entry[type]);

        const label = {
            label: `${sensorId} (${type})`,
            data: formattedData,
            borderColor: sensorColors[sensorId] || getRandomColor(),
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
                        unit: 'minute',
                        tooltipFormat: 'dd/MM/yyyy HH:mm',
                        displayFormats: {
                            minute: 'dd/MM/yyyy HH:mm'
                        }
                    },
                    ticks: {
                        maxTicksLimit: 24000000,
                        autoSkip: false
                    },
                    grid: {
                        drawOnChartArea: true,
                        drawTicks: true,
                        tickMarkLength: 5,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        color: (context) => {
                            let index = context.tickIndex;
                            return index % 1 === 0 ? '#ddd' : 'rgba(0,0,0,0)';
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
    const elementId = `${type}-${robotId}`;
    const targetElement = document.getElementById(elementId);

    if (!targetElement) {
        console.error(`Element with ID "${elementId}" not found.`);
        return;
    }

    targetElement.innerHTML = `
        <div>
            <canvas id="chart-${elementId}" width="200" height="100"></canvas>
        </div>
    `;
}

function updateValue(robotId, time, value) {
    const storageKey = `time-${robotId}-${time}`;
    localStorage.setItem(storageKey, value);
    console.log(`Saved ${value} for ${storageKey}`);
}

async function renderFilterForm(robotId) {
    const elementId = `gauge-${robotId}`;
    const targetElement = document.getElementById(elementId);

    if (!targetElement) {
        console.error(`Element with ID "${targetElement}" not found.`);
        return;
    }

    targetElement.innerHTML = `
        <div class="filter-box">
            <h3>Filter by Date and Time</h3>
            <form id="filterForm">
                <label for="startDate">Start Date and Time:</label>
                <input type="text" id="startDate" name="startDate" required>

                <label for="endDate">End Date and Time:</label>
                <input type="text" id="endDate" name="endDate" required>

                <label for="currentTime">Current Time:</label>
                <input type="checkbox" id="currentTime" name="currentTime">

                <button type="submit">Apply Filter</button>
            </form>
        </div>
    `;

    flatpickr("#startDate", {
        enableTime: true,
        dateFormat: "Y-m-d H:i:S",
        time_24hr: true,
    });

    flatpickr("#endDate", {
        enableTime: true,
        dateFormat: "Y-m-d H:i:S",
        time_24hr: true,
    });

    const form = document.getElementById("filterForm");
    form.addEventListener("submit", handleFormSubmit);
}

function updateEndDate() {
    const currentTimeCheckbox = document.getElementById("currentTime");
    const endDateInput = document.getElementById("endDate");

    if (currentTimeCheckbox && currentTimeCheckbox.checked && endDateInput) {
        const currentTime = new Date().toISOString();
        endDateInput.value = currentTime;
        console.log("End Date updated to:", currentTime);
    }
}

function autoupdater() {
    try {
        const initflag = false;
        updateEndDate();
        loadRobotIds(initflag); // No need for 'await' here since it's not returning anything directly
    } catch (error) {
        console.error("Error updating readings:", error);
    }
}

// In the handleFormSubmit function, ensure you're calling autoupdater properly:
function handleFormSubmit(e) {
    e.preventDefault();

    const robotId = "robot1"; // Example robot ID
    const startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    // Save startDate and endDate to localStorage using updateValue function
    updateValue(robotId, "starttime", startDate);
    updateValue(robotId, "endtime", endDate);

    if (document.getElementById("currentTime").checked) {
        setInterval(autoupdater, 100); // Call autoupdater every 20 seconds
    } else {
        autoupdater(); // Call autoupdater once
    }

    console.log("Filter Applied:");
    console.log("Start Date and Time:", startDate);
    console.log("End Date and Time:", endDate);
    console.log("Current Time Selected:", document.getElementById("currentTime").checked);

    alert(`Filter applied: \nStart Date and Time: ${startDate}\nEnd Date and Time: ${endDate}`);
}
