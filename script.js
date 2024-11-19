
// Function to load and display robot IDs (Rpi__1, Rpi__2, etc.) / ロボットID（Rpi__1、Rpi__2など）を読み込んで表示する機能
function loadRobotIds() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:3000/getRobotId", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const robotIds = JSON.parse(xhr.responseText);
            const compostTable = document.getElementById("compostTable");
            
            compostTable.innerHTML = ""; // Clear existing rows / 既存の行をクリアする

            robotIds.sort(function(a, b) {
                if (a.robotId === "Rpi__1") return -1;
                if (b.robotId === "Rpi__1") return 1;
                return 0;
            });

            // Populate table with robot IDs (just one row per robot)/テーブルにロボット ID を入力します (ロボットごとに 1 行のみ)
            robotIds.forEach(function(item) {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${item.robotId}</td>`;
                compostTable.appendChild(row);

                // Add rows to temperature and humidity tables for each robot ID/ロボット ID ごとに温度と湿度のテーブルに行を追加します
                const tempRow = document.createElement("tr");
                tempRow.innerHTML = `<td id="currentTemp-${item.robotId}">--</td><td id="maxTemp-${item.robotId}">--</td><td id="minTemp-${item.robotId}">--</td><td id="avgTemp-${item.robotId}">--</td>`;
                document.getElementById("temperatureTable").appendChild(tempRow);

                const humRow = document.createElement("tr");
                humRow.innerHTML = `<td id="currentHumd-${item.robotId}">--</td><td id="maxHumd-${item.robotId}">--</td><td id="minHumd-${item.robotId}">--</td><td id="avgHumd-${item.robotId}">--</td>`;
                document.getElementById("humidityTable").appendChild(humRow);

                // Fetch initial data for each robot/各ロボットの初期データを取得する
                loadTemperatureData(item.robotId);
                loadHumidityData(item.robotId);
            });
        }
    };
    xhr.send();
}

// Function to fetch the latest temperature data for a given robot/特定のロボットの最新の温度データを取得する機能
function fetchLatestData(robotId) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:3000/getLatest?robotID=${robotId}&type=temperature`, true);
    xhr.onreadystatechange = function() {
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
    xhr.onreadystatechange = function() {
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
    xhr.onreadystatechange = function() {
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
    const robotIds = ['Rpi__1', 'Rpi__2']; // Add robot IDs to auto-update / 自動更新にロボット ID を追加する
    robotIds.forEach(function(robotId) {
        loadTemperatureData(robotId);
        loadHumidityData(robotId);
    });
}

// Load data when the page is loaded and set up periodic updates / ページのロード時にデータをロードし、定期的な更新を設定します
window.onload = function() {
    loadRobotIds();
    setInterval(autoUpdateData, 3000); // Update data every 5 seconds / 5秒ごとにデータを更新
};


function fetchSensorData() {
const xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:3000/getSensorData", true);
xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        const sensorData = JSON.parse(xhr.responseText);
        const table = document.getElementById("sensorTable");

        // Clear the table except the header row/ヘッダー行以外のテーブルをクリア
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

        // Insert new rows/新しい行を挿入
        sensorData.forEach(function(row) {
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

// Fetch data every 5 seconds (5000 milliseconds)/データを5秒ごとに取得
setInterval(fetchSensorData, 5000);

// Initial fetch/最初のデータ取得
fetchSensorData();


window.onload = function() {
// Hide all tabs by default
var tabContents = document.querySelectorAll('.tabcontent');
tabContents.forEach(function(tab) {
    tab.style.display = "none";
});

// Show the Measure tab content by default
document.getElementById("TabMeasure").style.display = "block";

// Optionally, set the active class for the button (if you want it to be styled as active)
var tabs = document.querySelectorAll('.tab');
tabs.forEach(function(tab) {
    tab.classList.remove('active');
});

document.querySelector('[onclick="openTab(event, \'Measure\')"]').classList.add('active');
};

function openTab(event, tabId) {
    // Get all tabs and tab content
    const tabs = document.getElementsByClassName("tab");
    const tabContent = document.getElementsByClassName("tab-content");

    // Remove active class from all tabs
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }

    // Hide all tab content
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    // Add active class to the clicked tab
    event.currentTarget.classList.add("active");
    // Show the corresponding tab content
    document.getElementById(tabId).style.display = "block";
    }

// This function will check if the input is empty and it will prompt the user to input a number / この関数は入力が空かどうかをチェックし、ユーザーに数値の入力を求めます。
function checkInputs(robotId) {
    const minTemp = document.getElementById(minTemp$,{robotId}).value;
    const maxTemp = document.getElementById(maxTemp$,{robotId}).value;
    const minHumidity = document.getElementById(minHumidity$,{robotId}).value;
    const maxHumidity = document.getElementById(maxHumidity$,{robotId}).value;

    if (!minTemp || !maxTemp || !minHumidity || !maxHumidity) {
        alert("Please fill in all temperature and humidity fields before setting.");
    } else {
        alert("Set button clicked with values: Min Temp = " + minTemp + "°C, Max Temp = " + maxTemp + "°C, Min Humidity = " + minHumidity + "%, Max Humidity = " + maxHumidity + "%");
    }

    // Call the time check function within this function
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

    