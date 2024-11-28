// Function to load and display robot IDs (Rpi__1, Rpi__2, etc.) / ロボットID（Rpi__1、Rpi__2など）を読み込んで表示する機能
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

            // Populate table with robot IDs (just one row per robot)
            robotIds.forEach(function (item) {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${item.robotId}</td>`;
                compostTable.appendChild(row);

                // Add rows to temperature and humidity tables for each robot ID
                const tempRow = document.createElement("tr");
                tempRow.innerHTML = `<td id="currentTemp-${item.robotId}">--</td><td id="maxTemp-${item.robotId}">--</td><td id="minTemp-${item.robotId}">--</td><td id="avgTemp-${item.robotId}">--</td>`;
                document.getElementById("temperatureTable").appendChild(tempRow);

                const humRow = document.createElement("tr");
                humRow.innerHTML = `<td id="currentHumd-${item.robotId}">--</td><td id="maxHumd-${item.robotId}">--</td><td id="minHumd-${item.robotId}">--</td><td id="avgHumd-${item.robotId}">--</td>`;
                document.getElementById("humidityTable").appendChild(humRow);

                // Fetch initial data for each robot
                loadTemperatureData(item.robotId);
                loadHumidityData(item.robotId);
            });
        }
    };
    xhr.send();
}

// Function to fetch the latest temperature data for a given robot / 特定のロボットの最新の温度データを取得する機能
function fetchLatestData(robotId) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getLatest?robotID=${robotId}&type=temperature`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            document.getElementById(`currentTemp-${robotId}`).textContent = data[0]?.temperature || '--';
        }
    };
    xhr.send();
}

// Function to fetch min, max, and average data for temperature and humidity for a given robot / 特定のロボットの温度と湿度の最小、最大、平均データを取得する関数
function fetchFunctionData(type, func, elementId, robotId) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getFunc?robotID=${robotId}&type=${type}&func=${func}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const jsonquery = `${func}(${type})`;
            document.getElementById(`${elementId}-${robotId}`).textContent = data[0]?.[jsonquery] || '--';
        }
    };
    xhr.send();
}

// Fetch temperature data for a given robot / 特定のロボットの温度データを取得する
function loadTemperatureData(robotId) {
    fetchLatestData(robotId);
    fetchFunctionData('temperature', 'MAX', 'maxTemp', robotId);
    fetchFunctionData('temperature', 'MIN', 'minTemp', robotId);
    fetchFunctionData('temperature', 'AVG', 'avgTemp', robotId);
}

// Fetch humidity data for a given robot / 指定されたロボットの湿度データを取得します
function loadHumidityData(robotId) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getLatest?robotID=${robotId}&type=humidity`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            document.getElementById(`currentHumd-${robotId}`).textContent = data[0]?.humidity || '--';
        }
    };
    xhr.send();

    fetchFunctionData('humidity', 'MAX', 'maxHumd', robotId);
    fetchFunctionData('humidity', 'MIN', 'minHumd', robotId);
    fetchFunctionData('humidity', 'AVG', 'avgHumd', robotId);
}

// Periodically update data for each robot / 各ロボットのデータを定期的に更新する
function autoUpdateData() {
    const compostTable = document.getElementById("compostTable");
    const robotIds = Array.from(compostTable.querySelectorAll("tr td")).map(td => td.textContent);

    // Update temperature and humidity for all robot IDs dynamically
    robotIds.forEach(function (robotId) {
        loadTemperatureData(robotId);
        loadHumidityData(robotId);
    });
}

// Load data when the page is loaded and set up periodic updates / ページのロード時にデータをロードし、定期的な更新を設定します
window.onload = function () {
    loadRobotIds();
    setInterval(autoUpdateData, 3000); // Update data every 3 seconds / 3秒ごとにデータを更新
};

function fetchSensorData() {
    const selectedFilter = document.getElementById("filterRpi").value; // Get selected filter value
    const apiUrl =
        selectedFilter === "all"
            ? "http://localhost:3000/getSensorData"
            : `http://localhost:3000/getSensorData`; // Fetch all data, filtering will be client-side

    const xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const sensorData = JSON.parse(xhr.responseText);
            const table = document.getElementById("sensorTable");

            // Clear the table except the header row
            table.innerHTML = `
                <tr>
                    <th>Robot ID</th>
                    <th>Timestamp</th>
                    <th>Temperature</th>
                    <th>Humidity</th>
                    <th>Control Mode</th>
                    <th>Motor Duty Cycle</th>
                </tr>
            `;

            // Filter data if a specific RPI is selected
            const filteredData =
                selectedFilter === "all"
                    ? sensorData
                    : sensorData.filter((row) => row.robotId === selectedFilter);

            // Insert filtered rows
            filteredData.forEach(function (row) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${row.robotId}</td>
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


// This function will check if the input is empty and it will prompt the user to input a number / この関数は入力が空かどうかをチェックし、ユーザーに数値の入力を求めます。
function checkInputs(robotId) {
    const minTemp = document.getElementById(minTemp$, { robotId }).value;
    const maxTemp = document.getElementById(maxTemp$, { robotId }).value;
    const minHumidity = document.getElementById(minHumidity$, { robotId }).value;
    const maxHumidity = document.getElementById(maxHumidity$, { robotId }).value;

    if (!minTemp || !maxTemp || !minHumidity || !maxHumidity) {
        alert("Please fill in all temperature and humidity fields before setting.");
    } else {
        alert("Set button clicked with values: Min Temp = " + minTemp + "°C, Max Temp = " + maxTemp + "°C, Min Humidity = " + minHumidity + "%, Max Humidity = " + maxHumidity + "%");
    }

    // Call the time check function within this function / この関数内で時刻チェック関数を呼び出します。
    checkTimeInputs(robotId);
}

// This function will check if the input is empty and it will prompt the user to input a number / この関数は入力が空かどうかをチェックし、ユーザーに数値の入力を求めます。
function checkTimeInputs(robotId) {
    const interval = document.getElementById(interval1).value;
    const duration = document.getElementById(duration1).value;

    if (!interval || !duration) {
        alert("Please fill in both interval and duration before setting the time.");
    } else {
        alert("Set Time button clicked with values: Interval = " + interval + " min(s), Duration = " + duration + " min(s)");
    }
}
