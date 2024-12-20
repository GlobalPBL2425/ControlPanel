// Set up the Chart.js chart
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Dynamic Data',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                beginAtZero: true
            },
            y: {
                beginAtZero: true
            }
        }
    }
}
);
// Function to add data points to the chart
function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data);
    chart.update();
};

// Function to remove old data points from the chart
function removeData(chart) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.update();
};

// Simulate real-time updates
let counter = 0;
setInterval(() => {
    const randomData = Math.floor(Math.random() * 100); // Generate random data
    addData(myChart, `Point ${counter}`, randomData);   // Add new data
    if (myChart.data.labels.length > 10) {             // Limit to 10 points
        removeData(myChart);
    }
    counter++;
}, 1000); // Update every second

function loadRobotIds() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:3000/getRobotId", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const robotIds = JSON.parse(xhr.responseText);
            const compostTable = document.getElementById("compostTable");

            compostTable.innerHTML = ""; // Clear existing rows

            robotIds.sort(function (a, b) {
                if (a.robotId === "Rpi__1") return -1;
                if (b.robotId === "Rpi__1") return 1;
                return 0;
            });

            // Loop through each robot ID
            robotIds.forEach(function (item) {
                fetchSensorID(item.robotId, compostTable);
            });
        }
    };
    xhr.send();
};


function fetchSensorID(robotId, compostTable) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getSensorId?robotId=${robotId}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const sensorIds = JSON.parse(xhr.responseText);

            sensorIds.forEach(function (sensor) {
                const row = createGraphRow(robotId, sensor);
                compostTable.appendChild(row);
            });
        }
    };
    xhr.send();
};

window.onload = function () {
    loadRobotIds();
    const myLineChart = createChart('myChart', 'line', ['Jan', 'Feb', 'Mar'], [10, 20, 15]);

};
setInterval(function () {
    loadRobotIds();
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


function loadGraphData(robotId ,sensorId){
    
};

function loadPowerGauge(robotId ,sensorId)
{

};

function timeSlider(){
    
};