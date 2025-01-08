

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
                createGraphRow(item.robotId , dynamicTable);
                loadGraphData('Rpi__1', 'Sensor__1', 'temperature')
                .then(data => {
                    console.log(data); // Handle the received data
                })
                .catch(error => {
                    console.error('Error:', error); // Handle error
                });
            }
            // fetchSensorID(item.robotId )
            
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

        sensorIds.forEach(sensor => {
           

            

        });
    } catch (error) {
        console.error(`Error fetching sensor IDs for robotId ${robotId}:`, error);
        return null;
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

function createGraphRow(robotId , dynamicTable) {
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

function initgraph(){

}



setInterval(async function () {
    try {
        const initflag = false;
        
    } catch (error) {
        console.error("Error updating readings:", error);
    }
}, 1000);


/// get json of all reading which will be added into an array for full display
function loadGraphData(robotId, sensorId, type) {
    
    const savedstartime = new Date(0) // change this for dynamic timing (needs to be change from utc to jst format A(-9hr here then +9 when displaying )) 
    const savedendtime = new Date()

    //UTC to JST Convertion shenanigans
    savedstartime.setHours(savedstartime.getHours() + parseInt(9));
    savedendtime.setHours(savedendtime.getHours() + parseInt(9));

    const startFormatted =savedstartime.toISOString();
    const endFormatted = savedendtime.toISOString();
    
    // Return a Promise to handle async behavior
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `http://localhost:3000/getFROMTO?robotID=${robotId}&sensorId=${sensorId}&type=${type}&starttime=${startFormatted}&endtime=${endFormatted}`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data); // Resolve the promise with data
                } else {
                    reject(new Error(`Failed to fetch data: ${xhr.status}`)); // Reject on error
                }
            }
        };
        xhr.send();
    });
}

function displayGraphData(robotId, sensorReading, type) {
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