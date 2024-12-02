function fetchLatestData(robotId,sensorId) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getLatest?robotID=${robotId}&sensorID=${sensorId}&type=temperature`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const element = document.getElementById(`currentTemp-${robotId}`);
            if (element) {
                element.textContent = data[0]?.temperature || '--';
            }
        }
    };
    xhr.send();
}


// Fetch temperature data for a given robot / 特定のロボットの温度データを取得する
function loadTemperatureData(robotId ,sensorId) {
    fetchSensorDataByType(robotId, sensorId,'temperature', 'currTemp');
    fetchFunctionData(robotId, sensorId,'temperature', 'MAX' , 'maxTemp');
    fetchFunctionData(robotId, sensorId,'temperature', 'MIN' , 'minTemp');
    fetchFunctionData(robotId, sensorId,'temperature', 'AVG' , 'avgTemp');
}

// Fetch humidity data for a given robot / 指定されたロボットの湿度データを取得します
function loadHumidityData(robotId ,sensorId) {
    fetchSensorDataByType(robotId, sensorId,'humidity','currHumd');
    fetchFunctionData(robotId, sensorId,'humidity', 'MAX','maxHumd');
    fetchFunctionData(robotId, sensorId,'humidity', 'MIN','minHumd');
    fetchFunctionData(robotId, sensorId ,'humidity', 'AVG','avgHumd');


    
}

// Periodically update data for each robot / 各ロボットのデータを定期的に更新する
function autoUpdateData() {
    const xhr = new XMLHttpRequest();
    const compostTable = document.getElementById("compostTable");

    // Fetch robot IDs
    xhr.open("GET", `http://localhost:3000/getRobotId`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const robotIds = JSON.parse(xhr.responseText);

            // Iterate through each robot ID
            robotIds.forEach(function (robot) {
                const robotId = robot.robotId;

                // Fetch sensor IDs for each robot
                const xhr2 = new XMLHttpRequest();
                xhr2.open("GET", `http://localhost:3000/getSensorID?robotId=${robotId}`, true);
                xhr2.onreadystatechange = function () {
                    if (xhr2.readyState === 4 && xhr2.status === 200) {
                        const sensorIds = JSON.parse(xhr2.responseText);

                        // Log the sensor IDs or process them further
                        console.log(`Robot ID: ${robotId}, Sensor IDs:`, sensorIds);

                        // Example: Iterate through sensor IDs and load data
                        sensorIds.forEach(function (sensor) {
                            const sensorId = sensor.sensorId;
                            loadTemperatureData(robotId, sensorId);
                            loadHumidityData(robotId, sensorId);
                        });
                    }
                };
                xhr2.send();
            });
        }
    };
    xhr.send();
}
// Load data when the page is loaded and set up periodic updates / ページのロード時にデータをロードし、定期的な更新を設定します
window.onload = function () {
    loadRobotIds();
    setInterval(autoUpdateData, 3000); // Update data every 3 seconds / 3秒ごとにデータを更新
};

function fetchSensorData() {
    const selectedFilter = document.getElementById("filterRpi").value;
    const apiUrl =
        selectedFilter === "all"
            ? "http://localhost:3000/getSensorData"
            : `http://localhost:3000/getSensorData?robotId=${selectedFilter}`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const sensorData = JSON.parse(xhr.responseText);
            // console.log("API Response:", sensorData); // Debugging

            const table = document.getElementById("sensorTable");
            table.innerHTML = `
                <tr>
                    <th>Robot ID</th>
                    <th>Sensor ID</th>
                    <th>Timestamp</th>
                    <th>Temperature</th>
                    <th>Humidity</th>
                    <th>Control Mode</th>
                    <th>Motor Duty Cycle</th>
                </tr>
            `;

            const filteredData =
                selectedFilter === "all"
                    ? sensorData
                    : sensorData.filter((row) => row.robotId.toString() === selectedFilter);

            if (filteredData.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="7">No data available</td>`;
                table.appendChild(tr);
                return;
            }

            filteredData.forEach(function (row) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${row.robotId}</td>
                    <td>${row.sensorId}</td>
                    <td>${row.timestamp}</td>
                    <td>${row.temperature}</td>
                    <td>${row.humidity}</td>
                    <td>${row.controlMode}</td>
                    <td>${row.motorDutyCycle}</td>
                `;
                table.appendChild(tr);
            });
        }
    };
    xhr.send();
}

// Fetch data every 5 seconds
setInterval(fetchSensorData, 5000);

// Initial fetch
fetchSensorData();

// For the other Tabs, Measure/WeatherCondition/SensorReading/Conditions 
function openTab(evt, tabName) {
    // Hide all tabs
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(function (tab) {
        tab.style.display = 'none';
    });

    // Remove 'active' class from all tab buttons / すべてのタブボタンから「アクティブ」クラスを削除します
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(function (tab) {
        tab.classList.remove('active');
    });

    // Show the selected tab / 選択したタブを表示します
    document.getElementById(tabName).style.display = 'block';

    // Add 'active' class to the selected tab button / 選択したタブボタンに「アクティブ」クラスを追加します
    evt.currentTarget.classList.add('active');
}

// To toggle the Mixer & Heater Tabs / ミキサータブとヒータータブを切り替えるには
function toggleTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Add event listeners for tabs
document.getElementById('mixerTab').addEventListener('click', function () {
    toggleTab('mixerContent');
});

document.getElementById('heaterTab').addEventListener('click', function () {
    toggleTab('heaterContent');
});

// Function to retrieve input values for a specific robot and type
function getRobotInputs(robotId, type) {
    const prefix = type.toLowerCase();  // Convert type to lowercase for consistent naming convention
    return {
        min_temp: parseFloat(document.getElementById(`${prefix}_min_temp_${robotId}`).value) || 0,
        max_temp: parseFloat(document.getElementById(`${prefix}_max_temp_${robotId}`).value) || 0,
        min_humidity: parseFloat(document.getElementById(`${prefix}_min_humidity_${robotId}`).value) || 0,
        max_humidity: parseFloat(document.getElementById(`${prefix}_max_humidity_${robotId}`).value) || 0,
        time_interval: parseInt(document.getElementById(`${prefix}_interval_${robotId}`).value) || 0,
        duration: parseInt(document.getElementById(`${prefix}_duration_${robotId}`).value) || 0
        //humindity var
        //temp var
        //autoduration
    };
}

// Function to check all inputs for a specific robot and type
function checkAllInputs(robotId, type) {
    const data = getRobotInputs(robotId, type);

    // Validate temperature and humidity fields
    if (!data.min_temp || !data.max_temp || !data.min_humidity || !data.max_humidity) {
        alert("Please fill in all temperature and humidity fields before setting.");
        return;
    }

    // Validate time interval and duration fields
    if (!data.time_interval || !data.duration) {
        alert("Please fill in both interval and duration before setting the time.");
        return;
    }

    // Display the settings in an alert box and log to console
    alert(`Set button clicked with values:
        Min Temp = ${data.min_temp}°C, Max Temp = ${data.max_temp}°C,
        Min Humidity = ${data.min_humidity}%, Max Humidity = ${data.max_humidity}%, 
        Interval = ${data.time_interval} min(s), Duration = ${data.duration} min(s)`);

    console.log('Robot Settings:', data);
}


// Function to load and display robot IDs along with sensor data (temperature and humidity)
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
}

// Function to fetch sensor data and create table rows
function fetchSensorID(robotId, compostTable) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getSensorId?robotId=${robotId}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const sensorIds = JSON.parse(xhr.responseText);

            sensorIds.forEach(function (sensor) {
                const row = createSensorRow(robotId, sensor);
                compostTable.appendChild(row);
                loadSensorData(robotId, sensor.sensorId);
            });
        }
    };
    xhr.send();
}

// Function to create a row for a sensor
function createSensorRow(robotId, sensor) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${robotId}</td>
        <td>${sensor.sensorId}</td>
        <td id="currTemp-${robotId}-${sensor.sensorId}">--</td>
        <td id="minTemp-${robotId}-${sensor.sensorId}">--</td>
        <td id="maxTemp-${robotId}-${sensor.sensorId}">--</td>
        <td id="avgTemp-${robotId}-${sensor.sensorId}">--</td>
        <td id="currHumd-${robotId}-${sensor.sensorId}">--</td>
        <td id="minHumd-${robotId}-${sensor.sensorId}">--</td>
        <td id="maxHumd-${robotId}-${sensor.sensorId}">--</td>
        <td id="avgHumd-${robotId}-${sensor.sensorId}">--</td>
    `;
    return row;
}

// Function to load all sensor data for a specific robot and sensor
function loadSensorData(robotId, sensorId) {
    // Fetch current temperature and humidity
    fetchSensorDataByType(robotId, sensorId, 'current');
    // Fetch min, max, and average temperature and humidity
    ['temperature', 'humidity'].forEach(function (type) {
        ['MIN', 'MAX', 'AVG'].forEach(function (func) {
            fetchFunctionData(robotId, sensorId, type, func);
        });
    });
}

// Function to fetch the latest temperature or humidity data
function fetchSensorDataByType(robotId, sensorId, type, elementId) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getLatest?robotID=${robotId}&sensorID=${sensorId}&type=${type}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            document.getElementById(`${elementId}-${robotId}-${sensorId}`).textContent = data[0][type]  || '--';
        }
    };
    xhr.send();
}

// Function to fetch min, max, and average values for a specific data type (temperature or humidity)
function fetchFunctionData(robotId, sensorId, type, func, elementId) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getFunc?robotID=${robotId}&sensorID=${sensorId}&type=${type}&func=${func}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            
            document.getElementById(`${elementId}-${robotId}-${sensorId}`).textContent = data|| '--';
        }
    };
    xhr.send();
}

// Automatically update data every 3 seconds
setInterval(function () {
    loadRobotIds();
}, 3000);

// Initial data load when page is loaded
window.onload = function () {
    loadRobotIds();
};
